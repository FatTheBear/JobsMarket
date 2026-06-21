const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/company/meta/industries — Lấy danh sách ngành nghề
router.get('/meta/industries', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM Industry ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get("/dashboard/applications", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        DATE(applied_at) AS day,
        COUNT(*) AS total
      FROM Application
      GROUP BY DATE(applied_at)
      ORDER BY day
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
});


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
      return res.status(404).json({ message: 'Company information not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/company — Tạo mới thông tin công ty
router.post('/', async (req, res) => {
  try {
    const { hr_id, industry_id, name, logo_url, website, address } = req.body;

    if (!hr_id || !industry_id || !name) {
      return res.status(400).json({ message: 'Missing required information: hr_id, industry_id, name' });
    }

    const [result] = await pool.query(
      `INSERT INTO Company (hr_id, industry_id, name, logo_url, website, address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [hr_id, industry_id, name, logo_url || null, website || null, address || null]
    );

    res.status(201).json({ message: 'Company created successfully', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'This HR already has a company, use PUT to update' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/company/:hr_id — Cập nhật thông tin công ty
router.put('/:hr_id', async (req, res) => {
  try {
    const { hr_id } = req.params;
    const { industry_id, name, logo_url, website, address } = req.body;

    if (!industry_id || !name) {
      return res.status(400).json({ message: 'Missing required information: industry_id, name' });
    }

    const [result] = await pool.query(
      `UPDATE Company
       SET industry_id = ?, name = ?, logo_url = ?, website = ?, address = ?
       WHERE hr_id = ?`,
      [industry_id, name, logo_url || null, website || null, address || null, hr_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Company not found to update' });
    }

    res.json({ message: 'Updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/company/:hr_id/saved-candidates/:candidate_id — Lưu hoặc Bỏ lưu ứng viên
router.post('/:hr_id/saved-candidates/:candidate_id', async (req, res) => {
  try {
    const { hr_id, candidate_id } = req.params;
    
    // Check if already saved
    const [existing] = await pool.query('SELECT * FROM Saved_Candidate WHERE hr_id = ? AND candidate_id = ?', [hr_id, candidate_id]);
    
    if (existing.length > 0) {
      // Unsave
      await pool.query('DELETE FROM Saved_Candidate WHERE hr_id = ? AND candidate_id = ?', [hr_id, candidate_id]);
      return res.json({ message: 'Unsaved candidate', is_saved: false });
    } else {
      // Save
      await pool.query('INSERT INTO Saved_Candidate (hr_id, candidate_id) VALUES (?, ?)', [hr_id, candidate_id]);
      return res.status(201).json({ message: 'Saved candidate', is_saved: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/company/:hr_id/saved-candidates — Lấy danh sách ứng viên đã lưu
router.get('/:hr_id/saved-candidates', async (req, res) => {
  try {
    const { hr_id } = req.params;
    const query = `
      SELECT sc.*, cp.full_name, cp.phone, cp.avatar_url, cp.skills, cp.years_of_experience, cp.headline, cp.user_id
      FROM Saved_Candidate sc
      JOIN Candidate_Profile cp ON sc.candidate_id = cp.id
      WHERE sc.hr_id = ?
      ORDER BY sc.saved_at DESC
    `;
    const [rows] = await pool.query(query, [hr_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


module.exports = router;
