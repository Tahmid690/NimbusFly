const express = require('express');
const router = express.Router();
const contactController = require('../controllers/Contactcontroller');

router.post('/message',contactController.contactUs);


module.exports = router;

