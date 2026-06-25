import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ApplyModal from '../ApplyModal/ApplyModal';
import './JobDetail.css';
import ApplySuccess from '../../components/Modal/ApplySuccess/ApplySuccess'; 
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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


  const handleApplyJob = async () => {
    setIsApplying(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ job_id: job.id })
      });

      if (response.ok) {
        setIsModalOpen(true);
      } else {
        alert("Failed to apply. Please try again.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsApplying(false);
    }
  };


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
    <div className="job-detail-page-container">
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
              <span className="jd-badge badge-salary">{formatSalary()}</span>
              <span className="jd-badge badge-location">{job.loc || 'Location updating'}</span>
              <span className="jd-badge badge-experience">{job?.job_type || 'Not specified'}</span>
            </div>
          </div>
        </div>

        <div className="job-detail-card-action">
          <p className="job-detail-card-deadline">
            Deadline: {new Date(job.deadline).toLocaleDateString('en-GB')}
          </p>
          {hasApplied ? (
            <button className="job-detail-card-btn onClick={handleApplyJob} applied" disabled>
              Applied
            </button>
          ) : (
            <button className="job-detail-card-btn" onClick={handleApplyClick}>
              Apply Now
            </button>
          )}
        </div>
      </div>

      <div className="job-detail-bottom-content">
        <div className="job-detail-main-section">
          <h2 className="job-detail-section-title">Job Description</h2>
          <div className="job-detail-text-block">{job.description}</div>
        </div>
        
        {job.requirements && (
          <div className="job-detail-main-section">
            <h2 className="job-detail-section-title">Requirements</h2>
            <div className="job-detail-text-block">{job.requirements}</div>
          </div>
        )}
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
            if (msg.includes('already applied')) {
              setHasApplied(true);
              saveAppliedJobId(id);
            }
            showToast(msg, 'error');
          }}
        />
      )}
      <ApplySuccess 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        job={job} 
      />
    </div>
  );
}