const express = require('express');
const airlineadminController = require('../controllers/airlineadminController');
const adminController = require('../controllers/adminController');
const airlineadminMiddleware = require('../middleware/airlineadmin');
const router = express.Router();

router.post('/register', airlineadminController.register);
router.post('/login', adminController.adminLogin);

router.get('/admin/bookings', airlineadminMiddleware, adminController.getAdminBookings);
router.get('/admin/bookings/export', airlineadminMiddleware, adminController.exportBookings);
router.get('/admin/booking-analytics', airlineadminMiddleware, adminController.getBookingAnalytics);
router.get('/admin/booking/:booking_id', airlineadminMiddleware, adminController.getBookingDetails);
router.put('/admin/booking/:booking_id/status', airlineadminMiddleware, adminController.updateBookingStatus);
router.get('/getpassenger/:airline_id',airlineadminMiddleware,adminController.getPassengers);
router.put('/admin/changepassword/:admin_id', airlineadminMiddleware,airlineadminController.updatePassword);

// Admin dashboard specific routes 
router.get('/bookings/:airline_id', airlineadminMiddleware, airlineadminController.getAirlineBookings);
router.get('/flights/:airline_id', airlineadminMiddleware, airlineadminController.getAirlineFlights);
router.get('/analytics/:airline_id', airlineadminMiddleware,airlineadminController.getDashboardAnalytics);

// Parameterized routes (MUST come after specific routes)
router.get('/:id', airlineadminMiddleware, airlineadminController.getAdminById);
router.delete('/:id', airlineadminMiddleware, airlineadminController.deleteAdmin);

module.exports = router;