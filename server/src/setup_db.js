const mysql = require('mysql2/promise');

async function run() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '', // Assuming default XAMPP
        database: 'jobs_market' // Assuming database name
    });

    try {
        console.log("Creating Saved_Candidate table...");
        const query = `
        CREATE TABLE IF NOT EXISTS \`Saved_Candidate\` (
            \`hr_id\` INT NOT NULL,
            \`candidate_id\` INT NOT NULL,
            \`saved_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (\`hr_id\`, \`candidate_id\`),
            CONSTRAINT \`fk_savedcand_hr\` FOREIGN KEY (\`hr_id\`) REFERENCES \`User\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT \`fk_savedcand_profile\` FOREIGN KEY (\`candidate_id\`) REFERENCES \`Candidate_Profile\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        
        await connection.query(query);
        console.log("Table Created Successfully!");
        
    } catch (error) {
        console.error("Error creating table:", error);
    } finally {
        await connection.end();
    }
}

run();
