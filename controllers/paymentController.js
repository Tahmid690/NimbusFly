const pool = require('../config/database');

// ✅ 1. GET /payments/booking/:booking_id
const getPaymentByBooking = async (req, res) => {
  try {
    const booking_id = parseInt(req.params.booking_id);
    if (isNaN(booking_id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    const result = await pool.query(`
      SELECT * FROM payments
      WHERE booking_id = $1
    `, [booking_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No payment found for this booking' });
    }

    res.json({ success: true, data: result.rows[0] });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment',
      error: error.message
    });
  }
};

// ✅ 2. POST /payments/process
const processPayment = async (req, res) => {
  try {
    const { booking_id, amount, payment_method, transaction_id, status } = req.body;

    if (!booking_id) return res.status(400).json({ success: false, message: 'Booking ID is required' });
    if (!amount) return res.status(400).json({ success: false, message: 'Amount is required' });
    if (!payment_method) return res.status(400).json({ success: false, message: 'Payment method is required' });
    if (!transaction_id) return res.status(400).json({ success: false, message: 'Transaction ID is required' });
    if (!status) return res.status(400).json({ success: false, message: 'Payment status is required' });

    const payment_date = new Date();

    const result = await pool.query(`
      INSERT INTO payments (booking_id, amount, payment_method, transaction_id, payment_date, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [booking_id, amount, payment_method, transaction_id, payment_date, status]);

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message
    });
  }
};

// ✅ 3. PUT /payments/:id/status
const updatePaymentStatus = async (req, res) => {
  try {
    const payment_id = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(payment_id)) {
      return res.status(400).json({ success: false, message: 'Invalid payment ID' });
    }

    if (!status) {
      return res.status(400).json({ success: false, message: 'Payment status is required' });
    }

    const result = await pool.query(`
      UPDATE payments
      SET status = $1
      WHERE payment_id = $2
      RETURNING *
    `, [status, payment_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

module.exports = {
  getPaymentByBooking,
  processPayment,
  updatePaymentStatus
};
