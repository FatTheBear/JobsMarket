import React from 'react';
import './JobDetail.css';

export default function JobDetail({ job, onClose }) {
  if (!job) return null;

  // 1. Destructure data
  const {
    title,
    company_name,
    logo_url,
    salary_min,
    salary_max,
    loc,
    job_type,
    description,
    requirements,
    benefits,
    deadline
  } = job;

  // 2. Format Salary
  const formatSalary = () => {
    if (!salary_min && !salary_max) return 'Negotiable';
    if (salary_min && salary_max) return `$${salary_min} - $${salary_max}`;
    if (salary_min) return `From $${salary_min}`;
    return `Up to $${salary_max}`;
  };

  // 3. Format Date
  const formatDeadline = (dateString) => {
    if (!dateString) return 'No deadline specified';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="job-detail-overlay" onClick={onClose}>
      {/* Stop propagation to prevent closing when clicking inside the modal */}
      <div className="job-detail-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button className="job-detail-close" onClick={onClose}>
          &times;
        </button>

        {/* HEADER: Logo & Title */}
        <div className="job-detail-header">
          <div className="job-detail-logo">
            <img 
              src={logo_url || '/default-company-logo.png'} 
              alt={`${company_name || 'Company'} logo`}
              onError={(e) => { e.target.src = '/default-company-logo.png' }}
            />
          </div>
          <div className="job-detail-header-info">
            <h2 className="job-detail-title">{title || 'Untitled Job'}</h2>
            <p className="job-detail-company">{company_name || 'Company name not provided'}</p>
            <div className="job-detail-tags">
              <span className="jd-tag tag-salary">{formatSalary()}</span>
              <span className="jd-tag tag-location">{loc || 'Location updating'}</span>
              <span className="jd-tag tag-type">{job_type || 'Full-time'}</span>
            </div>
          </div>
        </div>

        {/* BODY: Full Information */}
        <div className="job-detail-body">
          <div className="jd-section">
            <h3>Job Description</h3>
            <p className="jd-text">{description || 'No description provided.'}</p>
          </div>

          <div className="jd-section">
            <h3>Requirements</h3>
            <p className="jd-text">{requirements || 'No requirements provided.'}</p>
          </div>

          <div className="jd-section">
            <h3>Benefits</h3>
            <p className="jd-text">{benefits || 'No benefits provided.'}</p>
          </div>

          <div className="jd-section jd-deadline">
            <strong>Application Deadline: </strong> {formatDeadline(deadline)}
          </div>
        </div>

        {/* FOOTER: Call to action */}
        <div className="job-detail-footer">
          <button className="jd-btn jd-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="jd-btn jd-btn-primary">Apply Now</button>
        </div>

      </div>
    </div>
  );
}