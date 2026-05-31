const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middleware/authMiddleware'); // Tệp bảo mật JWT của bạn

// Tất cả các APIs bên dưới đều yêu cầu đăng nhập trước khi truy cập
router.get('/info', authMiddleware, walletController.getWalletInfo);
router.get('/transactions', authMiddleware, walletController.getTransactions);
router.post('/link-bank', authMiddleware, walletController.linkBank);
router.post('/topup', authMiddleware, walletController.topup);

module.exports = router;
