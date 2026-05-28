const pool = require('../config/db');

const UserModel = {
    // Tìm user bằng email (Dùng để check xem email đã bị đăng ký chưa)
    findByEmail: async (email) => {
        const [rows] = await pool.execute('SELECT * FROM User WHERE email = ?', [email]);
        return rows[0]; // Trả về object user nếu thấy, undefined nếu không thấy
    },

    // Tạo tài khoản mới
    create: async (email, password_hash, role) => {
        const [result] = await pool.execute(
            'INSERT INTO User (email, password_hash, role) VALUES (?, ?, ?)',
            [email, password_hash, role]
        );
        return result.insertId; // Trả về ID vừa được MySQL tự động tạo ra
    }
};

module.exports = UserModel;