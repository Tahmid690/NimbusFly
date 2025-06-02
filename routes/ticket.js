const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

router.get('/booking/:booking_id', ticketController.getTicketsByBooking);
router.get('/:id', ticketController.getTicketById);
router.post('/generate', ticketController.generateTicket);

module.exports = router;
