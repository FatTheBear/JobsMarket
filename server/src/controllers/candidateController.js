const CandidateProfileModel = require('../models/CandidatesPrf');

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
    }
};

module.exports = candidateController;
