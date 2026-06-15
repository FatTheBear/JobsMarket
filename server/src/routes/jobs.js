const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST /api/jobs - Create a new job posting
router.post('/', async (req, res) => {
  console.log("Data get from Frontend:", req.body);

  try {
    const {
      title,
      description,
      requirements,
      salary_min,
      salary_max,
      job_type,
      deadline
    } = req.body;


    // Lấy user id từ JWT
    const user_id = req.user?.id;


    if (!user_id) {
      return res.status(401).json({
        message: "You must login with a company account to post a job."
      });
    }


    const requiredFields = {
      title,
      job_type
    };

    const missingFields = Object.keys(requiredFields)
      .filter(key => !requiredFields[key]);


    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }


    // Validate salary range
    if (
      salary_min != null &&
      salary_max != null &&
      salary_min > salary_max
    ) {
      return res.status(400).json({
        message: 'Minimum salary cannot exceed maximum salary'
      });
    }


    // Validate deadline
    if (deadline) {

      const deadlineDate = new Date(deadline);
      const today = new Date();

      today.setHours(0, 0, 0, 0);


      if (deadlineDate < today) {
        return res.status(400).json({
          message: 'Deadline must be today or later'
        });
      }
    }



    // Tìm company thuộc user đang đăng nhập
    const [companies] = await pool.query(
      'SELECT id FROM Company WHERE user_id = ?',
      [user_id]
    );


    if (companies.length === 0) {
      return res.status(404).json({
        message: 'Please create a Company Profile first before posting a job.'
      });
    }


    const company_id = companies[0].id;



    // Tạo job
    const [result] = await pool.query(
      `
      INSERT INTO Job_Posting
      (
        company_id,
        title,
        description,
        requirements,
        salary_min,
        salary_max,
        job_type,
        status
      )

      VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
      `,
      [
        company_id,
        title,
        description || null,
        requirements || null,
        salary_min || null,
        salary_max || null,
        job_type || 'Full-time'
      ]
    );



    res.status(201).json({
      message: 'Job posted successfully! Your job is waiting for Admin approval.',
      jobId: result.insertId
    });



  } catch (err) {

    console.error("Create Job Error:", err);

    res.status(500).json({
      message: 'Server error',
      error: err.message
    });

  }
});


// GET /api/jobs - Get all jobs
router.get('/', async (req, res) => {

  try {

    const [rows] = await pool.query(
      `
      SELECT 
        jp.*,
        c.name AS company_name,
        c.logo_url

      FROM Job_Posting jp

      LEFT JOIN Company c 
      ON jp.company_id = c.id

      ORDER BY jp.created_at DESC
      `
    );


    res.json(rows);


  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error',
      error: err.message
    });

  }

});



// GET /api/jobs/:id
router.get('/:id', async (req, res) => {

  try {

    const { id } = req.params;


    const [rows] = await pool.query(
      `
      SELECT 
        jp.*,
        c.name AS company_name,
        c.logo_url,
        c.website AS company_website

      FROM Job_Posting jp

      LEFT JOIN Company c
      ON jp.company_id = c.id

      WHERE jp.id = ?
      `,
      [id]
    );


    if (rows.length === 0) {

      return res.status(404).json({
        message: 'Job not found'
      });

    }


    res.json(rows[0]);


  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error',
      error: err.message
    });

  }

});


module.exports = router;