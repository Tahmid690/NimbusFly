const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Get customer profile
router.get('/:customer_id/profile', customerController.getCustomerProfile);

// Update customer profile
router.put('/:customer_id/profile', customerController.updateCustomerProfile);
router.put('/updt-password/:customer_id', customerController.updateCustomerPassword);
// Get customer statistics
router.get('/:customer_id/stats', customerController.getCustomerStats);

module.exports = router;