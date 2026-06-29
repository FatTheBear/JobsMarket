const pool = require('../config/db');
const { sendInterviewInvitation, sendHiredCongratulations } = require('../services/email/emailServices');
exports.getAppliedCandidates = async (req, res) => {
    const userId = req.user.id; 

    try {
        const connection = await pool.getConnection();

        try {
            // Lấy companyId của HR hiện tại từ hr_id (userId)
            const [companyRows] = await connection.execute(
                'SELECT id FROM Company WHERE hr_id = ?',
                [userId]
            );

            if (companyRows.length === 0) {
                connection.release();
                return res.status(404).json({ message: "Company profile not found for this HR" });
            }
            const companyId = companyRows[0].id;

            // Thực hiện truy vấn danh sách ứng viên ứng tuyển vào công ty này
            const [rows] = await connection.execute(`
                SELECT 
                    a.id AS application_id,
                    a.status,
                    a.applied_at,
                    cp.id AS candidate_id,
                    cp.full_name AS candidate_name,
                    cp.avatar_url AS candidate_avatar,
                    j.title AS applied_job,
                    j.job_type AS employment_type,
                    cv.file_url AS cv_url,
                    GROUP_CONCAT(s.skill_name SEPARATOR ', ') AS skills
                FROM application a
                JOIN Job_Posting j ON a.job_id = j.id
                JOIN Candidate_Profile cp ON a.candidate_id = cp.id
                JOIN candidate_cv cv ON a.cv_id = cv.id
                LEFT JOIN candidate_skill cs ON cp.id = cs.candidate_id
                LEFT JOIN skill s ON cs.skill_id = s.id
                WHERE j.company_id = ?
                GROUP BY a.id, cp.id, cp.full_name, cp.avatar_url, j.title, j.job_type, cv.file_url
                ORDER BY a.applied_at DESC
            `, [companyId]);

            connection.release();
            return res.status(200).json(rows);

        } catch (dbError) {
            console.error("Database query error:", dbError);
            connection.release();
            return res.status(500).json({ message: "Database query error" });
        }
    } catch (error) {
        console.error("Internal server error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// exports.updateApplicationStatus = async (req, res) => {
//     const { id } = req.params;
//     const { status, interviewDate, interviewTime } = req.body;
//     const userId = req.user.id;

//     const validStatuses = ['Reviewing', 'Interviewing', 'Rejected'];
    
//     if (!validStatuses.includes(status)) {
//         return res.status(400).json({ message: "Invalid status value" });
//     }

//     try {
//         const connection = await pool.getConnection();

//         try {
//             const [companyRows] = await connection.execute(
//                 'SELECT id FROM Company WHERE hr_id = ?',
//                 [userId]
//             );

//             if (companyRows.length === 0) {
//                 connection.release();
//                 return res.status(404).json({ message: "Company profile not found for this HR" });
//             }
//             const companyId = companyRows[0].id;

//             const [application] = await connection.execute(`
//                 SELECT a.id 
//                 FROM application a
//                 JOIN Job_Posting j ON a.job_id = j.id
//                 WHERE a.id = ? AND j.company_id = ?
//             `, [id, companyId]);

//             if (application.length === 0) {
//                 connection.release();
//                 return res.status(403).json({ message: "Unauthorized or application not found" });
//             }

//             await connection.execute(
//                 'UPDATE application SET status = ? WHERE id = ?',
//                 [status, id]
//             );

//             const [appDetails] = await connection.execute(`
//                 SELECT 
//                     cp.user_id, 
//                     u.email AS candidateEmail,
//                     cp.full_name AS candidateName,
//                     j.title AS job_title, 
//                     c.name AS company_name,
//                     c.address AS companyAddress
//                 FROM application a
//                 JOIN Candidate_Profile cp ON a.candidate_id = cp.id
//                 JOIN User u ON cp.user_id = u.id
//                 JOIN Job_Posting j ON a.job_id = j.id
//                 JOIN Company c ON j.company_id = c.id
//                 WHERE a.id = ?
//             `, [id]);

//             if (appDetails.length > 0) {
//                 const data = appDetails[0];

//                 const statusTitleMap = {
//                     'Reviewing': '📋 Application In Review',
//                     'Interviewing': '🎯 Interview Invitation',
//                     'Rejected': '📝 Application Update'
//                 };
//                 const notiTitle = statusTitleMap[status] || '📨 Application Status Updated';
//                 const notiContent = `Your application for "${data.job_title}" at ${data.company_name} has been updated to: ${status}.`;

//                 await connection.execute(
//                     'INSERT INTO Notification (user_id, title, content) VALUES (?, ?, ?)',
//                     [data.user_id, notiTitle, notiContent]
//                 );

//                 if (status === 'Interviewing') {
//                     const emailData = {
//                         candidateName: data.candidateName,
//                         companyName: data.company_name,
//                         jobTitle: data.job_title,
//                         interviewDate: interviewDate || 'TBA',
//                         interviewTime: interviewTime || 'TBA',
//                         interviewLocation: data.companyAddress
//                     };
                    
//                     sendInterviewInvitation(data.candidateEmail, emailData).catch(err => console.error(err));
//                 }
//             }

//             connection.release();
//             return res.status(200).json({ message: "Status updated successfully", status });

//         } catch (dbError) {
//             connection.release();
//             return res.status(500).json({ message: "Database query error" });
//         }
//     } catch (error) {
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };

exports.updateApplicationStatus = async (req, res) => {
    const { id } = req.params;
    const { status, interviewDate, interviewTime } = req.body;
    const userId = req.user.id;

    const validStatuses = ['Reviewing', 'Interviewing', 'Rejected', 'Offered'];
    
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    try {
        const connection = await pool.getConnection();
        let mailReport = "Chưa kích hoạt";

        try {
            const [companyRows] = await connection.execute(
                'SELECT id FROM Company WHERE hr_id = ?',
                [userId]
            );

            if (companyRows.length === 0) {
                connection.release();
                return res.status(404).json({ message: "Company profile not found for this HR" });
            }
            const companyId = companyRows[0].id;

            const [application] = await connection.execute(`
                SELECT a.id 
                FROM application a
                JOIN Job_Posting j ON a.job_id = j.id
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

            const [appDetails] = await connection.execute(`
                SELECT 
                    cp.user_id, 
                    u.email AS candidateEmail,
                    cp.full_name AS candidateName,
                    j.title AS job_title, 
                    c.name AS company_name,
                    c.address AS companyAddress
                FROM application a
                JOIN Candidate_Profile cp ON a.candidate_id = cp.id
                JOIN User u ON cp.user_id = u.id
                JOIN Job_Posting j ON a.job_id = j.id
                JOIN Company c ON j.company_id = c.id
                WHERE a.id = ?
            `, [id]);

            if (appDetails.length > 0) {
                const data = appDetails[0];

                const statusTitleMap = {
                    'Reviewing': '📋 Application In Review',
                    'Interviewing': '🎯 Interview Invitation',
                    'Rejected': '❌ CV Rejected',
                    'Offered': '🎉 Congratulations! You\'ve been hired'
                };
                const statusContentMap = {
                    'Reviewing': `Your application for "${data.job_title}" at ${data.company_name} is now being reviewed.`,
                    'Interviewing': `You have been invited to interview for "${data.job_title}" at ${data.company_name}. Check your email for details.`,
                    'Rejected': `Unfortunately, your CV for "${data.job_title}" at ${data.company_name} was not selected this time. Keep exploring new opportunities!`,
                    'Offered': `Great news! ${data.company_name} has offered you the "${data.job_title}" position. Check your email for next steps.`
                };
                const notiTitle = statusTitleMap[status] || '📨 Application Status Updated';
                const notiContent = statusContentMap[status] || `Your application for "${data.job_title}" at ${data.company_name} has been updated to: ${status}.`;

                await connection.execute(
                    'INSERT INTO Notification (user_id, title, content) VALUES (?, ?, ?)',
                    [data.user_id, notiTitle, notiContent]
                );

                const io = req.app.get('socketio');
                if (io) {
                    io.to(`user_${data.user_id}`).emit('notification', {
                        title: notiTitle,
                        content: notiContent
                    });
                }

                if (status === 'Interviewing') {
                    const emailData = {
                        candidateName: data.candidateName,
                        companyName: data.company_name,
                        jobTitle: data.job_title,
                        interviewDate: interviewDate || 'TBA',
                        interviewTime: interviewTime || 'TBA',
                        interviewLocation: data.companyAddress || 'TBA'
                    };
                    
                    try {
                        await sendInterviewInvitation(data.candidateEmail, emailData);
                        mailReport = `Send successfully ${data.candidateEmail}`;
                    } catch (err) {
                        mailReport = `mail error: ${err.message}`;
                    }
                }

                if (status === 'Offered') {
                    const emailData = {
                        candidateName: data.candidateName,
                        companyName: data.company_name,
                        jobTitle: data.job_title
                    };

                    try {
                        await sendHiredCongratulations(data.candidateEmail, emailData);
                        mailReport = `Hired email sent to ${data.candidateEmail}`;
                    } catch (err) {
                        mailReport = `mail error: ${err.message}`;
                    }
                }
            } else {
                mailReport = "SQL error - cannot get candidate";
            }

            connection.release();
            return res.status(200).json({ 
                message: "Status updated successfully", 
                status, 
                mailReport 
            });

        } catch (dbError) {
            connection.release();
            return res.status(500).json({ message: "Database query error", error: dbError.message });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};