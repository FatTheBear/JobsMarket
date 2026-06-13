const pool = require('../config/db');

const setupProfileController = {
    onboarding: async (req, res) => {
        try {
            // 1. Lấy ID của user từ token 
            // (Lưu ý: Middleware xác thực JWT sẽ giải mã và gắn ID này vào req.user)
            const userId = req.user.id; 
            
            // 2. Lấy dữ liệu từ Frontend gửi lên
            const { display_name, phone, avatar_url, headline, address, education, skills } = req.body;

            // 3. Xử lý dữ liệu mảng thành chuỗi JSON để lưu vào MySQL
            const educationJson = JSON.stringify(education || []);
            const skillsJson = JSON.stringify(skills || []);

            // 4. Cập nhật vào bảng Candidate_Profile dựa trên user_id
            const [result] = await pool.execute(`
                UPDATE Candidate_Profile 
                SET display_name = ?, 
                    phone = ?, 
                    avatar_url = ?, 
                    headline = ?, 
                    address = ?, 
                    education = ?, 
                    cand_skills = ?
                WHERE user_id = ?
            `, [display_name, phone, avatar_url, headline, address, educationJson, skillsJson, userId]);

            // Kiểm tra xem có profile nào được cập nhật không
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Candidate profile not found for this user!" });
            }

            // 5. Trả về kết quả thành công cho Frontend
            return res.status(200).json({ message: "Profile updated successfully!" });
            
        } catch (error) {
            console.error("Setup Profile Error:", error);
            return res.status(500).json({ message: "Internal server error!" });
        }
    }
};

module.exports = setupProfileController;