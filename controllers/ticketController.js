const pool = require('../config/database');

// 1. GET /tickets/booking/:booking_id
const getTicketsByBooking = async (req, res) => {
  try {
    const booking_id = parseInt(req.params.booking_id);

    if (isNaN(booking_id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    const result = await pool.query(`
      SELECT * FROM tickets
      WHERE booking_id = $1
    `, [booking_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No tickets found for this booking' });
    }

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets for booking',
      error: error.message
    });
  }
};

//  2. GET /tickets/:id
const getTicketById = async (req, res) => {
  try {
    const ticket_id = parseInt(req.params.id);

    if (isNaN(ticket_id)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket ID' });
    }

    const result = await pool.query(`
      SELECT * FROM tickets
      WHERE ticket_id = $1
    `, [ticket_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket',
      error: error.message
    });
  }
};

//  3. POST /tickets/generate
const generateTicket = async (req, res) => {
  try {
    const { booking_id, flight_id, passenger_id, seat_id, price } = req.body;

    // Validation
    if (!booking_id) return res.status(400).json({ success: false, message: 'Booking ID is required' });
    if (!flight_id) return res.status(400).json({ success: false, message: 'Flight ID is required' });
    if (!passenger_id) return res.status(400).json({ success: false, message: 'Passenger ID is required' });
    if (!seat_id) return res.status(400).json({ success: false, message: 'Seat ID is required' });
    if (!price) return res.status(400).json({ success: false, message: 'Price is required' });

    const result = await pool.query(`
      INSERT INTO tickets (booking_id, flight_id, passenger_id, seat_id, price)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [booking_id, flight_id, passenger_id, seat_id, price]);

    res.status(201).json({
      success: true,
      message: 'Ticket generated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate ticket',
      error: error.message
    });
  }
};

module.exports = {
  getTicketsByBooking,
  getTicketById,
  generateTicket
};
