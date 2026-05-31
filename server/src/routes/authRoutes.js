const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister } = require('../validators/authValidator');


router.post('/login', authController.login);
<<<<<<< HEAD
router.post('/register', validateRegister, authController.register);
router.post('/verify-otp', authController.verifyOTP);
//cấm đụng vô đống này
// const { verifyToken } = require('../middleware/authMiddleware');
// const profileController = require('../controllers/profileController');
// router.get('/profile', verifyToken, profileController.getProfile); 
=======
router.post('/register', authController.register);
router.post('/login', authController.login);
>>>>>>> 5aeff53e32060a4c8e39ba0413a4180e6e1b404c

module.exports = router;