const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST /api/jobs - Create a new job posting
router.post('/', async (req, res) => {
  console.log("Data get from Frontend:", req.body);
  try {
    const { hr_id, title, description, requirements, salary_min, salary_max, job_type, deadline } = req.body;

    const requiredFields = { title, job_type, hr_id };
    const missingFields = Object.keys(requiredFields).filter(key => !requiredFields[key]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate salary range
    if (salary_min != null && salary_max != null && salary_min > salary_max) {
      return res.status(400).json({ message: 'Minimum salary cannot exceed maximum salary' });
    }

    // Validate deadline
    if (deadline) {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        return res.status(400).json({ message: 'Deadline must be today or later' });
      }
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

// GET /api/jobs - Get all job postings
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT jp.*, c.name AS company_name, c.logo_url
       FROM Job_Posting jp
       LEFT JOIN Company c ON jp.company_id = c.id
       ORDER BY jp.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/jobs/search - Search jobs by keyword, location, salary
router.get('/search', async (req, res) => {
  try {
    const { q, location, salary } = req.query;

    let query = `
      SELECT jp.*, c.name AS company_name, c.logo_url, c.address AS company_address
      FROM Job_Posting jp
      LEFT JOIN Company c ON jp.company_id = c.id
      WHERE 1=1 AND jp.status = 'Approved'
    `;
    const queryParams = [];

    if (q) {
      query += ` AND (jp.title LIKE ? OR jp.description LIKE ? OR c.name LIKE ?)`;
      queryParams.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (location) {
      query += ` AND c.address LIKE ?`;
      queryParams.push(`%${location}%`);
    }

    if (salary) {
      if (salary === 'Dưới 10 triệu') {
        query += ` AND jp.salary_max <= 10000000`;
      } else if (salary === '10 - 20 triệu') {
        query += ` AND ((jp.salary_min >= 10000000 AND jp.salary_min <= 20000000) OR (jp.salary_max >= 10000000 AND jp.salary_max <= 20000000))`;
      } else if (salary === 'Trên 20 triệu') {
        query += ` AND (jp.salary_min > 20000000 OR jp.salary_max > 20000000)`;
      } else if (salary === 'Thỏa thuận') {
        query += ` AND (jp.salary_min IS NULL AND jp.salary_max IS NULL)`;
      }
    }

    query += ` ORDER BY jp.created_at DESC`;

    const [rows] = await pool.query(query, queryParams);
    
    // In a real app we'd fetch skills per job here, or use GROUP_CONCAT. 
    // For simplicity we will return jobs array directly.
    res.json(rows);
  } catch (err) {
    console.error('Error searching jobs:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/jobs/:id - Get a single job posting
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT jp.*, c.name AS company_name, c.logo_url, c.website AS company_website
       FROM Job_Posting jp
       LEFT JOIN Company c ON jp.company_id = c.id
       WHERE jp.id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
