const express = require('express');
const router = express.Router();
const passengerController = require('../controllers/passengerController');

router.get('/customer/:customer_id', passengerController.getCustomerPassenger);
router.get('/:id', passengerController.getPassengerById);
router.post('/add', passengerController.addPassenger);
router.put('/:id', passengerController.updatePassenger);
router.delete('/:id', passengerController.deletePassenger);

module.exports = router;