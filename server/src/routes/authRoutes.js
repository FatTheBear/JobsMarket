const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister } = require('../validators/authValidator');


router.post('/login', authController.login);
router.post('/register', validateRegister, authController.register);
router.post('/verify-otp', authController.verifyOTP);
//cấm đụng vô đống này
// const { verifyToken } = require('../middleware/authMiddleware');
// const profileController = require('../controllers/profileController');
// router.get('/profile', verifyToken, profileController.getProfile); 

module.exports = router;