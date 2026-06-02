const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const authMiddleware = require('../middleware/authMiddleware'); // Sử dụng file xác thực JWT đã tạo

// Lấy thông tin cá nhân
router.get('/profile', authMiddleware, candidateController.getProfile);

// Cập nhật thông tin cá nhân
router.put('/profile', authMiddleware, candidateController.updateProfile);

// Lấy danh sách doanh nghiệp đề xuất cho setup wizard
router.get('/companies', authMiddleware, candidateController.getRecommendedCompanies);

// Gửi payload onboarding của candidate wizard
router.post('/onboarding', authMiddleware, candidateController.saveOnboarding);

module.exports = router;
