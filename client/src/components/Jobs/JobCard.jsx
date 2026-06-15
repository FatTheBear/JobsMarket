import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './JobCard.css';

export default function JobCard({ job, onSelect }) {
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
    if (!salary_min && !salary_max) return 'Negotiable';
    if (salary_min && salary_max) return `$${salary_min} - $${salary_max}`;
    if (salary_min) return `From $${salary_min}`;
    return `Up to $${salary_max}`;
  };
  const navigate = useNavigate();

  // 3. Render the UI
  return (
    <div
      className="job-card-container"
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      {/* Phần trên: Logo và Tên công ty/Tên Job nằm ngang */}
      <div className="job-card-header">
        <img
         
          src={
            imgError
              ? '/default-company-logo.png'
              : (company_logo || '/default-company-logo.png')
          }
          alt="Company logo"
          onError={() => setImgError(true)}
          className="job-card-logo"
        />

        <div className="job-card-titles">
          <h3 className="job-card-title">
            {title || 'Untitled Job'}
          </h3>

          <p className="job-card-company">
            {company_name || 'Company name not provided'}
          </p>
        </div>
      </div>


      {/* Phần dưới: Tags và Mô tả */}
      <div className="job-card-body">

        <div className="job-card-tags">
          <span className="job-tag tag-salary">
            {formatSalary()}
          </span>

          <span className="job-tag tag-location">
            {loc || 'Location updating'}
          </span>

          <span className="job-tag tag-type">
            {job_type || 'Full-time'}
          </span>
        </div>


        <p className="job-card-description">
          {job.description
            ? job.description.substring(0, 100) + '...'
            : ''}
        </p>

      </div>

    </div>
  );
}