const pool = require('../config/database');

// ✅ 1. GET /seats/aircraft/:aircraft_id
const getSeatsByAircraft = async (req, res) => {
  try {
    const aircraft_id = parseInt(req.params.aircraft_id);

    if (isNaN(aircraft_id)) {
      return res.status(400).json({ success: false, message: 'Invalid aircraft ID' });
    }

    const result = await pool.query(`
      SELECT * FROM seats WHERE aircraft_id = $1
    `, [aircraft_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No seats found for this aircraft' });
    }

    res.json({ success: true, data: result.rows });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seats',
      error: error.message
    });
  }
};

// ✅ 2. GET /seats/flight/:flight_id/available
const getAvailableSeatsByFlight = async (req, res) => {
  try {
    const flight_id = parseInt(req.params.flight_id);

    if (isNaN(flight_id)) {
      return res.status(400).json({ success: false, message: 'Invalid flight ID' });
    }

    const result = await pool.query(`
      SELECT s.*
      FROM seats s
      JOIN aircraft a ON s.aircraft_id = a.aircraft_id
      JOIN flights f ON f.aircraft_id = a.aircraft_id
      WHERE f.flight_id = $1 AND s.is_booked = FALSE
    `, [flight_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No available seats for this flight' });
    }

    res.json({ success: true, data: result.rows });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available seats',
      error: error.message
    });
  }
};

// ✅ 3. PUT /seats/:id/book
const bookSeat = async (req, res) => {
  try {
    const seat_id = parseInt(req.params.id);

    if (isNaN(seat_id)) {
      return res.status(400).json({ success: false, message: 'Invalid seat ID' });
    }

    // Check if already booked
    const seatCheck = await pool.query(`SELECT is_booked FROM seats WHERE seat_id = $1`, [seat_id]);
    if (seatCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Seat not found' });
    }

    if (seatCheck.rows[0].is_booked) {
      return res.status(409).json({ success: false, message: 'Seat already booked' });
    }

    const result = await pool.query(`
      UPDATE seats SET is_booked = TRUE WHERE seat_id = $1 RETURNING *
    `, [seat_id]);

    res.json({ success: true, message: 'Seat booked successfully', data: result.rows[0] });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to book seat',
      error: error.message
    });
  }
};

// ✅ 4. PUT /seats/:id/release
const releaseSeat = async (req, res) => {
  try {
    const seat_id = parseInt(req.params.id);

    if (isNaN(seat_id)) {
      return res.status(400).json({ success: false, message: 'Invalid seat ID' });
    }

    // Check if seat exists
    const seatCheck = await pool.query(`SELECT is_booked FROM seats WHERE seat_id = $1`, [seat_id]);
    if (seatCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Seat not found' });
    }

    if (!seatCheck.rows[0].is_booked) {
      return res.status(409).json({ success: false, message: 'Seat is already available' });
    }

    const result = await pool.query(`
      UPDATE seats SET is_booked = FALSE WHERE seat_id = $1 RETURNING *
    `, [seat_id]);

    res.json({ success: true, message: 'Seat released successfully', data: result.rows[0] });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to release seat',
      error: error.message
    });
  }
};

module.exports = {
  getSeatsByAircraft,
  getAvailableSeatsByFlight,
  bookSeat,
  releaseSeat
};
