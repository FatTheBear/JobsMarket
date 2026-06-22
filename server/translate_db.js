const mysql = require('mysql2/promise');
async function run() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'jobs_market'
    });
    
    await connection.query(`UPDATE Job_Posting SET title = 'Frontend Developer', description = 'Build modern user interfaces.', requirements = 'React, CSS, JS' WHERE title LIKE '%Frontend Developer (ReactJS)%' OR title LIKE '%react%'`);
    await connection.query(`UPDATE Job_Posting SET title = 'Backend Developer', description = 'Build RESTful APIs.', requirements = 'Node.js, Express, MySQL' WHERE title LIKE '%Backend Developer (NodeJS)%'`);
    await connection.query(`UPDATE Job_Posting SET title = 'Mobile Developer', description = 'Develop cross-platform apps.', requirements = 'React Native, TypeScript' WHERE title LIKE '%Mobile Developer (React Native)%'`);
    await connection.query(`UPDATE Job_Posting SET title = 'Chief Accountant', description = 'Manage accounting activities.', requirements = 'Accounting degree, CPA, 5+ years experience' WHERE title LIKE '%Kế toán trưởng%'`);
    await connection.query(`UPDATE Job_Posting SET title = 'Digital Marketing Specialist', description = 'Plan and execute marketing campaigns.', requirements = 'Facebook Ads, Google Ads, SEO' WHERE title LIKE '%Chuyên viên Marketing Online%'`);
    await connection.query(`UPDATE Job_Posting SET title = 'Content Creator', description = 'Create social media content.', requirements = 'Creative mindset, portfolio' WHERE title LIKE '%Content Creator%'`);
    await connection.query(`UPDATE Job_Posting SET title = 'Math Tutor', description = 'Tutor high school math.', requirements = 'Math or Education degree' WHERE title LIKE '%Giáo viên dạy kèm Toán THPT%'`);
    await connection.query(`UPDATE Job_Posting SET title = 'Sales Associate', description = 'Online and offline sales.', requirements = 'Good communication skills' WHERE title LIKE '%Nhân viên bán hàng%'`);
    await connection.query(`UPDATE Job_Posting SET title = 'UI/UX Designer', description = 'Design wireframes and prototypes.', requirements = 'Figma proficiency' WHERE title LIKE '%UI/UX Designer%'`);
    await connection.query(`UPDATE Job_Posting SET title = 'Business Analyst', description = 'Analyze business requirements.', requirements = '2+ years BA experience' WHERE title LIKE '%Business Analyst (BA)%'`);
    await connection.query(`UPDATE Job_Posting SET title = 'Senior Frontend Developer', description = 'Build scalable web apps.', requirements = 'React, TypeScript, Next.js' WHERE title LIKE '%Senior Frontend Developer%'`);
    await connection.query(`UPDATE Job_Posting SET title = 'Software Engineer', description = 'Develop software solutions.', requirements = 'Programming experience' WHERE title LIKE '%àasfasafa%'`);

    await connection.query(`UPDATE Job_Posting SET description = 'Detailed job description will be updated soon.', requirements = 'Relevant skills and experience.' WHERE description LIKE '%Thiết kế%' OR description LIKE '%Xây dựng%' OR description LIKE '%Phát triển%' OR description LIKE '%Sáng tạo%' OR description LIKE '%Dạy kèm%' OR description LIKE '%Bán hàng%'`);

    console.log('Updated DB jobs to English');
    await connection.end();
}
run();
