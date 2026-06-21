import React, { useState } from "react";
import './JobCard.css';

export default function JobCard({ company_logo, job, onClick }) {
  const [imgError, setImgError] = useState(false);
  // 1. Destructure data from the job object
  const {
    title,
    company_name,
    logo_url,
    salary_min,
    salary_max,
    loc,
    job_type,
  } = job;

  // 2. Logic to format salary nicely
  const formatSalary = () => {
    // 1. Suy luận Internship từ cột job_type
    if (job_type && job_type.toLowerCase().includes('intern')) {
        return 'Internship';
    }

    // 2. Suy luận Negotiable (Thỏa thuận) nếu không có min max
    if (!salary_min && !salary_max) {
        return 'Negotiable';
    }

    // 3. Xử lý Specific (Cụ thể)
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
          src={imgError ? '/default-company-logo.png' : (logo_url || '/default-company-logo.png')}
          alt={`${company_name || 'Company'} logo`}
          onError={() => setImgError(true)}
          className="job-card-logo"
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