const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const pool = require('../server/src/config/db');

async function check() {
    try {
        const [skills] = await pool.execute(
          `SELECT s.id, s.name, js.min_level, js.min_years
           FROM job_skill js
           JOIN skill s ON js.skill_id = s.id
           WHERE js.job_id = ?`,
          [1] // Thử với job_id = 1
        );
        console.log('Skills found:', skills);
    } catch (e) {
        console.error('Error executing query:', e);
    } finally {
        await pool.end();
    }
}

check();
