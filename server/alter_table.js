const pool = require('./src/config/db');

const alterTable = async () => {
    try {
        await pool.query("ALTER TABLE community_post ADD COLUMN visibility VARCHAR(20) DEFAULT 'public'");
        console.log("ALTER TABLE community_post completed successfully!");
        process.exit(0);
    } catch (err) {
        // If column already exists, it might throw an error, we can ignore it or log it
        if (err.code === 'ER_DUP_COLUMNNAME') {
            console.log("Column 'visibility' already exists. Skipping...");
            process.exit(0);
        } else {
            console.error("ALTER TABLE failed:", err);
            process.exit(1);
        }
    }
};

alterTable();
