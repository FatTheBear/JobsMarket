const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Sử dụng file xác thực JWT đã tạo
const { validateOnboarding } = require('../validators/setupProfileValidator');
const upload = require('../middleware/upload');
const uploadCv = require('../middleware/uploadCV');

// Lấy thông tin cá nhân
router.get('/profile', authMiddleware, candidateController.getProfile);

// Cập nhật thông tin cá nhân
router.put('/profile', authMiddleware, upload.single('avatar'), candidateController.updateProfile);

// Lấy danh sách doanh nghiệp đề xuất cho setup wizard
router.get('/companies', authMiddleware, candidateController.getRecommendedCompanies);
//em đã xóa onboarding để vượt rào vô dashboard làm cho kịp func, khi vận hành nhớ thêm bên dưới này 
// Gửi payload onboarding của candidate wizard
router.post('/onboarding', authMiddleware, candidateController.saveOnboarding);

// Lấy thông tin public của một candidate khác bằng profile ID
router.get('/public/:id', authMiddleware, candidateController.getPublicProfile);

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

module.exports = router;
