const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
      process.env.JWT_SECRET || 'bugi_na_bai_bugi_na',
      { expiresIn: '24h' }
    );

    // Log admin activity (commented out - table may not exist)
    // await pool.query(
    //   'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
    //   [admin.admin_id, 'LOGIN', `Admin login from IP: ${req.ip}`]
    // );

res.json({
  success: true,
  message: 'Login successful',
  data: {
    admin: {
      admin_id: admin.admin_id,
      email: admin.email,
      airline_id: admin.airline_id,
      airline_name: admin.airline_name,
      role: 'admin'
    },
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

// Get bookings for admin's airline
const getAdminBookings = async (req, res) => {
  try {
    const { airline_id } = req.admin;
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE ac.airline_id = $1';
    let params = [airline_id];
    let paramCount = 1;

    // Add status filter
    if (status && status !== 'all') {
      whereClause += ` AND b.payment_status = $${++paramCount}`;
      params.push(status);
    }

    // Add search filter
    if (search) {
      whereClause += ` AND (
        LOWER(c.first_name || ' ' || c.last_name) LIKE $${++paramCount} OR
        LOWER(c.email) LIKE $${++paramCount} OR
        CAST(b.booking_id AS TEXT) LIKE $${++paramCount} OR
        LOWER(f.flight_number) LIKE $${++paramCount}
      )`;
      const searchTerm = `%${search.toLowerCase()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT b.booking_id) as total
      FROM bookings b
      JOIN customer c ON b.customer_id = c.customer_id
      JOIN ticket t ON b.booking_id = t.booking_id
      JOIN flights f ON t.flight_id = f.flight_id
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const totalBookings = parseInt(countResult.rows[0].total);

    // Get bookings with pagination
    const bookingsQuery = `
      SELECT 
        b.booking_id,
        b.booking_date,
        b.total_amount,
        b.payment_status,
        b.trip_type,
        c.first_name || ' ' || c.last_name as customer_name,
        c.email as customer_email,
        c.phone_number as customer_phone,
        COUNT(DISTINCT t.ticket_id) as total_passengers,
        STRING_AGG(DISTINCT f.flight_number, ', ') as flight_numbers,
        STRING_AGG(DISTINCT (origin_airport.iata_code || '-' || dest_airport.iata_code), ', ') as routes,
        MIN(f.departure_time) as earliest_departure,
        MAX(f.arrival_time) as latest_arrival,
        al.airline_name,
        al.logo_url,
        b.booking_date as created_at
      FROM bookings b
      JOIN customer c ON b.customer_id = c.customer_id
      JOIN ticket t ON b.booking_id = t.booking_id
      JOIN flights f ON t.flight_id = f.flight_id
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      JOIN airlines al ON ac.airline_id = al.airline_id
      JOIN airports origin_airport ON f.origin_airport_id = origin_airport.airport_id
      JOIN airports dest_airport ON f.destination_airport_id = dest_airport.airport_id
      ${whereClause}
      GROUP BY b.booking_id, c.first_name, c.last_name, c.email, c.phone_number, al.airline_name, al.logo_url
      ORDER BY b.booking_date DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    params.push(limit, offset);

    const bookingsResult = await pool.query(bookingsQuery, params);

    res.json({
      success: true,
      data: bookingsResult.rows,
      pagination: {
        total: totalBookings,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalBookings / limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Get booking analytics for admin
const getBookingAnalytics = async (req, res) => {
  try {
    const { airline_id } = req.admin;
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get booking statistics
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT b.booking_id) as total_bookings,
        COUNT(DISTINCT CASE WHEN b.payment_status = 'PAID' THEN b.booking_id END) as confirmed_bookings,
        COUNT(DISTINCT CASE WHEN b.payment_status = 'UNPAID' THEN b.booking_id END) as pending_bookings,
        COUNT(DISTINCT CASE WHEN b.payment_status = 'CANCELLED' THEN b.booking_id END) as cancelled_bookings,
        COALESCE(SUM(CASE WHEN b.payment_status = 'PAID' THEN b.total_amount END), 0) as total_revenue,
        COUNT(DISTINCT CASE WHEN DATE(b.booking_date) = $2 THEN b.booking_id END) as today_bookings,
        COALESCE(SUM(CASE WHEN DATE(b.booking_date) = $2 AND b.payment_status = 'PAID' THEN b.total_amount END), 0) as today_revenue,
        COUNT(DISTINCT c.customer_id) as total_passengers,
        COUNT(DISTINCT t.ticket_id) as total_tickets
      FROM bookings b
      JOIN customer c ON b.customer_id = c.customer_id
      JOIN ticket t ON b.booking_id = t.booking_id
      JOIN flights f ON t.flight_id = f.flight_id
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      WHERE ac.airline_id = $1 AND b.booking_date >= $3
    `;
    const statsResult = await pool.query(statsQuery, [airline_id, today, thirtyDaysAgo]);

    // Get recent bookings
    const recentBookingsQuery = `
      SELECT 
        b.booking_id,
        b.booking_date,
        b.total_amount,
        b.payment_status,
        c.first_name || ' ' || c.last_name as customer_name,
        STRING_AGG(DISTINCT f.flight_number, ', ') as flight_numbers,
        MIN(f.departure_time) as earliest_departure
      FROM bookings b
      JOIN customer c ON b.customer_id = c.customer_id
      JOIN ticket t ON b.booking_id = t.booking_id
      JOIN flights f ON t.flight_id = f.flight_id
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      WHERE ac.airline_id = $1
      GROUP BY b.booking_id, c.first_name, c.last_name
      ORDER BY b.booking_date DESC
      LIMIT 10
    `;
    const recentBookingsResult = await pool.query(recentBookingsQuery, [airline_id]);

    // Get flight statistics
    const flightStatsQuery = `
      SELECT 
        COUNT(*) as total_flights,
        COUNT(CASE WHEN f.departure_time > NOW() THEN 1 END) as upcoming_flights
      FROM flights f
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      WHERE ac.airline_id = $1
    `;
    const flightStatsResult = await pool.query(flightStatsQuery, [airline_id]);

    // Get upcoming flights
    const upcomingFlightsQuery = `
      SELECT 
        f.flight_id,
        f.flight_number,
        f.departure_time,
        f.arrival_time,
        origin_airport.iata_code as origin_code,
        dest_airport.iata_code as destination_code,
        f.available_seats,
        (ac.total_seats - f.available_seats) as booked_seats
      FROM flights f
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      JOIN airports origin_airport ON f.origin_airport_id = origin_airport.airport_id
      JOIN airports dest_airport ON f.destination_airport_id = dest_airport.airport_id
      WHERE ac.airline_id = $1 AND f.departure_time > NOW()
      ORDER BY f.departure_time
      LIMIT 10
    `;
    const upcomingFlightsResult = await pool.query(upcomingFlightsQuery, [airline_id]);

    // Transform the stats to camelCase for frontend compatibility
    const stats = statsResult.rows[0];
    const flightStats = flightStatsResult.rows[0];
    const transformedStats = {
      totalBookings: parseInt(stats.total_bookings),
      confirmedBookings: parseInt(stats.confirmed_bookings),
      pendingBookings: parseInt(stats.pending_bookings),
      cancelledBookings: parseInt(stats.cancelled_bookings),
      totalRevenue: parseFloat(stats.total_revenue),
      todayBookings: parseInt(stats.today_bookings),
      todayRevenue: parseFloat(stats.today_revenue),
      totalPassengers: parseInt(stats.total_passengers),
      totalTickets: parseInt(stats.total_tickets),
      totalFlights: parseInt(flightStats.total_flights),
      upcomingFlights: parseInt(flightStats.upcoming_flights)
    };

    res.json({
      success: true,
      data: {
        stats: transformedStats,
        recentBookings: recentBookingsResult.rows,
        upcomingFlights: upcomingFlightsResult.rows
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking analytics',
      error: error.message
    });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { airline_id } = req.admin;
    const { booking_id } = req.params;
    const { payment_status } = req.body;

    if (!payment_status || !['pending', 'confirmed', 'cancelled'].includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }

    // Verify booking belongs to admin's airline
    const verifyQuery = `
      SELECT b.booking_id 
      FROM bookings b
      JOIN ticket t ON b.booking_id = t.booking_id
      JOIN flights f ON t.flight_id = f.flight_id
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      WHERE b.booking_id = $1 AND ac.airline_id = $2
      LIMIT 1
    `;
    const verifyResult = await pool.query(verifyQuery, [booking_id, airline_id]);

    if (verifyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or access denied'
      });
    }

    // Update booking status
    const updateQuery = `
      UPDATE bookings 
      SET payment_status = $1
      WHERE booking_id = $2
      RETURNING *
    `;
    const updateResult = await pool.query(updateQuery, [payment_status, booking_id]);

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: updateResult.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

// Get detailed booking information
const getBookingDetails = async (req, res) => {
  try {
    const { airline_id } = req.admin;
    const { booking_id } = req.params;

    // Get booking details
    const bookingQuery = `
      SELECT 
        b.*,
        c.first_name || ' ' || c.last_name as customer_name,
        c.email as customer_email,
        c.phone_number as customer_phone,
        c.address as customer_address,
        c.date_of_birth as customer_dob
      FROM bookings b
      JOIN customer c ON b.customer_id = c.customer_id
      WHERE b.booking_id = $1
    `;
    const bookingResult = await pool.query(bookingQuery, [booking_id]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify booking belongs to admin's airline
    const verifyQuery = `
      SELECT DISTINCT ac.airline_id
      FROM bookings b
      JOIN ticket t ON b.booking_id = t.booking_id
      JOIN flights f ON t.flight_id = f.flight_id
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      WHERE b.booking_id = $1 AND ac.airline_id = $2
    `;
    const verifyResult = await pool.query(verifyQuery, [booking_id, airline_id]);
    
    if (verifyResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - booking not associated with your airline'
      });
    }

    // Get tickets and flight details
    const ticketsQuery = `
      SELECT 
        t.*,
        f.flight_number,
        f.departure_time,
        f.arrival_time,
        origin_airport.iata_code as origin_code,
        origin_airport.airport_name as origin_airport,
        dest_airport.iata_code as destination_code,
        dest_airport.airport_name as destination_airport,
        ac.model as aircraft_model,
        al.airline_name,
        p.first_name as passenger_first_name,
        p.last_name as passenger_last_name,
        p.passport_number,
        p.date_of_birth as passenger_dob,
        p.nationality,
        s.seat_number,
        s.seat_class
      FROM ticket t
      JOIN flights f ON t.flight_id = f.flight_id
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      JOIN airlines al ON ac.airline_id = al.airline_id
      JOIN airports origin_airport ON f.origin_airport_id = origin_airport.airport_id
      JOIN airports dest_airport ON f.destination_airport_id = dest_airport.airport_id
      JOIN passengers p ON t.passenger_id = p.passenger_id
      LEFT JOIN seats s ON t.seat_id = s.seat_id
      WHERE t.booking_id = $1
      ORDER BY f.departure_time, p.first_name
    `;
    const ticketsResult = await pool.query(ticketsQuery, [booking_id]);

    // Get payment details
    const paymentQuery = `
      SELECT * FROM payments 
      WHERE booking_id = $1
      ORDER BY payment_date DESC
    `;
    const paymentResult = await pool.query(paymentQuery, [booking_id]);

    res.json({
      success: true,
      data: {
        booking: bookingResult.rows[0],
        tickets: ticketsResult.rows,
        payments: paymentResult.rows
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

// Test database connectivity
const testDatabase = async (req, res) => {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const testQuery = 'SELECT COUNT(*) as total FROM bookings';
    const testResult = await pool.query(testQuery);
    console.log('Total bookings in database:', testResult.rows[0].total);
    
    // Test airlines
    const airlinesQuery = 'SELECT * FROM airlines';
    const airlinesResult = await pool.query(airlinesQuery);
    console.log('Airlines in database:', airlinesResult.rows);
    
    // Test admin table
    const adminQuery = 'SELECT * FROM airline_admin';
    const adminResult = await pool.query(adminQuery);
    console.log('Admins in database:', adminResult.rows);
    
    // Test bookings by airline
    const bookingsByAirlineQuery = `
      SELECT ac.airline_id, al.airline_name, COUNT(DISTINCT b.booking_id) as booking_count
      FROM bookings b
      JOIN ticket t ON b.booking_id = t.booking_id
      JOIN flights f ON t.flight_id = f.flight_id
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      JOIN airlines al ON ac.airline_id = al.airline_id
      GROUP BY ac.airline_id, al.airline_name
      ORDER BY booking_count DESC
    `;
    const bookingsByAirlineResult = await pool.query(bookingsByAirlineQuery);
    console.log('Bookings by airline:', bookingsByAirlineResult.rows);
    
    res.json({
      success: true,
      data: {
        totalBookings: testResult.rows[0].total,
        airlines: airlinesResult.rows,
        admins: adminResult.rows,
        bookingsByAirline: bookingsByAirlineResult.rows
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
};


// Export bookings as CSV
const exportBookings = async (req, res) => {
  try {
    const { airline_id } = req.admin;
    
    const bookingsQuery = `
      SELECT 
        b.booking_id,
        b.booking_date,
        b.total_amount,
        b.payment_status,
        b.trip_type,
        c.first_name || ' ' || c.last_name as customer_name,
        c.email as customer_email,
        c.phone_number as customer_phone,
        STRING_AGG(DISTINCT f.flight_number, ', ') as flight_numbers,
        STRING_AGG(DISTINCT (origin_airport.iata_code || '-' || dest_airport.iata_code), ', ') as routes,
        MIN(f.departure_time) as earliest_departure,
        MAX(f.arrival_time) as latest_arrival
      FROM bookings b
      JOIN customer c ON b.customer_id = c.customer_id
      JOIN ticket t ON b.booking_id = t.booking_id
      JOIN flights f ON t.flight_id = f.flight_id
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      JOIN airlines al ON ac.airline_id = al.airline_id
      JOIN airports origin_airport ON f.origin_airport_id = origin_airport.airport_id
      JOIN airports dest_airport ON f.destination_airport_id = dest_airport.airport_id
      WHERE ac.airline_id = $1
      GROUP BY b.booking_id, c.first_name, c.last_name, c.email, c.phone_number
      ORDER BY b.booking_date DESC
    `;
    
    const result = await pool.query(bookingsQuery, [airline_id]);
    
    // Create CSV content
    const csvHeader = 'Booking ID,Date,Customer Name,Email,Phone,Routes,Status,Amount,Trip Type,Flight Numbers,Departure,Arrival\n';
    const csvRows = result.rows.map(row => 
      `${row.booking_id},${row.booking_date},${row.customer_name},${row.customer_email},${row.customer_phone},"${row.routes}",${row.payment_status},${row.total_amount},${row.trip_type},"${row.flight_numbers}",${row.earliest_departure},${row.latest_arrival}`
    ).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv');
    res.send(csvContent);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export bookings',
      error: error.message
    });
  }
};

module.exports = {
  adminLogin,
  getDashboardAnalytics,
  getRevenueAnalytics,
  getAdminBookings,
  getBookingAnalytics,
  updateBookingStatus,
  getBookingDetails,
  exportBookings,
  testDatabase,
};