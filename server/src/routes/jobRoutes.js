const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// CREATE JOB
router.post("/jobs", async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary_min,
      salary_max,
      job_type,
      deadline,
      hr_id
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO jobs 
      (title, description, requirements, salary_min, salary_max, job_type, deadline, hr_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, requirements, salary_min, salary_max, job_type, deadline, hr_id]
    );

    res.status(201).json({
      message: "Job created",
      jobId: result.insertId
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET JOBS
router.get("/jobs", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM jobs ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;