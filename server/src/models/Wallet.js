const pool = require('../config/db');

const WalletModel = {
  // Lấy thông tin số dư xu và liên kết ngân hàng của User
  getWalletInfo: async (userId) => {
    const [rows] = await pool.execute(
      'SELECT coins, bank_name, bank_account_number, bank_account_name FROM User WHERE id = ?',
      [userId]
    );
    return rows[0];
  },

  // Lấy lịch sử giao dịch
  getTransactions: async (userId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM Transaction WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },

  // Cập nhật thông tin ngân hàng
  linkBank: async (userId, { bankName, accountNumber, accountName }) => {
    await pool.execute(
      'UPDATE User SET bank_name = ?, bank_account_number = ?, bank_account_name = ? WHERE id = ?',
      [bankName, accountNumber, accountName, userId]
    );
    return true;
  },

  // ⚠️ QUAN TRỌNG: Nạp xu sử dụng TRANSACTION để bảo mật dữ liệu
  processTopup: async (userId, { coins, amountFiat, method, refCode }) => {
    const connection = await pool.getConnection();
    try {
      // Bắt đầu Transaction
      await connection.beginTransaction();

      // 1. Tạo bản ghi lịch sử giao dịch ở trạng thái hoàn thành ('completed')
      const [txResult] = await connection.execute(
        `INSERT INTO Transaction (user_id, amount_fiat, coins, type, payment_method, status, reference_code) 
         VALUES (?, ?, ?, 'deposit', ?, 'completed', ?)`,
        [userId, amountFiat, coins, method, refCode]
      );

      // 2. Cộng số xu trực tiếp vào tài khoản User
      await connection.execute(
        'UPDATE User SET coins = coins + ? WHERE id = ?',
        [coins, userId]
      );

      // Xác nhận thành công và commit thay đổi lên DB
      await connection.commit();
      return { success: true, transactionId: txResult.insertId };

    } catch (error) {
      // Nếu có bất cứ lỗi gì xảy ra, lập tức quay xe (Rollback) khôi phục DB ban đầu
      await connection.rollback();
      throw error;
    } finally {
      // Giải phóng kết nối về lại pool
      connection.release();
    }
  }
};

module.exports = WalletModel;
