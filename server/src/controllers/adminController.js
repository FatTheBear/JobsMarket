const db = require('../config/db'); 

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
