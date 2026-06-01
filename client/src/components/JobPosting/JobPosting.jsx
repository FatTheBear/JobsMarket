import React, { useState } from 'react';
import './JobPosting.css';
import JobSkillsManager from '../JobSkillsManager/JobSkillsManager';

const API_URL = 'http://localhost:5000';
const TEMP_HR_ID = 1; // Tạm thời khớp với file CompanyProfile

// Helper: lấy ngày hôm nay dạng yyyy-mm-dd
const todayStr = () => new Date().toISOString().split('T')[0];

export default function JobPosting() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    salary_min: '',
    salary_max: '',
    job_type: 'Full-time',
    deadline: '',
  });
  const [toast, setToast]       = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading]   = useState(false);
  const [postedJobId, setPostedJobId] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate title
    if (!form.title.trim()) {
      showToast('Job title is required', 'error');
      return;
    }

    // Validate salary range
    if (form.salary_min && form.salary_max) {
      if (parseInt(form.salary_min) > parseInt(form.salary_max)) {
        showToast('Minimum salary cannot exceed maximum salary', 'error');
        return;
      }
    }
    if (form.salary_min && parseInt(form.salary_min) < 0) {
      showToast('Salary cannot be negative', 'error');
      return;
    }

    // Validate deadline
    if (form.deadline && form.deadline < todayStr()) {
      showToast('Deadline must be today or later', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        hr_id: TEMP_HR_ID,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
        deadline: form.deadline || null,
      };

      const res = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Job posted! Now add required skills below 👇', 'success');
        setPostedJobId(data.jobId);
        setForm({
          title: '',
          description: '',
          requirements: '',
          salary_min: '',
          salary_max: '',
          job_type: 'Full-time',
          deadline: '',
        });
      } else {
        showToast(data.message || 'Error posting job', 'error');
      }
    } catch {
      showToast('Cannot connect to the server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnother = () => {
    setPostedJobId(null);
  };

  return (
    <div className="job-posting-container">
      {/* Toast */}
      <div className={`jp-toast ${toast.show ? 'show' : ''} ${toast.type}`}>
        {toast.message}
      </div>

      <h1 className="page-title">Post a New Job</h1>
      <p className="page-subtitle">Find the best candidates for your company</p>

      {/* ---- FORM ---- */}
      {!postedJobId ? (
        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Job Title */}
            <div className="form-group">
              <label>Job Title <span className="required">*</span></label>
              <input
                type="text" name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. Senior Frontend Developer" required
              />
            </div>

            {/* Job Type + Deadline */}
            <div className="form-row">
              <div className="form-group half">
                <label>Job Type <span className="required">*</span></label>
                <select name="job_type" value={form.job_type} onChange={handleChange} required>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
              <div className="form-group half">
                <label>Application Deadline</label>
                <input
                  type="date" name="deadline" value={form.deadline}
                  onChange={handleChange} min={todayStr()}
                />
              </div>
            </div>

            {/* Salary */}
            <div className="form-row">
              <div className="form-group half">
                <label>Minimum Salary (USD)</label>
                <input
                  type="number" name="salary_min" value={form.salary_min}
                  onChange={handleChange} placeholder="e.g. 1000" min="0"
                />
              </div>
              <div className="form-group half">
                <label>Maximum Salary (USD)</label>
                <input
                  type="number" name="salary_max" value={form.salary_max}
                  onChange={handleChange} placeholder="e.g. 3000" min="0"
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Job Description</label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                placeholder="Describe the job responsibilities..." rows="5"
              />
            </div>

            {/* Requirements */}
            <div className="form-group">
              <label>Requirements</label>
              <textarea
                name="requirements" value={form.requirements} onChange={handleChange}
                placeholder="List the skills, experience, and qualifications needed..." rows="5"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Posting...' : '🚀 Post Job'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ---- SAU KHI ĐĂNG: hiện skills manager ---- */
        <div>
          <div className="jp-success-banner">
            ✅ Job posted successfully! Now add required skill tags to help candidates self-assess.
          </div>

          <JobSkillsManager jobId={postedJobId} />

          <div className="form-actions" style={{ marginTop: '24px' }}>
            <button className="btn-secondary" onClick={handlePostAnother}>
              ← Post Another Job
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
