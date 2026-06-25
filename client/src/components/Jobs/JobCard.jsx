import React, { useState } from "react";
import './JobCard.css';
import axios from 'axios';



const removeAccents = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

const translateLocation = (name) => {
  if (!name) return '';
  const prefixes = [
    'Thành phố ', 'Tỉnh ', 'Quận ', 'Huyện ',
    'Thị xã ', 'Phường ', 'Xã ', 'Thị trấn '
  ];
  let result = name;
  for (const prefix of prefixes) {
    if (result.startsWith(prefix)) {
      result = result.slice(prefix.length);
      break;
    }
  }
  return removeAccents(result);
};

const API_URL = 'http://localhost:5000';

export default function JobCard({ job, onClick }) {
  const [imgError, setImgError] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState({ type: "", text: "" });
  const [myCVs, setMyCVs] = useState([]);
  const [isLoadingCVs, setIsLoadingCVs] = useState(false);

  const {
    id: jobId,
    title,
    company_name,
    logo_url,
    salary_min,
    salary_max,
    province,
    district,
    exact_address,
    job_type,
    deadline,
    experience_req,
    job_level,
  } = job;

  const getValidLogo = () => {
    if (imgError || !logo_url) return '/default-company-logo.png';
    if (logo_url.startsWith('data:image')) return logo_url;
    if (logo_url.startsWith('http')) return logo_url;
    return `${API_URL}${logo_url}`;
  };

  const formatSalary = () => {
    if (job_type && job_type.toLowerCase().includes('intern')) return 'Internship';
    if (!salary_min && !salary_max) return 'Negotiable';
    if (salary_min && salary_max) return `$${salary_min} - $${salary_max}`;
    if (salary_min) return `From $${salary_min}`;
    return `Up to $${salary_max}`;
  };

  const formatDeadline = () => {
    if (!deadline) return null;
    const d = new Date(deadline);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const fetchMyCVs = async () => {
    setIsLoadingCVs(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/candidate/cvs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyCVs(response.data);
    } catch (error) {
      setFeedbackMessage({ type: "danger", text: "Could not load your CVs. Please try again." });
    } finally {
      setIsLoadingCVs(false);
    }
  };

  const handleOpenApplyModal = (e) => {
    e.stopPropagation();
    setShowApplyModal(true);
    setFeedbackMessage({ type: "", text: "" });
    setSelectedCvId("");
    fetchMyCVs();
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setFeedbackMessage({ type: "", text: "" });
    if (!selectedCvId) return setFeedbackMessage({ type: "danger", text: "Please select a CV to apply." });
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/candidate/apply`, { jobId, cvId: selectedCvId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 201) {
        setFeedbackMessage({ type: "success", text: "Application submitted successfully!" });
        setTimeout(() => {
          setShowApplyModal(false);
          setSelectedCvId("");
          setFeedbackMessage({ type: "", text: "" });
        }, 2000);
      }
    } catch (error) {
      setFeedbackMessage({
        type: "danger",
        text: error.response?.data?.message || "Connection error! Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="job-card-container job-card-horizontal" onClick={onClick}>
        {/* LEFT: Logo */}
        <img
          className="job-card-logo"
          src={getValidLogo()}
          onError={() => setImgError(true)}
          alt="Company Logo"
        />

        {/* MIDDLE: Main info */}
        <div className="job-card-middle">
          <h3 className="job-card-title">{title || 'Untitled Job'}</h3>
          <p className="job-card-company">{company_name || 'Company name not provided'}</p>
          <div className="job-card-tags">
            <span className="job-tag tag-salary">{formatSalary()}</span>
            <span className="job-tag tag-location">
              📍 {province
                ? province.replace(/ Province| City/gi, '').trim()
                : district || exact_address || 'Updating'}            </span>            <span className="job-tag tag-type">{job_type || 'Full-time'}</span>
            {job_level && <span className="job-tag tag-level">{job_level}</span>}
            {experience_req && <span className="job-tag tag-exp">🎓 {experience_req}</span>}
          </div>
        </div>

        {/* RIGHT: Deadline + Apply button */}
        <div className="job-card-right">
          {formatDeadline() && (
            <p className="job-card-deadline">Deadline: {formatDeadline()}</p>
          )}
          <button
            className="job-card-apply-btn"
            onClick={handleOpenApplyModal}
          >
            Apply Now
          </button>
      <div className="job-card-footer">
        <div className="job-card-tags">
          <span className="job-tag tag-salary">{formatSalary()}</span>
          <span className="job-tag tag-location">{loc || 'Location updating'}</span>
          <span className="job-tag tag-type">{job_type || 'Full-time'}</span>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="apply-modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="apply-modal" onClick={e => e.stopPropagation()}>
            <div className="apply-modal-header">
              <h3>Apply for: {title}</h3>
              <button className="apply-modal-close" onClick={() => setShowApplyModal(false)}>✕</button>
            </div>
            <div className="apply-modal-body">
              {feedbackMessage.text && (
                <div className={`apply-feedback apply-feedback-${feedbackMessage.type}`}>
                  {feedbackMessage.text}
                </div>
              )}
              {isLoadingCVs ? (
                <p className="apply-loading">Loading your CVs...</p>
              ) : myCVs.length === 0 ? (
                <p className="apply-no-cv">You have no CVs uploaded yet. Please upload a CV in your profile first.</p>
              ) : (
                <div className="apply-cv-list">
                  <label className="apply-label">Select a CV to submit:</label>
                  {myCVs.map(cv => (
                    <label key={cv.id} className={`apply-cv-option ${selectedCvId === cv.id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="cv"
                        value={cv.id}
                        checked={selectedCvId === cv.id}
                        onChange={() => setSelectedCvId(cv.id)}
                      />
                      <span>{cv.cv_name}</span>
                      <span className="apply-cv-type">{cv.file_type}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="apply-modal-footer">
              <button className="apply-btn-cancel" onClick={() => setShowApplyModal(false)}>Cancel</button>
              <button
                className="apply-btn-submit"
                onClick={handleApplySubmit}
                disabled={isSubmitting || !selectedCvId}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}