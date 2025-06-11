const pool = require('../config/database');


const getAllflights = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM flights');

    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flights',
      error: error.message
    });
  }
};

const getFlightById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM flights WHERE flight_id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch flight', error: error.message });
  }
};

const createFlight = async (req, res) => {
  const {
    flight_id,
    flight_number,
    aircraft_id,
    origin_airport_id,
    destination_airport_id,
    departure_time,
    arrival_time,
    business_ticket_price,
    economy_ticket_price,
    round_trip_discount,
    available_seats,
    available_busi_seats,
    available_econ_seats
  } = req.body;

  try {
    const query = `
      INSERT INTO flights (
        flight_id, flight_number, aircraft_id,
        origin_airport_id, destination_airport_id,
        departure_time, arrival_time,
        business_ticket_price, economy_ticket_price, round_trip_discount,
        available_seats, available_busi_seats, available_econ_seats
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
      )
    `;

    await pool.query(query, [
      flight_id, flight_number, aircraft_id,
      origin_airport_id, destination_airport_id,
      departure_time, arrival_time,
      business_ticket_price, economy_ticket_price, round_trip_discount,
      available_seats, available_busi_seats, available_econ_seats
    ]);

    res.status(201).json({ success: true, message: 'Flight created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create flight', error: error.message });
  }
};

const updateFlight = async (req, res) => {
  const { id } = req.params;
  const {
    flight_number,
    aircraft_id,
    origin_airport_id,
    destination_airport_id,
    departure_time,
    arrival_time,
    business_ticket_price,
    economy_ticket_price,
    round_trip_discount,
    available_seats,
    available_busi_seats,
    available_econ_seats
  } = req.body;

  try {
    const query = `
      UPDATE flights SET
        flight_number = $1,
        aircraft_id = $2,
        origin_airport_id = $3,
        destination_airport_id = $4,
        departure_time = $5,
        arrival_time = $6,
        business_ticket_price = $7,
        economy_ticket_price = $8,
        round_trip_discount = $9,
        available_seats = $10,
        available_busi_seats = $11,
        available_econ_seats = $12
      WHERE flight_id = $13
    `;

    await pool.query(query, [
      flight_number, aircraft_id, origin_airport_id, destination_airport_id,
      departure_time, arrival_time,
      business_ticket_price, economy_ticket_price, round_trip_discount,
      available_seats, available_busi_seats, available_econ_seats,
      id
    ]);

    res.json({ success: true, message: 'Flight updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update flight', error: error.message });
  }
};

const deleteFlight = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM flights WHERE flight_id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }
    res.json({ success: true, message: 'Flight deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete flight', error: error.message });
  }
};


const searchFlights = async (req, res) => {
  const {
    origin,
    destination,
    journeyDate,
    returnDate,
    tripType,
    adults,
    children,
    seatClass,
    orderType
  } = req.query;

  // console.log(req.query);


  try {

    //One-Way
    let order_typ;
    // console.log(orderType);
    if (orderType === 'Cheapest') {
      if (seatClass === 'Business') order_typ = `f.business_ticket_price`;
      else order_typ = `f.economy_ticket_price`;
    }
    else if (orderType === 'Fastest') order_typ = `f.arrival_time - f.departure_time`;
    else order_typ = `f.departure_time`


    let total = 0.75 * parseInt(children || 0) + parseInt(adults || 0);

    // console.log(total);

    const query1 = `
      SELECT
        f.origin_airport_id as origin_airport_id,
        f.destination_airport_id as destination_airport_id,
        a.airline_name as airline_name,
        f.departure_time as departure_time,
        f.arrival_time as arrival_time,
        (f.arrival_time - f.departure_time) as flight_time,
        ROUND((CASE 
            WHEN $4 = 'Business' THEN f.business_ticket_price 
            ELSE f.economy_ticket_price 
        END)*($6),2) as total_ticket_price,
        (CASE 
            WHEN $4 = 'Business' THEN f.business_ticket_price 
            ELSE f.economy_ticket_price 
        END) as base_price,
        f.baggage_limit as baggage_limit,
        ac.model as aircraft_name,
        f.flight_number as flight_number,

        a.logo_url as logo_url
        
    FROM
        flights f
        JOIN aircraft ac ON ac.aircraft_id = f.aircraft_id
        JOIN airlines a ON ac.airline_id = a.airline_id
        JOIN airports apo ON apo.airport_id = f.origin_airport_id
        JOIN airports apd ON apd.airport_id = f.destination_airport_id
        WHERE 
            apo.iata_code = $1 AND
            apd.iata_code = $2 AND
            DATE(f.departure_time) = $3 AND
            (
                CASE 
                    WHEN $4 = 'Business' THEN f.available_busi_seats 
                    ELSE f.available_econ_seats 
                END >= $5
            ) 
        ORDER BY `+ order_typ;


    if (tripType === 'round-trip') {

      if (orderType === 'Cheapest') {
        if (seatClass === 'Business') order_typ = `(f1.business_ticket_price*(1-f1.round_trip_discount) + f2.business_ticket_price*(1-f2.round_trip_discount))`;
        else order_typ = `(f1.economy_ticket_price*(1-f1.round_trip_discount) + f2.economy_ticket_price*(1-f2.round_trip_discount))`;
      }
      else if (orderType === 'Fastest') order_typ = `((f1.arrival_time - f1.departure_time)+(f2.arrival_time - f2.departure_time))`;
      else order_typ = `f1.departure_time`

      const query2 = `
            SELECT
              f1.origin_airport_id as origin_airport_id,
              f1.destination_airport_id as destination_airport_id,
              a1.airline_name as airline_name,
              f1.departure_time as departure_time,
              f1.arrival_time as arrival_time,
              (f1.arrival_time - f1.departure_time) as flight_time,
              f1.flight_number as flight_number,
              ac1.model as aircraft_name,
              f1.baggage_limit as baggage_limit,
              f1.round_trip_discount as round_trip_discount,
              
              a2.airline_name as return_airline_name,
              f2.departure_time as return_departure_time,
              f2.arrival_time as return_arrival_time,
              (f2.arrival_time - f2.departure_time) as return_flight_time,
              f2.flight_number as return_flight_number,
              ac2.model as return_aircraft_name,
              f2.baggage_limit as return_baggage_limit,
              f2.round_trip_discount as return_round_trip_discount,

              a1.logo_url as logo_url,


              ROUND((CASE 
                  WHEN $4 = 'Business' THEN (f1.business_ticket_price*(1-f1.round_trip_discount) + f2.business_ticket_price*(1-f2.round_trip_discount))
                  ELSE (f1.economy_ticket_price*(1-f1.round_trip_discount) + f2.economy_ticket_price*(1-f2.round_trip_discount))
              END) * $6, 2) as total_ticket_price,
              
              ROUND((CASE 
                  WHEN $4 = 'Business' THEN (f1.business_ticket_price*(1-f1.round_trip_discount) + f2.business_ticket_price*(1-f2.round_trip_discount)) 
                  ELSE (f1.economy_ticket_price*(1-f1.round_trip_discount) + f2.economy_ticket_price*(1-f2.round_trip_discount))
              END),2) as base_price,
              
              (CASE 
                  WHEN $4 = 'Business' THEN f2.business_ticket_price 
                  ELSE f2.economy_ticket_price 
              END) as return_base_price,
              
              ((f1.arrival_time - f1.departure_time)+(f2.arrival_time - f2.departure_time)) as total_travel_time

            FROM
                flights f1
                JOIN aircraft ac1 ON ac1.aircraft_id = f1.aircraft_id
                JOIN airlines a1 ON ac1.airline_id = a1.airline_id
                JOIN airports apo1 ON apo1.airport_id = f1.origin_airport_id
                JOIN airports apd1 ON apd1.airport_id = f1.destination_airport_id
                
                JOIN flights f2 ON f2.origin_airport_id = f1.destination_airport_id 
                              AND f2.destination_airport_id = f1.origin_airport_id
                JOIN aircraft ac2 ON ac2.aircraft_id = f2.aircraft_id
                JOIN airlines a2 ON ac2.airline_id = a2.airline_id
                              AND a2.airline_id = a1.airline_id  

            WHERE 
                apo1.iata_code = $1 AND
                apd1.iata_code = $2 AND
                DATE(f1.departure_time) = $3 AND
                
                DATE(f2.departure_time) = $7 AND  
                
                (CASE 
                    WHEN $4 = 'Business' THEN f1.available_busi_seats 
                    ELSE f1.available_econ_seats 
                END) >= $5 AND
                
                (CASE 
                    WHEN $4 = 'Business' THEN f2.available_busi_seats 
                    ELSE f2.available_econ_seats 
                END) >= $5 AND
                
                f2.departure_time >= (f1.arrival_time + INTERVAL '2 hours')

            ORDER BY  `+ order_typ;

      const result = await pool.query(query2, [origin, destination, journeyDate, seatClass, parseInt(adults || 0) + parseInt(children || 0), total, returnDate]);
      console.log(result.rows);
      return res.json({
        data: result.rows
      });

    }
    // console.log(query1);
    const result = await pool.query(query1, [origin, destination, journeyDate, seatClass, parseInt(adults || 0) + parseInt(children || 0), total]);

    // const query1=`SELECT * FROM flights`;
    // const result = await pool.query(query1);
    // console.log(result.rows);
    return res.json({
      data: result.rows
    });

  }
  catch (error) {
    console.error('Flight search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search flights',
      error: error.message
    });
  }
};

const airlineFlights = async (req, res) => {
  const { airline_id } = req.params;
  try {
    const query = `
      SELECT *
      FROM flights f
      JOIN aircraft ac ON ac.aircraft_id=f.aircraft_id
      WHERE ac.airline_id = $1
    `;
    const result = await pool.query(query, [airline_id]);
    res.json({
      success: true,
      count: result.rowCount,
      data: result.rows
    });
  }
  catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch flights', error: error.message });
  }

};




module.exports = {
  getAllflights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight,
  searchFlights,
  airlineFlights
};
