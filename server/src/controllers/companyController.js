const pool = require('../config/db');

exports.getAppliedCandidates = async (req, res) => {
    const { id } = req.user; 

    try {
        const connection = await pool.getConnection();

        try {
            const [rows] = await connection.execute(`
                SELECT 
                    a.id AS application_id,
                    a.status,
                    a.applied_at,
                    cp.full_name AS candidate_name,
                    cp.avatar AS candidate_avatar,
                    j.title AS applied_job,
                    j.employment_type,
                    cv.file_url AS cv_url,
                    GROUP_CONCAT(s.skill_name SEPARATOR ', ') AS skills
                FROM application a
                JOIN Job j ON a.job_id = j.id
                JOIN Candidate_Profile cp ON a.candidate_id = cp.user_id
                JOIN candidate_cv cv ON a.cv_id = cv.id
                LEFT JOIN Candidate_Skill s ON cp.user_id = s.candidate_id
                WHERE j.company_id = ?
                GROUP BY a.id, cp.full_name, cp.avatar, j.title, j.employment_type, cv.file_url
                ORDER BY a.applied_at DESC
            `, [companyId]);

            connection.release();
            return res.status(200).json(rows);

        } catch (dbError) {
            connection.release();
            return res.status(500).json({ message: "Database query error" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { companyId } = req.user;

    const validStatuses = ['Applied', 'In-Review', 'Interview', 'Hired', 'Rejected'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    try {
        const connection = await pool.getConnection();

        try {
            const [application] = await connection.execute(`
                SELECT a.id 
                FROM application a
                JOIN Job j ON a.job_id = j.id
                WHERE a.id = ? AND j.company_id = ?
            `, [id, companyId]);

            if (application.length === 0) {
                connection.release();
                return res.status(403).json({ message: "Unauthorized or application not found" });
            }

            await connection.execute(
                'UPDATE application SET status = ? WHERE id = ?',
                [status, id]
            );

            connection.release();
            return res.status(200).json({ message: "Status updated successfully", status });

        } catch (dbError) {
            connection.release();
            return res.status(500).json({ message: "Database query error" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};