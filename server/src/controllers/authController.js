const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const pool = require('../config/db');
const User = require('../models/User');

const authController = {
    register: async (req, res) => {
        const { email, password, role, full_name, company_name, industry_id } = req.body;

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
                let dbRole = 'Candidate';
                if (role === 'company') {
                    dbRole = 'HR';
                } else if (role === 'candidate') {
                    dbRole = 'Candidate';
                }

                const [userResult] = await connection.execute(
                    'INSERT INTO User (email, password_hash, role) VALUES (?, ?, ?)',
                    [email, password_hash, dbRole]
                );

                const newUserId = userResult.insertId;

                const crypto = require('crypto');
                const nodemailer = require('nodemailer');

                const otp = crypto.randomInt(100000, 999999).toString();
                const expiresAt = new Date(Date.now() + 5 * 60000); // Hết hạn sau 5 phút

                await connection.execute(
                    'UPDATE User SET verification_code = ?, code_expires_at = ? WHERE id = ?',
                    [otp, expiresAt, newUserId]
                );

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
                        subject: 'Verify your JobsMarket account',
                        html: `
<div style="font-family: Arial, sans-serif; background-color: #f6f8fa; padding: 30px; color: #333333; line-height: 1.6;">
    <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e1e4e8; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <h2 style="color: #1a73e8; margin-top: 0; font-size: 24px; border-bottom: 1px solid #e1e4e8; padding-bottom: 15px;">JobsMarket Verification</h2>
        <p style="font-size: 16px;">Hello,</p>
        <p style="font-size: 16px;">Thank you for signing up for JobsMarket. Please use the following One-Time Password (OTP) to verify your account:</p>
        
        <div style="text-align: center; margin: 30px 0; padding: 15px; background-color: #f1f3f4; border-radius: 6px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1a73e8;">
            ${otp}
        </div>
        
        <p style="font-size: 14px; color: #586069;">This code is valid for <strong>5 minutes</strong>. If you did not request this verification, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e1e4e8; margin: 30px 0 20px 0;" />
        <p style="font-size: 14px; color: #586069; margin: 0;">Best regards,</p>
        <p style="font-size: 14px; font-weight: bold; color: #333333; margin: 5px 0 0 0;">The JobsMarket Team</p>
    </div>
</div>
`
                    });
                } else {
                    console.log(`\n======================================================`);
                    console.log(`[LOCAL DEV] Gmail SMTP credentials missing in .env.`);
                    console.log(`Registered Email: ${email}`);
                    console.log(`Generated OTP Code: ${otp}`);
                    console.log(`======================================================\n`);
                }

                if (role === 'candidate') {
                    await connection.execute(
                        'INSERT INTO Candidate_Profile (user_id, full_name) VALUES (?, ?)',
                        [newUserId, full_name]
                    );
                }
                else if (role === 'company') {
                    await connection.execute(
                        'INSERT INTO Company (hr_id, industry_id, name) VALUES (?, ?, ?)',
                        [newUserId, industry_id, company_name]
                    );
                }
                else if (role === 'Admin') {
                    // Cấp quyền Admin: Lưu ở bảng User chính là đủ, không cần điền bảng phụ
                    console.log(`--- Đã tạo tài khoản Admin ID: ${newUserId} thành công ---`);
                }
                else {
                    throw new Error("Invalid role specified!");
                }

                await connection.commit();
                connection.release();
                return res.status(201).json({ message: "Account registered successfully!" });

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
                'SELECT id, email, password_hash, role, status FROM User WHERE email = ?',
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

            return res.status(200).json({
                message: "Logged in successfully!",
                token: token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            console.error("Login Error:", error);
            return res.status(500).json({ message: "Internal server error!" });
        }
    }
};

module.exports = authController;