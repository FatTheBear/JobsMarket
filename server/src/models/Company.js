 const pool = require('../config/db');

const CompanyModel = {
    // Tạo hồ sơ doanh nghiệp cơ bản lúc đăng ký
    create: async (hr_id, industry_id, name) => {
        const [result] = await pool.execute(
            'INSERT INTO Company (hr_id, industry_id, name) VALUES (?, ?, ?)',
            [hr_id, industry_id, name]
        );
        return result.insertId;
    }
};

module.exports = CompanyModel;