const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/company/:hr_id — Lấy thông tin công ty theo hr_id
router.get('/:hr_id', async (req, res) => {
  try {
    const { hr_id } = req.params;
    const [rows] = await pool.query(
      `SELECT c.*, i.name AS industry_name
       FROM Company c
       LEFT JOIN Industry i ON c.industry_id = i.id
       WHERE c.hr_id = ?`,
      [hr_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Chưa có thông tin công ty' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// POST /api/company — Tạo mới thông tin công ty
router.post('/', async (req, res) => {
  try {
    const { hr_id, industry_id, name, logo_url, website, address } = req.body;

    if (!hr_id || !industry_id || !name) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc: hr_id, industry_id, name' });
    }

    const [result] = await pool.query(
      `INSERT INTO Company (hr_id, industry_id, name, logo_url, website, address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [hr_id, industry_id, name, logo_url || null, website || null, address || null]
    );

    res.status(201).json({ message: 'Tạo công ty thành công', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'HR này đã có công ty, dùng PUT để cập nhật' });
    }
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// PUT /api/company/:hr_id — Cập nhật thông tin công ty
router.put('/:hr_id', async (req, res) => {
  try {
    const { hr_id } = req.params;
    const { industry_id, name, logo_url, website, address } = req.body;

    if (!industry_id || !name) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc: industry_id, name' });
    }

    const [result] = await pool.query(
      `UPDATE Company
       SET industry_id = ?, name = ?, logo_url = ?, website = ?, address = ?
       WHERE hr_id = ?`,
      [industry_id, name, logo_url || null, website || null, address || null, hr_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy công ty để cập nhật' });
    }

    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// GET /api/company/industries — Lấy danh sách ngành nghề
router.get('/meta/industries', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM Industry ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router;
