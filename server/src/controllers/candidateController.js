const CandidateProfileModel = require('../models/CandidatesPrf');
const pool = require('../config/db');

const candidateController = {
    // Get candidate profile details.
    getProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const profile = await CandidateProfileModel.findByUserId(userId);

            if (!profile) {
                return res.status(404).json({ message: "Candidate profile not found!" });
            }

            // Parse JSON fields before returning them to the client.
            if (profile.skills && typeof profile.skills === 'string') {
                profile.skills = JSON.parse(profile.skills);
            }

            // Parse education if stored as JSON.
            if (profile.education && typeof profile.education === 'string') {
                profile.education = JSON.parse(profile.education);
            }
            // Calculate years of experience.
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

                // Convert months to years and keep one decimal place.
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

    // Update candidate profile information.
    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const updateFields = req.body;
            if (req.file) {
                const avatarUrl = `http://localhost:5000/uploads/avatars/${req.file.filename}`;
                updateFields.avatar_url = avatarUrl;
            }
            // Parse JSON arrays for education and experience.
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

    // Get recommended companies for onboarding.
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

    // Save initial onboarding information.
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

    // Get a candidate public profile by profile ID.
    getPublicProfile: async (req, res) => {
        try {
            const profileId = req.params.id;
            const profile = await CandidateProfileModel.findByProfileId(profileId);

            if (!profile) {
                return res.status(404).json({ message: "Candidate profile not found!" });
            }

            // Parse JSON fields.
            if (profile.skills && typeof profile.skills === 'string') {
                profile.skills = JSON.parse(profile.skills);
            }
            if (profile.education && typeof profile.education === 'string') {
                profile.education = JSON.parse(profile.education);
            }

            // Check profile privacy.
            const isOwner = req.user && req.user.id === profile.user_id;
            const isAdmin = req.user && req.user.role === 'Admin';

            if (!profile.is_public && !isOwner && !isAdmin) {
                return res.status(403).json({ message: "This profile is private." });
            }
            // Calculate years of experience.
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
        const file = req.file;
        const cv_name = req.body.cv_name || "Candidate CV";

        if (!file) {
            return res.status(400).json({ message: "Please select a CV file to upload!" });
        }

        try {
            const connection = await pool.getConnection();

            // 1. Find the candidate profile ID from user_id.
            const [candidateRows] = await connection.execute(
                'SELECT id FROM candidate_profile WHERE user_id = ?',
                [userId]
            );

            if (candidateRows.length === 0) {
                connection.release();
                return res.status(404).json({ message: "Please update your personal information before uploading a CV!" });
            }

            const candidateId = candidateRows[0].id;

            // 2. Extract file information.
            const file_name = file.filename;
            const file_url = `/uploads/cvs/${file.filename}`;
            const file_size = file.size;

            let file_type = 'Word';
            if (file.mimetype === 'application/pdf') {
                file_type = 'PDF';
            }

            // 3. Save the CV record.
            const [result] = await connection.execute(
                'INSERT INTO candidate_cv (candidate_id, cv_name, file_name, file_url, file_type, file_size) VALUES (?, ?, ?, ?, ?, ?)',
                [candidateId, cv_name, file_name, file_url, file_type, file_size]
            );

            connection.release();
            return res.status(201).json({ message: "CV saved successfully!", cv_url: file_url });

        } catch (error) {
            console.error("Error saving CV:", error);
            return res.status(500).json({ message: "Server error while saving CV!" });
        }
    },
    // 1. API: get all CVs.
    getAllCVs: async (req, res) => {
        try {
            const userId = req.user.id;
            const connection = await pool.getConnection();
            // Get the candidate ID.
            const [candidateRows] = await connection.execute(
                'SELECT id FROM candidate_profile WHERE user_id = ?',
                [userId]
            );
            if (candidateRows.length === 0) {
                connection.release();
                return res.status(200).json([]);
            }
            const candidateId = candidateRows[0].id;
            // Get all CVs for this candidate, newest first.
            const [cvRows] = await connection.execute(
                'SELECT id, cv_name as name, file_type as type, file_size as size, file_url as dataUrl, DATE_FORMAT(created_at, "%b %e, %Y") as uploadedAt FROM candidate_cv WHERE candidate_id = ? ORDER BY created_at DESC',
                [candidateId]
            );
            connection.release();
            // Normalize the response for frontend use.
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
            console.error("Error loading CV list:", error);
            return res.status(500).json({ message: "Server error while loading CV list!" });
        }
    },
    // 2. API: delete one CV.
    deleteCV: async (req, res) => {
        try {
            const cvId = req.params.id;
            const userId = req.user.id;

            const connection = await pool.getConnection();

            // Delete only when the CV belongs to the current user.
            await connection.execute(
                'DELETE cv FROM candidate_cv cv JOIN candidate_profile cp ON cv.candidate_id = cp.id WHERE cv.id = ? AND cp.user_id = ?',
                [cvId, userId]
            );
            connection.release();
            return res.status(200).json({ message: "CV deleted successfully!" });
        } catch (error) {
            console.error("Error deleting CV:", error);
            return res.status(500).json({ message: "Server error while deleting CV!" });
        }
    },
    // 3. API: submit a job application.
    applyJob: async (req, res) => {
        try {
            const { job_id, cv_id } = req.body;
            const userId = req.user.id;

            if (!job_id || !cv_id) {
                return res.status(400).json({ message: "Please provide a valid job_id and cv_id!" });
            }

            const connection = await pool.getConnection();

            // 1. Get candidate_id.
            const [candidateRows] = await connection.execute(
                'SELECT id FROM candidate_profile WHERE user_id = ?',
                [userId]
            );

            if (candidateRows.length === 0) {
                connection.release();
                return res.status(404).json({ message: "Candidate profile does not exist!" });
            }

            const candidateId = candidateRows[0].id;

            // 2. Ensure the candidate owns the submitted CV.
            const [cvRows] = await connection.execute(
                'SELECT id FROM candidate_cv WHERE id = ? AND candidate_id = ?',
                [cv_id, candidateId]
            );

            if (cvRows.length === 0) {
                connection.release();
                return res.status(403).json({ message: "Invalid CV or you do not own it!" });
            }

            // 3. Check whether the candidate already applied to this job.
            const [existingApp] = await connection.execute(
                'SELECT id FROM application WHERE job_id = ? AND candidate_id = ?',
                [job_id, candidateId]
            );

            if (existingApp.length > 0) {
                connection.release();
                return res.status(400).json({ message: "You have already applied for this job!" });
            }

            // 4. Save the application.
            await connection.execute(
                'INSERT INTO application (job_id, candidate_id, cv_id, status) VALUES (?, ?, ?, "Applied")',
                [job_id, candidateId, cv_id]
            );

            connection.release();
            return res.status(201).json({ message: "Applied successfully!" });
        } catch (error) {
            console.error("Error applying for job:", error);
            return res.status(500).json({ message: "System error while applying: " + error.message });
        }
    },
    // 4. API: get application history.
    getApplications: async (req, res) => {
        try {
            const userId = req.user.id;
            const connection = await pool.getConnection();

            // 1. Get candidate_id.
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

            // Format response data.
            const formattedApps = rows.map(app => ({
                id: app.application_id,
                status: app.status,
                appliedAt: app.applied_at,
                jobTitle: app.job_title,
                companyName: app.company_name,
                companyLogo: app.company_logo ? (app.company_logo.startsWith('http') ? app.company_logo : `http://localhost:5000${app.company_logo}`) : null,
                cvName: app.cv_name,
                cvUrl: app.cv_url ? `http://localhost:5000${app.cv_url}` : null
            }));

            return res.status(200).json(formattedApps);
        } catch (error) {
            console.error("Error loading application history:", error);
            return res.status(500).json({ message: "System error while loading application history!" });
        }
    },

    getNotifications: async (req, res) => {
        try {
            const userId = req.user.id;
            const connection = await pool.getConnection();

            // Fetch notifications for the user
            const [rows] = await connection.execute(
                'SELECT id, title, content, is_read, DATE_FORMAT(created_at, "%b %e, %Y %H:%i") as created_at FROM Notification WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );

            // If no notifications found, auto-insert a welcome notification and an account security notification
            if (rows.length === 0) {
                const welcomeTitle1 = "Welcome to JobsMarket! 🎉";
                const welcomeContent1 = "Thank you for joining our platform. Complete your profile to start applying for jobs!";
                const welcomeTitle2 = "Secure Your Account 🔒";
                const welcomeContent2 = "Make sure to verify your phone number and email to keep your account safe.";

                await connection.execute(
                    'INSERT INTO Notification (user_id, title, content, is_read) VALUES (?, ?, ?, FALSE), (?, ?, ?, FALSE)',
                    [userId, welcomeTitle1, welcomeContent1, userId, welcomeTitle2, welcomeContent2]
                );

                const [newRows] = await connection.execute(
                    'SELECT id, title, content, is_read, DATE_FORMAT(created_at, "%b %e, %Y %H:%i") as created_at FROM Notification WHERE user_id = ? ORDER BY created_at DESC',
                    [userId]
                );
                connection.release();
                return res.status(200).json(newRows);
            }

            connection.release();
            return res.status(200).json(rows);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            return res.status(500).json({ message: "Server error while fetching notifications!" });
        }
    },

    markNotificationAsRead: async (req, res) => {
        try {
            const userId = req.user.id;
            const notiId = req.params.id;
            const connection = await pool.getConnection();

            await connection.execute(
                'UPDATE Notification SET is_read = TRUE WHERE id = ? AND user_id = ?',
                [notiId, userId]
            );

            connection.release();
            return res.status(200).json({ message: "Notification marked as read!" });
        } catch (error) {
            console.error("Error marking notification as read:", error);
            return res.status(500).json({ message: "Server error while updating notification!" });
        }
    },

    markAllNotificationsAsRead: async (req, res) => {
        try {
            const userId = req.user.id;
            const connection = await pool.getConnection();

            await connection.execute(
                'UPDATE Notification SET is_read = TRUE WHERE user_id = ?',
                [userId]
            );

            connection.release();
            return res.status(200).json({ message: "All notifications marked as read!" });
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            return res.status(500).json({ message: "Server error while updating notifications!" });
        }
    }
};

module.exports = candidateController;
