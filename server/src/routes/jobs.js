const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/authMiddleware');

// POST /api/jobs - Create a new job posting
router.post('/', authMiddleware, async (req, res) => {
  console.log("USER FROM TOKEN:", req.user);

  try {
    const {
      title,
      description,
      requirements,
      salary_min,
      salary_max,
      job_type,
      deadline,
      experience_req,
      working_hours,
      job_level,
      vacancies,
      gender_req,
      age_req,
      language_req,
      province,
      district,
      ward,
      exact_address,
      selected_skills,
      selected_industries
    } = req.body;

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

    const missingFields = Object.keys(requiredFields).filter(key => !requiredFields[key]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    if (salary_min != null && salary_max != null && salary_min > salary_max) {
      return res.status(400).json({
        message: 'Minimum salary cannot exceed maximum salary'
      });
    }

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

    const [companies] = await pool.query(
      'SELECT id, hr_id, pro_package, pro_expired_at FROM Company WHERE hr_id = ?',
      [user_id]
    );

    if (companies.length === 0) {
      return res.status(404).json({
        message: 'Please create a Company Profile first before posting a job.'
      });
    }

    const company = companies[0];
    const company_id = company.id;
    const hr_id = user_id;

    // 1. Kiểm tra gói Pro hiện tại
    let currentProPackage = company.pro_package || 'Free';
    let currentProExpiredAt = company.pro_expired_at ? new Date(company.pro_expired_at) : null;
    let isProCurrentlyActive = currentProExpiredAt && currentProExpiredAt >= new Date();

    const { post_type } = req.body; // 'Free', 'Pro_Day', 'Pro_Month'
    
    // Kết nối database transaction để thực hiện trừ coins an toàn nếu nạp gói mới
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (!isProCurrentlyActive && (post_type === 'Pro_Day' || post_type === 'Pro_Month')) {
        // Cần mua gói Pro mới
        const coinsRequired = post_type === 'Pro_Day' ? 20 : 500;
        
        // Lấy coins hiện tại của User
        const [users] = await connection.execute(
          'SELECT coins FROM User WHERE id = ? FOR UPDATE',
          [user_id]
        );
        const userCoins = users[0]?.coins || 0;
        
        if (userCoins < coinsRequired) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({
            message: `Insufficient coins balance to purchase Pro plan (Required: ${coinsRequired} coins, current balance: ${userCoins} coins).`
          });
        }
        
        // Trừ coins
        await connection.execute(
          'UPDATE User SET coins = coins - ? WHERE id = ?',
          [coinsRequired, user_id]
        );
        
        // Tạo Transaction
        await connection.execute(
          `INSERT INTO Transaction (user_id, amount_fiat, coins, type, payment_method, status, reference_code) 
           VALUES (?, 0, ?, 'spend', 'system', 'completed', ?)`,
          [user_id, coinsRequired, `PRO_SUB_${post_type.toUpperCase()}_${Date.now()}`]
        );
        
        // Kích hoạt gói Pro cho Company
        const durationHours = post_type === 'Pro_Day' ? 24 : (30 * 24);
        const newExpiredAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);
        
        await connection.execute(
          'UPDATE Company SET pro_package = ?, pro_expired_at = ? WHERE id = ?',
          [post_type, newExpiredAt, company_id]
        );
        
        currentProPackage = post_type;
        currentProExpiredAt = newExpiredAt;
        isProCurrentlyActive = true;
      }

      // 2. Kiểm tra giới hạn đăng tin trong 24 giờ qua
      const [recentJobs] = await connection.execute(
        'SELECT created_at FROM Job_Posting WHERE hr_id = ? AND created_at >= NOW() - INTERVAL 1 DAY',
        [hr_id]
      );
      
      const recentPostsCount = recentJobs.length;
      
      if (isProCurrentlyActive) {
        if (recentPostsCount >= 2) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({
            message: 'Pro plan limit exceeded: Maximum 2 job postings per 24 hours.'
          });
        }
      } else {
        if (recentPostsCount >= 1) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({
            message: 'Free account limit exceeded: Maximum 1 job posting per 24 hours. Please upgrade to Pro plan to post more.'
          });
        }
      }

      await connection.commit();
      connection.release();
    } catch (transactionError) {
      await connection.rollback();
      connection.release();
      console.error("Transaction failed during job post:", transactionError);
      return res.status(500).json({
        message: 'System error occurred while processing job posting and coin deduction.',
        error: transactionError.message
      });
    }

    const fullLocation = [exact_address, ward, district, province].filter(Boolean).join(', ');

    const workHoursString = typeof working_hours === 'object'
      ? JSON.stringify(working_hours)
      : (working_hours || null);

    const metadataObj = {
      deadline: deadline || null,
      job_level: job_level || null,
      vacancies: vacancies || null,
      gender_req: gender_req || null,
      detailed_address: fullLocation,
      is_pro: isProCurrentlyActive ? 1 : 0
    };

    const metadataString = JSON.stringify(metadataObj);

    const sql = `
      INSERT INTO Job_Posting (
        company_id, 
        hr_id, 
        title, 
        description, 
        requirements, 
        salary_min, 
        salary_max, 
        job_type, 
        status, 
        loc, 
        work_hrs, 
        exp_yrs, 
        age_req, 
        lang_req,
        metadata
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      company_id,
      hr_id,
      title,
      description || null,
      requirements || null,
      salary_min || null,
      salary_max || null,
      job_type || 'Full-time',
      province || null,
      workHoursString,
      experience_req || null,
      age_req || null,
      language_req || null,
      metadataString
    ];

    const [result] = await pool.query(sql, values);
    const jobId = result.insertId;

    if (selected_skills && Array.isArray(selected_skills) && selected_skills.length > 0) {
      const skillValues = selected_skills.map(id => [jobId, id, 'Beginner', 0]);
      await pool.query(
        'INSERT INTO Job_Skill (job_id, skill_id, min_level, min_years) VALUES ?',
        [skillValues]
      );
    }

    if (selected_industries && Array.isArray(selected_industries) && selected_industries.length > 0) {
      const indValues = selected_industries.map(id => [jobId, id]);
      await pool.query(
        'INSERT INTO Job_Industry (job_id, industry_id) VALUES ?',
        [indValues]
      );
    }

    res.status(201).json({
      message: 'Job posted successfully! Waiting for Admin approval.',
      jobId: jobId
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
      if (salary === 'Under 10 million') {
        query += ` AND jp.salary_max <= 10000000`;
      } else if (salary === '10 - 20 million') {
        query += ` AND ((jp.salary_min >= 10000000 AND jp.salary_min <= 20000000) OR (jp.salary_max >= 10000000 AND jp.salary_max <= 20000000))`;
      } else if (salary === 'Over 20 million') {
        query += ` AND (jp.salary_min > 20000000 OR jp.salary_max > 20000000)`;
      } else if (salary === 'Negotiable') {
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