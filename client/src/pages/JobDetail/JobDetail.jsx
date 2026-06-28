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
    } catch { }
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
  let jobMeta = {};
  if (job && job.metadata) {
    try {
      jobMeta = typeof job.metadata === 'string' ? JSON.parse(job.metadata) : job.metadata;
    } catch (e) {
      console.error("Error parsing job metadata:", e);
    }
  }

  return (
    <div className="job-detail-page-container">
      <div className={`jd-toast ${toast.show ? 'show' : ''} ${toast.type}`}>
        {toast.msg}
      </div>
      <button className="jd-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className="job-detail-top-card">
        <div className="job-detail-card-header">
          <img
            src={job.logo_url || '/img/default-avatar.png'}
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
          {job.deadline && (
            <p className="job-detail-card-deadline">
              Deadline: {new Date(job.deadline).toLocaleDateString('en-GB')}
            </p>
          )}
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

      <div className="job-detail-bottom-content">
        <div className="job-detail-main-section" style={{ marginBottom: '32px' }}>
          <h2 className="job-detail-section-title" style={{ color: '#1f2937', fontSize: '20px', borderBottom: '2px solid #01796F', display: 'inline-block', paddingBottom: '8px', marginBottom: '16px' }}>
            Job Description
          </h2>
          <div 
            className="job-detail-text-block" 
            style={{ whiteSpace: 'pre-line', lineHeight: '1.8', color: '#4b5563', fontSize: '16px' }}
          >
            {job.description || "Information is being updated."}
          </div>
        </div>

        {job.requirements && (
          <div className="job-detail-main-section" style={{ marginBottom: '32px' }}>
            <h2 className="job-detail-section-title" style={{ color: '#1f2937', fontSize: '20px', borderBottom: '2px solid #01796F', display: 'inline-block', paddingBottom: '8px', marginBottom: '16px' }}>
              Job Requirements
            </h2>
            <div 
              className="job-detail-text-block" 
              style={{ whiteSpace: 'pre-line', lineHeight: '1.8', color: '#4b5563', fontSize: '16px' }}
            >
              {job.requirements}
            </div>
          </div>
        )}
        {job.company_description && (
          <div className="job-detail-main-section company-info-section" style={{ marginTop: '40px', borderTop: '1px solid #eaeaea', paddingTop: '30px' }}>
            <h2 className="job-detail-section-title">About the Company</h2>
            <div style={{ backgroundColor: '#f9fafb', padding: '24px', borderRadius: '8px', marginTop: '16px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '20px' }}>{job.company_name}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {job.company_size && (
                  <div>
                    <span style={{ color: '#6b7280', fontSize: '14px', display: 'block' }}>Company Size</span>
                    <strong style={{ color: '#374151' }}>{job.company_size} Employees</strong>
                  </div>
                )}
                {job.company_website && (
                  <div>
                    <span style={{ color: '#6b7280', fontSize: '14px', display: 'block' }}>Website</span>
                    <a href={job.company_website} target="_blank" rel="noopener noreferrer" style={{ color: '#01796F', fontWeight: 'bold', textDecoration: 'none' }}>
                      Visit Website ↗
                    </a>
                  </div>
                )}
                {job.company_address && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px', display: 'block' }}>Headquarters</span>
                    <strong style={{ color: '#374151' }}>{job.company_address}</strong>
                  </div>
                )}
              </div>

              <div style={{ color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {job.company_description}
              </div>
            </div>
          </div>
        )}
        <div className="job-detail-main-section" style={{ marginTop: '25px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 className="job-detail-section-title" style={{ fontSize: '18px', marginBottom: '15px', color: '#333' }}>Job Information Details</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {jobMeta.job_level && (
            <div style={{ padding: '10px', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#6b7280', fontSize: '14px', display: 'block' }}>Job Level</span>
              <strong style={{ color: '#374151' }}>{jobMeta.job_level}</strong>
            </div>
          )}
          
          {jobMeta.vacancies && (
            <div style={{ padding: '10px', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#6b7280', fontSize: '14px', display: 'block' }}>Number of Vacancies</span>
              <strong style={{ color: '#374151' }}>{jobMeta.vacancies} positions</strong>
            </div>
          )}

          {job.lang_req && (
            <div style={{ padding: '10px', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#6b7280', fontSize: '14px', display: 'block' }}>Language Requirement</span>
              <strong style={{ color: '#374151' }}>{job.lang_req}</strong>
            </div>
          )}

          {jobMeta.gender_req && (
            <div style={{ padding: '10px', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#6b7280', fontSize: '14px', display: 'block' }}>Gender Requirement</span>
              <strong style={{ color: '#374151' }}>{jobMeta.gender_req}</strong>
            </div>
          )}

          {job.age_req && (
            <div style={{ padding: '10px', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#6b7280', fontSize: '14px', display: 'block' }}>Age Requirement</span>
              <strong style={{ color: '#374151' }}>{job.age_req}</strong>
            </div>
          )}

          {job.exp_yrs && (
            <div style={{ padding: '10px', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#6b7280', fontSize: '14px', display: 'block' }}>Experience</span>
              <strong style={{ color: '#374151' }}>{job.exp_yrs}</strong>
            </div>
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