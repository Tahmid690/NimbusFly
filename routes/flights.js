const express = require('express');
const router = express.Router();
const flightsController = require('../controllers/flightsController');


router.get('/', flightsController.getAllflights);
router.get('/:id', flightsController.getFlightById);
router.post('/', flightsController.createFlight);
router.put('/:id', flightsController.updateFlight);
router.delete('/:id', flightsController.deleteFlight);
router.get('/search', flightsController.searchFlights);
router.get('/airline/:airline_id',flightsController.airlineFlights);

module.exports = router;