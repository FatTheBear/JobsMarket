const pool = require('./src/config/db');

async function checkDb() {
  try {
    console.log("--- TRANSACTIONS ---");
    const [txns] = await pool.query("SELECT * FROM `Transaction` LIMIT 50");
    console.log(txns);

    console.log("--- USERS ---");
    const [users] = await pool.query("SELECT id, email, role, coins FROM `User` LIMIT 50");
    console.log(users);
  } catch (err) {
    console.error("DB check failed:", err.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

checkDb();
