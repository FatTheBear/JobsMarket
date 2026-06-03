const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const authMiddleware = require('../middleware/authMiddleware'); // Sử dụng file xác thực JWT đã tạo
const { validateOnboarding } = require('../validators/setupProfileValidator');

// Lấy thông tin cá nhân
router.get('/profile', authMiddleware, candidateController.getProfile);

// Cập nhật thông tin cá nhân
router.put('/profile', authMiddleware, candidateController.updateProfile);

// Lấy danh sách doanh nghiệp đề xuất cho setup wizard
router.get('/companies', authMiddleware, candidateController.getRecommendedCompanies);

// Gửi payload onboarding của candidate wizard
router.post('/onboarding', authMiddleware, validateOnboarding, candidateController.saveOnboarding);

// Lấy thông tin public của một candidate khác bằng profile ID
router.get('/public/:id', authMiddleware, candidateController.getPublicProfile);

module.exports = router;
