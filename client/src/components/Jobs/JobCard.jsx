import React, { useState } from "react";
import './JobCard.css';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export default function JobCard({ job, onClick }) {
  const [imgError, setImgError] = useState(false);
  
  // States for Application Flow
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
    loc,
    job_type,
  } = job;

  const getValidLogo = () => {
    if (imgError || !logo_url) return '/default-company-logo.png';
    if (logo_url.startsWith('data:image')) return logo_url;
    if (logo_url.startsWith('http')) return logo_url;
    return `${API_URL}${logo_url}`;
  };

  const formatSalary = () => {
    if (job_type && job_type.toLowerCase().includes('intern')) {
      return 'Internship';
    }
    if (!salary_min && !salary_max) {
      return 'Negotiable';
    }
    if (salary_min && salary_max) return `$${salary_min} - $${salary_max}`;
    if (salary_min) return `From $${salary_min}`;
    return `Up to $${salary_max}`;
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
      console.error("Failed to fetch CVs", error);
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

    if (!selectedCvId) {
      return setFeedbackMessage({ type: "danger", text: "Please select a CV to apply." });
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token'); 
      const payload = {
        jobId: jobId, 
        cvId: selectedCvId
      };

      const response = await axios.post(`${API_URL}/api/candidate/apply`, payload, {
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
      if (error.response && error.response.data) {
        setFeedbackMessage({ type: "danger", text: error.response.data.message });
      } else {
        setFeedbackMessage({ type: "danger", text: "Connection error! Please try again." });
      }
    } finally {
      setIsSubmitting(false); 
    }
  };
  // 3. Render the UI
  return (
    <div className="job-card-container" onClick={onClick}>
      <div className="job-card-header">
        <div style={{ width: '56px', height: '56px', flexShrink: 0, overflow: 'hidden', borderRadius: '8px', border: '1px solid #B0C4DE' }}>
          <img
            src={getValidLogo()}
            onError={() => setImgError(true)}
            alt={company_name || 'Logo'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div className="job-card-main-info">
          <h3 className="job-card-title">{title || 'Untitled Job'}</h3>
          <p className="job-card-company">{company_name || 'Company name not provided'}</p>
        </div>
      </div>

      <div className="job-card-footer">
        <div className="job-card-tags">
          <span className="job-tag tag-salary">{formatSalary()}</span>
          <span className="job-tag tag-location">{loc || 'Location updating'}</span>
          <span className="job-tag tag-type">{job_type || 'Full-time'}</span>
        </div>
      </div>
    </div>
  );
}