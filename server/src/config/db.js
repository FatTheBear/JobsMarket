const mysql = require('mysql2/promise');
require('dotenv').config(); 


const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, 
    queueLimit: 0
});


pool.getConnection()
    .then(async (connection) => {
        console.log('Connect to database successfull!');
        try {
            await connection.query(`ALTER TABLE Notification ADD COLUMN post_id INT NULL DEFAULT NULL`);
            console.log('Added post_id column to Notification table successfully.');
        } catch (alterErr) {
            if (alterErr.code !== 'ER_DUP_FIELDNAME') {
                console.log('Notification table alter status:', alterErr.message);
            }
        }
        connection.release(); 
    })
    .catch((err) => {
        console.error('Connect error', err.message);
    });

module.exports = pool;