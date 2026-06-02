const pool = require('../config/db');

const CandidateProfileModel = {
    // 1. Tạo profile mới (khi đăng ký tài khoản)
    create: async (user_id, full_name) => {
        const [result] = await pool.execute(
            'INSERT INTO Candidate_Profile (user_id, full_name) VALUES (?, ?)',
            [user_id, full_name]
        );
        return result.insertId;
    },
    // 2. Tìm profile bằng user_id (Dùng để lấy dữ liệu trang cá nhân)
    findByUserId: async (user_id) => {
        const [rows] = await pool.execute(
            `SELECT cp.*, u.email 
             FROM Candidate_Profile cp 
             JOIN User u ON cp.user_id = u.id 
             WHERE cp.user_id = ?`,
            [user_id]
        );
        return rows[0]; // Trả về thông tin profile hoặc undefined
    },
    // 3. Cập nhật thông tin profile
    updateByUserId: async (user_id, updateData) => {
        const { full_name, phone, avatar_url, headline, about, years_of_experience, skills, is_public } = updateData;

        const [result] = await pool.execute(
            `UPDATE Candidate_Profile 
             SET full_name = ?, phone = ?, avatar_url = ?, headline = ?, 
                 about = ?, years_of_experience = ?, skills = ?, is_public = ? 
             WHERE user_id = ?`,
            [
                full_name,
                phone || null,
                avatar_url || null,
                headline || null,
                about || null,
                years_of_experience || 0,
                skills ? JSON.stringify(skills) : null,
                is_public !== undefined ? is_public : true,
                user_id
            ]
        );
        return result.affectedRows > 0;
    }
};

module.exports = CandidateProfileModel;