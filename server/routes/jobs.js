const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /api/jobs - Create a new job posting
router.post('/', async (req, res) => {
  try {
    const { hr_id, title, description, requirements, salary_min, salary_max, job_type } = req.body;

    if (!hr_id || !title || !job_type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find company_id associated with hr_id
    const [companies] = await pool.query('SELECT id FROM Company WHERE hr_id = ?', [hr_id]);
    
    if (companies.length === 0) {
      return res.status(404).json({ message: 'Please create a Company Profile first before posting a job.' });
    }
    const company_id = companies[0].id;

    const [result] = await pool.query(
      `INSERT INTO Job_Posting (company_id, hr_id, title, description, requirements, salary_min, salary_max, job_type, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Approved')`, 
      [company_id, hr_id, title, description, requirements, salary_min || null, salary_max || null, job_type]
    );

    res.status(201).json({ message: 'Job posted successfully!', jobId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
