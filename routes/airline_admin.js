const express = require('express');
const airlineadminController = require('../controllers/airlineadminController');
const airlineadminMiddleware = require('../middleware/airlineadmin');
const router = express.Router();

router.post('/register', airlineadminController.register);
 router.post('/login', airlineadminController.login);
router.get('/:id', airlineadminMiddleware, adminController.getAdminById);
router.put('/:id', airlineadminMiddleware, adminController.updateAdmin);
router.delete('/:id', airlineadminMiddleware, adminController.deleteAdmin);

module.exports = router;