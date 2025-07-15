const express = require('express');
const router = express.Router();
const flightsController = require('../controllers/flightsController');
const { runInContext } = require('lodash');


router.get('/search', flightsController.searchFlights);
router.get('/', flightsController.getAllflights);
router.get('/:id', flightsController.getFlightById);
router.post('/add', flightsController.createFlight);
router.put('/updt/:id', flightsController.updateFlight);
router.delete('/:id', flightsController.deleteFlight);
router.put('/cancel/:id', flightsController.cancelFlight);

router.get('/airline/:airline_id',flightsController.airlineFlights);

module.exports = router;