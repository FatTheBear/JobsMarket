const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController.js");
const { upload ,uploadAvatar, uploadCompany } = require('../middleware/upload');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Áp dụng middleware kiểm tra quyền Admin cho toàn bộ route admin
router.use(authMiddleware, adminMiddleware);

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
router.get('/news-categories', adminController.getNewsCategories);

// 4. Thêm mới danh mục dữ liệu nhanh
router.post('/skills', adminController.createSkill);
router.delete('/skills/:id', adminController.deleteSkill);

router.post('/industries', adminController.createIndustry);
router.delete('/industries/:id', adminController.deleteIndustry);


router.post("/news",uploadAvatar.single("thumbnail"),adminController.createNews);
router.put('/news/:id', uploadAvatar.single("thumbnail"), adminController.updateNews);
router.delete('/news/:id', adminController.deleteNews);


// 5. Quản lý giao dịch ví xu (Nạp tiền)
router.get('/transactions', adminController.getTransactions);
router.put('/transactions/:id/status', adminController.updateTransactionStatus);

// 6. Quản lý Coin Exchange Fees
router.get('/coin-fees', adminController.getCoinFees);
router.post('/coin-fees', adminController.createCoinFee);
router.put('/coin-fees/:id', adminController.updateCoinFee);
router.delete('/coin-fees/:id', adminController.deleteCoinFee);

// 7. Notifications
router.get('/notifications', adminController.getNotifications);
router.put('/notifications/:id/read', adminController.markNotificationRead);
router.delete('/notifications/:id', adminController.deleteNotification);


router.get('/pending-companies', adminController.getPendingCompanies);
// router.patch('/company/:id/approve', adminController.approveCompany);
router.patch('/users/:id/ban', adminController.banAccount);

router.get('/companies/pending', authMiddleware, adminController.getPendingCompanies);
router.patch('/companies/:id/approve', authMiddleware, adminController.approveCompany);

module.exports = router;