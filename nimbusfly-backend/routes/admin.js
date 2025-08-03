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
router.post('/login', adminLogin); // For debugging only
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
