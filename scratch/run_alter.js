const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });
const pool = require('../server/src/config/db');

async function run() {
    try {
        console.log("Modifying Candidate_Profile table structure...");
        await pool.query("ALTER TABLE Candidate_Profile MODIFY COLUMN full_name VARCHAR(255) DEFAULT NULL;");
        console.log("Success! Table Modified.");
        process.exit(0);
    } catch (err) {
        console.error("Failed to modify table:", err);
        process.exit(1);
    }
}

run();
