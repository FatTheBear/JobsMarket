const db = require('./src/config/db');

const generateData = () => {
    const locations = ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Can Tho', 'Hai Phong'];
    const sizes = ['10-50', '50-100', '100-200', '200-500', '500-1000'];
    const jobTypes = ['Full-time', 'Part-time', 'Remote', 'Freelance', 'Contract'];
    const prefixes = ['Tech', 'Global', 'Smart', 'NextGen', 'Alpha', 'Prime', 'Apex', 'Nova', 'Core', 'Innova'];
    const suffixes = ['Solutions', 'Group', 'Inc', 'LLC', 'Corp', 'Enterprises', 'Holdings', 'Partners', 'Systems', 'Ventures'];
    
    let companies = [];
    let jobs = [];
    let companyIdCounter = 1;
    let jobIdCounter = 1;

    for (let categoryId = 1; categoryId <= 30; categoryId++) {
        for (let i = 0; i < 6; i++) {
            const industryId = ((categoryId - 1) * 6) + i + 1; 
            const companyName = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]} ${companyIdCounter}`;
            const logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random&color=fff&size=128`;
            const size = sizes[Math.floor(Math.random() * sizes.length)];
            const address = locations[Math.floor(Math.random() * locations.length)];
            const email = `contact@${companyName.replace(/\s+/g, '').toLowerCase()}.com`;
            const phone = `09${Math.floor(Math.random() * 90000000) + 10000000}`;
            const description = `We are ${companyName}, a leading organization committed to excellence, innovation, and sustainable growth. We pride ourselves on creating a dynamic and inclusive workplace where talent thrives.`;

            companies.push(`(${companyIdCounter}, 1, ${industryId}, '${companyName}', '${size}', '${logoUrl}', '${address}', '${description}', '${email}', '${phone}', 'Active')`);

            for (let j = 0; j < 6; j++) {
                const jobTitle = `Specialist Role ${j + 1} at ${companyName}`;
                const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
                const salary = Math.floor(Math.random() * 3000) + 500;
                const jobDesc = `Join our team as a ${jobTitle}. You will be responsible for driving key initiatives, collaborating with cross-functional teams, and delivering high-quality results.`;
                const requirements = `Bachelor degree required. Minimum 2 years of experience. Strong communication and analytical skills.`;

                jobs.push(`(${jobIdCounter}, ${companyIdCounter}, 1, ${industryId}, '${jobTitle}', '${jobDesc}', '${requirements}', '${salary}', '${jobType}', '${address}', 'Approved')`);
                jobIdCounter++;
            }
            companyIdCounter++;
        }
    }

    return { companies, jobs };
};

const seedDatabase = async () => {
    try {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM Company');
        if (rows[0].count > 0) {
            console.log('Database already seeded. Skipping...');
            process.exit(0);
        }

        console.log('Initializing default database values...');

        const [hrCheck] = await db.query('SELECT id FROM User WHERE id = 1');
        if (hrCheck.length === 0) {
            await db.query(`INSERT INTO User (id, email, password, role) VALUES (1, 'admin_hr@system.com', 'hashedpassword', 'HR')`);
        }

        const { companies, jobs } = generateData();

        const chunkSize = 50;
        
        for (let i = 0; i < companies.length; i += chunkSize) {
            const companyChunk = companies.slice(i, i + chunkSize).join(',');
            await db.query(`INSERT IGNORE INTO Company (id, hr_id, industry_id, name, size, logo_url, address, description, email, phone, status) VALUES ${companyChunk}`);
        }
        console.log('180 Companies seeded successfully.');

        for (let i = 0; i < jobs.length; i += chunkSize) {
            const jobChunk = jobs.slice(i, i + chunkSize).join(',');
            await db.query(`INSERT IGNORE INTO Job_Posting (id, company_id, hr_id, industry_id, title, description, requirements, salary, type, location, status) VALUES ${jobChunk}`);
        }
        console.log('1080 Jobs seeded successfully.');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();