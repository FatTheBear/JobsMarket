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

            const [existingFees] = await pool.query('SELECT * FROM \`Coin_Exchange_Fee\` WHERE \`is_default\` = TRUE');
            if (existingFees.length === 0) {
                await pool.query(`
                    INSERT INTO \`Coin_Exchange_Fee\` (\`price_vnd\`, \`coins\`, \`label\`, \`description\`, \`is_default\`, \`is_active\`, \`sort_order\`)
                    VALUES (20000, 100, 'Standard Package', 'System default package', TRUE, TRUE, 1);
                `);
                console.log('Successfully inserted default Coin_Exchange_Fee package.');
            }
        } catch (error) {
            console.error('Error creating Coin_Exchange_Fee or updating Transaction table:', error);
        }

        console.log('All migrations completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    }

    console.log('--- Starting DB Structure Update Migration ---');

    try {
        console.log('Dropping req_skills column from job_posting...');
        await pool.query('ALTER TABLE `job_posting` DROP COLUMN `req_skills`');
        console.log('-> Successfully dropped req_skills column.');
    } catch (err) {
        if (err.errno === 1091) {
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

        await pool.query(`
            ALTER TABLE \`Job_Posting\`
            ADD COLUMN IF NOT EXISTS \`metadata\` JSON;
        `);
        console.log('-> metadata column in Job_Posting is ready.');

        // 3. INTEGRATED MIGRATIONS FROM OLD FILES & NEW NATIONALITY COLUMN

        try {
            console.log('Adding birthday column to Candidate_Profile...');
            await pool.query("ALTER TABLE `Candidate_Profile` ADD COLUMN `birthday` DATE DEFAULT NULL");
            console.log('Successfully added birthday column to Candidate_Profile.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
                console.log('Birthday column already exists in Candidate_Profile.');
            } else {
                throw err;
            }
        }

        const moreProfileCols = [
            { name: 'languages', sql: 'ALTER TABLE `Candidate_Profile` ADD COLUMN `languages` TEXT DEFAULT NULL' },
            { name: 'certifications', sql: 'ALTER TABLE `Candidate_Profile` ADD COLUMN `certifications` TEXT DEFAULT NULL' },
            { name: 'awards', sql: 'ALTER TABLE `Candidate_Profile` ADD COLUMN `awards` TEXT DEFAULT NULL' }
        ];
        for (const col of moreProfileCols) {
            try {
                console.log(`Adding ${col.name} column to Candidate_Profile...`);
                await pool.query(col.sql);
                console.log(`Successfully added ${col.name} column to Candidate_Profile.`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
                    console.log(`${col.name} column already exists in Candidate_Profile.`);
                } else {
                    throw err;
                }
            }
        }

        const socialCols = [
            { name: 'portfolio', sql: 'ALTER TABLE `Candidate_Profile` ADD COLUMN `portfolio` VARCHAR(255) DEFAULT NULL' },
            { name: 'github', sql: 'ALTER TABLE `Candidate_Profile` ADD COLUMN `github` VARCHAR(255) DEFAULT NULL' },
            { name: 'facebook', sql: 'ALTER TABLE `Candidate_Profile` ADD COLUMN `facebook` VARCHAR(255) DEFAULT NULL' },
            { name: 'blog', sql: 'ALTER TABLE `Candidate_Profile` ADD COLUMN `blog` VARCHAR(255) DEFAULT NULL' },
            { name: 'x', sql: 'ALTER TABLE `Candidate_Profile` ADD COLUMN `x` VARCHAR(255) DEFAULT NULL' },
            { name: 'linkedin', sql: 'ALTER TABLE `Candidate_Profile` ADD COLUMN `linkedin` VARCHAR(255) DEFAULT NULL' }
        ];
        for (const col of socialCols) {
            try {
                console.log(`Adding ${col.name} column to Candidate_Profile...`);
                await pool.query(col.sql);
                console.log(`Successfully added ${col.name} column to Candidate_Profile.`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
                    console.log(`${col.name} column already exists in Candidate_Profile.`);
                } else {
                    throw err;
                }
            }
        }

        try {
            console.log('Adding nationality column to Candidate_Profile...');
            await pool.query("ALTER TABLE `Candidate_Profile` ADD COLUMN `nationality` VARCHAR(100) DEFAULT NULL");
            console.log('Successfully added nationality column to Candidate_Profile.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
                console.log('Nationality column already exists in Candidate_Profile.');
            } else {
                throw err;
            }
        }

        // 3e. Create Saved_Candidate table
        try {
            console.log('Creating Saved_Candidate table...');
            await pool.query(`
                CREATE TABLE IF NOT EXISTS \`Saved_Candidate\` (
                    \`hr_id\` INT NOT NULL,
                    \`candidate_id\` INT NOT NULL,
                    \`saved_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (\`hr_id\`, \`candidate_id\`),
                    CONSTRAINT \`fk_savedcand_hr\` FOREIGN KEY (\`hr_id\`) REFERENCES \`User\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
                    CONSTRAINT \`fk_savedcand_profile\` FOREIGN KEY (\`candidate_id\`) REFERENCES \`Candidate_Profile\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `);
            console.log('Successfully created Saved_Candidate table.');
        } catch (err) {
            console.error('Error creating Saved_Candidate table:', err.message);
        }

        // 3f. Create Community_Post, Post_Like, and Post_Comment tables
        try {
            console.log('Creating Community_Post table...');
            await pool.query(`
                CREATE TABLE IF NOT EXISTS \`Community_Post\` (
                    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
                    \`user_id\` INT NOT NULL,
                    \`content\` TEXT DEFAULT NULL,
                    \`media_url\` VARCHAR(255) DEFAULT NULL,
                    \`media_type\` VARCHAR(50) DEFAULT NULL,
                    \`parent_post_id\` INT DEFAULT NULL,
                    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (\`user_id\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE,
                    FOREIGN KEY (\`parent_post_id\`) REFERENCES \`Community_Post\`(\`id\`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `);
            console.log('Successfully created Community_Post table.');

            console.log('Creating Post_Like table...');
            await pool.query(`
                CREATE TABLE IF NOT EXISTS \`Post_Like\` (
                    \`post_id\` INT NOT NULL,
                    \`user_id\` INT NOT NULL,
                    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (\`post_id\`, \`user_id\`),
                    FOREIGN KEY (\`post_id\`) REFERENCES \`Community_Post\`(\`id\`) ON DELETE CASCADE,
                    FOREIGN KEY (\`user_id\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `);
            console.log('Successfully created Post_Like table.');

            console.log('Creating Post_Comment table...');
            await pool.query(`
                CREATE TABLE IF NOT EXISTS \`Post_Comment\` (
                    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
                    \`post_id\` INT NOT NULL,
                    \`user_id\` INT NOT NULL,
                    \`content\` TEXT NOT NULL,
                    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (\`post_id\`) REFERENCES \`Community_Post\`(\`id\`) ON DELETE CASCADE,
                    FOREIGN KEY (\`user_id\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `);
            console.log('Successfully created Post_Comment table.');

            console.log('Creating Post_Media table...');
            await pool.query(`
                CREATE TABLE IF NOT EXISTS \`Post_Media\` (
                    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
                    \`post_id\` INT NOT NULL,
                    \`media_url\` VARCHAR(255) NOT NULL,
                    \`media_type\` VARCHAR(50) NOT NULL,
                    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (\`post_id\`) REFERENCES \`Community_Post\`(\`id\`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `);
            console.log('Successfully created Post_Media table.');

            console.log('Creating Comment_Like table...');
            await pool.query(`
                CREATE TABLE IF NOT EXISTS \`Comment_Like\` (
                    \`comment_id\` INT NOT NULL,
                    \`user_id\` INT NOT NULL,
                    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (\`comment_id\`, \`user_id\`),
                    FOREIGN KEY (\`comment_id\`) REFERENCES \`Post_Comment\`(\`id\`) ON DELETE CASCADE,
                    FOREIGN KEY (\`user_id\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `);
            console.log('Successfully created Comment_Like table.');

            try {
                console.log('Adding parent_comment_id to Post_Comment...');
                await pool.query(`
                    ALTER TABLE \`Post_Comment\` 
                    ADD COLUMN \`parent_comment_id\` INT DEFAULT NULL,
                    ADD FOREIGN KEY (\`parent_comment_id\`) REFERENCES \`Post_Comment\`(\`id\`) ON DELETE CASCADE
                `);
                console.log('Successfully added parent_comment_id to Post_Comment.');
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_FK_DUP_NAME' || err.code === 'ER_DUP_KEY') {
                    console.log('parent_comment_id column or key already exists in Post_Comment.');
                }
            }
        } catch (err) {
            console.error('Error creating community post tables:', err.message);
        }

        // Create Job_Industry table
        try {
            console.log('Creating Job_Industry table...');
            await pool.query(`
                CREATE TABLE IF NOT EXISTS \`Job_Industry\` (
                    \`job_id\` INT NOT NULL,
                    \`industry_id\` INT NOT NULL,
                    PRIMARY KEY (\`job_id\`, \`industry_id\`),
                    CONSTRAINT \`fk_job_industry_job\` FOREIGN KEY (\`job_id\`) REFERENCES \`Job_Posting\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
                    CONSTRAINT \`fk_job_industry_industry\` FOREIGN KEY (\`industry_id\`) REFERENCES \`Industry\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `);
            console.log('Successfully created Job_Industry table.');
        } catch (err) {
            console.error('\n[CRITICAL ERROR] Failed to create Job_Industry table:', err.message);
            throw err;
        }

        // Updating Job_Skill schema
        try {
            console.log('Updating Job_Skill schema...');
            try {
                await pool.query("ALTER TABLE `Job_Skill` ADD COLUMN `min_level` VARCHAR(50) DEFAULT 'Beginner'");
                console.log('Added column min_level.');
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
                    console.log('Column min_level already exists.');
                } else {
                    throw err;
                }
            }

            try {
                await pool.query("ALTER TABLE `Job_Skill` ADD COLUMN `min_years` INT DEFAULT 0");
                console.log('Added column min_years.');
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
                    console.log('Column min_years already exists.');
                } else {
                    throw err;
                }
            }
            console.log('Job_Skill update completed.');
        } catch (dbError) {
            console.error('\n[CRITICAL ERROR] Schema update failed:', dbError.message);
            process.exit(1);
        }

        // Upgrade Company table structure
        try {
            console.log('Modifying Company table columns...');
            await pool.query("ALTER TABLE `Company` MODIFY COLUMN `logo_url` LONGTEXT DEFAULT NULL");
            console.log('Successfully modified logo_url column to LONGTEXT.');
            
            const companyCols = [
                { name: 'email', sql: "ALTER TABLE `Company` ADD COLUMN `email` VARCHAR(255) DEFAULT NULL" },
                { name: 'phone', sql: "ALTER TABLE `Company` ADD COLUMN `phone` VARCHAR(20) DEFAULT NULL" },
                { name: 'facebook', sql: "ALTER TABLE `Company` ADD COLUMN `facebook` VARCHAR(255) DEFAULT NULL" },
                { name: 'linkedin', sql: "ALTER TABLE `Company` ADD COLUMN `linkedin` VARCHAR(255) DEFAULT NULL" },
                { name: 'twitter', sql: "ALTER TABLE `Company` ADD COLUMN `twitter` VARCHAR(255) DEFAULT NULL" },
                { name: 'scale', sql: "ALTER TABLE `Company` ADD COLUMN `scale` JSON DEFAULT NULL" },
                { name: 'culture', sql: "ALTER TABLE `Company` ADD COLUMN `culture` JSON DEFAULT NULL" },
                { name: 'benefits', sql: "ALTER TABLE `Company` ADD COLUMN `benefits` JSON DEFAULT NULL" }
            ];
            for (const col of companyCols) {
                try {
                    console.log(`Adding ${col.name} column to Company...`);
                    await pool.query(col.sql);
                    console.log(`Successfully added ${col.name} column to Company.`);
                } catch (err) {
                    if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
                        console.log(`${col.name} column already exists in Company.`);
                    } else {
                        throw err;
                    }
                }
            }
            console.log('Successfully completed Company structure migration.');
        } catch (err) {
            console.error('Error modifying Company table columns:', err.message);
        }

        // Altering Company table to add new registration fields
        try {
            console.log('Altering Company table to add new registration fields...');
            const regCols = [
                { name: 'hr_name', sql: "ALTER TABLE `Company` ADD COLUMN `hr_name` VARCHAR(255) DEFAULT NULL" },
                { name: 'hr_phone', sql: "ALTER TABLE `Company` ADD COLUMN `hr_phone` VARCHAR(50) DEFAULT NULL" },
                { name: 'company_phone', sql: "ALTER TABLE `Company` ADD COLUMN `company_phone` VARCHAR(50) DEFAULT NULL" },
                { name: 'tax_id', sql: "ALTER TABLE `Company` ADD COLUMN `tax_id` VARCHAR(100) DEFAULT NULL" },
                { name: 'business_license_url', sql: "ALTER TABLE `Company` ADD COLUMN `business_license_url` VARCHAR(255) DEFAULT NULL" },
                { name: 'size', sql: "ALTER TABLE `Company` ADD COLUMN `size` VARCHAR(50) DEFAULT NULL" },
                { name: 'description', sql: "ALTER TABLE `Company` ADD COLUMN `description` TEXT DEFAULT NULL" }
            ];
            for (const col of regCols) {
                try {
                    console.log(`Adding ${col.name} column to Company...`);
                    await pool.query(col.sql);
                    console.log(`Successfully added ${col.name} column to Company.`);
                } catch (err) {
                    if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
                        console.log(`${col.name} column already exists in Company.`);
                    } else {
                        throw err;
                    }
                }
            }
            console.log('Successfully completed Company registration fields migration.');
        } catch (err) {
            console.error('\n[CRITICAL ERROR] Failed to alter Company table:', err.message);
            throw err;
        }

        // Altering Company table to add pro package columns
        try {
            console.log('Altering Company table to add pro package columns...');
            const proCols = [
                { name: 'pro_package', sql: "ALTER TABLE `Company` ADD COLUMN `pro_package` ENUM('Free', 'Pro_Day', 'Pro_Month') DEFAULT 'Free'" },
                { name: 'pro_expired_at', sql: "ALTER TABLE `Company` ADD COLUMN `pro_expired_at` DATETIME DEFAULT NULL" }
            ];
            for (const col of proCols) {
                try {
                    console.log(`Adding ${col.name} column to Company...`);
                    await pool.query(col.sql);
                    console.log(`Successfully added ${col.name} column to Company.`);
                } catch (err) {
                    if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
                        console.log(`${col.name} column already exists in Company.`);
                    } else {
                        throw err;
                    }
                }
            }
            console.log('Successfully completed Company pro package columns migration.');
        } catch (err) {
            console.error('\n[CRITICAL ERROR] Failed to alter Company table for pro packages:', err.message);
            throw err;
        }


        // Redundant alter table block removed because those columns are already added above safely.

        try {
            console.log('Connecting to database...');

            await pool.query(`
      ALTER TABLE \`Company\`
      DROP COLUMN \`facebook\`,
      DROP COLUMN \`linkedin\`,
      DROP COLUMN \`twitter\`;
    `);

            console.log('Successfully dropped unused columns from Company table.');
        } catch (error) {
            if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                console.log('Columns are already dropped. Database is clean!');
            } else {
                console.error('[CRITICAL ERROR] Migration failed:', error.message);
                throw error;
            }
        }


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
        process.exit(1);
    }
    await pool.end();
    console.log('Database connection closed.');
}

runMigration();