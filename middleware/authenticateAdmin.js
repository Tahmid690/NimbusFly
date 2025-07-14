// middleware/authenticateAdmin.js
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateAdmin = async (req, res, next) => {
  try {
    console.log('Authenticating admin request...');
    
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No authorization header or invalid format');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('Token extracted:', token ? 'Token present' : 'No token');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bugi_na_bai_bugi_na');
    console.log('Token decoded successfully:', {
      admin_id: decoded.admin_id,
      airline_id: decoded.airline_id,
      email: decoded.email
    });

    // Verify admin still exists and is active
    const adminQuery = `
      SELECT aa.*, a.airline_name 
      FROM airline_admin aa
      LEFT JOIN airlines a ON aa.airline_id = a.airline_id
      WHERE aa.admin_id = $1 AND aa.airline_id = $2
    `;
    
    const adminResult = await pool.query(adminQuery, [decoded.admin_id, decoded.airline_id]);

    if (adminResult.rows.length === 0) {
      console.log('Admin not found in database');
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Admin not found.'
      });
    }

    const admin = adminResult.rows[0];
    console.log('Admin verified:', {
      admin_id: admin.admin_id,
      email: admin.email,
      airline_id: admin.airline_id,
      airline_name: admin.airline_name
    });

    // Add admin info to request object
    req.admin = {
      admin_id: admin.admin_id,
      email: admin.email,
      airline_id: admin.airline_id,
      airline_name: admin.airline_name,
      role: 'admin'
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed.',
      error: error.message
    });
  }
};

module.exports = authenticateAdmin;