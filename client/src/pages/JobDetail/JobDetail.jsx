import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ApplyModal from '../ApplyModal/ApplyModal';
import './JobDetail.css';

const API_URL = 'http://localhost:5000';

const saveAppliedJobId = (jobId) => {
  const ids = JSON.parse(localStorage.getItem('appliedJobIds') || '[]');
  const numId = Number(jobId);
  if (!ids.includes(numId)) {
    localStorage.setItem('appliedJobIds', JSON.stringify([...ids, numId]));
  }
};

const isLocallyApplied = (jobId) => {
  const ids = JSON.parse(localStorage.getItem('appliedJobIds') || '[]');
  return ids.includes(Number(jobId));
};

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3500);
  };

  useEffect(() => {
    fetchJobDetail();
  }, [id]);

  useEffect(() => {
    if (job) {
      checkAppliedStatus(job.title);
    }
  }, [job, id]);

  const fetchJobDetail = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/jobs/${id}`);
      setJob(res.data);
    } catch (err) {
      showToast('Failed to load job information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkAppliedStatus = async (jobTitle) => {
    if (isLocallyApplied(id)) {
      setHasApplied(true);
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/candidate/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const alreadyApplied = (res.data || []).some(
        (app) => app.jobTitle === jobTitle
      );
      if (alreadyApplied) {
        setHasApplied(true);
        saveAppliedJobId(id);
      }
    } catch {}
  };

  const handleApplyClick = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      showToast('Please login to apply', 'error');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    setShowApplyModal(true);
  };

  const formatSalary = () => {
    if (job.job_type && job.job_type.toLowerCase().includes('intern')) {
      return 'Internship';
    }
    if (!job.salary_min && !job.salary_max) {
      return 'Negotiable';
    }
    if (job.salary_min && job.salary_max) {
      return `$${Number(job.salary_min).toLocaleString('en-US')} - $${Number(job.salary_max).toLocaleString('en-US')}`;
    }
    if (job.salary_min) {
      return `From $${Number(job.salary_min).toLocaleString('en-US')}`;
    }
    return `Up to $${Number(job.salary_max).toLocaleString('en-US')}`;
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  if (!job) return <div style={{ padding: '50px', textAlign: 'center' }}>Job not found</div>;

  return (
    <div className="job-detail-container">
      <div className={`jd-toast ${toast.show ? 'show' : ''} ${toast.type}`}>
        {toast.msg}
      </div>

      <div className="job-detail-top-card">
        <div className="job-detail-card-header">
          <img 
            src={job.logo_url || '/default-company-logo.png'} 
            alt="Company Logo" 
            className="job-detail-card-logo"
          />
          <div className="job-detail-card-meta">
            <h1 className="job-detail-card-title">{job.title}</h1>
            <p className="job-detail-card-company">{job.company_name}</p>
            <div className="job-detail-card-badges">
              <span className="jd-badge badge-salary">💰 {formatSalary()}</span>
              <span className="jd-badge badge-location">📍 {job.loc || 'Location updating'}</span>
              <span className="jd-badge badge-experience">💼 {job.experience || 'Not specified'}</span>
            </div>
          </div>
          <div className="job-header-action">
            {hasApplied ? (
              <button className="apply-btn applied" disabled>✓ Applied</button>
            ) : (
              <button className="apply-btn" onClick={handleApplyClick}>Apply Now</button>
            )}
          </div>
        </div>
      </div>

      <div className="job-content-grid">
        <div className="job-main-col">
          <div className="job-section">
            <h2>Job Description</h2>
            <p>{job.description}</p>
          </div>
          {job.requirements && (
            <div className="job-section">
              <h2>Requirements</h2>
              <p>{job.requirements}</p>
            </div>
          )}
          <div className="job-detail-card-action">
            <p className="job-detail-card-deadline">
              Deadline: {new Date(job.deadline).toLocaleDateString('en-GB')}
            </p>
            {hasApplied ? (
              <button className="job-detail-card-btn applied" disabled>
                Applied
              </button>
            ) : (
              <button className="job-detail-card-btn" onClick={handleApplyClick}>
                Apply Now
              </button>
            )}
          </div>
        </div>

        <div className="job-side-col">
          <div className="company-card">
            {job.logo_url ? (
              <img src={job.logo_url} alt="Company Logo" className="company-logo" />
            ) : (
              <div className="company-logo-placeholder">🏢</div>
            )}
            <h3>{job.company_name}</h3>
            {job.company_website && (
              <a href={job.company_website} target="_blank" rel="noreferrer" className="company-website-btn">
                Visit Website
              </a>
            )}
          </div>
        </div>
      </div>

      {showApplyModal && (
        <ApplyModal
          jobId={id}
          jobTitle={job.title}
          onClose={() => setShowApplyModal(false)}
          onSuccess={(msg) => {
            setShowApplyModal(false);
            setHasApplied(true);
            saveAppliedJobId(id);
            showToast(msg, 'success');
          }}
          onError={(msg) => {
            if (msg.includes('already applied') || msg.includes('đã ứng tuyển')) {
              setHasApplied(true);
              saveAppliedJobId(id);
            }
            showToast(msg, 'error');
          }}
        />
      )}
    </div>
  );
}