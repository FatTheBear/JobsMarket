const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST /api/applications - Apply for a job
router.post('/', async (req, res) => {
  try {
    const { user_id, job_id, cv_id } = req.body;

    if (!user_id || !job_id || !cv_id) {
      return res.status(400).json({ message: 'Missing required fields: user_id, job_id, cv_id' });
    }

    // Lookup candidate_id by user_id
    const [candidates] = await pool.query('SELECT id FROM Candidate_Profile WHERE user_id = ?', [user_id]);
    if (candidates.length === 0) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }
    const candidate_id = candidates[0].id;

    // Check if already applied
    const [existing] = await pool.query(
      'SELECT id FROM Application WHERE job_id = ? AND candidate_id = ?',
      [job_id, candidate_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Bạn đã ứng tuyển vào công việc này rồi.' });
    }

    // Insert new application
    const [result] = await pool.query(
      `INSERT INTO Application (job_id, candidate_id, cv_id, status) VALUES (?, ?, ?, 'Applied')`,
      [job_id, candidate_id, cv_id]
    );

    res.status(201).json({ message: 'Nộp đơn thành công!', applicationId: result.insertId });
  } catch (err) {
    console.error('Error applying for job:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/applications/candidate/:userId - Get application history for a candidate
router.get('/candidate/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [candidates] = await pool.query('SELECT id FROM Candidate_Profile WHERE user_id = ?', [userId]);
    if (candidates.length === 0) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }
    const candidate_id = candidates[0].id;

    const query = `
      SELECT a.*, jp.title AS job_title, c.name AS company_name, c.logo_url
      FROM Application a
      JOIN Job_Posting jp ON a.job_id = jp.id
      JOIN Company c ON jp.company_id = c.id
      WHERE a.candidate_id = ?
      ORDER BY a.applied_at DESC
    `;
    const [rows] = await pool.query(query, [candidate_id]);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching application history:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
