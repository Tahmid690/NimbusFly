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

  console.log("yeppi");

  try {

    let flights = [];

    //One-Way

    const query1=`SELECT * FROM flights`;
    const result=await pool.query(query1);
    return res.json({
      data:result.rows
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