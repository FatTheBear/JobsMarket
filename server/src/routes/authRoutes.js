const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister } = require('../validators/authValidator');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// Mở route kích hoạt công ty trong nhóm Auth
router.post('/activate-company', adminController.activateCompany);
// Định nghĩa các API của Authentication
router.post('/login', authController.login);
router.post('/register', validateRegister, authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post("/resend-otp", authController.resendOtp);
router.post("/change-password/request", authMiddleware, authController.requestChangePassword);
router.post("/change-password/confirm", authMiddleware, authController.confirmChangePassword);

//đừng đụng vô đống này
// const { verifyToken } = require('../middleware/authMiddleware');
// const profileController = require('../controllers/profileController');
// router.get('/profile', verifyToken, profileController.getProfile); 
// router.post('/register', authController.register);
// router.post('/login', authController.login);

module.exports = router;