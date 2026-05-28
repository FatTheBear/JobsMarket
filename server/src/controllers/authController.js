const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const pool = require('../config/db');
const UserModel = require('../models/UserModel');

const authController = {
    register: async (req, res) => {
        const { email, password, role, full_name, company_name, industry_id } = req.body;

        try {
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: "Email already exists!" });
            }

            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);

            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                const [userResult] = await connection.execute(
                    'INSERT INTO User (email, password_hash, role) VALUES (?, ?, ?)',
                    [email, password_hash, role]
                );
                
                const newUserId = userResult.insertId;

                if (role === 'Candidate') {
                    if (!full_name) throw new Error("Full name is required for Candidate!");
                    
                    await connection.execute(
                        'INSERT INTO Candidate_Profile (user_id, full_name) VALUES (?, ?)',
                        [newUserId, full_name]
                    );
                } 
                else if (role === 'HR') {
                    if (!company_name || !industry_id) throw new Error("Company name and industry are required for HR!");
                    
                    await connection.execute(
                        'INSERT INTO Company (hr_id, industry_id, name) VALUES (?, ?, ?)',
                        [newUserId, industry_id, company_name]
                    );
                } 
                else {
                    throw new Error("Invalid role specified!");
                }

                await connection.commit();
                connection.release();

                return res.status(201).json({
                    message: "Account registered successfully!",
                    userId: newUserId,
                    role: role
                });

            } catch (transactionError) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ message: transactionError.message });
            }

        } catch (error) {
            return res.status(500).json({ message: "Internal server error!" });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            console.log("RECEIVED EMAIL:", email);
            console.log("RECEIVED PASSWORD:", password);

            const [rows] = await pool.query(
                "SELECT * FROM User WHERE email = ?",
                [email]
            );

            console.log("USER FOUND:", rows);

            if (rows.length === 0) {
                return res.status(401).json({
                    message: "Email does not exist"
                });
            }

            const user = rows[0];

            console.log("DB HASH:", user.password_hash);

            const isMatch = await bcrypt.compare(
                password,
                user.password_hash
            );

            console.log("MATCH:", isMatch);

            if (!isMatch) {
                return res.status(401).json({
                    message: "Incorrect password"
                });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    role: user.role
                },
                "SECRET_KEY",
                { expiresIn: "1d" }
            );

            res.json({
                token,
                role: user.role
            });

        } catch (err) {
            console.error(err);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
};

module.exports = authController;