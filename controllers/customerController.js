const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Get customer profile by ID
const getCustomerProfile = async (req, res) => {
  try {
    const customer_id = parseInt(req.params.customer_id);
    
    if (isNaN(customer_id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid customer ID' 
      });
    }

    const result = await pool.query(`
      SELECT 
        customer_id,
        first_name,
        last_name,
        email,
        phone_number,
        date_of_birth,
        address
      FROM customer
      WHERE customer_id = $1
    `, [customer_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer profile',
      error: error.message
    });
  }
};

// Update customer profile
const updateCustomerProfile = async (req, res) => {
  try {
    const customer_id = parseInt(req.params.customer_id);
    const { first_name, last_name, email, phone_number, date_of_birth, address } = req.body;

    if (isNaN(customer_id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid customer ID' 
      });
    }

    // Basic validation
    if (!first_name || !last_name || !email || !phone_number || !address) {
      return res.status(400).json({ 
        success: false, 
        message: 'First name, last name, email, phone number, and address are required' 
      });
    }

    // Check if email is already used by another customer
    const emailCheck = await pool.query(`
      SELECT customer_id FROM customer 
      WHERE email = $1 AND customer_id != $2
    `, [email, customer_id]);

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email is already in use by another customer' 
      });
    }

    // Check if phone number is already used by another customer
    const phoneCheck = await pool.query(`
      SELECT customer_id FROM customer 
      WHERE phone_number = $1 AND customer_id != $2
    `, [phone_number, customer_id]);

    if (phoneCheck.rows.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Phone number is already in use by another customer' 
      });
    }

    const result = await pool.query(`
      UPDATE customer
      SET 
        first_name = $1,
        last_name = $2,
        email = $3,
        phone_number = $4,
        date_of_birth = $5,
        address = $6
      WHERE customer_id = $7
      RETURNING customer_id, first_name, last_name, email, phone_number, date_of_birth, address
    `, [first_name, last_name, email, phone_number, date_of_birth, address, customer_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      if (error.constraint?.includes('email')) {
        return res.status(409).json({ 
          success: false, 
          message: 'Email is already in use' 
        });
      }
      if (error.constraint?.includes('phone')) {
        return res.status(409).json({ 
          success: false, 
          message: 'Phone number is already in use' 
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Get customer statistics
const getCustomerStats = async (req, res) => {
  try {
    const customer_id = parseInt(req.params.customer_id);
    
    if (isNaN(customer_id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid customer ID' 
      });
    }

    const result = await pool.query(`
      SELECT 
        COUNT(DISTINCT b.booking_id) as total_bookings,
        COUNT(DISTINCT t.ticket_id) as total_tickets,
        COALESCE(SUM(b.total_amount), 0) as total_spent,
        COUNT(DISTINCT CASE 
          WHEN f.departure_time > NOW() 
          THEN b.booking_id 
        END) as upcoming_flights
      FROM customer c
      LEFT JOIN bookings b ON c.customer_id = b.customer_id
      LEFT JOIN ticket t ON b.booking_id = t.booking_id
      LEFT JOIN flights f ON t.flight_id = f.flight_id
      WHERE c.customer_id = $1
      GROUP BY c.customer_id
    `, [customer_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer statistics',
      error: error.message
    });
  }
};


const updateCustomerPassword = async (req, res) => {
  try {
    const { customer_id } = req.params; // Get customer ID from URL params
    const { current_password, new_password, confirm_password } = req.body;

    // Input validation
    if (!customer_id) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }

    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password, and confirmation are required'
      });
    }

    // Check if new passwords match
    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match'
      });
    }

    // Password strength validation
    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Additional password strength check (optional)
    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    // if (!passwordRegex.test(new_password)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    //   });
    // }

    // Get current customer data
    const customerQuery = 'SELECT customer_id, email, password FROM customer WHERE customer_id = $1';
    const customerResult = await pool.query(customerQuery, [customer_id]);

    if (customerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const customer = customerResult.rows[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(current_password, customer.password);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(new_password, customer.password);
    
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(new_password, saltRounds);

    // Update password in database
    const updateQuery = `
      UPDATE customer 
      SET password = $1 
      WHERE customer_id = $2
      RETURNING customer_id, email, first_name, last_name
    `;
    
    const updateResult = await pool.query(updateQuery, [hashedNewPassword, customer_id]);

    // Success response
    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      data: {
        customer_id: updateResult.rows[0].customer_id,
        email: updateResult.rows[0].email,
        name: `${updateResult.rows[0].first_name} ${updateResult.rows[0].last_name}`,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


module.exports = {
  getCustomerProfile,
  updateCustomerProfile,
  getCustomerStats,
  updateCustomerPassword
};