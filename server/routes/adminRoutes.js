const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController.js");

// 1. Quản lý chung & thống kê số liệu
router.get('/dashboard-stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

// 2. Phê duyệt bài đăng tuyển dụng
router.get('/pending-jobs', adminController.getPendingJobs);
router.put('/jobs/:id/status', adminController.updateJobStatus);

// 3. Quản lý danh mục bài viết & kỹ năng
router.get('/skills', adminController.getSkills);
router.get('/industries', adminController.getIndustries);
router.get('/news', adminController.getNews);

// 4. Thêm mới danh mục dữ liệu nhanh
router.post('/skills', adminController.createSkill);
router.post('/industries', adminController.createIndustry);

router.post('/news', adminController.createNews);
router.put('/news/:id', adminController.updateNews);
router.delete('/news/:id', adminController.deleteNews);

module.exports = router;