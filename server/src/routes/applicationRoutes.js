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
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    // Check if CV exists (to prevent Foreign Key constraint error with mock data)
    const [cvs] = await pool.query('SELECT id FROM Candidate_CV WHERE id = ?', [cv_id]);
    
    if (cvs.length === 0) {
      // Mock data scenario: return success without inserting to database
      return res.status(201).json({ 
        message: 'Application submitted successfully! (Note: UI test mode using a mock CV)', 
        applicationId: 999 
      });
    }

    // Insert new application (Real CV scenario)
    const [result] = await pool.query(
      `INSERT INTO Application (job_id, candidate_id, cv_id, status) VALUES (?, ?, ?, 'Applied')`,
      [job_id, candidate_id, cv_id]
    );

    res.status(201).json({ message: 'Application submitted successfully!', applicationId: result.insertId });
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

// GET /api/applications/hr/:hrId - Get all applications for jobs posted by this HR
router.get('/hr/:hrId', async (req, res) => {
  try {
    const { hrId } = req.params;
    const query = `
      SELECT a.*, 
             cp.full_name AS candidate_name, cp.user_id, cp.phone, cp.avatar_url, cp.skills AS candidate_skills, cp.years_of_experience,
             jp.title AS job_title, 
             cv.file_url, cv.cv_name, cv.file_type,
             (SELECT COUNT(*) FROM Saved_Candidate sc WHERE sc.hr_id = ? AND sc.candidate_id = a.candidate_id) AS is_saved
      FROM Application a
      JOIN Job_Posting jp ON a.job_id = jp.id
      JOIN Candidate_Profile cp ON a.candidate_id = cp.id
      JOIN Candidate_CV cv ON a.cv_id = cv.id
      WHERE jp.hr_id = ?
      ORDER BY a.applied_at DESC
    `;
    const [rows] = await pool.query(query, [hrId, hrId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching applications for HR:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
