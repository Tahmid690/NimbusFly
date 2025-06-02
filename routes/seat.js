const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');

router.get('/aircraft/:aircraft_id', seatController.getSeatsByAircraft);
router.get('/flight/:flight_id/available', seatController.getAvailableSeatsByFlight);
router.put('/:id/book', seatController.bookSeat);
router.put('/:id/release', seatController.releaseSeat);

module.exports = router;
