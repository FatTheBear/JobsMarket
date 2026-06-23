const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const pool = require('../config/db');
const User = require('../models/User');
const crypto = require('crypto');
const emailService = require('../services/email/emailServices');

const authController = {
    register: async (req, res) => {
        const { email, password, role } = req.body;

        try {
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: "Email already exists!" });
            }

            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);

            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                const dbRole = 'Candidate';

                const [userResult] = await connection.execute(
                    'INSERT INTO User (email, password_hash, role) VALUES (?, ?, ?)',
                    [email, password_hash, dbRole]
                );

                const newUserId = userResult.insertId;

                const otp = crypto.randomInt(100000, 999999).toString();
                const expiresAt = new Date(Date.now() + 5 * 60000);

                await connection.execute(
                    'UPDATE User SET verification_code = ?, code_expires_at = ? WHERE id = ?',
                    [otp, expiresAt, newUserId]
                );

                await emailService.sendCandidateOTP(email, otp);

                await connection.execute(
                    'INSERT INTO Candidate_Profile (user_id) VALUES (?)',
                    [newUserId]
                );

                await connection.commit();
                connection.release();
                return res.status(201).json({ message: "Candidate account registered successfully!" });

            } catch (transactionError) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ message: transactionError.message });
            }
        } catch (error) {
            return res.status(500).json({ message: "Internal server error!" });
        }
    },

    registerCompany: async (req, res) => {
        const { 
            email, password, hrName, hrPhone, 
            companyName, companyPhone, location, 
            taxId, industryId, size, description 
        } = req.body;

        try {
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: "Email already exists!" });
            }

            if (!req.files || !req.files['logo'] || !req.files['businessLicense']) {
                return res.status(400).json({ message: "Company logo and business license are required." });
            }

            const logoUrl = req.files['logo'][0].path.replace(/\\/g, '/');
            const businessLicenseUrl = req.files['businessLicense'][0].path.replace(/\\/g, '/');

            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                const [userResult] = await connection.execute(
                    'INSERT INTO User (email, password_hash, role, status) VALUES (?, ?, ?, ?)',
                    [email, passwordHash, 'HR', 'pending']
                );

                const newUserId = userResult.insertId;

                await connection.execute(
                    `INSERT INTO Company (
                        hr_id, industry_id, name, hr_name, hr_phone, company_phone, 
                        address, tax_id, business_license_url, logo_url, size, description
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        newUserId, industryId, companyName, hrName, hrPhone, companyPhone, 
                        location, taxId, businessLicenseUrl, logoUrl, size, description
                    ]
                );

                await emailService.sendCompanyPending(email, hrName, companyName);

                await connection.commit();
                connection.release();
                return res.status(201).json({ message: "Company registration submitted and pending approval." });

            } catch (transactionError) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ message: transactionError.message });
            }
        } catch (error) {
            return res.status(500).json({ message: "Internal server error!" });
        }
    },

    verifyOTP: async (req, res) => {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required!" });
        }

        try {
            const connection = await pool.getConnection();

            try {
                const [users] = await connection.execute(
                    'SELECT id, status, verification_code, code_expires_at, role FROM User WHERE email = ?',
                    [email]
                );

                if (users.length === 0) {
                    connection.release();
                    return res.status(404).json({ message: "User not found!" });
                }

                const user = users[0];

                if (user.status === 'Active') {
                    connection.release();
                    return res.status(400).json({ message: "Account is already verified!" });
                }

                if (user.verification_code !== otp) {
                    connection.release();
                    return res.status(400).json({ message: "Invalid OTP!" });
                }

                if (new Date() > new Date(user.code_expires_at)) {
                    connection.release();
                    return res.status(400).json({ message: "OTP has expired!" });
                }

                await connection.execute(
                    'UPDATE User SET status = ?, verification_code = NULL, code_expires_at = NULL WHERE id = ?',
                    ['Active', user.id]
                );

                const token = jwt.sign(
                    { id: user.id, role: user.role },
                    process.env.JWT_SECRET || 'SECRET_KEY',
                    { expiresIn: '1d' }
                );

                connection.release();
                return res.status(200).json({
                    message: "Account verified successfully!",
                    token: token,
                    user: {
                        id: user.id,
                        email: email,
                        role: user.role
                    }
                });

            } catch (dbError) {
                connection.release();
                return res.status(500).json({ message: "Database error during verification!" });
            }
        } catch (error) {
            return res.status(500).json({ message: "Internal server error!" });
        }
    },

    login: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required!" });
        }

        try {
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

             LEFT JOIN Company com ON u.id = com.hr_id


             WHERE u.email = ?`,
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({ message: "Invalid email or password!" });
            }

            const user = users[0];

            const isPasswordValid = await bcrypt.compare(password, user.password_hash);

            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid email or password!" });
            }

            if (user.status === 'Pending') {
                return res.status(403).json({ message: "Please verify your email before logging in." });
            }

            if (user.status === 'Banned') {
                return res.status(403).json({ message: "This account has been banned." });
            }


            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET || 'SECRET_KEY',
                { expiresIn: '1d' }
            );


            let userName = 'User';
            let avatarUrl = '/default-avatar.png';


            if (user.role === 'Candidate') {

                userName = user.candidate_name || 'Candidate';
                avatarUrl = user.candidate_avatar || '/default-avatar.png';

            } else if (user.role === 'HR' || user.role === 'company') {

                userName = user.company_name || 'HR Manager';
                avatarUrl = user.company_avatar || '/default-avatar.png';

            }


            return res.status(200).json({
                message: "Logged in successfully!",
                token: token,

                userName: userName,
                avatarUrl: avatarUrl,

                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,

                    // thêm để frontend dùng khi đăng bài
                    company_id: user.company_id || null
                }
            });


        } catch (error) {
            console.error("Login Error:", error);
            return res.status(500).json({ message: "Internal server error!" });
        }
    },
    resendOtp: async (req, res) => {
        const { email } = req.body;

        try {
            const crypto = require('crypto');
            const nodemailer = require('nodemailer');

            const otp = crypto.randomInt(100000, 999999).toString();
            const expiresAt = new Date(Date.now() + 5 * 60000);

            const connection = await pool.getConnection();

            const [result] = await connection.execute(
                'UPDATE User SET verification_code = ?, code_expires_at = ? WHERE email = ?',
                [otp, expiresAt, email]
            );

            connection.release();

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "User not found!" });
            }

            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Resend OTP - JobsMarket',
                    html: `
                        <p>Your new OTP is: <b>${otp}</b></p>
                    `
                });
            }

            return res.status(200).json({
                message: "OTP resent successfully!"
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message
            });
        }
    }

};

module.exports = authController;