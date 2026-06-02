const WalletModel = require('../models/Wallet');

const walletController = {
  // Lấy thông tin số dư xu
  getWalletInfo: async (req, res) => {
    try {
      const userId = req.user.id; // Lấy từ authMiddleware
      const wallet = await WalletModel.getWalletInfo(userId);
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "Failed to load wallet data", error: error.message });
    }
  },

  // Lấy danh sách lịch sử giao dịch
  getTransactions: async (req, res) => {
    try {
      const userId = req.user.id;
      const list = await WalletModel.getTransactions(userId);
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: "Failed to load transaction history", error: error.message });
    }
  },

  // Liên kết ngân hàng
  linkBank: async (req, res) => {
    try {
      const userId = req.user.id;
      const { bankName, accountNumber, accountName } = req.body;
      await WalletModel.linkBank(userId, { bankName, accountNumber, accountName });
      res.json({ message: "Bank account linked successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Failed to link bank account", error: error.message });
    }
  },

  // Thực hiện nạp tiền
  topup: async (req, res) => {
    try {
      const userId = req.user.id;
      const { coins, amountFiat, method } = req.body;

      // Tạo mã tham chiếu ngẫu nhiên duy nhất cho giao dịch nạp tiền
      const refCode = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const result = await WalletModel.processTopup(userId, {
        coins,
        amountFiat,
        method,
        refCode
      });

      res.json({ message: "Top-up successful!", result });
    } catch (error) {
      res.status(500).json({ message: "Top-up failed", error: error.message });
    }
  }
};

module.exports = walletController;
