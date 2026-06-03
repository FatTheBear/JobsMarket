const pool = require('./src/config/db');

async function runMigration() {
    console.log('Starting migrations...');
    try {
        // 1. Add verification_code and code_expires_at to User if not present
        try {
            console.log('Adding verification fields to User...');
            await pool.query(`
                ALTER TABLE \`User\` 
                ADD COLUMN \`verification_code\` VARCHAR(255) DEFAULT NULL,
                ADD COLUMN \`code_expires_at\` TIMESTAMP NULL DEFAULT NULL
            `);
            console.log('Successfully added verification fields to User.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Verification fields already exist in User.');
            } else {
                throw err;
            }
        }

        // 2. Add education to Candidate_Profile if not present
        try {
            console.log('Adding education JSON column to Candidate_Profile...');
            await pool.query(`
                ALTER TABLE \`Candidate_Profile\`
                ADD COLUMN \`education\` JSON DEFAULT NULL
            `);
            console.log('Successfully added education column to Candidate_Profile.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Education column already exists in Candidate_Profile.');
            } else {
                throw err;
            }
        }

        // 2b. Add address to Candidate_Profile if not present
        try {
            console.log('Adding address column to Candidate_Profile...');
            await pool.query(`
                ALTER TABLE \`Candidate_Profile\`
                ADD COLUMN \`address\` VARCHAR(255) DEFAULT NULL
            `);
            console.log('Successfully added address column to Candidate_Profile.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Address column already exists in Candidate_Profile.');
            } else {
                throw err;
            }
        }

        // 2c. Alter avatar_url in Candidate_Profile to be LONGTEXT (for base64 storage)
        try {
            console.log('Modifying avatar_url to LONGTEXT in Candidate_Profile...');
            await pool.query(`
                ALTER TABLE \`Candidate_Profile\`
                MODIFY COLUMN \`avatar_url\` LONGTEXT DEFAULT NULL
            `);
            console.log('Successfully modified avatar_url to LONGTEXT in Candidate_Profile.');
        } catch (err) {
            throw err;
        }

        // 2d. Add display_name to Candidate_Profile if not present
        try {
            console.log('Adding display_name column to Candidate_Profile...');
            await pool.query(`
                ALTER TABLE \`Candidate_Profile\`
                ADD COLUMN \`display_name\` VARCHAR(255) DEFAULT NULL
            `);
            console.log('Successfully added display_name column to Candidate_Profile.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('display_name column already exists in Candidate_Profile.');
            } else {
                throw err;
            }
        }

        // 3. Create Company_Follower table
        console.log('Creating Company_Follower table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`Company_Follower\` (
                \`candidate_id\` INT NOT NULL,
                \`company_id\` INT NOT NULL,
                \`followed_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (\`candidate_id\`, \`company_id\`),
                FOREIGN KEY (\`candidate_id\`) REFERENCES \`Candidate_Profile\`(\`id\`) ON DELETE CASCADE,
                FOREIGN KEY (\`company_id\`) REFERENCES \`Company\`(\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Successfully created Company_Follower table.');

        // 4. Drop legacy skill tables
        try {
            console.log('Dropping legacy skill tables (Job_Skill, Candidate_Skill, Skill)...');
            await pool.query('SET FOREIGN_KEY_CHECKS = 0;');
            await pool.query('DROP TABLE IF EXISTS `Job_Skill`;');
            await pool.query('DROP TABLE IF EXISTS `Candidate_Skill`;');
            await pool.query('DROP TABLE IF EXISTS `Skill`;');
            await pool.query('SET FOREIGN_KEY_CHECKS = 1;');
            console.log('Successfully dropped legacy skill tables.');
        } catch (err) {
            throw err;
        }

        // 5. Add abbreviated columns to Job_Posting
        try {
            console.log('Adding new fields to Job_Posting...');
            await pool.query(`
                ALTER TABLE \`Job_Posting\`
                ADD COLUMN \`req_skills\` JSON DEFAULT NULL,
                ADD COLUMN \`benf\` TEXT DEFAULT NULL,
                ADD COLUMN \`loc\` VARCHAR(255) DEFAULT NULL,
                ADD COLUMN \`work_hrs\` VARCHAR(100) DEFAULT NULL,
                ADD COLUMN \`deg_req\` VARCHAR(255) DEFAULT NULL,
                ADD COLUMN \`exp_yrs\` VARCHAR(50) DEFAULT NULL,
                ADD COLUMN \`age_req\` VARCHAR(50) DEFAULT NULL,
                ADD COLUMN \`lang_req\` VARCHAR(100) DEFAULT NULL,
                ADD COLUMN \`emp_phone\` VARCHAR(20) DEFAULT NULL,
                ADD COLUMN \`emp_email\` VARCHAR(100) DEFAULT NULL
            `);
            console.log('Successfully added new fields to Job_Posting.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('New fields already exist in Job_Posting.');
            } else {
                throw err;
            }
        }

        // 6. Add cand_skills to Candidate_Profile
        try {
            console.log('Adding cand_skills column to Candidate_Profile...');
            await pool.query(`
                ALTER TABLE \`Candidate_Profile\`
                ADD COLUMN \`cand_skills\` JSON DEFAULT NULL
            `);
            console.log('Successfully added cand_skills column to Candidate_Profile.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('cand_skills column already exists in Candidate_Profile.');
            } else {
                throw err;
            }
        }

        // 7. Add cv_url to Candidate_Profile
        try {
            console.log('Adding cv_url column to Candidate_Profile...');
            await pool.query(`
                ALTER TABLE \`Candidate_Profile\`
                ADD COLUMN \`cv_url\` LONGTEXT DEFAULT NULL
            `);
            console.log('Successfully added cv_url column to Candidate_Profile.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('cv_url column already exists in Candidate_Profile.');
            } else {
                throw err;
            }
        }

        // 8. Create Candidate_Experience and Candidate_Education tables
        console.log('Creating Candidate_Experience and Candidate_Education tables...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`Candidate_Experience\` (
                \`id\` INT AUTO_INCREMENT PRIMARY KEY,
                \`candidate_id\` INT NOT NULL,
                \`company_name\` VARCHAR(255) NOT NULL,
                \`role\` VARCHAR(255) NOT NULL,
                \`start_date\` VARCHAR(50) NOT NULL,
                \`end_date\` VARCHAR(50) DEFAULT NULL,
                \`description\` TEXT DEFAULT NULL,
                FOREIGN KEY (\`candidate_id\`) REFERENCES \`Candidate_Profile\`(\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`Candidate_Education\` (
                \`id\` INT AUTO_INCREMENT PRIMARY KEY,
                \`candidate_id\` INT NOT NULL,
                \`school_name\` VARCHAR(255) NOT NULL,
                \`degree\` VARCHAR(255) NOT NULL,
                \`start_date\` VARCHAR(50) NOT NULL,
                \`end_date\` VARCHAR(50) DEFAULT NULL,
                \`description\` TEXT DEFAULT NULL,
                FOREIGN KEY (\`candidate_id\`) REFERENCES \`Candidate_Profile\`(\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Successfully created Candidate_Experience and Candidate_Education tables.');

        // 9. Migrate existing education JSON data to the new tables
        console.log('Migrating existing profile JSON data to new tables...');
        const [profiles] = await pool.query('SELECT id, education FROM Candidate_Profile');
        for (const profile of profiles) {
            if (profile.education) {
                try {
                    const parsed = typeof profile.education === 'string' ? JSON.parse(profile.education) : profile.education;
                    if (Array.isArray(parsed)) {
                        for (const item of parsed) {
                            // Check if it looks like an education or experience item
                            const isEdu = item.school || item.degree;
                            const isExp = item.company || item.role;
                            
                            if (isEdu) {
                                await pool.query(
                                    'INSERT INTO Candidate_Education (candidate_id, school_name, degree, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
                                    [profile.id, item.school || 'School', item.degree || 'Degree', item.startDate || '2026-01', item.gradDate || null]
                                );
                            } else if (isExp) {
                                await pool.query(
                                    'INSERT INTO Candidate_Experience (candidate_id, company_name, role, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
                                    [profile.id, item.company || 'Company', item.role || 'Role', item.startDate || '2026-01', item.endDate || null]
                                );
                            } else {
                                // Fallback default to Education
                                await pool.query(
                                    'INSERT INTO Candidate_Education (candidate_id, school_name, degree, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
                                    [profile.id, item.school || 'School', item.degree || 'Degree', item.startDate || '2026-01', item.gradDate || null]
                                );
                            }
                        }
                    }
                } catch (e) {
                    console.error(`Failed to migrate profile ID ${profile.id}:`, e.message);
                }
            }
        }
        console.log('Successfully completed data migration.');

        console.log('All migrations completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
        console.log('Database connection closed.');
    }
}

runMigration();