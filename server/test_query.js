const pool = require('./src/config/db');

async function dropBankColumns() {
  try {
    console.log("Dropping bank columns from User table...");
    await pool.query(`
      ALTER TABLE \`User\`
      DROP COLUMN \`bank_name\`,
      DROP COLUMN \`bank_account_number\`,
      DROP COLUMN \`bank_account_name\`
    `);
    console.log("Successfully dropped bank columns!");
  } catch (err) {
    console.log("Already dropped or failed:", err.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

dropBankColumns();
