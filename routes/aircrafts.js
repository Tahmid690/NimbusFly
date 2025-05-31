
const express = require('express');
const router = express.Router();
const aircraftController = require('../controllers/aircraftsController');

router.get('/', aircraftController.getAllAircraft);
router.get('/airline/:airline_id', aircraftController.getAircraftByAirline);
router.get('/:id', aircraftController.getAircraftById);
router.post('/add', aircraftController.createAircraft);
router.put('/:id', aircraftController.updateAircraft);
router.delete('/:id', aircraftController.deleteAircraft);

module.exports = router;