const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister } = require('../validators/authValidator');

router.post('/login', authController.login);
router.post('/register', validateRegister, authController.register);
router.post('/verify-otp', authController.verifyOTP);

module.exports = router;