const db = require('../db.js'); // Đổi sang require theo cấu hình CommonJS của team

// 1. Lấy dữ liệu tổng quan
exports.getStats = async (req, res) => {
    try {
        const [userCount] = await db.query("SELECT COUNT(*) as count FROM `User` WHERE role != 'Admin'");
        const [jobCount] = await db.query("SELECT COUNT(*) as count FROM `Job_Posting` WHERE status = 'Pending'");

        res.json({
            totalUsers: userCount[0].count,
            pendingJobs: jobCount[0].count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Lấy danh sách người dùng
exports.getUsers = async (req, res) => {
    try {
        const query = `
            SELECT u.id, u.email, u.role, u.status, 
                   IFNULL(cp.full_name, IFNULL(c.name, 'Chưa cập nhật')) AS full_name 
            FROM \`User\` u
            LEFT JOIN \`Candidate_Profile\` cp ON u.id = cp.user_id
            LEFT JOIN \`Company\` c ON u.id = c.hr_id
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
            FROM \`Job_Posting\` j
            JOIN \`Company\` c ON j.company_id = c.id
            WHERE j.status = 'Pending'
        `);
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Cập nhật trạng thái User (Khóa / Mở khóa)
exports.updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await db.query("UPDATE `User` SET status = ? WHERE id = ?", [status, id]);
        res.json({ message: "Cập nhật trạng thái thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Duyệt hoặc Từ chối bài đăng
exports.updateJobStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'Approved' hoặc 'Rejected'
    try {
        await db.query("UPDATE `Job_Posting` SET status = ? WHERE id = ?", [status, id]);
        res.json({ message: "Xử lý bài đăng thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Server side: adminController.js
exports.getStats = async (req, res) => {
    try {
        // Đếm Users (loại trừ Admin)
        const [userCount] = await db.query("SELECT COUNT(*) as count FROM `User` WHERE role != 'Admin'");
        
        // Đếm Jobs chờ duyệt
        const [jobCount] = await db.query("SELECT COUNT(*) as count FROM `Job_Posting` WHERE status = 'Pending'");
        
        // Đếm Applications (Bảng này bạn đã có dữ liệu)
        const [appCount] = await db.query("SELECT COUNT(*) as count FROM `application`");

        res.json({
            totalUsers: userCount[0].count,
            pendingJobs: jobCount[0].count,
            totalApplications: appCount[0].count // Đây là chìa khóa để Dashboard hiện số
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};