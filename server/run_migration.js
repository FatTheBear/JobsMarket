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
        // try {
        //     console.log('Dropping legacy skill tables (Job_Skill, Candidate_Skill, Skill)...');
        //     await pool.query('SET FOREIGN_KEY_CHECKS = 0;');
        //     await pool.query('DROP TABLE IF EXISTS `Job_Skill`;');
        //     await pool.query('DROP TABLE IF EXISTS `Candidate_Skill`;');
        //     await pool.query('DROP TABLE IF EXISTS `Skill`;');
        //     await pool.query('SET FOREIGN_KEY_CHECKS = 1;');
        //     console.log('Successfully dropped legacy skill tables.');
        // } catch (err) {
        //     throw err;
        // }

        // 5. Add abbreviated columns to Job_Posting
        // try {
        //     console.log('Adding new fields to Job_Posting...');
        //     await pool.query(`
        //         ALTER TABLE \`Job_Posting\`
        //         ADD COLUMN \`req_skills\` JSON DEFAULT NULL,
        //         ADD COLUMN \`benf\` TEXT DEFAULT NULL,
        //         ADD COLUMN \`loc\` VARCHAR(255) DEFAULT NULL,
        //         ADD COLUMN \`work_hrs\` VARCHAR(100) DEFAULT NULL,
        //         ADD COLUMN \`deg_req\` VARCHAR(255) DEFAULT NULL,
        //         ADD COLUMN \`exp_yrs\` VARCHAR(50) DEFAULT NULL,
        //         ADD COLUMN \`age_req\` VARCHAR(50) DEFAULT NULL,
        //         ADD COLUMN \`lang_req\` VARCHAR(100) DEFAULT NULL,
        //         ADD COLUMN \`emp_phone\` VARCHAR(20) DEFAULT NULL,
        //         ADD COLUMN \`emp_email\` VARCHAR(100) DEFAULT NULL
        //     `);
        //     console.log('Successfully added new fields to Job_Posting.');
        // } catch (err) {
        //     if (err.code === 'ER_DUP_FIELDNAME') {
        //         console.log('New fields already exist in Job_Posting.');
        //     } else {
        //         throw err;
        //     }
        // }

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

        // 10. Add Coin_Exchange_Fee table and update Transaction table for PayPal
        console.log('Creating Coin_Exchange_Fee table and updating Transaction table...');
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS \`Coin_Exchange_Fee\` (
                    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
                    \`price_vnd\` DECIMAL(10, 2) NOT NULL,
                    \`coins\` INT NOT NULL,
                    \`label\` VARCHAR(100) DEFAULT NULL,
                    \`description\` TEXT DEFAULT NULL,
                    \`is_default\` BOOLEAN DEFAULT FALSE,
                    \`is_active\` BOOLEAN DEFAULT TRUE,
                    \`sort_order\` INT DEFAULT 0,
                    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `);

            // Insert default package if not exists
            const [existingFees] = await pool.query('SELECT * FROM \`Coin_Exchange_Fee\` WHERE \`is_default\` = TRUE');
            if (existingFees.length === 0) {
                await pool.query(`
                    INSERT INTO \`Coin_Exchange_Fee\` (\`price_vnd\`, \`coins\`, \`label\`, \`description\`, \`is_default\`, \`is_active\`, \`sort_order\`)
                    VALUES (20000, 100, 'Standard Package', 'System default package', TRUE, TRUE, 1);
                `);
                console.log('Successfully inserted default Coin_Exchange_Fee package.');
            }

            // Add columns to Transaction table
            // try {
            //     await pool.query(`
            //         ALTER TABLE \`Transaction\`
            //         ADD COLUMN \`paypal_order_id\` VARCHAR(255) DEFAULT NULL AFTER \`reference_code\`,
            //         ADD COLUMN \`fee_id\` INT DEFAULT NULL AFTER \`paypal_order_id\`,
            //         ADD CONSTRAINT \`fk_tx_fee\` FOREIGN KEY (\`fee_id\`) REFERENCES \`Coin_Exchange_Fee\`(\`id\`) ON DELETE SET NULL;
            //     `);
            //     console.log('Successfully added paypal_order_id and fee_id to Transaction table.');
            // } catch (err) {
            //     if (err.code === 'ER_DUP_FIELDNAME') {
            //         console.log('paypal_order_id and fee_id columns already exist in Transaction table.');
            //     } else {
            //         throw err;
            //     }
            // }

        } catch (error) {
            console.error('Error creating Coin_Exchange_Fee or updating Transaction table:', error);
        }

        console.log('All migrations completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    }



    console.log('--- Starting DB Structure Update Migration ---');

    // 1. DROP REDUNDANT COLUMNS IN JOB_POSTING TABLE
    // Wrapped in isolated try-catch blocks so the script won't crash if the column is already dropped.
    try {
        console.log('Dropping req_skills column from job_posting...');
        await pool.query('ALTER TABLE `job_posting` DROP COLUMN `req_skills`');
        console.log('-> Successfully dropped req_skills column.');
    } catch (err) {
        if (err.errno === 1091) { // MySQL Error Code for: Column doesn't exist
            console.log('-> Column req_skills was already dropped.');
        } else {
            console.error('Error dropping req_skills column:', err.message);
        }
    }

    try {
        console.log('Dropping emp_phone column from job_posting...');
        await pool.query('ALTER TABLE `job_posting` DROP COLUMN `emp_phone`');
        console.log('-> Successfully dropped emp_phone column.');
    } catch (err) {
        if (err.errno === 1091) {
            console.log('-> Column emp_phone was already dropped.');
        } else {
            console.error('Error dropping emp_phone column:', err.message);
        }
    }

    try {
        console.log('Dropping emp_email column from job_posting...');
        await pool.query('ALTER TABLE `job_posting` DROP COLUMN `emp_email`');
        console.log('-> Successfully dropped emp_email column.');
    } catch (err) {
        if (err.errno === 1091) {
            console.log('-> Column emp_email was already dropped.');
        } else {
            console.error('Error dropping emp_email column:', err.message);
        }
    }


    // 2. CREATE SKILL ECOSYSTEM TABLES
    try {
        // Create Skill table (Dictionary)
        console.log('Creating skill table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`skill\` (
                \`id\` INT(11) NOT NULL AUTO_INCREMENT,
                \`skill_name\` VARCHAR(100) NOT NULL,
                PRIMARY KEY (\`id\`),
                UNIQUE KEY \`unique_skill_name\` (\`skill_name\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('-> skill table is ready.');

        // Create job_skill junction table
        console.log('Creating job_skill table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`job_skill\` (
                \`job_id\` INT(11) NOT NULL,
                \`skill_id\` INT(11) NOT NULL,
                PRIMARY KEY (\`job_id\`, \`skill_id\`),
                CONSTRAINT \`fk_js_job\` FOREIGN KEY (\`job_id\`) REFERENCES \`job_posting\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT \`fk_js_skill\` FOREIGN KEY (\`skill_id\`) REFERENCES \`skill\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('-> job_skill table is ready.');

        // Tạo bảng candidate_skill
        console.log('Creating candidate_skill table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`candidate_skill\` (
                \`candidate_id\` INT(11) NOT NULL,
                \`skill_id\` INT(11) NOT NULL,
                \`level\` INT DEFAULT 0,
                PRIMARY KEY (\`candidate_id\`, \`skill_id\`),
                CONSTRAINT \`fk_cs_candidate\` FOREIGN KEY (\`candidate_id\`) REFERENCES \`Candidate_Profile\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT \`fk_cs_skill\` FOREIGN KEY (\`skill_id\`) REFERENCES \`skill\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('-> candidate_skill table is ready.');

        console.log('Adding user_id to Company table...');

        await pool.query(`
            ALTER TABLE \`Company\`
            ADD COLUMN IF NOT EXISTS \`user_id\` INT(11),
            ADD CONSTRAINT \`fk_company_user\`
            FOREIGN KEY (\`user_id\`) REFERENCES \`User\`(\`id\`)
            ON DELETE CASCADE
            ON UPDATE CASCADE;
        `);

        console.log('-> user_id column in Company is ready.');

        // Add company_bio and cover_image_url to Company table for public profiles
        console.log('Adding company_bio and cover_image_url columns to Company table...');
        try {
            await pool.query(`
                ALTER TABLE \`Company\`
                ADD COLUMN IF NOT EXISTS \`company_bio\` TEXT DEFAULT NULL COMMENT 'Company description/biography',
                ADD COLUMN IF NOT EXISTS \`cover_image_url\` VARCHAR(255) DEFAULT NULL COMMENT 'Company cover image URL'
            `);
            console.log('-> company_bio and cover_image_url columns added to Company table.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('-> company_bio and cover_image_url columns already exist in Company table.');
            } else {
                throw err;
            }
        }

    } catch (dbError) {
        console.error('\n[CRITICAL ERROR] Table creation failed:', dbError.message);
        process.exit(1); // Exit process with failure code

    }
    await pool.end();
    console.log('Database connection closed.');
}


runMigration();