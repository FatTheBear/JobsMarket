const pool = require('../config/db');

const WalletModel = {
  // Lấy thông tin số dư xu và liên kết ngân hàng của User
  getWalletInfo: async (userId) => {
    const [rows] = await pool.execute(
      `SELECT 
        0 AS coins, 
        NULL AS bank_name, 
        NULL AS bank_account_number, 
        NULL AS bank_account_name 
      FROM User 
      WHERE id = ?`,
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

  createPendingTransaction: async (userId, { coins, amountFiat, refCode, paypalOrderId, feeId }) => {
    const [result] = await pool.execute(
      `INSERT INTO Transaction (user_id, amount_fiat, coins, type, payment_method, status, reference_code, paypal_order_id, fee_id) 
       VALUES (?, ?, ?, 'deposit', 'paypal', 'pending', ?, ?, ?)`,
      [userId, amountFiat, coins, refCode, paypalOrderId, feeId]
    );
    return result.insertId;
  },

  completePayPalTransaction: async (paypalOrderId) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Lock row to prevent double capture
      const [rows] = await connection.execute(
        'SELECT * FROM Transaction WHERE paypal_order_id = ? FOR UPDATE',
        [paypalOrderId]
      );

      if (rows.length === 0) {
        throw new Error('Transaction not found');
      }

      const transaction = rows[0];

      if (transaction.status === 'completed') {
        // Đã hoàn thành trước đó, không làm gì thêm
        await connection.commit();
        return { success: true, alreadyCompleted: true };
      }

      if (transaction.status !== 'pending') {
        throw new Error('Transaction is not in pending state');
      }

      // 1. Cập nhật trạng thái
      await connection.execute(
        'UPDATE Transaction SET status = "completed" WHERE id = ?',
        [transaction.id]
      );

      // 2. Cộng xu
      await connection.execute(
        'UPDATE User SET coins = coins + ? WHERE id = ?',
        [transaction.coins, transaction.user_id]
      );

      await connection.commit();
      return { success: true, alreadyCompleted: false };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = WalletModel;
