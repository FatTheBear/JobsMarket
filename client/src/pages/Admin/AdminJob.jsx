import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useModal } from './useModal'; // Nhớ kiểm tra đường dẫn file này

export default function AdminJob({ pendingJobs, onReviewJob }) {
  const { showAlert, showConfirm } = useModal();

  // Hàm xử lý việc duyệt hoặc từ chối công việc
  const handleAction = async (id, decision) => {
    const actionText = decision === 'Approved' ? 'approve' : 'reject';
    
    // Hiển thị xác nhận trước khi thực hiện
    const confirmed = await showConfirm(`Are you sure you want to ${actionText} this job posting?`);
    if (!confirmed) return;

    try {
      // Gọi hàm onReviewJob truyền từ component cha (AdminDashboard)
      await onReviewJob(id, decision);
      await showAlert(`Job has been ${actionText}ed successfully!`, "success");
    } catch (error) {
      await showAlert(`Failed to ${actionText} the job. Please try again.`, "error");
    }
  };

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
                <button 
                  onClick={() => handleAction(job.id, 'Approved')} 
                  className="btn-approve"
                >
                  <CheckCircle size={16} /> Approve
                </button>
                <button 
                  onClick={() => handleAction(job.id, 'Rejected')} 
                  className="btn-reject"
                >
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}