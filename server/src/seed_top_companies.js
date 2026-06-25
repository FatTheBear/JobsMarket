const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function run() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'jobs_market'
    });

    try {
        const passwordHash = await bcrypt.hash('123456', 10);
        const companies = [
            { name: 'MISA', email: 'hr_misa@test.com', logo: '/icons/emp_misa.svg' },
            { name: 'Concentrix', email: 'hr_concentrix@test.com', logo: '/icons/emp_concentrix.svg' },
            { name: 'MB', email: 'hr_mb@test.com', logo: '/icons/emp_mb.svg' },
            { name: 'SeABank', email: 'hr_seabank@test.com', logo: '/icons/emp_seabank.svg' },
            { name: 'LG', email: 'hr_lg@test.com', logo: '/icons/emp_lg.svg' },
        ];

        for (let i = 0; i < companies.length; i++) {
            const c = companies[i];
            
            // 1. Insert User
            const [userResult] = await connection.query(
                `INSERT INTO User (email, password_hash, role, status) VALUES (?, ?, 'HR', 'Active')`,
                [c.email, passwordHash]
            );
            const hr_id = userResult.insertId;

            // 2. Insert Company
            await connection.query(
                `INSERT INTO Company (hr_id, industry_id, name, logo_url) VALUES (?, 1, ?, ?)`,
                [hr_id, c.name, c.logo]
            );

            // 3. Insert Job Posting
            await connection.query(
                `INSERT INTO Job_Posting (company_id, hr_id, title, description, requirements, salary_min, salary_max, job_type, status) 
                 VALUES ((SELECT id FROM Company WHERE hr_id = ?), ?, ?, 'Description', 'Requirements', 10000000, 20000000, 'Full-time', 'Approved')`,
                [hr_id, hr_id, `Staff Recruitment - ${c.name}`]
            );
            
            console.log(`Seeded ${c.name}`);
        }
        console.log("Seeding complete!");
    } catch (error) {
        console.error("Seeding error:", error);
    } finally {
        await connection.end();
    }
}
run();
