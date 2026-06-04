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

            return res.status(200).json(profile);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error!" });
        }
    }
};

module.exports = candidateController;
