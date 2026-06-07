const db = require('../config/db'); 
const CoinExchangeFeeModel = require('../models/CoinExchangeFee');

// 1. Lấy dữ liệu tổng quan (Đồng bộ chuẩn db.query)
exports.getStats = async (req, res) => {
    try {
        const [userCount] = await db.query("SELECT COUNT(*) as count FROM `user` WHERE role != 'Admin'");
        const [candidateCount] = await db.query("SELECT COUNT(*) as count FROM `user` WHERE role = 'Candidate'");
        const [hrCount] = await db.query("SELECT COUNT(*) as count FROM `user` WHERE role = 'HR'");
        const [jobCount] = await db.query("SELECT COUNT(*) as count FROM `job_posting` WHERE status = 'Pending'");
        const [activeJobCount] = await db.query("SELECT COUNT(*) as count FROM `job_posting` WHERE status = 'Approved'");
        const [appCount] = await db.query("SELECT COUNT(*) as count FROM `application`");
        const [industryCount] = await db.query("SELECT COUNT(*) as count FROM `industry`");

        res.json({
            totalUsers: userCount[0].count,
            candidatesCount: candidateCount[0].count,
            hrCount: hrCount[0].count,
            pendingJobs: jobCount[0].count,
            activeJobs: activeJobCount[0].count,
            totalApplications: appCount[0].count,
            industriesCount: industryCount[0].count
        });
    } catch (error) {
        console.error("❌ Lỗi tại getStats:", error.message);
        res.status(500).json({ message: error.message });
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
    try {
        const [skills] = await db.query("SELECT id, name FROM `skill` ORDER BY id DESC");
        res.json(skills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
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
        const [newsList] = await db.query("SELECT * FROM `news`");
        res.json(newsList);
    } catch (error) {
        console.error("NEWS ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

// 9. Thêm nhanh kỹ năng mới
exports.createSkill = async (req, res) => {
    const { name } = req.body;
    try {
        if (!name) return res.status(400).json({ message: "Skill name is required" });
        await db.query("INSERT INTO `skill` (name) VALUES (?)", [name]);
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
        const {
            title,
            slug,
            category_id,
            thumbnail_url,
            short_description,
            content,
            status
        } = req.body;

        const query = `
            INSERT INTO news (
                admin_id,
                category_id,
                title,
                slug,
                thumbnail_url,
                short_description,
                content,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            5,
            category_id || 1,
            title,
            slug,
            thumbnail_url || '',
            short_description || '',
            content || '',
            status || 'Draft'
        ]);

        res.json({
            success: true,
            insertedId: result.insertId
        });

    } catch (error) {
        console.error("CREATE NEWS ERROR:", error);
        res.status(500).json({
            message: error.message
        });
    }
};

// 12. Cập nhật bài viết
exports.updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            slug,
            category_id,
            thumbnail_url,
            short_description,
            content,
            status
        } = req.body;

        const query = `
            UPDATE news
            SET
                title = ?,
                slug = ?,
                category_id = ?,
                thumbnail_url = ?,
                short_description = ?,
                content = ?,
                status = ?
            WHERE id = ?
        `;

        await db.query(query, [
            title,
            slug,
            category_id,
            thumbnail_url,
            short_description,
            content,
            status,
            id
        ]);

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
        console.error("❌ Lỗi tại getTransactions:", error.message);
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
            console.log(`✅ Đã cộng ${transaction.coins} xu cho User ID: ${transaction.user_id}`);
        }

        await connection.commit();
        connection.release();
        
        res.json({ success: true, message: "Xử lý giao dịch thành công!" });

    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error("❌ Lỗi tại updateTransactionStatus:", error.message);
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