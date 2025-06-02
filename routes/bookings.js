const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/customer/:customer_id', bookingController.getCustomerBooking);
router.get('/:id', bookingController.getBookingById);
router.post('/create', bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;