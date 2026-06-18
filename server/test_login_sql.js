const mysql = require('mysql2/promise');
async function run() {
    try {
        const pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'jobs_market'
        });
        const [users] = await pool.execute(
            `SELECT 
                u.id, 
                u.email, 
                u.password_hash, 
                u.role, 
                u.status,

                cp.full_name AS candidate_name, 
                cp.avatar_url AS candidate_avatar,

                com.id AS company_id,
                com.name AS company_name, 
                com.logo_url AS company_avatar

             FROM User u

             LEFT JOIN Candidate_Profile cp 
             ON u.id = cp.user_id

             LEFT JOIN Company com 
             ON u.id = com.hr_id

             WHERE u.email = ?`,
            ['ungvien5@gmail.com']
        );
        console.log(users);
        await pool.end();
    } catch (e) {
        console.error('DB ERROR:', e.message);
    }
}
run();
