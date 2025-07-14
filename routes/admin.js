// routes/admin.js
const express = require('express');
const router = express.Router();
const authenticateAdmin = require('../middleware/authenticateAdmin');
const {
  adminLogin,
  getBookingAnalytics,
  getRevenueAnalytics,
  getAdminBookings,
  getAdminFlights,
  getAdminAircraft,
  updateBookingStatus,
  getBookingDetails,
  exportBookings,
  testDatabase,
  resetAdminPassword
} = require('../controllers/adminController');

// Public routes (no authentication required)
router.post('/login', adminLogin);
router.post('/reset-password', resetAdminPassword); // For debugging only
router.get('/test-db', testDatabase); // For debugging only

// Protected routes (authentication required)
router.use(authenticateAdmin); // Apply authentication middleware to all routes below

// Dashboard and analytics
router.get('/booking-analytics', getBookingAnalytics);
router.get('/revenue-analytics', getRevenueAnalytics);

// Bookings management
router.get('/bookings', getAdminBookings);
router.get('/bookings/:booking_id', getBookingDetails);
router.put('/bookings/:booking_id/status', updateBookingStatus);
router.get('/bookings/export', exportBookings);

// Flights management
router.get('/flights/:airline_id', getAdminFlights);

// Aircraft management
router.get('/aircraft/:airline_id', getAdminAircraft);

module.exports = router;

// Alternative route setup if using different structure
// routes/index.js or app.js
/*
const express = require('express');
const cors = require('cors');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3001', // Your frontend URL
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/admin', adminRoutes);

// Airlines route (if separate)
app.get('/airlines/:airline_id', async (req, res) => {
  try {
    const { airline_id } = req.params;
    const query = 'SELECT * FROM airlines WHERE airline_id = $1';
    const result = await pool.query(query, [airline_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Airline not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch airline',
      error: error.message
    });
  }
});

// Aircraft routes (if separate)
app.get('/aircraft/airline/:airline_id', async (req, res) => {
  try {
    const { airline_id } = req.params;
    
    const aircraftQuery = `
      SELECT 
        ac.aircraft_id,
        ac.model,
        ac.total_seats,
        ac.econ_seats,
        ac.busi_seats,
        al.airline_name,
        COUNT(f.flight_id) as total_flights,
        COUNT(CASE WHEN f.departure_time > NOW() THEN 1 END) as upcoming_flights
      FROM aircraft ac
      JOIN airlines al ON ac.airline_id = al.airline_id
      LEFT JOIN flights f ON ac.aircraft_id = f.aircraft_id
      WHERE ac.airline_id = $1
      GROUP BY ac.aircraft_id, ac.model, ac.total_seats, ac.econ_seats, ac.busi_seats, al.airline_name
      ORDER BY ac.aircraft_id
    `;

    const result = await pool.query(aircraftQuery, [airline_id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch aircraft',
      error: error.message
    });
  }
});

module.exports = app;
*/