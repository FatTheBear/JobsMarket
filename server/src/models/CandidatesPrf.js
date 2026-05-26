const pool = require('../config/db');

const CandidateProfileModel = {
    create: async (user_id, full_name) => {
        const [result] = await pool.execute(
            'INSERT INTO Candidate_Profile (user_id, full_name) VALUES (?, ?)',
            [user_id, full_name]
        );
        return result.insertId;
    }
};

module.exports = CandidateProfileModel;