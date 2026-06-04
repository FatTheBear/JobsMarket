import React from 'react';
import './JobCard.css';

export default function JobCard({ job, onSelect }) {
  // 1. Destructure data from the job object
  const {
    title,
    company_name, 
    logo_url,     
    salary_min,
    salary_max,
    loc,
    job_type
  } = job;

  // 2. Logic to format salary nicely
  const formatSalary = () => {
    if (!salary_min && !salary_max) return 'Negotiable';
    if (salary_min && salary_max) return `$${salary_min} - $${salary_max}`;
    if (salary_min) return `From $${salary_min}`;
    return `Up to $${salary_max}`;
  };

  // 3. Render the UI
  return (
    <div className="job-card-container" onClick={() => onSelect(job)}>
      <div className="job-card-logo">
        <img 
          src={logo_url || '/default-company-logo.png'} 
          alt={`${company_name || 'Company'} logo`} 
          onError={(e) => { e.target.src = '/default-company-logo.png' }} // Fallback if image fails to load
        />
      </div>
      
      <div className="job-card-body">
        <h3 className="job-card-title">{title || 'Untitled Job'}</h3>
        <p className="job-card-company">{company_name || 'Company name not provided'}</p>
        
        <div className="job-card-tags">
          <span className="job-tag tag-salary">{formatSalary()}</span>
          <span className="job-tag tag-location">{loc || 'Location updating'}</span>
          <span className="job-tag tag-type">{job_type || 'Full-time'}</span>
        </div>
      </div>
    </div>
  );
}