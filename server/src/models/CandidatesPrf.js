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
        const { full_name, display_name, phone, avatar_url, headline, about, years_of_experience, skills, is_public, education, address } = updateData;

        const [result] = await pool.execute(
            `UPDATE Candidate_Profile 
             SET full_name = ?, display_name = ?, phone = ?, avatar_url = ?, headline = ?, 
                 about = ?, years_of_experience = ?, skills = ?, is_public = ?, education = ?, address = ?
             WHERE user_id = ?`,
            [
                full_name,
                display_name || null,
                phone || null,
                avatar_url || null,
                headline || null,
                about || null,
                years_of_experience || 0,
                skills ? (typeof skills === 'string' ? skills : JSON.stringify(skills)) : null,
                is_public !== undefined ? is_public : true,
                education ? (typeof education === 'string' ? education : JSON.stringify(education)) : null,
                address || null,
                user_id
            ]
        );
        return result.affectedRows > 0;
    },
    // 4. Lấy danh sách doanh nghiệp đề xuất kèm trạng thái Follow
    getRecommendedCompanies: async (candidateUserId) => {
        // Lấy profile id trước
        const [profiles] = await pool.execute(
            'SELECT id FROM Candidate_Profile WHERE user_id = ?',
            [candidateUserId]
        );
        const profileId = profiles.length > 0 ? profiles[0].id : 0;

        const [rows] = await pool.execute(
            `SELECT c.id, c.name, c.logo_url, c.website, c.address, i.name as industry_name,
                    IF(cf.candidate_id IS NULL, FALSE, TRUE) as is_followed
             FROM Company c
             LEFT JOIN Industry i ON c.industry_id = i.id
             LEFT JOIN Company_Follower cf ON c.id = cf.company_id AND cf.candidate_id = ?
             LIMIT 6`,
            [profileId]
        );
        return rows;
    },
    // 5. Cập nhật toàn bộ thông tin onboarding trong một Transaction
    updateOnboardingData: async (user_id, onboardingData) => {
        console.log("[DEBUG ONBOARDING PAYLOAD]", onboardingData);
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const { display_name, phone, avatar_url, headline, address, education, skills, followedCompanyIds } = onboardingData;

            // Lấy profile id
            const [profiles] = await connection.execute(
                'SELECT id FROM Candidate_Profile WHERE user_id = ?',
                [user_id]
            );

            let profileId;
            if (profiles.length === 0) {
                const [insertResult] = await connection.execute(
                    'INSERT INTO Candidate_Profile (user_id, display_name, is_public) VALUES (?, ?, ?)',
                    [user_id, display_name || 'Candidate', true]
                );
                profileId = insertResult.insertId;
            } else {
                profileId = profiles[0].id;
            }

            // Cập nhật Candidate_Profile
            await connection.execute(
                `UPDATE Candidate_Profile 
                 SET display_name = ?, phone = ?, avatar_url = ?, headline = ?, 
                     address = ?, education = ?, skills = ?
                 WHERE id = ?`,
                [
                    display_name || null,
                    phone || null,
                    avatar_url || null,
                    headline || null,
                    address || null,
                    education ? (typeof education === 'string' ? education : JSON.stringify(education)) : null,
                    skills ? (typeof skills === 'string' ? skills : JSON.stringify(skills)) : null,
                    profileId
                ]
            );

            // Cập nhật Company_Follower
            if (followedCompanyIds && Array.isArray(followedCompanyIds)) {
                await connection.execute(
                    'DELETE FROM Company_Follower WHERE candidate_id = ?',
                    [profileId]
                );

                for (const companyId of followedCompanyIds) {
                    const [companyExists] = await connection.execute(
                        'SELECT id FROM Company WHERE id = ?',
                        [companyId]
                    );

                    if (companyExists.length > 0) {
                        await connection.execute(
                            'INSERT INTO Company_Follower (candidate_id, company_id) VALUES (?, ?)',
                            [profileId, companyId]
                        );
                    } else {
                        console.log(`[ONBOARDING] Skipping follow for non-existent company ID: ${companyId}`);
                    }
                }
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = CandidateProfileModel;