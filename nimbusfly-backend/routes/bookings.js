const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/', bookingController.getAllBookings);
router.get('/customer/:customer_id', bookingController.getCustomerBooking);
router.get('/:id/details', bookingController.getBookingDetails);
router.get('/:id', bookingController.getBookingById);
router.post('/create', bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);
router.get('/passenger/:id', bookingController.passengerusingbooking);
router.post('/cancel/:id',bookingController.cancelBooking);

module.exports = router;