const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/industries — Get all available industries
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM Industry ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
