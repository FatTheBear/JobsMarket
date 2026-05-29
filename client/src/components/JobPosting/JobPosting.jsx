import React, { useState } from 'react';
import './JobPosting.css';

const API_URL = 'http://localhost:5000';
const TEMP_HR_ID = 1; // Tạm thời khớp với file CompanyProfile

export default function JobPosting() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    salary_min: '',
    salary_max: '',
    job_type: 'Full-time'
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        hr_id: TEMP_HR_ID,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null
      };

      const res = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Job posted successfully!', 'success');
        setForm({
          title: '',
          description: '',
          requirements: '',
          salary_min: '',
          salary_max: '',
          job_type: 'Full-time'
        });
      } else {
        showToast(data.message || 'Error posting job', 'error');
      }
    } catch (err) {
      showToast('Cannot connect to the server', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-posting-container">
      <div className={`toast ${toast.show ? 'show' : ''} ${toast.type}`}>
        {toast.message}
      </div>

      <h1 className="page-title">Post a New Job</h1>
      <p className="page-subtitle">Find the best candidates for your company</p>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Job Title <span className="required">*</span></label>
            <input 
              type="text" name="title" value={form.title} onChange={handleChange}
              placeholder="e.g. Senior Frontend Developer" required 
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Job Type <span className="required">*</span></label>
              <select name="job_type" value={form.job_type} onChange={handleChange} required>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Minimum Salary (USD)</label>
              <input 
                type="number" name="salary_min" value={form.salary_min} onChange={handleChange}
                placeholder="e.g. 1000" min="0" 
              />
            </div>
            <div className="form-group half">
              <label>Maximum Salary (USD)</label>
              <input 
                type="number" name="salary_max" value={form.salary_max} onChange={handleChange}
                placeholder="e.g. 3000" min="0" 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Job Description</label>
            <textarea 
              name="description" value={form.description} onChange={handleChange}
              placeholder="Describe the job responsibilities..." rows="5"
            />
          </div>

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
    </div>
  );
}
