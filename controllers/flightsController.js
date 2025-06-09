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
    if(orderType==='Cheapest'){
      if(seatClass==='Business') order_typ=`f.business_ticket_price`;
      else order_typ=`f.economy_ticket_price`;
    } 
    else if(orderType==='Fastest') order_typ=`f.arrival_time - f.departure_time`;
    else order_typ=`f.departure_time`

    
    let total = 0.75*parseInt(children || 0) + parseInt(adults || 0);

    // console.log(total);

    const query1 = `
      SELECT
        a.airline_name as airline_name,
        f.departure_time as departure_time,
        f.arrival_time as arrival_time,
        (f.arrival_time - f.departure_time) as flight_time,
        (CASE 
            WHEN $4 = 'Business' THEN f.business_ticket_price 
            ELSE f.economy_ticket_price 
        END)*($6) as ticket_price,
        f.baggage_limit as baggage_limit,
        ac.model as aircraft_name,
        f.flight_number as flight_number
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
        ORDER BY `+order_typ;  
    // console.log(query1);
    const result = await pool.query(query1,[origin,destination,journeyDate,seatClass,parseInt(adults || 0)+parseInt(children || 0),total]);
   
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
