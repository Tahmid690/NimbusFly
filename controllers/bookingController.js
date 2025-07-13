const pool = require('../config/database');

const getCustomerBooking = async (req, res) => {
  try {
    const id = parseInt(req.params.customer_id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Customer ID'
      });
    }

    const result = await pool.query(`
      SELECT 
        bk.*,
        (cus.first_name || ' ' || cus.last_name) AS customer_name,
        cus.email as customer_email,
        cus.phone_number as customer_phone,
        COUNT(t.ticket_id) as total_passengers,
        STRING_AGG(DISTINCT f.flight_number, ', ') as flight_numbers,
        STRING_AGG(DISTINCT (origin_airport.iata_code || '-' || dest_airport.iata_code), ', ') as routes,
        MIN(f.departure_time) as earliest_departure,
        MAX(f.arrival_time) as latest_arrival,
        STRING_AGG(DISTINCT al.airline_name, ', ') as airlines
      FROM bookings bk
      LEFT JOIN customer cus ON bk.customer_id = cus.customer_id
      LEFT JOIN ticket t ON bk.booking_id = t.booking_id
      LEFT JOIN flights f ON t.flight_id = f.flight_id
      LEFT JOIN airports origin_airport ON f.origin_airport_id = origin_airport.airport_id
      LEFT JOIN airports dest_airport ON f.destination_airport_id = dest_airport.airport_id
      LEFT JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      LEFT JOIN airlines al ON ac.airline_id = al.airline_id
      WHERE bk.customer_id = $1
      GROUP BY bk.booking_id, cus.first_name, cus.last_name, cus.email, cus.phone_number
      ORDER BY bk.booking_date DESC
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No bookings found for this customer'
      });
    }

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch bookings for customer',
      error: error.message
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Booking ID'
      });
    }

    const result = await pool.query(`
      SELECT * FROM bookings
      WHERE booking_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking of this ID not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch booking',
      error: error.message
    });
  }
};

const createBooking = async (req, res) => {
  try {
    const { customer_id, total_amount, payment_status, trip_type } = req.body;

    if (!customer_id) {
      return res.status(400).json({ success: false, message: 'Customer ID is required' });
    }
    if (!total_amount) {
      return res.status(400).json({ success: false, message: 'Total amount is required' });
    }
    if (!payment_status) {
      return res.status(400).json({ success: false, message: 'Payment status is required' });
    }
    if (!trip_type) {
      return res.status(400).json({ success: false, message: 'Trip type is required' });
    }

    const booking_date = new Date();

    const result = await pool.query(`
      INSERT INTO bookings (customer_id, booking_date, total_amount, payment_status, trip_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [customer_id, booking_date, total_amount, payment_status, trip_type]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: result.rows[0]
    });

  } catch (error) {
    if (error.code === '23503') {
      res.status(409).json({ success: false, message: 'Customer not found.' });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create booking',
        error: error.message
      });
    }
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking_id = parseInt(req.params.id);
    const { customer_id, total_amount, payment_status, trip_type } = req.body;

    if (isNaN(booking_id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    if (!customer_id) {
      return res.status(400).json({ success: false, message: 'Customer ID is required' });
    }
    if (!total_amount) {
      return res.status(400).json({ success: false, message: 'Total amount is required' });
    }
    if (!payment_status) {
      return res.status(400).json({ success: false, message: 'Payment status is required' });
    }
    if (!trip_type) {
      return res.status(400).json({ success: false, message: 'Trip type is required' });
    }

    const result = await pool.query(`
      UPDATE bookings
      SET customer_id = $1, total_amount = $2, payment_status = $3, trip_type = $4
      WHERE booking_id = $5
      RETURNING *
    `, [customer_id, total_amount, payment_status, trip_type, booking_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: error.message
    });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking_id = parseInt(req.params.id);

    if (isNaN(booking_id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    const result = await pool.query(`
      DELETE FROM bookings
      WHERE booking_id = $1
      RETURNING *
    `, [booking_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
};

// Get detailed booking information with flights, passengers, and tickets
const getBookingDetails = async (req, res) => {
  try {
    const booking_id = parseInt(req.params.id);

    if (isNaN(booking_id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    // Get booking info
    const bookingResult = await pool.query(`
      SELECT 
        bk.*,
        (cus.first_name || ' ' || cus.last_name) AS customer_name,
        cus.email as customer_email,
        cus.phone_number as customer_phone
      FROM bookings bk
      LEFT JOIN customer cus ON bk.customer_id = cus.customer_id
      WHERE bk.booking_id = $1
    `, [booking_id]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Get tickets with flight and passenger details
    const ticketsResult = await pool.query(`
      SELECT 
        t.*,
        f.flight_number,
        f.departure_time,
        f.arrival_time,
        origin_airport.iata_code as origin_code,
        origin_airport.airport_name as origin_airport,
        dest_airport.iata_code as destination_code,
        dest_airport.airport_name as destination_airport,
        al.airline_name,
        al.logo_url,
        ac.model as aircraft_model,
        p.first_name as passenger_first_name,
        p.last_name as passenger_last_name,
        p.passport_number,
        p.date_of_birth,
        p.nationality,
        s.seat_number,
        s.seat_class
      FROM ticket t
      LEFT JOIN flights f ON t.flight_id = f.flight_id
      LEFT JOIN airports origin_airport ON f.origin_airport_id = origin_airport.airport_id
      LEFT JOIN airports dest_airport ON f.destination_airport_id = dest_airport.airport_id
      LEFT JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      LEFT JOIN airlines al ON ac.airline_id = al.airline_id
      LEFT JOIN passengers p ON t.passenger_id = p.passenger_id
      LEFT JOIN seats s ON t.seat_id = s.seat_id
      WHERE t.booking_id = $1
      ORDER BY f.departure_time, p.first_name
    `, [booking_id]);

    res.json({
      success: true,
      data: {
        booking: bookingResult.rows[0],
        tickets: ticketsResult.rows
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking details',
      error: error.message
    });
  }
};

module.exports = {
  getCustomerBooking,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  getBookingDetails
};
