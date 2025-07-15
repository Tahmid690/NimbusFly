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


-- Trigger for Seat addition after aircraft addition

CREATE OR REPLACE FUNCTION insert_aircraft_seats()
RETURNS TRIGGER AS $$
DECLARE
    i INTEGER;
    seat_num VARCHAR;
    row_num INTEGER;
    seat_letter CHAR;
    letters CHAR[] := ARRAY['A', 'B', 'C', 'D', 'E', 'F','G','H'];
BEGIN
    FOR i IN 1..NEW.busi_seats LOOP
        row_num := ((i - 1) / 8) + 1;
        seat_letter := letters[((i - 1) % 8) + 1];
        seat_num := row_num || seat_letter;
        
        INSERT INTO seats (aircraft_id, seat_number, seat_class, is_booked)
        VALUES (NEW.aircraft_id, seat_num, 'Business', FALSE);
    END LOOP;
    
    FOR i IN 1..NEW.econ_seats LOOP
        row_num := ((NEW.busi_seats + i - 1) / 8) + 1;
        seat_letter := letters[((NEW.busi_seats + i - 1) % 8) + 1];
        seat_num := row_num || seat_letter;
        
        INSERT INTO seats (aircraft_id, seat_number, seat_class, is_booked)
        VALUES (NEW.aircraft_id, seat_num, 'Economy', FALSE);
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER aircraft_seats_trigger
    AFTER INSERT ON public.aircraft
    FOR EACH ROW
    EXECUTE FUNCTION insert_aircraft_seats();
    
--same for updt

CREATE OR REPLACE FUNCTION update_aircraft_seats()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.econ_seats != NEW.econ_seats OR OLD.busi_seats != NEW.busi_seats THEN
        DELETE FROM seats WHERE aircraft_id = NEW.aircraft_id;
        PERFORM insert_aircraft_seats_for_update(NEW.aircraft_id, NEW.busi_seats, NEW.econ_seats);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_aircraft_seats_for_update(
    p_aircraft_id INTEGER,
    p_busi_seats INTEGER,
    p_econ_seats INTEGER
)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
    seat_num VARCHAR;
    row_num INTEGER;
    seat_letter CHAR;
    letters CHAR[] := ARRAY['A', 'B', 'C', 'D', 'E', 'F','G','H'];
BEGIN
    FOR i IN 1..p_busi_seats LOOP
        row_num := ((i - 1) / 8) + 1;
        seat_letter := letters[((i - 1) % 8) + 1];
        seat_num := row_num || seat_letter;
        
        INSERT INTO seats (aircraft_id, seat_number, seat_class, is_booked)
        VALUES (p_aircraft_id, seat_num, 'Business', FALSE);
    END LOOP;
    
    FOR i IN 1..p_econ_seats LOOP
        row_num := ((p_busi_seats + i - 1) / 8) + 1;
        seat_letter := letters[((p_busi_seats + i - 1) % 8) + 1];
        seat_num := row_num || seat_letter;
        
        INSERT INTO seats (aircraft_id, seat_number, seat_class, is_booked)
        VALUES (p_aircraft_id, seat_num, 'Economy', FALSE);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER aircraft_seats_update_trigger
    AFTER UPDATE ON public.aircraft
    FOR EACH ROW
    EXECUTE FUNCTION update_aircraft_seats();    

