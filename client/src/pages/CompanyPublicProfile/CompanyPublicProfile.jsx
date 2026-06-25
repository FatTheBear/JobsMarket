import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import JoinUsModal from '../JoinUsModal/JoinUsModal';
import './CompanyPublicProfile.css';

const API_URL = 'http://localhost:5000';

export default function CompanyPublicProfile() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');

  useEffect(() => {
    checkAuthStatus();
    fetchCompanyProfile();
  }, [companyId]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  };

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/company-public/public/${companyId}`);
      setCompany(response.data.company);
      setJobs(response.data.jobs || []);
    } catch (err) {
      console.error('Error fetching company profile:', err);
      setError('Failed to load company profile');
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (jobId) => {
    navigate(`/job/${jobId}`);
  };

  const handleApplyClick = (e, jobTitle) => {
    e.stopPropagation();
    if (isAuthenticated) {
      navigate(`/job/${e.currentTarget.dataset.jobId}`);
    } else {
      setSelectedJobTitle(jobTitle);
      setShowJoinModal(true);
    }
  };

  if (loading) {
    return (
      <div className="cpp-container">
        <div className="cpp-loading">Loading company profile...</div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="cpp-container">
        <div className="cpp-error">{error || 'Company not found'}</div>
      </div>
    );
  }

  return (
    <div className="cpp-container">
      {/* Company Header */}
      <div className="cpp-header">
        <div 
          className="cpp-cover-image"
          style={{
            backgroundImage: company.cover_image_url 
              ? `url(${company.cover_image_url})` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        />
        
        <div className="cpp-header-content">
          <div className="cpp-logo-section">
            <img 
              src={company.logo_url || '/default-company-logo.png'} 
              alt={company.name}
              className="cpp-logo"
            />
          </div>
          
          <div className="cpp-company-info">
            <h1 className="cpp-company-name">{company.name}</h1>
            <p className="cpp-industry">{company.industry_name || 'Technology'}</p>
            
            {company.website && (
              <a 
                href={company.website} 
                target="_blank" 
                rel="noreferrer"
                className="cpp-website-link"
              >
                🌐 Visit Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="cpp-tabs">
        <button
          className={`cpp-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          About
        </button>
        <button
          className={`cpp-tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Open Positions ({jobs.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="cpp-content">
        {activeTab === 'overview' && (
          <div className="cpp-overview-section">
            <div className="cpp-overview-card">
              <h2>About Company</h2>
              <p className="cpp-bio">
                {company.company_bio || 'No information available'}
              </p>
              
              <div className="cpp-info-grid">
                <div className="cpp-info-item">
                  <span className="cpp-label">Industry</span>
                  <span className="cpp-value">{company.industry_name || 'N/A'}</span>
                </div>
                
                {company.address && (
                  <div className="cpp-info-item">
                    <span className="cpp-label">Location</span>
                    <span className="cpp-value">{company.address}</span>
                  </div>
                )}
                
                {company.website && (
                  <div className="cpp-info-item">
                    <span className="cpp-label">Website</span>
                    <span className="cpp-value">
                      <a href={company.website} target="_blank" rel="noreferrer">
                        {company.website}
                      </a>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="cpp-jobs-section">
            {jobs.length > 0 ? (
              <div className="cpp-jobs-grid">
                {jobs.map((job) => (
                  <div 
                    key={job.id}
                    className="cpp-job-card"
                    onClick={() => handleJobClick(job.id)}
                  >
                    <div className="cpp-job-header">
                      <h3 className="cpp-job-title">{job.title}</h3>
                      <span className={`cpp-job-type ${job.job_type?.toLowerCase()}`}>
                        {job.job_type}
                      </span>
                    </div>

                    <p className="cpp-job-description">
                      {job.description?.substring(0, 100)}...
                    </p>

                    {job.salary_min && job.salary_max && (
                      <div className="cpp-job-salary">
                        💰 ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                      </div>
                    )}

                    {job.skills && job.skills.length > 0 && (
                      <div className="cpp-job-skills">
                        {job.skills.slice(0, 3).map((skill) => (
                          <span key={skill.id} className="cpp-skill-tag">
                            {skill.name}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="cpp-skill-tag more">
                            +{job.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="cpp-job-meta">
                      <span className="cpp-job-view-count">
                        👁 {job.view_count} views
                      </span>
                      <button
                        className="cpp-apply-btn"
                        onClick={(e) => handleApplyClick(e, job.title)}
                        data-job-id={job.id}
                      >
                        {isAuthenticated ? 'Apply Now' : 'Explore'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="cpp-no-jobs">
                <p>No open positions at the moment</p>
              </div>
            )}
          </div>
        )}
      </div>

      <JoinUsModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        jobTitle={selectedJobTitle}
      />
    </div>
  );
}
