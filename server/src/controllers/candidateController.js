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
    }
};

module.exports = candidateController;
