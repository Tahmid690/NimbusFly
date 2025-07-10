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
    const { 
      customer_id, 
      passengers, 
      flight_data, 
      payment_method, 
      billing_address, 
      total_amount 
    } = req.body;

    if (!customer_id) return res.status(400).json({ success: false, message: 'Customer ID is required' });
    if (!passengers || passengers.length === 0) return res.status(400).json({ success: false, message: 'Passenger data is required' });
    if (!flight_data) return res.status(400).json({ success: false, message: 'Flight data is required' });
    if (!payment_method) return res.status(400).json({ success: false, message: 'Payment method is required' });
    if (!total_amount) return res.status(400).json({ success: false, message: 'Total amount is required' });

    // Generate booking ID and transaction ID
    const booking_id = `NF${Date.now().toString().slice(-6)}`;
    const transaction_id = `TXN${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const payment_date = new Date();

    // In a real application, you would:
    // 1. Create a booking record first
    // 2. Process payment with payment gateway
    // 3. Create passenger records
    // 4. Create ticket records
    // 5. Send confirmation emails

    // For demo purposes, we'll simulate successful payment
    const paymentResult = {
      payment_id: Date.now(),
      booking_id: booking_id,
      amount: total_amount,
      payment_method: payment_method,
      transaction_id: transaction_id,
      payment_date: payment_date,
      status: 'completed'
    };

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      booking_id: booking_id,
      transaction_id: transaction_id,
      amount: total_amount,
      status: 'completed',
      data: paymentResult
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
