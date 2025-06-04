const express = require('express');
const router = express.Router();
const airportsController = require('../controllers/airportsController');

router.get('/', airportsController.getAllAirports);
router.get('/search', airportsController.searchAirports);
router.get('/search_name',airportsController.searchAirportsbyname);
router.get('/:id', airportsController.getAirportById);
router.post('/add', airportsController.createAirport);
router.put('/:id', airportsController.updateAirport);
router.delete('/:id', airportsController.deleteAirport);



module.exports = router;