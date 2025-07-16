-- Update current aircraft rows with available seat counts
UPDATE flights AS a
SET
    available_busi_seats = s.avail_busi,
    available_econ_seats  = s.avail_econ,
    available_seats = s.avail_busi + s.avail_econ
FROM (
    SELECT
        aircraft_id,
        COUNT(*) FILTER (WHERE seat_class = 'Business' AND NOT is_booked) AS avail_busi,
        COUNT(*) FILTER (WHERE seat_class = 'Economy'  AND NOT is_booked) AS avail_econ
    FROM seats
    GROUP BY aircraft_id
) AS s
WHERE a.aircraft_id = s.aircraft_id;


    
-- Update Seat in Seats Table and Flight Table Trigger

CREATE OR REPLACE FUNCTION create_flight_seats()
RETURNS TRIGGER AS $$
DECLARE
    i INTEGER;
    seat_num VARCHAR;
    row_num INTEGER;
    seat_letter CHAR;
    letters CHAR[] := ARRAY['A', 'B', 'C', 'D', 'E', 'F','G','H'];
    aircraft_info RECORD;
BEGIN
    SELECT econ_seats, busi_seats, total_seats
    INTO aircraft_info
    FROM aircraft
    WHERE aircraft_id = NEW.aircraft_id;
    
    FOR i IN 1..aircraft_info.busi_seats LOOP
        row_num := ((i - 1) / 8) + 1;
        seat_letter := letters[((i - 1) % 8) + 1];
        seat_num := row_num || seat_letter;
        
        INSERT INTO seats (aircraft_id, flight_id, seat_number, seat_class, is_booked)
        VALUES (NEW.aircraft_id, NEW.flight_id, seat_num, 'Business', FALSE);
    END LOOP;
    
    FOR i IN 1..aircraft_info.econ_seats LOOP
        row_num := ((aircraft_info.busi_seats + i - 1) / 8) + 1;
        seat_letter := letters[((aircraft_info.busi_seats + i - 1) % 8) + 1];
        seat_num := row_num || seat_letter;
        
        INSERT INTO seats (aircraft_id, flight_id, seat_number, seat_class, is_booked)
        VALUES (NEW.aircraft_id, NEW.flight_id, seat_num, 'Economy', FALSE);
    END LOOP;
    
    UPDATE flights
    SET available_econ_seats = aircraft_info.econ_seats,
        available_busi_seats = aircraft_info.busi_seats,
        available_seats = aircraft_info.total_seats
    WHERE flight_id = NEW.flight_id;

    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER flight_seats_creation_trigger
    AFTER INSERT ON flights
    FOR EACH ROW
    EXECUTE FUNCTION create_flight_seats();


-- Resolving Schduling Conflicts with Aircrafts

CREATE OR REPLACE FUNCTION validate_aircraft_scheduling()
RETURNS TRIGGER AS $$
DECLARE
    conflict_count INTEGER;
    aircraft_status_val VARCHAR;
    min_turnaround_minutes INTEGER := 60; 
BEGIN
    IF NEW.departure_time > NOW() THEN
        IF NEW.arrival_time - NEW.departure_time < INTERVAL '30 minutes' THEN
            RAISE EXCEPTION 'Flight duration must be at least 30 minutes';
        END IF;
        
        SELECT status INTO aircraft_status_val
        FROM aircraft
        WHERE aircraft_id = NEW.aircraft_id;
        
        IF aircraft_status_val != 'Active' THEN
            RAISE EXCEPTION 'Cannot schedule flights on aircraft with status: %', aircraft_status_val;
        END IF;
        
        SELECT COUNT(*)
        INTO conflict_count
        FROM flights f
        WHERE f.aircraft_id = NEW.aircraft_id
        AND f.status = TRUE
        AND f.flight_id != COALESCE(NEW.flight_id, 0)
        AND (
            (NEW.departure_time < f.arrival_time AND NEW.arrival_time > f.departure_time) OR
            (NEW.departure_time >= f.arrival_time AND 
            NEW.departure_time < f.arrival_time + INTERVAL '1 hour') OR
            (NEW.arrival_time <= f.departure_time AND 
            NEW.arrival_time > f.departure_time - INTERVAL '1 hour')
        );
        IF conflict_count > 0 THEN
            RAISE EXCEPTION 'Aircraft % has scheduling conflict. Minimum % minutes turnaround required between flights.', 
                            NEW.aircraft_id, min_turnaround_minutes;
        END IF; 
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER aircraft_scheduling_validation_trigger
    BEFORE INSERT OR UPDATE ON flights
    FOR EACH ROW
    EXECUTE FUNCTION validate_aircraft_scheduling();


--Flight Number Generation Trigger

CREATE OR REPLACE FUNCTION generate_flight_number()
RETURNS TRIGGER AS $$
DECLARE
    airline_abbreviation VARCHAR(10);
    next_sequence INTEGER;
    new_flight_number VARCHAR;
BEGIN
    SELECT al.abbreviation INTO airline_abbreviation
    FROM aircraft a
    JOIN airlines al ON a.airline_id = al.airline_id
    WHERE a.aircraft_id = NEW.aircraft_id;
    
    SELECT MAX(
        CASE 
            WHEN f.flight_number ~ ('^' || airline_abbreviation || '[0-9]+$') THEN
                CAST(SUBSTRING(f.flight_number FROM LENGTH(airline_abbreviation) + 1) AS INTEGER)
            ELSE 0
        END
    ) + 1
    INTO next_sequence
    FROM flights f
    JOIN aircraft a ON f.aircraft_id = a.aircraft_id
    JOIN airlines al ON a.airline_id = al.airline_id
    WHERE al.abbreviation = airline_abbreviation;
    
    new_flight_number := airline_abbreviation || LPAD(next_sequence::TEXT, 4, '0');  
    NEW.flight_number := new_flight_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER flight_number_generation_trigger
    BEFORE INSERT ON flights
    FOR EACH ROW
    EXECUTE FUNCTION generate_flight_number();

--total seats

CREATE OR REPLACE FUNCTION aircraft_total_seats_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.total_seats != (NEW.econ_seats + NEW.busi_seats) THEN
        RAISE EXCEPTION 'Summation of business seats and economy seats must be equal to total seats';
    END IF;
    IF NEW.econ_seats < 0 OR NEW.busi_seats < 0 THEN
        RAISE EXCEPTION 'Seat counts cannot be negative';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER aircraft_seat_calculation_trigger
    BEFORE INSERT OR UPDATE ON aircraft
    FOR EACH ROW
    EXECUTE FUNCTION aircraft_total_seats_balance();


-- Edit Check

CREATE OR REPLACE FUNCTION update_flight_status()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.departure_time <= CURRENT_TIMESTAMP AND TG_OP = 'UPDATE' THEN
        IF NEW.departure_time != OLD.departure_time OR 
           NEW.arrival_time != OLD.arrival_time OR
           NEW.aircraft_id != OLD.aircraft_id OR
           NEW.origin_airport_id != OLD.origin_airport_id OR
           NEW.destination_airport_id != OLD.destination_airport_id THEN
            RAISE EXCEPTION 'Cannot modify core details of departed flights';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER flight_status_management_trigger
    BEFORE UPDATE ON public.flights
    FOR EACH ROW
    EXECUTE FUNCTION update_flight_status();


--flight cacellation

CREATE OR REPLACE FUNCTION handle_flight_cancellation()
RETURNS TRIGGER AS $$
DECLARE
    affected_bookings INTEGER;
    affected_payments INTEGER;
BEGIN
    IF OLD.status = TRUE AND NEW.status = FALSE THEN
        IF NEW.departure_time < NOW() THEN
            RAISE EXCEPTION 'Cant Cancel Active or Complete Flights';
        END IF;
        
        UPDATE bookings 
        SET payment_status = 'CANCELLED'
        WHERE booking_id IN (
            SELECT DISTINCT t.booking_id
            FROM ticket t
            WHERE t.flight_id = NEW.flight_id
        )
        AND payment_status != 'CANCELLED';
        
        
        UPDATE payments 
        SET status = 'CANCELLED'
        WHERE booking_id IN (
            SELECT DISTINCT t.booking_id
            FROM ticket t
            WHERE t.flight_id = NEW.flight_id
        )
        AND status != 'CANCELLED';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER flight_cancellation_booking_trigger
    AFTER UPDATE OF status ON flights
    FOR EACH ROW
    EXECUTE FUNCTION handle_flight_cancellation();
