import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminJob({ pendingJobs, onReviewJob }) {
  return (
    <div>
      <h1 className="admin-title">Approve Pending Job Postings</h1>
      {pendingJobs.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', color: '#64748b' }}>
          🎉 There are currently no job postings awaiting approval.
        </div>
      ) : (
        <div className="job-list">
          {pendingJobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-info">
                <h3>{job.title}</h3>
                <p><strong>Company:</strong> {job.company_name} | <strong>HR:</strong> {job.hr_email}</p>
                <p><strong>Salary:</strong> {job.salary_min || 0} - {job.salary_max || 'Negotiable'} USD</p>
                <div className="job-desc">
                  <strong>Job Description:</strong><br />{job.description}
                </div>
              </div>
              <div className="btn-group">
                <button onClick={() => onReviewJob(job.id, 'Approved')} className="btn-approve"><CheckCircle size={16} /> Approve</button>
                <button onClick={() => onReviewJob(job.id, 'Rejected')} className="btn-reject"><XCircle size={16} /> Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}