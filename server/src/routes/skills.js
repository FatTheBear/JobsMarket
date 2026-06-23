const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/skills — Get all available skills
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, skill_name AS name FROM skill ORDER BY skill_name ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/skills — Add a new skill (if not exists)
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Skill name is required' });
    }

    // Check if skill already exists
    const [existing] = await pool.query(
      'SELECT id, skill_name AS name FROM skill WHERE LOWER(skill_name) = LOWER(?)',
      [name.trim()]
    );
    if (existing.length > 0) {
      return res.status(200).json({ message: 'Skill already exists', skill: existing[0] });
    }

    const [result] = await pool.query(
      'INSERT INTO skill (skill_name) VALUES (?)',
      [name.trim()]
    );
    res.status(201).json({ message: 'Skill created', skill: { id: result.insertId, name: name.trim() } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/skills/job/:job_id — Get all skills required for a specific job
router.get('/job/:job_id', async (req, res) => {
  try {
    const { job_id } = req.params;
    const [rows] = await pool.query(
      `SELECT js.skill_id AS id, js.skill_id, s.skill_name AS name, js.min_level, js.min_years
       FROM job_skill js
       JOIN skill s ON js.skill_id = s.id
       WHERE js.job_id = ?
       ORDER BY s.skill_name ASC`,
      [job_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/skills/job/:job_id — Add a skill requirement to a job
router.post('/job/:job_id', async (req, res) => {
  try {
    const { job_id } = req.params;
    const { skill_id, min_level, min_years } = req.body;

    if (!skill_id) {
      return res.status(400).json({ message: 'skill_id is required' });
    }

    // Upsert: replace if already exists
    await pool.query(
      `INSERT INTO Job_Skill (job_id, skill_id, min_level, min_years)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE min_level = VALUES(min_level), min_years = VALUES(min_years)`,
      [job_id, skill_id, min_level || 'Beginner', min_years || 0]
    );

    res.status(201).json({ message: 'Skill added to job' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/skills/job/:job_id/:skill_id — Remove a skill from a job
router.delete('/job/:job_id/:skill_id', async (req, res) => {
  try {
    const { job_id, skill_id } = req.params;
    await pool.query(
      'DELETE FROM Job_Skill WHERE job_id = ? AND skill_id = ?',
      [job_id, skill_id]
    );
    res.json({ message: 'Skill removed from job' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
