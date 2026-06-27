const express = require('express');
const pool = require('../config/db');

const router = express.Router();

/**
 * GET /api/company/public/:companyId
 * Get company public profile (for candidates to view)
 * Returns: company info + company jobs
 */
router.get('/public/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;

    // Get company info
    const [companies] = await pool.execute(
      `SELECT 
        c.id,
        c.name,
        c.logo_url,
        c.cover_image_url,
        c.website,
        c.address,
        c.description,
        i.name as industry_name,
        u.created_at as company_created_at
      FROM Company c
      LEFT JOIN Industry i ON c.industry_id = i.id
      LEFT JOIN User u ON c.hr_id = u.id
      WHERE c.id = ?`,
      [companyId]
    );

    if (!companies || companies.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const company = companies[0];

    // Get company jobs
    const [jobs] = await pool.execute(
      `SELECT 
        jp.id,
        jp.title,
        jp.description,
        jp.salary_min,
        jp.salary_max,
        jp.job_type,
        jp.status,
        jp.view_count,
        jp.created_at
      FROM Job_Posting jp
      WHERE jp.company_id = ? AND jp.status = 'Approved'
      ORDER BY jp.created_at DESC`,
      [companyId]
    );

    // Get skills for each job
    const jobsWithSkills = await Promise.all(
      jobs.map(async (job) => {
        const [skills] = await pool.execute(
          `SELECT s.id, s.name, js.min_level, js.min_years
           FROM Job_Skill js
           JOIN Skill s ON js.skill_id = s.id
           WHERE js.job_id = ?`,
          [job.id]
        );
        return { ...job, skills };
      })
    );

    res.status(200).json({
      company,
      jobs: jobsWithSkills
    });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/company/featured
 * Get featured companies (for dashboard)
 * Returns: List of companies with their info
 */
router.get('/featured', async (req, res) => {
  try {
    const [companies] = await pool.execute(
      `SELECT 
        c.id,
        c.name,
        c.logo_url,
        c.cover_image_url,
        c.website,
        c.company_bio,
        i.name as industry_name,
        COUNT(jp.id) as job_count
      FROM Company c
      LEFT JOIN Industry i ON c.industry_id = i.id
      LEFT JOIN Job_Posting jp ON c.id = jp.company_id AND jp.status = 'Approved'
      GROUP BY c.id
      ORDER BY job_count DESC
      LIMIT 6`
    );

    res.status(200).json(companies);
  } catch (error) {
    console.error('Error fetching featured companies:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT /api/company/:companyId/profile
 * Update company public profile (bio, cover image)
 * Requires: HR authentication
 */
router.put('/:companyId/profile', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { company_bio, cover_image_url } = req.body;
    const hrId = req.user?.id; // Assumes auth middleware sets req.user

    // Verify company belongs to HR
    const [companyCheck] = await pool.execute(
      'SELECT * FROM Company WHERE id = ? AND hr_id = ?',
      [companyId, hrId]
    );

    if (!companyCheck || companyCheck.length === 0) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await pool.execute(
      `UPDATE Company 
       SET company_bio = ?, cover_image_url = ?
       WHERE id = ?`,
      [company_bio || null, cover_image_url || null, companyId]
    );

    res.status(200).json({ message: 'Company profile updated' });
  } catch (error) {
    console.error('Error updating company profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
