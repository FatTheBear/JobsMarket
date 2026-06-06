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
        if (rows.length === 0) return undefined;
        const profile = rows[0];

        // Lấy danh sách Education
        const [education] = await pool.execute(
            'SELECT school_name as school, degree, start_date as startDate, end_date as gradDate, description FROM Candidate_Education WHERE candidate_id = ? ORDER BY start_date DESC',
            [profile.id]
        );
        profile.education = education;

        // Lấy danh sách Experience
        const [experience] = await pool.execute(
            'SELECT company_name as company, role, start_date as startDate, end_date as endDate, description FROM Candidate_Experience WHERE candidate_id = ? ORDER BY start_date DESC',
            [profile.id]
        );
        profile.experience = experience;

        // Lấy danh sách Skills
        const [skills] = await pool.execute(
            `SELECT s.skill_name as name, cs.level 
             FROM candidate_skill cs 
             JOIN skill s ON cs.skill_id = s.id 
             WHERE cs.candidate_id = ?`,
            [profile.id]
        );
        profile.skills = skills;

        return profile;
    },
    // Tìm profile bằng profile_id (Dùng cho trang public profile)
    findByProfileId: async (profile_id) => {
        const [rows] = await pool.execute(
            `SELECT cp.*, u.email 
             FROM Candidate_Profile cp 
             JOIN User u ON cp.user_id = u.id 
             WHERE cp.id = ?`,
            [profile_id]
        );
        if (rows.length === 0) return undefined;
        const profile = rows[0];

        // Lấy danh sách Education
        const [education] = await pool.execute(
            'SELECT school_name as school, degree, start_date as startDate, end_date as gradDate, description FROM Candidate_Education WHERE candidate_id = ? ORDER BY start_date DESC',
            [profile.id]
        );
        profile.education = education;

        // Lấy danh sách Experience
        const [experience] = await pool.execute(
            'SELECT company_name as company, role, start_date as startDate, end_date as endDate, description FROM Candidate_Experience WHERE candidate_id = ? ORDER BY start_date DESC',
            [profile.id]
        );
        profile.experience = experience;

        return profile;
    },
    // 3. Cập nhật thông tin profile
    updateByUserId: async (user_id, updateData) => {
        const { full_name, display_name, phone, avatar_url, headline, about, years_of_experience, is_public, address, cv_url, education, experience, skills } = updateData;
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [profiles] = await connection.execute(
                'SELECT id FROM Candidate_Profile WHERE user_id = ?',
                [user_id]
            );
            if (profiles.length === 0) {
                await connection.rollback();
                connection.release();
                return false;
            }
            const profileId = profiles[0].id;
            // tính số năm kinh nghiệm lưu vào DB
            let calculatedYears = 0;
            if (experience && Array.isArray(experience)) {
                let totalMonths = 0;
                experience.forEach(exp => {
                    if (exp.startDate) {
                        const start = new Date(exp.startDate);
                        const end = exp.endDate ? new Date(exp.endDate) : new Date();
                        const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
                        if (diffMonths > 0) totalMonths += diffMonths;
                    }
                });
                calculatedYears = Math.round((totalMonths / 12) * 10) / 10;
            }

            await connection.execute(
                `UPDATE Candidate_Profile 
                 SET full_name = ?, display_name = ?, phone = ?, avatar_url = ?, headline = ?, 
                     about = ?, years_of_experience = ?, is_public = ?, address = ?, cv_url = ?
                 WHERE id = ?`,
                [
                    full_name,
                    display_name || null,
                    phone || null,
                    avatar_url || null,
                    headline || null,
                    about || null,
                    calculatedYears,
                    is_public !== undefined ? is_public : true,
                    address || null,
                    cv_url || null,
                    profileId
                ]
            );
            // lưu học vấn
            if (education && Array.isArray(education)) {
                await connection.execute('DELETE FROM Candidate_Education WHERE candidate_id = ?', [profileId]);
                for (const item of education) {
                    await connection.execute(
                        'INSERT INTO Candidate_Education (candidate_id, school_name, degree, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
                        [profileId, item.school || '', item.degree || '', item.startDate || null, item.gradDate || null]
                    );
                }
            }

            //lưu kinh nghiệm
            if (experience && Array.isArray(experience)) {
                await connection.execute('DELETE FROM Candidate_Experience WHERE candidate_id = ?', [profileId]);
                for (const item of experience) {
                    await connection.execute(
                        'INSERT INTO Candidate_Experience (candidate_id, company_name, role, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
                        [profileId, item.company || '', item.role || '', item.startDate || null, item.endDate || null]
                    );
                }
            }
            //lưu skill và level
            if (skills && Array.isArray(skills)) {
                await connection.execute('DELETE FROM candidate_skill WHERE candidate_id = ?', [profileId]);
                for (const skillItem of skills) {
                    const trimmedSkill = skillItem.name.trim();
                    if (!trimmedSkill) continue;

                    // 1. Kiểm tra xem skill này đã có trong từ điển chưa
                    const [existingSkills] = await connection.execute(
                        'SELECT id FROM skill WHERE skill_name = ?',
                        [trimmedSkill]
                    );

                    let currentSkillId;
                    if (existingSkills.length > 0) {
                        currentSkillId = existingSkills[0].id;
                    } else {
                        const [insertSkillResult] = await connection.execute(
                            'INSERT INTO skill (skill_name) VALUES (?)',
                            [trimmedSkill]
                        );
                        currentSkillId = insertSkillResult.insertId;
                    }

                    // 2. Lưu vào bảng cầu nối Candidate_Skill kèm theo cột level
                    await connection.execute(
                        'INSERT INTO candidate_skill (candidate_id, skill_id, level) VALUES (?, ?, ?)',
                        [profileId, currentSkillId, skillItem.level || 0]
                    );
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
    },
    // 4. Lấy danh sách doanh nghiệp đề xuất kèm trạng thái Follow
    getRecommendedCompanies: async (candidateUserId) => {
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
    // 5. Cập nhật toàn bộ thông tin onboarding trong một Transaction (BẢN ĐÃ FIX CHUẨN)
    updateOnboardingData: async (user_id, onboardingData) => {
        console.log("[DEBUG ONBOARDING PAYLOAD]", onboardingData);
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const { display_name, phone, avatar_url, headline, address, education, experience, skills, followedCompanyIds } = onboardingData;

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

            // 1. Cập nhật bảng Candidate_Profile (LOẠI BỎ CỘT SKILLS JSON)
            await connection.execute(
                `UPDATE Candidate_Profile 
                 SET display_name = ?, phone = ?, avatar_url = ?, headline = ?, address = ?
                 WHERE id = ?`,
                [
                    display_name || null,
                    phone || null,
                    avatar_url || null,
                    headline || null,
                    address || null,
                    profileId
                ]
            );

            // 2. Đồng bộ Candidate_Education
            await connection.execute('DELETE FROM Candidate_Education WHERE candidate_id = ?', [profileId]);
            if (education && Array.isArray(education)) {
                for (const item of education) {
                    await connection.execute(
                        'INSERT INTO Candidate_Education (candidate_id, school_name, degree, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
                        [profileId, item.school || 'School', item.degree || 'Degree', item.startDate || '2026-01', item.gradDate || null]
                    );
                }
            }

            // 3. Đồng bộ Candidate_Experience
            await connection.execute('DELETE FROM Candidate_Experience WHERE candidate_id = ?', [profileId]);
            if (experience && Array.isArray(experience)) {
                for (const item of experience) {
                    await connection.execute(
                        'INSERT INTO Candidate_Experience (candidate_id, company_name, role, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
                        [profileId, item.company || 'Company', item.role || 'Role', item.startDate || '2026-01', item.endDate || null]
                    );
                }
            }

            // 4. ĐỒNG BỘ SKILLS VÀO BẢNG CHUẨN (SKILL & CANDIDATE_SKILL)
            await connection.execute('DELETE FROM candidate_skill WHERE candidate_id = ?', [profileId]);
            if (skills && Array.isArray(skills)) {
                for (const skillName of skills) {
                    const trimmedSkill = skillName.trim();
                    if (!trimmedSkill) continue;

                    // Kiểm tra xem skill này đã có trong bảng từ điển 'skill' chưa
                    const [existingSkills] = await connection.execute(
                        'SELECT id FROM skill WHERE skill_name = ?',
                        [trimmedSkill]
                    );

                    let currentSkillId;
                    if (existingSkills.length > 0) {
                        currentSkillId = existingSkills[0].id; // Lấy ID cũ
                    } else {
                        // Thêm mới vào từ điển
                        const [insertSkillResult] = await connection.execute(
                            'INSERT INTO skill (skill_name) VALUES (?)',
                            [trimmedSkill]
                        );
                        currentSkillId = insertSkillResult.insertId; // Lấy ID mới tạo
                    }

                    // Lưu vào bảng cầu nối Candidate_Skill
                    await connection.execute(
                        'INSERT INTO candidate_skill (candidate_id, skill_id) VALUES (?, ?)',
                        [profileId, currentSkillId]
                    );
                }
            }

            // 5. Cập nhật Company_Follower
            if (followedCompanyIds && Array.isArray(followedCompanyIds)) {
                await connection.execute('DELETE FROM Company_Follower WHERE candidate_id = ?', [profileId]);
                for (const companyId of followedCompanyIds) {
                    const [companyExists] = await connection.execute('SELECT id FROM Company WHERE id = ?', [companyId]);
                    if (companyExists.length > 0) {
                        await connection.execute(
                            'INSERT INTO Company_Follower (candidate_id, company_id) VALUES (?, ?)',
                            [profileId, companyId]
                        );
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