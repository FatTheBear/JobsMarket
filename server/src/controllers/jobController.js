const user_id = req.user?.id || req.userId;


const [companyRows] = await db.query(
    "SELECT id FROM company WHERE user_id = ?",
    [user_id]
);


if(companyRows.length === 0){
    return res.status(400).json({
        message:"This account is not linked with a company"
    });
}


const company_id = companyRows[0].id;


const [jobResult] = await db.query(
`
INSERT INTO job_posting
(
 company_id,
 title,
 description,
 requirements,
 salary_min,
 salary_max,
 job_type,
 status
)

VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')

`,
[
 company_id,
 title,
 description || null,
 requirements || null,
 salary_min || null,
 salary_max || null,
 job_type || 'Full-time'
]
);
const job_id = jobResult.insertId;

return res.status(201).json({
    message: "Job posted successfully! Your job is waiting for Admin approval.",
    jobId: job_id
});