const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/info', authMiddleware, walletController.getWalletInfo);
router.get('/transactions', authMiddleware, walletController.getTransactions);
router.post('/link-bank', authMiddleware, walletController.linkBank);
router.get('/coin-fees', authMiddleware, walletController.getActiveFees);
router.post('/paypal/create-order', authMiddleware, walletController.createPayPalOrder);
router.post('/paypal/capture-order', authMiddleware, walletController.capturePayPalOrder);

module.exports = router;
