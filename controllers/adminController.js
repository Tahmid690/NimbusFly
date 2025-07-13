const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if admin exists
    const adminQuery = `
      SELECT aa.*, a.airline_name 
      FROM airline_admin aa
      LEFT JOIN airlines a ON aa.airline_id = a.airline_id
      WHERE aa.email = $1
    `;
    const adminResult = await pool.query(adminQuery, [email]);

    if (adminResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const admin = adminResult.rows[0];

    // Verify password (assuming passwords are hashed)
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        admin_id: admin.admin_id, 
        airline_id: admin.airline_id,
        email: admin.email,
        role: 'admin'
      },
      process.env.JWT_SECRET || 'nimbusfly_admin_secret',
      { expiresIn: '24h' }
    );

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [admin.admin_id, 'LOGIN', `Admin login from IP: ${req.ip}`]
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin_id: admin.admin_id,
        email: admin.email,
        airline_id: admin.airline_id,
        airline_name: admin.airline_name,
        role: 'admin',
        token: token
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get dashboard analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const { airline_id } = req.admin;
    const today = new Date().toISOString().split('T')[0];

    // Get today's bookings
    const todayBookingsQuery = `
      SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue
      FROM bookings b
      JOIN flights f ON EXISTS (
        SELECT 1 FROM ticket t WHERE t.booking_id = b.booking_id AND t.flight_id = f.flight_id
      )
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      WHERE ac.airline_id = $1 AND DATE(b.booking_date) = $2
    `;
    const todayBookings = await pool.query(todayBookingsQuery, [airline_id, today]);

    // Get active flights today
    const activeFlightsQuery = `
      SELECT COUNT(*) as count
      FROM flights f
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      WHERE ac.airline_id = $1 AND DATE(f.departure_time) = $2
    `;
    const activeFlights = await pool.query(activeFlightsQuery, [airline_id, today]);

    // Get load factor
    const loadFactorQuery = `
      SELECT 
        ac.total_seats,
        COUNT(t.ticket_id) as booked_seats
      FROM flights f
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      LEFT JOIN ticket t ON t.flight_id = f.flight_id
      WHERE ac.airline_id = $1 AND DATE(f.departure_time) = $2
      GROUP BY ac.total_seats
    `;
    const loadFactor = await pool.query(loadFactorQuery, [airline_id, today]);

    // Calculate average load factor
    let avgLoadFactor = 0;
    if (loadFactor.rows.length > 0) {
      const totalSeats = loadFactor.rows.reduce((sum, row) => sum + row.total_seats, 0);
      const bookedSeats = loadFactor.rows.reduce((sum, row) => sum + parseInt(row.booked_seats), 0);
      avgLoadFactor = totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;
    }

    // Get recent bookings
    const recentBookingsQuery = `
      SELECT 
        b.booking_id,
        b.total_amount,
        b.booking_date,
        c.first_name || ' ' || c.last_name as customer_name,
        f.flight_number,
        f.departure_time
      FROM bookings b
      JOIN customer c ON b.customer_id = c.customer_id
      JOIN ticket t ON t.booking_id = b.booking_id
      JOIN flights f ON t.flight_id = f.flight_id
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      WHERE ac.airline_id = $1
      ORDER BY b.booking_date DESC
      LIMIT 10
    `;
    const recentBookings = await pool.query(recentBookingsQuery, [airline_id]);

    res.json({
      success: true,
      data: {
        kpis: {
          todayBookings: parseInt(todayBookings.rows[0].count),
          todayRevenue: parseFloat(todayBookings.rows[0].revenue),
          activeFlights: parseInt(activeFlights.rows[0].count),
          loadFactor: Math.round(avgLoadFactor * 100) / 100
        },
        recentBookings: recentBookings.rows
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard analytics',
      error: error.message
    });
  }
};

// Get revenue analytics
const getRevenueAnalytics = async (req, res) => {
  try {
    const { airline_id } = req.admin;
    const { period = '7d' } = req.query;

    let dateFilter = '';
    switch (period) {
      case '7d':
        dateFilter = "AND b.booking_date >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case '30d':
        dateFilter = "AND b.booking_date >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      case '90d':
        dateFilter = "AND b.booking_date >= CURRENT_DATE - INTERVAL '90 days'";
        break;
      default:
        dateFilter = "AND b.booking_date >= CURRENT_DATE - INTERVAL '7 days'";
    }

    // Daily revenue for chart
    const revenueQuery = `
      SELECT 
        DATE(b.booking_date) as date,
        COUNT(b.booking_id) as bookings,
        COALESCE(SUM(b.total_amount), 0) as revenue
      FROM bookings b
      JOIN ticket t ON t.booking_id = b.booking_id
      JOIN flights f ON t.flight_id = f.flight_id
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      WHERE ac.airline_id = $1 ${dateFilter}
      GROUP BY DATE(b.booking_date)
      ORDER BY DATE(b.booking_date)
    `;
    const revenueData = await pool.query(revenueQuery, [airline_id]);

    // Route performance
    const routeQuery = `
      SELECT 
        ap1.iata_code as origin,
        ap2.iata_code as destination,
        COUNT(b.booking_id) as bookings,
        COALESCE(SUM(b.total_amount), 0) as revenue
      FROM bookings b
      JOIN ticket t ON t.booking_id = b.booking_id
      JOIN flights f ON t.flight_id = f.flight_id
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      JOIN airports ap1 ON f.origin_airport_id = ap1.airport_id
      JOIN airports ap2 ON f.destination_airport_id = ap2.airport_id
      WHERE ac.airline_id = $1 ${dateFilter}
      GROUP BY ap1.iata_code, ap2.iata_code
      ORDER BY revenue DESC
      LIMIT 10
    `;
    const routeData = await pool.query(routeQuery, [airline_id]);

    res.json({
      success: true,
      data: {
        dailyRevenue: revenueData.rows,
        topRoutes: routeData.rows
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue analytics',
      error: error.message
    });
  }
};

module.exports = {
  adminLogin,
  getDashboardAnalytics,
  getRevenueAnalytics
};