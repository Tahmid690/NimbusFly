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

// ✅ 2. GET /seats/flight/:flight_id/available?class=Economy|Business
const getAvailableSeatsByFlight = async (req, res) => {
  try {
    const flight_id = parseInt(req.params.flight_id);
    const seatClass = req.query.class; // Optional: filter by seat class

    if (isNaN(flight_id)) {
      return res.status(400).json({ success: false, message: 'Invalid flight ID' });
    }

    let query = `
      SELECT s.*
      FROM seats s
      JOIN aircraft a ON s.aircraft_id = a.aircraft_id
      JOIN flights f ON f.aircraft_id = a.aircraft_id
      WHERE f.flight_id = $1 
      AND s.seat_id NOT IN (
        -- Exclude seats already assigned to tickets for this specific flight
        SELECT DISTINCT t.seat_id 
        FROM ticket t 
        WHERE t.flight_id = $1 AND t.seat_id IS NOT NULL
      )
    `;
    
    const queryParams = [flight_id];
    
    // Add seat class filter if specified
    if (seatClass && (seatClass === 'Economy' || seatClass === 'Business')) {
      query += ` AND (s.class = $2 OR s.seat_class = $2)`;
      queryParams.push(seatClass);
    }
    
    query += ` ORDER BY s.seat_number`;

    const result = await pool.query(query, queryParams);

    if (result.rows.length === 0) {
      const classMsg = seatClass ? ` for ${seatClass} class` : '';
      return res.status(404).json({ 
        success: false, 
        message: `No available seats${classMsg} for this flight` 
      });
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
    const { flight_id, passenger_id, booking_id } = req.body;

    if (isNaN(seat_id)) {
      return res.status(400).json({ success: false, message: 'Invalid seat ID' });
    }

    if (!flight_id || !passenger_id || !booking_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'flight_id, passenger_id, and booking_id are required' 
      });
    }

    // Check if seat exists
    const seatCheck = await pool.query(`SELECT * FROM seats WHERE seat_id = $1`, [seat_id]);
    if (seatCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Seat not found' });
    }

    // Check if seat is already booked for this specific flight
    const flightSeatCheck = await pool.query(`
      SELECT * FROM ticket WHERE flight_id = $1 AND seat_id = $2
    `, [flight_id, seat_id]);

    if (flightSeatCheck.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Seat already booked for this flight' });
    }

    // Book the seat by creating a ticket record (assuming price needs to be provided)
    const price = req.body.price || 0;
    const result = await pool.query(`
      INSERT INTO ticket (booking_id, flight_id, passenger_id, seat_id, price)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [booking_id, flight_id, passenger_id, seat_id, price]);

    res.json({ 
      success: true, 
      message: 'Seat booked successfully for flight', 
      data: {
        ticket: result.rows[0],
        seat: seatCheck.rows[0]
      }
    });

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
    const { flight_id } = req.body;

    if (isNaN(seat_id)) {
      return res.status(400).json({ success: false, message: 'Invalid seat ID' });
    }

    if (!flight_id) {
      return res.status(400).json({ success: false, message: 'flight_id is required' });
    }

    // Check if seat exists
    const seatCheck = await pool.query(`SELECT * FROM seats WHERE seat_id = $1`, [seat_id]);
    if (seatCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Seat not found' });
    }

    // Check if seat is booked for this specific flight
    const ticketCheck = await pool.query(`
      SELECT * FROM ticket WHERE flight_id = $1 AND seat_id = $2
    `, [flight_id, seat_id]);

    if (ticketCheck.rows.length === 0) {
      return res.status(409).json({ success: false, message: 'Seat is not booked for this flight' });
    }

    // Release the seat by deleting the ticket record
    const result = await pool.query(`
      DELETE FROM ticket WHERE flight_id = $1 AND seat_id = $2 RETURNING *
    `, [flight_id, seat_id]);

    res.json({ 
      success: true, 
      message: 'Seat released successfully for flight', 
      data: {
        released_ticket: result.rows[0],
        seat: seatCheck.rows[0]
      }
    });

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
