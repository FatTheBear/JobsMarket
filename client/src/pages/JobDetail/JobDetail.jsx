import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ApplyModal from '../ApplyModal/ApplyModal';
import './JobDetail.css';
import { FaMoneyBillWave, FaMapMarkerAlt, FaHourglassHalf, FaPaperPlane } from 'react-icons/fa';
import ApplySuccess from '../../components/Modal/ApplySuccess/ApplySuccess';
import CompanyCard from '../DashBoard/UserDashboard/CompanyCard';

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
  const [isSaved, setIsSaved] = useState(false);

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
      let jobData = res.data;

      try {
        const skillsRes = await axios.get(`${API_URL}/api/skills/job/${id}`);
        if (skillsRes.data && skillsRes.data.length > 0) {
          jobData.fetchedSkills = skillsRes.data;
        }
      } catch (skillErr) {}
      
      try {
        const indRes = await axios.get(`${API_URL}/api/industry/job/${id}`);
        const indData = indRes.data.data || indRes.data;
        if (indData && indData.length > 0) {
          jobData.fetchedIndustries = indData;
        }
      } catch (indErr) {}

      setJob(jobData);
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
    const tokenStr = localStorage.getItem('token');
    if (!tokenStr) {
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
    } catch (e) {}
  }
  
  const displayIndustries = job?.fetchedIndustries || job?.industries || jobMeta?.industries || job?.selected_industries || jobMeta?.selected_industries || [];
  const displaySkills = job?.fetchedSkills || job?.skills || jobMeta?.skills || job?.selected_skills || jobMeta?.selected_skills || [];
  
  const toggleSaveJob = () => {
    setIsSaved(!isSaved);
  };
  
  const getDaysLeft = (deadline) => {
    if (!deadline) return 0;
    const today = new Date();
    const dlDate = new Date(deadline);
    const diffTime = dlDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="job-detail-page-container">
      <div className={`jd-toast ${toast.show ? 'show' : ''} ${toast.type}`}>
        {toast.msg}
      </div>

      <button type="button" className="jd-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px', alignItems: 'stretch' }}>

        <div className="job-detail-top-card layout-v2" style={{ margin: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 className="job-detail-card-title">{job.title}</h1>

          <div className="job-info-grid">
            <div className="info-item">
              <div className="icon-circle">
                <FaMoneyBillWave />
              </div>
              <div className="info-text">
                <span className="info-label">Salary</span>
                <strong className="info-value">{formatSalary()}</strong>
              </div>
            </div>

            <div className="info-item">
              <div className="icon-circle">
                <FaMapMarkerAlt />
              </div>
              <div className="info-text">
                <span className="info-label">Location</span>
                <strong className="info-value">{job.province || 'Updating'}</strong>
              </div>
            </div>

            <div className="info-item">
              <div className="icon-circle">
                <FaHourglassHalf />
              </div>
              <div className="info-text">
                <span className="info-label">Experience</span>
                <strong className="info-value">{job.exp_yrs || 'Not specified'}</strong>
              </div>
            </div>
          </div>

          {job.deadline && (
            <div className="job-deadline-container">
              <span className="deadline-text">Application deadline: </span>
              <strong>{new Date(job.deadline).toLocaleDateString('en-GB')} </strong>
              <span className="days-left">({getDaysLeft(job.deadline)} days left)</span>
            </div>
          )}

          <div className="job-action-full">
            {hasApplied ? (
              <button className="job-apply-btn-full applied" disabled>
                Applied
              </button>
            ) : (
              <button className="job-apply-btn-full" onClick={handleApplyClick}>
                <FaPaperPlane className="btn-icon" /> Apply Now
              </button>
            )}
            <button
              className={`job-save-btn ${isSaved ? 'saved' : ''}`}
              onClick={toggleSaveJob}
              type="button"
            >
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        <CompanyCard
          company={{
            id: job?.company_id,
            name: job?.company_name,
            logo_url: job?.company_logo || job?.logo_url,
            size: job?.company_size,
            industry_name: job?.industry_name,
            address: job?.company_address
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px', marginTop: '24px', alignItems: 'start' }}>
        <div className="job-detail-bottom-content">
          <div className="job-detail-main-section">
            <h2 className="job-detail-section-title-v2">Job Details</h2>

            {displayIndustries.length > 0 && (
              <div className="job-tags-row">
                <span className="job-tags-label">Industry:</span>
                <div className="job-tags-list">
                  {displayIndustries.map((ind) => (
                    <span className="job-tag-item" key={ind.id || ind}>
                      {ind.name || ind}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {displaySkills.length > 0 && (
              <div className="job-tags-row">
                <span className="job-tags-label">Skills:</span>
                <div className="job-tags-list">
                  {displaySkills.map((skill) => (
                    <span className="job-tag-item" key={skill.id || skill}>
                      {skill.skill_name || skill.name || skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '32px' }}>
              <h2 className="job-detail-section-title-v2">Job Description</h2>
              <div className="job-detail-text-block">
                {job.description || "Information is being updated."}
              </div>
            </div>

            <div style={{ marginTop: '32px' }}>
              <h2 className="job-detail-section-title-v2">Job Requirements</h2>
              <div className="job-detail-text-block">
                {job.requirements || "Information is being updated."}
              </div>
            </div>

            <div style={{ marginTop: '32px' }}>
              <h2 className="job-detail-section-title-v2">Benefits</h2>
              <div className="job-detail-text-block">
                {job.benf || "Information is being updated."}
              </div>
            </div>
          </div>

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

        <div></div>
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