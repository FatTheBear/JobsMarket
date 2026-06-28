const mysql = require('mysql2/promise');

async function run() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'jobs_market'
        });

        // Add cover_image_url to Company table
        console.log('Adding cover_image_url to Company table...');
        try {
            await connection.query(`
                ALTER TABLE Company
                ADD COLUMN cover_image_url LONGTEXT DEFAULT NULL
            `);
            console.log('✓ cover_image_url added to Company table');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('✓ cover_image_url already exists in Company table');
            } else {
                throw e;
            }
        }

        // Add company_bio to company table
        console.log('Adding company_bio to company table...');
        try {
            await connection.query(`
                ALTER TABLE company
                ADD COLUMN company_bio LONGTEXT DEFAULT NULL
            `);
            console.log('✓ company_bio added to company table');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('✓ company_bio already exists in company table');
            } else {
                throw e;
            }
        }

        // Modify status column in user table
        console.log('Modifying status column in user table...');
        try {
            await connection.query(`
                ALTER TABLE user MODIFY COLUMN status ENUM('Pending', 'Approved', 'Active', 'Banned') DEFAULT 'Pending'
            `);
            console.log('✓ status column modified in user table');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME' || e.code === 'ER_DUP_ENTRY') {
                console.log('✓ status column already properly configured');
            } else {
                throw e;
            }
        }

        console.log('\n✅ All migrations completed successfully!');
        await connection.end();
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

run();
