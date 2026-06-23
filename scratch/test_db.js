const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const pool = require('../server/src/config/db');

async function testDb() {
  console.log('Querying Community_Post table...');
  try {
    const [rows] = await pool.query('SELECT id, user_id, content, media_url, media_type FROM Community_Post ORDER BY id DESC LIMIT 5');
    console.log('Last 5 posts in DB:');
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('Database query failed:', err.message);
  } finally {
    pool.end();
  }
}

testDb();
