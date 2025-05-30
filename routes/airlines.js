const express = require('express');
const router = express.Router();
const airlinesController = require('../controllers/airlinesController');


router.get('/', airlinesController.getAllAirlines);
router.get('/:id', airlinesController.getAirlineById);
router.post('/add', airlinesController.createAirline);
router.put('/:id', airlinesController.updateAirline);
router.delete('/:id', airlinesController.deleteAirline);

module.exports = router;