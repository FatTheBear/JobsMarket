const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const companyController = require('../controllers/companyController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');


router.get('/applications', authMiddleware, companyController.getAppliedCandidates);
router.put('/applications/:id/status', authMiddleware, companyController.updateApplicationStatus);
router.patch('/applications/:id/status', authMiddleware, companyController.updateApplicationStatus);
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
// Accept both `logo` and `cover_image` files (optional)
router.post('/', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'cover_image', maxCount: 1 }]), async (req, res) => {
  try {
    const { 
      hr_id, 
      industry_id, 
      name, 
      website, 
      address,
      email,
      company_phone,
      tax_id,
      size,
      description
    } = req.body;

    if (!hr_id || !industry_id || !name) {
      return res.status(400).json({ message: 'Missing required information' });
    }

    let logo_url = req.body.logo_url;
    let cover_image_url = req.body.cover_image_url;
    if (req.files && req.files['logo'] && req.files['logo'][0]) {
      logo_url = `/uploads/avatars/${req.files['logo'][0].filename}`;
    }
    if (req.files && req.files['cover_image'] && req.files['cover_image'][0]) {
      cover_image_url = `/uploads/avatars/${req.files['cover_image'][0].filename}`;
    }

    const [result] = await pool.query(
      `INSERT INTO Company (hr_id, industry_id, name, logo_url, cover_image_url, website, address,
                            email, company_phone, tax_id, size, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hr_id,
        industry_id,
        name,
        logo_url || null,
        cover_image_url || null,
        website || null,
        address || null,
        email || null,
        company_phone || null,
        tax_id || null,
        size || null,
        description || null
      ]
    );

    res.status(201).json({ message: 'Company created successfully', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'This HR already has a company, use PUT to update' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// PUT /api/company/:hr_id — Cập nhật thông tin công ty
router.put('/:hr_id', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'cover_image', maxCount: 1 }]), async (req, res) => {
  try {
    const { hr_id } = req.params;
    const { 
      industry_id, 
      name, 
      website, 
      address,
      email,
      company_phone,
      tax_id,
      size,
      description
    } = req.body;

    if (!industry_id || !name) {
      return res.status(400).json({ message: 'Missing required information' });
    }

    let logo_url = req.body.logo_url;
    let cover_image_url = req.body.cover_image_url;
    if (req.files && req.files['logo'] && req.files['logo'][0]) {
      logo_url = `/uploads/avatars/${req.files['logo'][0].filename}`;
    }
    if (req.files && req.files['cover_image'] && req.files['cover_image'][0]) {
      cover_image_url = `/uploads/avatars/${req.files['cover_image'][0].filename}`;
    }

    const [result] = await pool.query(
      `UPDATE Company
       SET industry_id = ?, name = ?, logo_url = ?, cover_image_url = ?, website = ?, address = ?,
           email = ?, company_phone = ?, tax_id = ?, size = ?, description = ?
       WHERE hr_id = ?`,
      [
        industry_id,
        name,
        logo_url || null,
        cover_image_url || null,
        website || null,
        address || null,
        email || null,
        company_phone || null,
        tax_id || null,
        size || null,
        description || null,
        hr_id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'Updated successfully', logo_url });
  } catch (err) {
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


// GET /api/company/public/:id — Lấy thông tin công ty công khai và danh sách việc làm
router.get('/public/:id', async (req, res) => {
  try {
    const { id } = req.params; // company_id

    // Lấy token để xác định candidate hiện tại có đang follow hay không
    let currentCandidateId = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY');
        const [candidates] = await pool.query('SELECT id FROM Candidate_Profile WHERE user_id = ?', [decoded.id]);
        if (candidates.length > 0) {
          currentCandidateId = candidates[0].id;
        }
      } catch (err) {
        // Bỏ qua lỗi token
      }
    }

    // 1. Lấy thông tin doanh nghiệp
    const [companies] = await pool.query(
      `SELECT c.*, i.name AS industry_name, u.email AS hr_email,
              (SELECT COUNT(*) FROM Company_Follower WHERE company_id = c.id) AS followers_count
       FROM Company c
       LEFT JOIN Industry i ON c.industry_id = i.id
       LEFT JOIN User u ON c.hr_id = u.id
       WHERE c.id = ?`,
      [id]
    );

    if (companies.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const company = companies[0];

    // 2. Kiểm tra xem candidate hiện tại đã follow chưa
    let isFollowed = false;
    if (currentCandidateId) {
      const [followCheck] = await pool.query(
        'SELECT 1 FROM Company_Follower WHERE candidate_id = ? AND company_id = ?',
        [currentCandidateId, id]
      );
      isFollowed = followCheck.length > 0;
    }

    // 3. Lấy danh sách jobs đang tuyển của công ty đó (ở trạng thái Approved)
    const [jobs] = await pool.query(
      `SELECT * FROM Job_Posting 
       WHERE company_id = ? AND status = 'Approved'
       ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      company,
      isFollowed,
      jobs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/company/:id/follow — Follow hoặc Unfollow công ty
router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params; // company_id
    const user_id = req.user.id; // user_id của Candidate từ authMiddleware

    // 1. Lấy candidate_profile.id dựa vào user_id
    const [candidates] = await pool.query('SELECT id FROM Candidate_Profile WHERE user_id = ?', [user_id]);
    if (candidates.length === 0) {
      return res.status(403).json({ message: 'Only candidates can follow companies' });
    }
    const candidate_id = candidates[0].id;

    // 2. Kiểm tra follow
    const [existing] = await pool.query(
      'SELECT * FROM Company_Follower WHERE candidate_id = ? AND company_id = ?',
      [candidate_id, id]
    );

    if (existing.length > 0) {
      // Hủy follow
      await pool.query(
        'DELETE FROM Company_Follower WHERE candidate_id = ? AND company_id = ?',
        [candidate_id, id]
      );
      res.json({ message: 'Unfollowed company', followed: false });
    } else {
      // Bắt đầu follow
      await pool.query(
        'INSERT INTO Company_Follower (candidate_id, company_id) VALUES (?, ?)',
        [candidate_id, id]
      );
      res.status(201).json({ message: 'Followed company', followed: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


module.exports = router;
