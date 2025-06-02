const pool = require('../config/database');

const getCustomerBooking = async (req, res) => {
  try {
    const id = parseInt(req.params.customer_id); // FIXED: res.params → req.params
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Customer ID'
      });
    }

    const result = await pool.query(`
      SELECT (cus.first_name || ' ' || cus.last_name) AS customer_name,
             bk.*
      FROM bookings bk
      LEFT JOIN customer cus ON bk.customer_id = cus.customer_id
      WHERE bk.customer_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking of this customer not found'
      });
    }

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch booking for customer',
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

module.exports = {
  getCustomerBooking,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking
};
