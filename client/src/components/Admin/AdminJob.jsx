import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminJob({ pendingJobs, onReviewJob }) {
  return (
    <div>
      <h1 className="admin-title">Phê Duyệt Tin Việc Làm Chờ Duyệt</h1>
      {pendingJobs.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', color: '#64748b' }}>
          🎉 Hiện tại không có bài đăng nào đang chờ duyệt.
        </div>
      ) : (
        <div className="job-list">
          {pendingJobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-info">
                <h3>{job.title}</h3>
                <p><strong>Doanh nghiệp:</strong> {job.company_name} | <strong>HR:</strong> {job.hr_email}</p>
                <p><strong>Mức lương:</strong> {job.salary_min || 0} - {job.salary_max || 'Thỏa thuận'} USD</p>
                <div className="job-desc">
                  <strong>Mô tả công việc:</strong><br />{job.description}
                </div>
              </div>
              <div className="btn-group">
                <button onClick={() => onReviewJob(job.id, 'Approved')} className="btn-approve"><CheckCircle size={16} /> Duyệt</button>
                <button onClick={() => onReviewJob(job.id, 'Rejected')} className="btn-reject"><XCircle size={16} /> Từ Chối</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}