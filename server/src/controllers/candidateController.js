const CandidateProfileModel = require('../models/CandidatesPrf');
const pool = require('../config/db');

const candidateController = {
    // Lấy thông tin chi tiết Candidate Profile
    getProfile: async (req, res) => {
        try {
            const userId = req.user.id; // Lấy từ authMiddleware sau khi giải mã Token
            const profile = await CandidateProfileModel.findByUserId(userId);

            if (!profile) {
                return res.status(404).json({ message: "Candidate profile not found!" });
            }

            // Nếu trường skills được lưu dưới dạng JSON trong DB, parse nó về Object/Array khi gửi về Client
            if (profile.skills && typeof profile.skills === 'string') {
                profile.skills = JSON.parse(profile.skills);
            }

            // Nếu trường education được lưu dưới dạng JSON trong DB, parse nó về Object/Array khi gửi về Client
            if (profile.education && typeof profile.education === 'string') {
                profile.education = JSON.parse(profile.education);
            }
            //Tính số năm kinh nghiệm
            if (profile.experience && Array.isArray(profile.experience)) {
                let totalMonths = 0;
                profile.experience.forEach(exp => {
                    if (exp.startDate) { // Kiểm tra xem có ngày bắt đầu không
                        const start = new Date(exp.startDate);
                        // Nếu không có ngày kết thúc (nghĩa là đang làm), lấy ngày hôm nay
                        const end = exp.endDate ? new Date(exp.endDate) : new Date();

                        // Tính tổng số tháng (Số năm chênh lệch * 12 + Số tháng chênh lệch)
                        const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

                        if (diffMonths > 0) {
                            totalMonths += diffMonths;
                        }
                    }
                });

                // Quy đổi ra năm, làm tròn 1 chữ số thập phân (Ví dụ: 32 tháng -> 2.7 năm)
                profile.years_of_experience = Math.round((totalMonths / 12) * 10) / 10;
            } else {
                profile.years_of_experience = 0;
            }

            return res.status(200).json(profile);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error!" });
        }
    },

    // Cập nhật thông tin Candidate Profile
    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id; // Lấy từ authMiddleware
            const updateFields = req.body;
            if (req.file) {
                const avatarUrl = `http://localhost:5000/uploads/avatars/${req.file.filename}`;
                updateFields.avatar_url = avatarUrl;
            }
            // Parse chuỗi JSON thành mảng cho Education và Experience
            if (updateFields.education && typeof updateFields.education === 'string') {
                updateFields.education = JSON.parse(updateFields.education);
            }
            if (updateFields.experience && typeof updateFields.experience === 'string') {
                updateFields.experience = JSON.parse(updateFields.experience);
            }
            if (updateFields.skills && typeof updateFields.skills === 'string') {
                updateFields.skills = JSON.parse(updateFields.skills);
            }
            const isUpdated = await CandidateProfileModel.updateByUserId(userId, updateFields);

            if (!isUpdated) {
                return res.status(400).json({ message: "Update profile failed!" });
            }

            return res.status(200).json({ message: "Profile updated successfully!" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error!" });
        }
    },

    // Lấy danh sách công ty đề xuất cho onboarding
    getRecommendedCompanies: async (req, res) => {
        try {
            const userId = req.user.id;
            const companies = await CandidateProfileModel.getRecommendedCompanies(userId);
            return res.status(200).json(companies);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error!" });
        }
    },

    // Lưu thông tin Onboarding ban đầu
    saveOnboarding: async (req, res) => {
        try {
            const userId = req.user.id;
            const onboardingData = req.body;

            await CandidateProfileModel.updateOnboardingData(userId, onboardingData);
            return res.status(200).json({ message: "Onboarding profile saved successfully!" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error!" });
        }
    },

    // Lấy thông tin public của candidate bằng profile ID
    getPublicProfile: async (req, res) => {
        try {
            const profileId = req.params.id;
            const profile = await CandidateProfileModel.findByProfileId(profileId);

            if (!profile) {
                return res.status(404).json({ message: "Candidate profile not found!" });
            }

            // Parse các trường JSON
            if (profile.skills && typeof profile.skills === 'string') {
                profile.skills = JSON.parse(profile.skills);
            }
            if (profile.education && typeof profile.education === 'string') {
                profile.education = JSON.parse(profile.education);
            }

            // Kiểm tra tính riêng tư của Profile
            const isOwner = req.user && req.user.id === profile.user_id;
            const isAdmin = req.user && req.user.role === 'Admin';

            if (!profile.is_public && !isOwner && !isAdmin) {
                return res.status(403).json({ message: "This profile is private." });
            }
            //Tính số năm kinh nghiệm
            if (profile.experience && Array.isArray(profile.experience)) {
                let totalMonths = 0;
                profile.experience.forEach(exp => {
                    if (exp.startDate) {
                        const start = new Date(exp.startDate);
                        const end = exp.endDate ? new Date(exp.endDate) : new Date();
                        const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
                        if (diffMonths > 0) {
                            totalMonths += diffMonths;
                        }
                    }
                });
                profile.years_of_experience = Math.round((totalMonths / 12) * 10) / 10;
            } else {
                profile.years_of_experience = 0;
            }

            return res.status(200).json(profile);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error!" });
        }
    },
    uploadCV: async (req, res) => {
        const userId = req.user.id;
        const file = req.file; // File CV do multer bắt được
        const cv_name = req.body.cv_name || "CV Ứng viên";

        if (!file) {
            return res.status(400).json({ message: "Please select a CV file to upload!" });
        }

        try {
            const connection = await pool.getConnection();

            // 1. Tìm ID hồ sơ ứng viên (candidate_id) từ user_id
            const [candidateRows] = await connection.execute(
                'SELECT id FROM candidate_profile WHERE user_id = ?',
                [userId]
            );

            if (candidateRows.length === 0) {
                connection.release();
                return res.status(404).json({ message: "Please update your personal information before uploading a CV!" });
            }

            const candidateId = candidateRows[0].id;

            // 2. Trích xuất thông tin file
            const file_name = file.filename;
            const file_url = `/uploads/cvs/${file.filename}`;
            const file_size = file.size;

            let file_type = 'Word';
            if (file.mimetype === 'application/pdf') {
                file_type = 'PDF';
            }

            // 3. Lưu toàn bộ dữ liệu vào bảng candidate_cv
            const [result] = await connection.execute(
                'INSERT INTO candidate_cv (candidate_id, cv_name, file_name, file_url, file_type, file_size) VALUES (?, ?, ?, ?, ?, ?)',
                [candidateId, cv_name, file_name, file_url, file_type, file_size]
            );

            connection.release();
            return res.status(201).json({ message: "CV saved successfully!", cv_url: file_url });

        } catch (error) {
            console.error("Lỗi khi lưu CV:", error);
            return res.status(500).json({ message: "Server error khi lưu CV!" });
        }
    },
    // 1. API Lấy danh sách toàn bộ CV
    getAllCVs: async (req, res) => {
        try {
            const userId = req.user.id;
            const connection = await pool.getConnection();
            // Lấy ID của ứng viên (candidate_id)
            const [candidateRows] = await connection.execute(
                'SELECT id FROM candidate_profile WHERE user_id = ?',
                [userId]
            );
            if (candidateRows.length === 0) {
                connection.release();
                return res.status(200).json([]); // Trả về mảng rỗng nếu chưa có profile
            }
            const candidateId = candidateRows[0].id;
            // Lấy toàn bộ CV của ứng viên này sắp xếp mới nhất lên đầu
            const [cvRows] = await connection.execute(
                'SELECT id, cv_name as name, file_type as type, file_size as size, file_url as dataUrl, DATE_FORMAT(created_at, "%b %e, %Y") as uploadedAt FROM candidate_cv WHERE candidate_id = ? ORDER BY created_at DESC',
                [candidateId]
            );
            connection.release();
            // Chuẩn hóa dữ liệu một chút để Frontend dễ dùng
            const formattedCVs = cvRows.map(cv => ({
                id: cv.id,
                name: cv.name,
                type: cv.type === 'PDF' ? 'application/pdf' : 'application/msword',
                size: (cv.size / 1024 / 1024).toFixed(2) + ' MB',
                uploadedAt: cv.uploadedAt,
                dataUrl: 'http://localhost:5000' + cv.dataUrl
            }));
            return res.status(200).json(formattedCVs);
        } catch (error) {
            console.error("Lỗi lấy danh sách CV:", error);
            return res.status(500).json({ message: "Server error khi tải danh sách CV!" });
        }
    },
    // 2. API Xóa 1 CV
    deleteCV: async (req, res) => {
        try {
            const cvId = req.params.id; // Lấy ID của CV cần xóa từ đường dẫn
            const userId = req.user.id;

            const connection = await pool.getConnection();

            // Xóa cứng khỏi Database (có kiểm tra chéo user_id để ứng viên không xóa trộm CV của người khác)
            await connection.execute(
                'DELETE cv FROM candidate_cv cv JOIN candidate_profile cp ON cv.candidate_id = cp.id WHERE cv.id = ? AND cp.user_id = ?',
                [cvId, userId]
            );
            connection.release();
            return res.status(200).json({ message: "CV deleted successfully!" });
        } catch (error) {
            console.error("Lỗi xóa CV:", error);
            return res.status(500).json({ message: "Server error khi xóa CV!" });
        }
    },
    // 3. API Nộp Đơn Ứng Tuyển
    applyJob: async (req, res) => {
        try {
            const { job_id, cv_id } = req.body;
            const userId = req.user.id;

            if (!job_id || !cv_id) {
                return res.status(400).json({ message: "Please provide a valid job_id and cv_id!" });
            }

            const connection = await pool.getConnection();

            // 1. Lấy candidate_id
            const [candidateRows] = await connection.execute(
                'SELECT id FROM candidate_profile WHERE user_id = ?',
                [userId]
            );

            if (candidateRows.length === 0) {
                connection.release();
                return res.status(404).json({ message: "Candidate profile does not exist!" });
            }

            const candidateId = candidateRows[0].id;

            // 2. Kiểm tra xem ứng viên có gửi đúng CV của mình không
            const [cvRows] = await connection.execute(
                'SELECT id FROM candidate_cv WHERE id = ? AND candidate_id = ?',
                [cv_id, candidateId]
            );

            if (cvRows.length === 0) {
                connection.release();
                return res.status(403).json({ message: "Invalid CV or you do not own it!" });
            }

            // 3. Kiểm tra xem ứng viên đã apply vào job này chưa
            const [existingApp] = await connection.execute(
                'SELECT id FROM application WHERE job_id = ? AND candidate_id = ?',
                [job_id, candidateId]
            );

            if (existingApp.length > 0) {
                connection.release();
                return res.status(400).json({ message: "You have already applied for this job!" });
            }

            // 4. Lưu dữ liệu ứng tuyển
            await connection.execute(
                'INSERT INTO application (job_id, candidate_id, cv_id, status) VALUES (?, ?, ?, "Applied")',
                [job_id, candidateId, cv_id]
            );

            connection.release();
            return res.status(201).json({ message: "Applied successfully!" });
        } catch (error) {
            console.error("Lỗi khi ứng tuyển:", error);
            return res.status(500).json({ message: "System error while applying: " + error.message });
        }
    },
    // 4. API Lấy lịch sử ứng tuyển
    getApplications: async (req, res) => {
        try {
            const userId = req.user.id;
            const connection = await pool.getConnection();

            // 1. Lấy candidate_id
            const [candidateRows] = await connection.execute(
                'SELECT id FROM candidate_profile WHERE user_id = ?',
                [userId]
            );

            if (candidateRows.length === 0) {
                connection.release();
                return res.status(200).json([]);
            }

            const candidateId = candidateRows[0].id;

            // 2. Query join application, job_posting, company, candidate_cv
            const query = `
                SELECT 
                    a.id as application_id,
                    a.status,
                    a.applied_at,
                    jp.title as job_title,
                    c.name as company_name,
                    c.logo_url as company_logo,
                    cv.cv_name,
                    cv.file_url as cv_url
                FROM application a
                JOIN job_posting jp ON a.job_id = jp.id
                JOIN company c ON jp.company_id = c.id
                JOIN candidate_cv cv ON a.cv_id = cv.id
                WHERE a.candidate_id = ?
                ORDER BY a.applied_at DESC
            `;

            const [rows] = await connection.execute(query, [candidateId]);
            connection.release();

            // Format data trả về
            const formattedApps = rows.map(app => ({
                id: app.application_id,
                status: app.status,
                appliedAt: app.applied_at, // Frontend sẽ format
                jobTitle: app.job_title,
                companyName: app.company_name,
                companyLogo: app.company_logo ? (app.company_logo.startsWith('http') ? app.company_logo : `http://localhost:5000${app.company_logo}`) : null,
                cvName: app.cv_name,
                cvUrl: app.cv_url ? `http://localhost:5000${app.cv_url}` : null
            }));

            return res.status(200).json(formattedApps);
        } catch (error) {
            console.error("Lỗi lấy lịch sử ứng tuyển:", error);
            return res.status(500).json({ message: "System error while loading application history!" });
        }
    }
};
module.exports = candidateController;
