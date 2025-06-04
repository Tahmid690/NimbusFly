const express = require('express');
const airlineadminController = require('../controllers/airlineadminController');
const airlineadminMiddleware = require('../middleware/airlineadmin');
const router = express.Router();

router.post('/register', airlineadminController.register);
router.post('/login', airlineadminController.login);
router.get('/:id', airlineadminMiddleware, airlineadminController.getAdminById);
router.put('/:id', airlineadminMiddleware, airlineadminController.updateAdmin);
router.delete('/:id', airlineadminMiddleware, airlineadminController.deleteAdmin);

module.exports = router;