const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Sử dụng file xác thực JWT đã tạo
const { validateOnboarding } = require('../validators/setupProfileValidator');
const { upload } = require('../middleware/upload');
const uploadCv = require('../middleware/uploadCV');

// Lấy thông tin cá nhân
router.get('/profile', authMiddleware, candidateController.getProfile);

// Cập nhật thông tin cá nhân
router.put('/profile', authMiddleware, uploadAvatar.single('avatar'), candidateController.updateProfile);

// Lấy danh sách doanh nghiệp đề xuất cho setup wizard
router.get('/companies', authMiddleware, candidateController.getRecommendedCompanies);

// Lấy danh sách user đề xuất cho onboarding (sắp xếp theo followers)
router.get('/suggested-users', authMiddleware, candidateController.getSuggestedUsers);

// Gợi ý danh sách ngành nghề cho Job Title Autocomplete
router.get('/suggest-industries', authMiddleware, candidateController.suggestIndustries);

// Gợi ý danh sách kỹ năng cho Skill Name Autocomplete
router.get('/suggest-skills', authMiddleware, candidateController.suggestSkills);

// Danh sách quốc gia (RestCountries v5) cho Nationality autocomplete
router.get('/countries', authMiddleware, candidateController.getCountries);

// Gửi payload onboarding của candidate wizard
router.post('/onboarding', authMiddleware, validateOnboarding, candidateController.saveOnboarding);

// Lấy thông tin public của một candidate khác bằng profile ID
router.get('/public/:id', authMiddleware, candidateController.getPublicProfile);

// Lấy danh sách CV công khai của một candidate khác
router.get('/public/:id/cvs', authMiddleware, candidateController.getPublicCVs);

// Upload CV
router.post('/upload-cv', authMiddleware, uploadCv.single('cv_file'), candidateController.uploadCV);

//lấy danh sách CV
router.get('/my-cvs', authMiddleware, candidateController.getAllCVs);

// Xóa CV
router.delete('/cvs/:id', authMiddleware, candidateController.deleteCV);

// Nộp đơn ứng tuyển
router.post('/apply', authMiddleware, candidateController.applyJob);

// Lấy lịch sử ứng tuyển
router.get('/applications', authMiddleware, candidateController.getApplications);

// Lấy danh sách thông báo
router.get('/notifications', authMiddleware, candidateController.getNotifications);

// Đánh dấu 1 thông báo đã đọc
router.put('/notifications/:id/read', authMiddleware, candidateController.markNotificationAsRead);

// Đánh dấu tất cả thông báo đã đọc
router.put('/notifications/read-all', authMiddleware, candidateController.markAllNotificationsAsRead);
router.post('/test-ping', (req, res) => {
    return res.status(200).json({ message: "ROUTE ĐÃ NHẬN!" });
});

module.exports = router;
