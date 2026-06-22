const mysql = require('mysql2/promise');
async function run() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'jobs_market'
        });
        await connection.query(`
            ALTER TABLE Job_Posting 
            ADD COLUMN experience_req VARCHAR(100) DEFAULT NULL,
            ADD COLUMN working_hours JSON DEFAULT NULL,
            ADD COLUMN job_level VARCHAR(100) DEFAULT NULL,
            ADD COLUMN vacancies INT DEFAULT NULL,
            ADD COLUMN gender_req VARCHAR(50) DEFAULT NULL,
            ADD COLUMN age_req VARCHAR(50) DEFAULT NULL,
            ADD COLUMN language_req VARCHAR(100) DEFAULT NULL,
            ADD COLUMN province VARCHAR(100) DEFAULT NULL,
            ADD COLUMN district VARCHAR(100) DEFAULT NULL,
            ADD COLUMN ward VARCHAR(100) DEFAULT NULL,
            ADD COLUMN exact_address VARCHAR(255) DEFAULT NULL
        `);
        console.log('Database schema updated successfully.');
        await connection.end();
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist.');
        } else {
            console.error(e);
            process.exit(1);
        }
    }
}
run();
