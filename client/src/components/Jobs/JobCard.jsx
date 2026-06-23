import React, { useState } from "react";
import './JobCard.css';

export default function JobCard({ company_logo, job, onClick }) {
  const API_URL = 'http://localhost:5000';

const [imgError, setImgError] = useState(false);

const {
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

  // 3. Render the UI
  return (
    <div className="job-card-container" onClick={onClick}>
      {/* Khối trên: Logo + Tên Job + Tên Công ty */}
      <div className="job-card-header">
        <img
          src={getValidLogo()}
          onError={() => setImgError(true)}
          alt="Company Logo"
        />
        <div className="job-card-main-info">
          <h3 className="job-card-title">{title || 'Untitled Job'}</h3>
          <p className="job-card-company">{company_name || 'Company name not provided'}</p>
        </div>
      </div>

      {/* Khối dưới: Lương, Địa điểm, Loại công việc */}
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