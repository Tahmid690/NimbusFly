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
