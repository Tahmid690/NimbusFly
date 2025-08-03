const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/user/register', authController.register);
router.post('/user/login', authController.login);
router.get('/user/profile', authMiddleware, authController.getProfile);

module.exports = router;