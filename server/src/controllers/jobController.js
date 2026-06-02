const db = require("../config/db.js"); // Khớp với file db.js của nhóm bạn

const jobController = {
    // Hàm xử lý logic Đăng tin tuyển dụng (Job Posting)
    createJob: async (req, res) => {
       
  console.log("--- BẮT ĐẦU ĐĂNG TIN ---");
    console.log("Dữ liệu nhận từ Frontend:", req.body);
    // ...
        try {
            const { 
                title, 
                industry_id, 
                description, 
                requirements, 
                salary_min, 
                salary_max, 
                job_type, 
                skill_ids 
            } = req.body;

            // Lấy ID của HR từ token đăng nhập (Thường nhóm lưu ở req.user.id hoặc req.userId)
            const hr_id = req.user?.id || req.userId; 

            if (!hr_id) {
                return res.status(401).json({ message: "Không tìm thấy thông tin Nhà tuyển dụng! Vui lòng đăng nhập lại." });
            }

            // 1. Tìm company_id của Công ty thuộc quyền quản lý của HR này
            const [companyRows] = await db.query(
                "SELECT id FROM `company` WHERE hr_id = ?", 
                [hr_id]
            );

            if (companyRows.length === 0) {
                return res.status(400).json({ message: "Tài khoản HR của bạn chưa được liên kết với bất kỳ Công ty nào!" });
            }
            const company_id = companyRows[0].id;

            // 2. Chèn dữ liệu mới vào đúng bảng `Job_Posting` theo cấu trúc SQL của nhóm
            const [jobResult] = await db.query(
    `INSERT INTO \`job_posting\` 
    (company_id, hr_id, title, description, requirements, salary_min, salary_max, job_type, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
                [
                    company_id, 
                    hr_id, 
                    title, 
                    description || null, 
                    requirements || null, 
                    salary_min ? parseInt(salary_min) : null, 
                    salary_max ? parseInt(salary_max) : null, 
                    job_type || 'Full-time'
                ]
            );

            const job_id = jobResult.insertId;

            // 3. Chèn các kỹ năng đi kèm vào bảng trung gian `Job_Skill`
            if (skill_ids && Array.isArray(skill_ids) && skill_ids.length > 0) {
                // Duyệt qua từng skill_id để chèn dòng vào bảng Job_Skill
                for (const skill_id of skill_ids) {
                    await db.query(
    `INSERT INTO \`job_skill\` (job_id, skill_id, min_level, min_years) 
     VALUES (?, ?, 'Beginner', 0.0)`,
    [job_id, skill_id]
);
                }
            }

            res.status(201).json({ 
                message: "Đăng tin tuyển dụng thành công! Đang chờ Admin phê duyệt.", 
                jobId: job_id 
            });

        } catch (error) {
            console.error("Lỗi xử lý Job Posting:", error);
            res.status(500).json({ message: "Lỗi hệ thống khi đăng tin tuyển dụng" });
        }
    }
};

module.exports = jobController;