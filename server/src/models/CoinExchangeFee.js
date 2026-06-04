const pool = require('../config/db');

const CoinExchangeFeeModel = {
  getAll: async () => {
    const [rows] = await pool.execute(
      'SELECT * FROM Coin_Exchange_Fee ORDER BY sort_order ASC, created_at DESC'
    );
    return rows;
  },

  getActive: async () => {
    const [rows] = await pool.execute(
      'SELECT * FROM Coin_Exchange_Fee WHERE is_active = TRUE ORDER BY sort_order ASC, created_at DESC'
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM Coin_Exchange_Fee WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  create: async (data) => {
    const { price_vnd, coins, label, description, is_active, sort_order } = data;
    const [result] = await pool.execute(
      `INSERT INTO Coin_Exchange_Fee (price_vnd, coins, label, description, is_default, is_active, sort_order) 
       VALUES (?, ?, ?, ?, FALSE, ?, ?)`,
      [price_vnd, coins, label || null, description || null, is_active ?? true, sort_order || 0]
    );
    return { id: result.insertId, ...data };
  },

  update: async (id, data) => {
    const { price_vnd, coins, label, description, is_active, sort_order } = data;
    
    // Kiểm tra gói mặc định
    const current = await CoinExchangeFeeModel.getById(id);
    if (!current) throw new Error("Fee package not found");
    if (current.is_default) throw new Error("Cannot modify default package");

    await pool.execute(
      `UPDATE Coin_Exchange_Fee 
       SET price_vnd = ?, coins = ?, label = ?, description = ?, is_active = ?, sort_order = ? 
       WHERE id = ?`,
      [price_vnd, coins, label || null, description || null, is_active ?? true, sort_order || 0, id]
    );
    return true;
  },

  delete: async (id) => {
    // Kiểm tra gói mặc định
    const current = await CoinExchangeFeeModel.getById(id);
    if (!current) throw new Error("Fee package not found");
    if (current.is_default) throw new Error("Cannot delete default package");

    await pool.execute('DELETE FROM Coin_Exchange_Fee WHERE id = ?', [id]);
    return true;
  }
};

module.exports = CoinExchangeFeeModel;
