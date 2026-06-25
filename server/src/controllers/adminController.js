const db = require('../config/db');
const CoinExchangeFeeModel = require('../models/CoinExchangeFee');
const pool = require('../config/db');
const email = require('../services/email/emailServices');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// 1. Lấy dữ liệu tổng quan (Đồng bộ chuẩn db.query)
exports.getStats = async (req, res) => {
    try {

        const [userCount] =
            await db.query(`
        SELECT
          COUNT(CASE WHEN role != 'Admin' THEN 1 END) totalUsers,
          COUNT(CASE WHEN role = 'Candidate' THEN 1 END) candidatesCount,
          COUNT(CASE WHEN role = 'HR' THEN 1 END) hrCount,
          COUNT(CASE WHEN role = 'Admin' THEN 1 END) adminCount
        FROM user
      `);

        const [jobStats] =
            await db.query(`
        SELECT
          COUNT(*) totalJobs,
          COUNT(CASE WHEN status='Approved' THEN 1 END) approvedJobs,
          COUNT(CASE WHEN status='Pending' THEN 1 END) pendingJobs,
          COUNT(CASE WHEN status='Rejected' THEN 1 END) rejectedJobs
        FROM job_posting
      `);

        const [applicationStats] =
            await db.query(`
        SELECT
          COUNT(*) totalApplications,

          COUNT(CASE WHEN status='Applied' THEN 1 END) appliedCount,
          COUNT(CASE WHEN status='Reviewing' THEN 1 END) reviewingCount,
          COUNT(CASE WHEN status='Interviewing' THEN 1 END) interviewingCount,
          COUNT(CASE WHEN status='Offered' THEN 1 END) offeredCount,
          COUNT(CASE WHEN status='Rejected' THEN 1 END) rejectedApplicationCount

        FROM application
      `);

        const [companyStats] =
            await db.query(`
        SELECT COUNT(*) totalCompanies
        FROM company
      `);

        const [newsStats] =
            await db.query(`
        SELECT COUNT(*) totalNews
        FROM news
      `);

        const [cvStats] =
            await db.query(`
        SELECT COUNT(*) totalCVs
        FROM candidate_cv
      `);

        const [skillStats] =
            await db.query(`
        SELECT COUNT(*) totalSkills
        FROM skill
      `);

        const [industryStats] =
            await db.query(`
        SELECT COUNT(*) totalIndustries
        FROM industry
      `);

        const [transactionStats] =
            await db.query(`
        SELECT
          COUNT(*) totalTransactions,

          COUNT(
            CASE WHEN status='completed'
            THEN 1
            END
          ) successfulTransactions,

          COUNT(
            CASE WHEN status='pending'
            THEN 1
            END
          ) pendingTransactions,

          COALESCE(
            SUM(
              CASE
                WHEN status='completed'
                THEN amount_fiat
                ELSE 0
              END
            ),
            0
          ) totalRevenue

        FROM transaction
      `);

        res.json({
            totalUsers: userCount[0].totalUsers,
            candidatesCount: userCount[0].candidatesCount,
            hrCount: userCount[0].hrCount,

            pendingJobs: jobStats[0].pendingJobs,
            approvedJobs: jobStats[0].approvedJobs,
            rejectedJobs: jobStats[0].rejectedJobs,

            totalApplications: applicationStats[0].totalApplications,

            appliedCount: applicationStats[0].appliedCount,
            reviewingCount: applicationStats[0].reviewingCount,
            interviewingCount: applicationStats[0].interviewingCount,
            offeredCount: applicationStats[0].offeredCount,
            rejectedApplicationCount: applicationStats[0].rejectedApplicationCount,

            totalCompanies: companyStats[0].totalCompanies,
            totalNews: newsStats[0].totalNews,
            totalCVs: cvStats[0].totalCVs,
            totalSkills: skillStats[0].totalSkills,

            totalIndustries: industryStats[0].totalIndustries,
            industriesCount: industryStats[0].totalIndustries,

            pendingTransactions: transactionStats[0].pendingTransactions,
            totalRevenue: transactionStats[0].totalRevenue
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message
        });
    }
};

// 2. Lấy danh sách người dùng
exports.getUsers = async (req, res) => {
    try {
        const query = `
            SELECT u.id, u.email, u.role, u.status, 
                   IFNULL(cp.full_name, IFNULL(c.name, 'Chưa cập nhật')) AS full_name 
            FROM \`user\` u
            LEFT JOIN \`candidate_profile\` cp ON u.id = cp.user_id
            LEFT JOIN \`company\` c ON u.id = c.hr_id
            WHERE u.role != 'Admin'
        `;
        const [users] = await db.query(query);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Lấy danh sách việc làm chờ duyệt
exports.getPendingJobs = async (req, res) => {
    try {
        const [jobs] = await db.query(`
            SELECT j.id, j.title, c.name AS company_name, j.description, j.status 
            FROM \`job_posting\` j
            JOIN \`company\` c ON j.company_id = c.id
            WHERE j.status = 'Pending'
        `);
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Cập nhật trạng thái User
exports.updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await db.query("UPDATE `user` SET status = ? WHERE id = ?", [status, id]);
        res.json({ message: "Cập nhật trạng thái thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Duyệt hoặc Từ chối bài đăng
exports.updateJobStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await db.query("UPDATE `job_posting` SET status = ? WHERE id = ?", [status, id]);
        res.json({ message: "Xử lý bài đăng thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. Lấy danh sách kỹ năng
exports.getSkills = async (req, res) => {
    const [skills] = await db.query(
        "SELECT id, skill_name FROM skill ORDER BY id DESC"
    );

    res.json(skills);
};

// 7. Lấy danh sách ngành nghề
exports.getIndustries = async (req, res) => {
    try {
        const [industries] = await db.query("SELECT id, name FROM `industry` ORDER BY id DESC");
        res.json(industries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 8. Lấy danh sách tin tức kèm cơ chế fallback an toàn
exports.getNews = async (req, res) => {
    try {
        const [newsList] = await db.query(`
            SELECT
                n.*,
                nc.name AS category_name
            FROM news n
            LEFT JOIN news_category nc
                ON n.category_id = nc.id
            ORDER BY n.created_at DESC
        `);

        res.json(newsList);

    } catch (error) {
        console.error("NEWS ERROR:", error);
        res.status(500).json({
            message: error.message
        });
    }
};

// 9. Thêm nhanh kỹ năng mới
exports.createSkill = async (req, res) => {
    const { name } = req.body;
    try {
        if (!name) return res.status(400).json({ message: "Skill name is required" });
        await db.query(
            "INSERT INTO skill (skill_name) VALUES (?)",
            [name]
        );
        res.json({ message: "Skill added successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 10. Thêm nhanh ngành nghề mới
exports.createIndustry = async (req, res) => {
    const { name } = req.body;
    try {
        if (!name) return res.status(400).json({ message: "Industry name is required" });
        await db.query("INSERT INTO `industry` (name) VALUES (?)", [name]);
        res.json({ message: "Industry added successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 11. Tạo bài viết mới
exports.createNews = async (req, res) => {
    try {
        console.log("FILE:", req.file);

        const {
            title,
            slug,
            category_id,
            short_description,
            content,
            status,
            is_featured,
            published_at
        } = req.body;

        // ép kiểu an toàn
        const categoryId = Number(category_id) || 1;
        const featured = Number(is_featured) || 0;

        if (!title || !slug) {
            return res.status(400).json({
                message: "Title và slug là bắt buộc"
            });
        }

        const thumbnail_url = req.file
            ? `/uploads/${req.file.filename}`
            : "";

        const [result] = await db.query(
            `INSERT INTO news (
        admin_id,
        category_id,
        title,
        slug,
        thumbnail_url,
        short_description,
        content,
        status,
        is_featured,
        published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                5,
                categoryId,
                title,
                slug,
                thumbnail_url,
                short_description || "",
                content || "",
                status || "Draft",
                featured,
                published_at || null
            ]
        );

        return res.json({
            success: true,
            insertedId: result.insertId
        });

    } catch (err) {
        console.error("CREATE NEWS ERROR:", err);
        return res.status(500).json({
            message: err.message
        });
    }
};

exports.updateNews = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            slug,
            category_id,
            short_description,
            content,
            status,
            thumbnail_url
        } = req.body;

        const categoryId = Number(category_id);

        // 1. validate cứng
        if (!title || !slug || !categoryId) {
            return res.status(400).json({
                message: "Missing title, slug, category_id"
            });
        }

        // 2. check category tồn tại
        const [cat] = await db.query(
            "SELECT id FROM news_category WHERE id = ?",
            [categoryId]
        );

        if (cat.length === 0) {
            return res.status(400).json({
                message: "Invalid category_id"
            });
        }

        // 3. fix thumbnail không bị xoá khi update
        const finalThumbnail =
            req.file
                ? `/uploads/${req.file.filename}`
                : thumbnail_url || null;

        await db.query(
            `UPDATE news SET
        title = ?,
        slug = ?,
        category_id = ?,
        thumbnail_url = ?,
        short_description = ?,
        content = ?,
        status = ?
      WHERE id = ?`,
            [
                title,
                slug,
                categoryId,
                finalThumbnail,
                short_description || "",
                content || "",
                status || "Draft",
                id
            ]
        );

        res.json({ success: true });

    } catch (err) {
        console.error("UPDATE NEWS ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};

// 13. Xóa bài viết
exports.deleteNews = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(
            "DELETE FROM news WHERE id = ?",
            [id]
        );

        res.json({
            success: true
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message
        });
    }
};

// 14. Lấy danh sách lịch sử giao dịch (Nạp/Tiêu xu) của toàn hệ thống
exports.getTransactions = async (req, res) => {
    try {
        const query = `
            SELECT t.*, u.email, u.bank_name, u.bank_account_number, u.bank_account_name 
            FROM \`Transaction\` t
            JOIN \`User\` u ON t.user_id = u.id
            ORDER BY t.created_at DESC
        `;
        const [transactions] = await db.query(query);
        res.json(transactions);
    } catch (error) {
        console.error("Lỗi tại getTransactions:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// 15. Duyệt hoặc Từ chối lệnh nạp tiền (Cộng xu tự động nếu duyệt thành công)
exports.updateTransactionStatus = async (req, res) => {
    const { id } = req.params; // ID của Giao dịch
    const { status } = req.body; // 'completed' hoặc 'failed'

    // Tạo connection để dùng Transaction nhằm đảm bảo an toàn dữ liệu khi cộng xu
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // Kiểm tra xem giao dịch có tồn tại và đang ở trạng thái pending không
        const [rows] = await connection.execute(
            "SELECT * FROM `Transaction` WHERE id = ? FOR UPDATE",
            [id]
        );

        if (rows.length === 0) {
            throw new Error("Transaction does not exist!");
        }

        const transaction = rows[0];

        if (transaction.status !== 'pending') {
            throw new Error("Giao dịch này đã được xử lý trước đó rồi!");
        }

        // 1. Cập nhật trạng thái của Giao dịch
        await connection.execute(
            "UPDATE `Transaction` SET status = ? WHERE id = ?",
            [status, id]
        );

        // 2. Nếu Admin bấm DUYỆT ('completed') và loại giao dịch là NẠP TIỀN ('deposit')
        if (status === 'completed' && transaction.type === 'deposit') {
            // Tiến hành cộng xu thẳng vào tài khoản User
            await connection.execute(
                "UPDATE `User` SET coins = coins + ? WHERE id = ?",
                [transaction.coins, transaction.user_id]
            );
            console.log(`Đã cộng ${transaction.coins} xu cho User ID: ${transaction.user_id}`);
        }

        await connection.commit();
        connection.release();

        res.json({ success: true, message: "Xử lý giao dịch thành công!" });

    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error("Lỗi tại updateTransactionStatus:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// 16. Xóa Kỹ năng
exports.deleteSkill = async (req, res) => {
    const { id } = req.params;
    try {
        // Kiểm tra xem skill có đang được sử dụng trong job nào không (tùy chọn)
        await db.query("DELETE FROM `skill` WHERE id = ?", [id]);
        res.json({ success: true, message: "Skill deleted successfully!" });
    } catch (error) {
        console.error("DELETE SKILL ERROR:", error);
        res.status(500).json({ message: "Error deleting skill" });
    }
};

// 17. Xóa Ngành nghề
exports.deleteIndustry = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM `industry` WHERE id = ?", [id]);
        res.json({ success: true, message: "Industry deleted successfully!" });
    } catch (error) {
        console.error("DELETE INDUSTRY ERROR:", error);
        res.status(500).json({ message: "Error deleting industry" });
    }
};
//18. chọn news_category
exports.getNewsCategories = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT id, name 
            FROM news_category
            ORDER BY id ASC
        `);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// =========================================================
// COIN EXCHANGE FEES
// =========================================================

exports.getCoinFees = async (req, res) => {
    try {
        const fees = await CoinExchangeFeeModel.getAll();
        res.json(fees);
    } catch (error) {
        console.error("GET COIN FEES ERROR:", error);
        res.status(500).json({ message: "Error fetching coin packages", error: error.message });
    }
};

exports.createCoinFee = async (req, res) => {
    try {
        const result = await CoinExchangeFeeModel.create(req.body);
        res.status(201).json({ message: "Coin package created successfully", fee: result });
    } catch (error) {
        res.status(500).json({ message: "Error creating coin package", error: error.message });
    }
};

exports.updateCoinFee = async (req, res) => {
    try {
        const { id } = req.params;
        await CoinExchangeFeeModel.update(id, req.body);
        res.json({ message: "Coin package updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating coin package", error: error.message });
    }
};

exports.deleteCoinFee = async (req, res) => {
    try {
        const { id } = req.params;
        await CoinExchangeFeeModel.delete(id);
        res.json({ message: "Coin package deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting coin package", error: error.message });
    }
};

// =========================================================
// NOTIFICATIONS
// =========================================================

// Lấy danh sách thông báo
exports.getNotifications = async (req, res) => {
    try {
        const [notifications] = await db.query(`
            SELECT
                n.id,
                n.user_id,
                u.email,
                n.title,
                n.content,
                n.is_read,
                n.created_at
            FROM Notification n
            LEFT JOIN User u
                ON n.user_id = u.id
            ORDER BY n.created_at DESC
        `);

        res.json(notifications);

    } catch (error) {
        console.error("GET NOTIFICATIONS ERROR:", error);
        res.status(500).json({
            message: error.message
        });
    }
};

// Đánh dấu đã đọc
exports.markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(
            `UPDATE Notification
             SET is_read = 1
             WHERE id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: "Notification marked as read"
        });

    } catch (error) {
        console.error("MARK NOTIFICATION ERROR:", error);
        res.status(500).json({
            message: error.message
        });
    }
};

// Xóa thông báo
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(
            `DELETE FROM Notification
             WHERE id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: "Notification deleted"
        });

    } catch (error) {
        console.error("DELETE NOTIFICATION ERROR:", error);
        res.status(500).json({
            message: error.message
        });
    }
};

// Hàm lấy danh sách tất cả tin tức đã xuất bản
exports.getPublicNews = async (req, res) => {
    try {
        const [newsList] = await db.query(`
            SELECT n.*, nc.name AS category_name 
            FROM news n 
            LEFT JOIN news_category nc ON n.category_id = nc.id 
            WHERE n.status = 'Published'
            ORDER BY n.created_at DESC
        `);
        res.json(newsList);
    } catch (error) {
        console.error("GET PUBLIC NEWS ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getPublicNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(`
            SELECT n.*, nc.name AS category_name 
            FROM news n 
            LEFT JOIN news_category nc ON n.category_id = nc.id 
            WHERE n.id = ? AND n.status = 'Published'`, [id]);

        if (rows.length === 0) return res.status(404).json({ message: "Bài viết không tồn tại hoặc chưa được xuất bản" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// exports.approveCompany = async (req, res) => {
//     const { id } = req.params;

//     try {
//         const connection = await db.getConnection();
//         try {
//             const [rows] = await connection.execute(
//                 `SELECT u.email, c.hr_name, c.name AS company_name 
//                  FROM User u 
//                  JOIN Company c ON u.id = c.hr_id 
//                  WHERE u.id = ? AND u.role = 'HR'`,
//                 [id]
//             );

//             if (rows.length === 0) {
//                 connection.release();
//                 return res.status(404).json({ message: "Company account not found" });
//             }

//             const { email, hr_name, company_name } = rows[0];

//             await connection.execute(
//                 'UPDATE User SET status = ? WHERE id = ?',
//                 ['Active', id]
//             );

//             await emailService.sendCompanyActive(email, hr_name, company_name);

//             connection.release();
//             return res.status(200).json({ message: "Company approved successfully!" });

//         } catch (dbError) {
//             connection.release();
//             return res.status(500).json({ message: "Database error" });
//         }
//     } catch (error) {
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };

exports.banAccount = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
        return res.status(400).json({ message: "Ban reason is required" });
    }

    try {
        const connection = await db.getConnection();
        try {
            const [users] = await connection.execute(
                'SELECT email, role FROM User WHERE id = ?',
                [id]
            );

            if (users.length === 0) {
                connection.release();
                return res.status(404).json({ message: "User not found" });
            }

            const { email, role } = users[0];
            let userName = "User";

            if (role === 'HR') {
                const [company] = await connection.execute('SELECT hr_name FROM Company WHERE hr_id = ?', [id]);
                if (company.length > 0) userName = company[0].hr_name;
            } else if (role === 'Candidate') {
                const [candidate] = await connection.execute('SELECT full_name FROM Candidate_Profile WHERE user_id = ?', [id]);
                if (candidate.length > 0 && candidate[0].full_name) userName = candidate[0].full_name;
            }

            await connection.execute(
                'UPDATE User SET status = ? WHERE id = ?',
                ['Banned', id]
            );

            await emailService.sendAccountBanned(email, userName, reason);

            connection.release();
            return res.status(200).json({ message: "Account has been banned" });

        } catch (dbError) {
            connection.release();
            return res.status(500).json({ message: "Database error" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};


exports.getPendingCompanies = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id AS company_id,
        hr_id,
        name AS company_name,
        email AS company_email,
        company_phone,
        tax_id,
        size,
        description,
        business_license_url,
        status,
        created_at
      FROM Company
      WHERE status = 'Pending'
      ORDER BY created_at DESC
    `);
    
    return res.status(200).json(rows);
  } catch (error) {
    // THÊM DÒNG NÀY ĐỂ BẮT ĐÚNG LỖI CỘT NÀO
    console.error("GET PENDING COMPANIES ERROR:", error); 
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
exports.approveCompany = async (req, res) => {
  const { id } = req.params;
  const activationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

  try {
    const [companyData] = await pool.query(
      `SELECT c.name, u.email 
       FROM Company c
       JOIN User u ON c.hr_id = u.id
       WHERE c.id = ? AND c.status = 'Pending'`,
      [id]
    );

    if (companyData.length === 0) {
      return res.status(404).json({ message: "Company not found or already processed" });
    }

    const companyEmail = companyData[0].email;
    const companyName = companyData[0].name;

    // 1. Update Database
    await pool.query(
      `UPDATE Company 
       SET status = 'Approved', activation_code = ? 
       WHERE id = ?`,
      [activationCode, id]
    );

    // 2. Log activation details for debugging/testing
    console.log(`\nSUCCESS: Company approved - ${companyName}`);
    console.log(`ACTIVATION CODE: ${activationCode}`);
    console.log(`SENDING TO EMAIL: ${companyEmail || 'NOT FOUND IN DB'}\n`);

    // 3. Handle Email Sending Fallback
    if (companyEmail) {
      try {
        const templatePath = path.join(__dirname, '..', 'services', 'email', 'templates', 'company_active.html');
        let htmlContent = fs.readFileSync(templatePath, 'utf8');

        const activationLink = `http://localhost:3000/activate-company?id=${id}&code=${activationCode}`;

        htmlContent = htmlContent
          .replace(/{{COMPANY_NAME}}/g, companyName)
          .replace(/{{ACTIVATION_CODE}}/g, activationCode)
          .replace(/{{ACTIVATION_LINK}}/g, activationLink);

        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: false, // Required false for port 587, true for port 465
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: '"JobsMarket Team" <jobsmarket33@gmail.com>',
          to: companyEmail,
          subject: 'Your Company Account Has Been Approved!',
          html: htmlContent
        };

        // Attempt to send email
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");

      } catch (mailError) {
        // Fallback: Log error but do not crash the API if SMTP fails
        console.error("Mail Error (Company was still approved in DB):", mailError.message);
      }
    } else {
      console.warn("Warning: Skipped email sending because no email was found in the database.");
    }

    // 4. Return success response to Frontend
    return res.status(200).json({ message: "Company approved successfully", activationCode });

  } catch (error) {
    console.error("APPROVE COMPANY ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
// GET /admin/dashboard-trends?period=7d|30d|12m
exports.getDashboardTrends = async (req, res) => {
    try {
        const { period = '30d', year, month } = req.query;

        const selectedYear = parseInt(year) || new Date().getFullYear();
        const selectedMonth = parseInt(month) || new Date().getMonth() + 1;

        let groupFormat, dateFilter, labelFormat;

        if (period === '7d') {
            groupFormat = '%Y-%m-%d';
            labelFormat = '%d/%m';
            dateFilter = 'DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        } else if (period === '12m') {
            groupFormat = '%Y-%m';
            labelFormat = '%m/%Y';
            dateFilter = `YEAR(created_at) = ${selectedYear}`;
        } else {
            // 30d — theo tháng + năm được chọn
            groupFormat = '%Y-%m-%d';
            labelFormat = '%d/%m';
            dateFilter = `YEAR(created_at) = ${selectedYear} AND MONTH(created_at) = ${selectedMonth}`;
        }

        const [jobTrends] = await db.query(`
            SELECT DATE_FORMAT(created_at, '${groupFormat}') AS period,
                   DATE_FORMAT(created_at, '${labelFormat}') AS label,
                   COUNT(*) AS count
            FROM job_posting
            WHERE ${dateFilter}
            GROUP BY period, label ORDER BY period ASC
        `);

        const appDateFilter = dateFilter.replace(/created_at/g, 'applied_at');
        const [appTrends] = await db.query(`
            SELECT DATE_FORMAT(applied_at, '${groupFormat}') AS period,
                   DATE_FORMAT(applied_at, '${labelFormat}') AS label,
                   COUNT(*) AS count
            FROM application
            WHERE ${appDateFilter}
            GROUP BY period, label ORDER BY period ASC
        `);

        const [revenueTrends] = await db.query(`
            SELECT DATE_FORMAT(created_at, '${groupFormat}') AS period,
                   DATE_FORMAT(created_at, '${labelFormat}') AS label,
                   COALESCE(SUM(amount_fiat), 0) AS total
            FROM transaction
            WHERE status = 'completed' AND type = 'deposit'
            AND ${dateFilter}
            GROUP BY period, label ORDER BY period ASC
        `);

        res.json({ jobTrends, appTrends, revenueTrends });
    } catch (error) {
        console.error('GET TRENDS ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /admin/top-skills
exports.getTopSkills = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.skill_name AS name, COUNT(js.job_id) AS count
            FROM skill s
            JOIN job_skill js ON s.id = js.skill_id
            JOIN job_posting jp ON js.job_id = jp.id
            WHERE jp.status = 'Approved'
GROUP BY s.id, s.skill_name
            ORDER BY count DESC
            LIMIT 8
        `);
        res.json(rows);
    } catch (error) {
        console.error('GET TOP SKILLS ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getTopIndustries = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT i.name, COUNT(ji.job_id) AS count
            FROM industry i
            JOIN job_industry ji ON i.id = ji.industry_id
            JOIN job_posting jp ON ji.job_id = jp.id
            WHERE jp.status = 'Approved'
            GROUP BY i.id, i.name
            ORDER BY count DESC
            LIMIT 8
        `);
        res.json(rows);
    } catch (error) {
        console.error('GET TOP INDUSTRIES ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.activateCompany = async (req, res) => {
  const { id, activationCode } = req.body;

  try {
    // Tìm chính xác công ty theo ID và MÃ kích hoạt
    const [companies] = await pool.query(
      `SELECT * FROM Company WHERE id = ? AND activation_code = ? AND status = 'Pending'`,
      [id, activationCode]
    );

    if (companies.length === 0) {
      return res.status(400).json({ message: "Invalid ID or activation code!" });
    }

    // Nếu khớp, kích hoạt ngay
    await pool.query(
      `UPDATE Company SET status = 'Active', activation_code = NULL WHERE id = ?`,
      [id]
    );

    return res.status(200).json({ message: "Account activated!" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};