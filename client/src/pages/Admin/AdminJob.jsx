import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, X, MapPin, Briefcase, Clock, Users, Calendar, DollarSign } from 'lucide-react';
import { useModal } from './useModal';

export default function AdminJob({ pendingJobs, onReviewJob }) {
  const { showAlert, showConfirm } = useModal();
  const [selectedJob, setSelectedJob] = useState(null); // job đang xem chi tiết

  // Duyệt / từ chối
  const handleAction = async (id, decision) => {
    const actionText = decision === 'Approved' ? 'approve' : 'reject';
    const confirmed = await showConfirm(`Are you sure you want to ${actionText} this job posting?`);
    if (!confirmed) return;
    try {
      await onReviewJob(id, decision);
      await showAlert(`Job has been ${actionText}ed successfully!`, "success");
      setSelectedJob(null); // đóng modal nếu đang mở
    } catch (error) {
      await showAlert(`Failed to ${actionText} the job. Please try again.`, "error");
    }
  };

  // Hiển thị lương gọn
  const formatSalary = (job) => {
    if (!job.salary_min && !job.salary_max) return 'Negotiable';
    return `${job.salary_min || 0} - ${job.salary_max || 'Negotiable'} USD`;
  };

  // Gộp địa chỉ
  const formatLocation = (job) => {
    return [job.exact_address, job.ward, job.district, job.province].filter(Boolean).join(', ') || 'Not specified';
  };

  // working_hours là chuỗi JSON -> hiển thị dễ đọc
  const formatWorkingHours = (raw) => {
    if (!raw) return null;
    try {
      const wh = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const parts = [];
      if (wh.type) parts.push(wh.type);
      if (wh.time) parts.push(wh.time);
      return parts.join(' • ') || null;
    } catch {
      return typeof raw === 'string' ? raw : null;
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
                <p><strong>Company:</strong> {job.company_name} | <strong>HR:</strong> {job.hr_email || 'N/A'}</p>
                <p><strong>Salary:</strong> {formatSalary(job)} | <strong>Type:</strong> {job.job_type || 'N/A'}</p>
                {job.skills && <p><strong>Skills:</strong> {job.skills}</p>}
              </div>
              <div className="btn-group">
                <button onClick={() => setSelectedJob(job)} className="btn-approve" style={{ background: '#475569' }}>
                  <Eye size={16} /> View Details
                </button>
                <button onClick={() => handleAction(job.id, 'Approved')} className="btn-approve">
                  <CheckCircle size={16} /> Approve
                </button>
                <button onClick={() => handleAction(job.id, 'Rejected')} className="btn-reject">
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Modal chi tiết ──────────────────────────────── */}
      {selectedJob && (
        <div
          onClick={() => setSelectedJob(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 12, width: 680, maxWidth: '100%',
              maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}
          >
            {/* Header */}
            <div style={{
              position: 'sticky', top: 0, background: '#01796F', color: '#fff',
              padding: '20px 24px', borderRadius: '12px 12px 0 0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20 }}>{selectedJob.title}</h2>
                <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: 14 }}>
                  {selectedJob.company_name}
                </p>
              </div>
              <button onClick={() => setSelectedJob(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: 24 }}>
              {/* Quick facts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <Fact icon={<DollarSign size={16} />} label="Salary" value={formatSalary(selectedJob)} />
                <Fact icon={<Briefcase size={16} />} label="Type" value={selectedJob.job_type || 'N/A'} />
                <Fact icon={<Users size={16} />} label="Vacancies" value={selectedJob.vacancies || 'N/A'} />
                <Fact icon={<Clock size={16} />} label="Experience" value={selectedJob.experience_req || 'N/A'} />
                <Fact icon={<Briefcase size={16} />} label="Level" value={selectedJob.job_level || 'N/A'} />
                <Fact icon={<Calendar size={16} />} label="Deadline" value={selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString() : 'N/A'} />
              </div>

              <Section title="HR Email" value={selectedJob.hr_email || 'N/A'} />
              <Section title="Location" value={formatLocation(selectedJob)} icon={<MapPin size={14} />} />
              {formatWorkingHours(selectedJob.working_hours) && (
                <Section title="Working Hours" value={formatWorkingHours(selectedJob.working_hours)} />
              )}

              {/* Requirements khác */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
                {selectedJob.gender_req && selectedJob.gender_req !== 'Any' && <Tag>Gender: {selectedJob.gender_req}</Tag>}
                {selectedJob.age_req && <Tag>Age: {selectedJob.age_req}</Tag>}
                {selectedJob.language_req && selectedJob.language_req !== 'Any' && <Tag>Language: {selectedJob.language_req}</Tag>}
              </div>

              {selectedJob.skills && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ margin: '0 0 8px', color: '#01796F' }}>Required Skills</h4>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {selectedJob.skills.split(', ').map((s, i) => <Tag key={i} color="#01796F">{s}</Tag>)}
                  </div>
                </div>
              )}

              {selectedJob.industries && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ margin: '0 0 8px', color: '#01796F' }}>Industries</h4>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {selectedJob.industries.split(', ').map((s, i) => <Tag key={i}>{s}</Tag>)}
                  </div>
                </div>
              )}

              <Block title="Job Description" value={selectedJob.description} />
              <Block title="Requirements" value={selectedJob.requirements} />

              <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 16 }}>
                Created: {selectedJob.created_at ? new Date(selectedJob.created_at).toLocaleString() : 'N/A'}
              </p>
            </div>

            {/* Footer actions */}
            <div style={{
              position: 'sticky', bottom: 0, background: '#f8fafc', borderTop: '1px solid #e2e8f0',
              padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: 10,
            }}>
              <button onClick={() => handleAction(selectedJob.id, 'Rejected')} className="btn-reject">
                <XCircle size={16} /> Reject
              </button>
              <button onClick={() => handleAction(selectedJob.id, 'Approved')} className="btn-approve">
                <CheckCircle size={16} /> Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components nhỏ ───────────────────────────────
const Fact = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '10px 12px', borderRadius: 8 }}>
    <span style={{ color: '#01796F' }}>{icon}</span>
    <div>
      <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{value}</div>
    </div>
  </div>
);

const Section = ({ title, value, icon }) => (
  <div style={{ marginBottom: 12 }}>
    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
      {icon} {title}:
    </span>{' '}
    <span style={{ fontSize: 14, color: '#1e293b' }}>{value}</span>
  </div>
);

// ─── Block có Read more / Read less ───────────────────────────────
const Block = ({ title, value }) => {
  const [expanded, setExpanded] = useState(false);

  const text = value || 'Not provided';
  const LIMIT = 200; // số ký tự hiển thị khi thu gọn
  const isLong = text.length > LIMIT;
  const shown = expanded || !isLong ? text : text.slice(0, LIMIT) + '...';

  return (
    <div style={{ marginBottom: 16 }}>
      <h4 style={{ margin: '0 0 6px', color: '#01796F' }}>{title}</h4>
      <p style={{
        margin: 0, fontSize: 14, color: '#475569', lineHeight: 1.6,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere',
      }}>
        {shown}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            marginTop: 6, background: 'none', border: 'none', cursor: 'pointer',
            color: '#01796F', fontWeight: 600, fontSize: 13, padding: 0,
          }}
        >
          {expanded ? 'Read less ▲' : 'Read more ▼'}
        </button>
      )}
    </div>
  );
};

const Tag = ({ children, color }) => (
  <span style={{
    background: color ? color : '#e2e8f0',
    color: color ? '#fff' : '#475569',
    padding: '4px 12px', borderRadius: 16, fontSize: 13, fontWeight: 500,
  }}>
    {children}
  </span>
);