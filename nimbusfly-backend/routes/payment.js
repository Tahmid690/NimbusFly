const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/booking/:booking_id', paymentController.getPaymentByBooking);
router.post('/process', paymentController.processPayment);
router.put('/:id/status', paymentController.updatePaymentStatus);

module.exports = router;
