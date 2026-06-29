import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import JoinUsModal from '../JoinUsModal/JoinUsModal';
import './CompanyPublicProfile.css';

const API_URL = 'http://localhost:5000';
const DEFAULT_COMPANY_LOGO = '/img/default-avatar.png';

export default function CompanyPublicProfile() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [posts, setPosts] = useState([]);
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
      const companyData = response.data.company;
      setCompany(companyData);
      setJobs(response.data.jobs || []);

      if (companyData && companyData.hr_id) {
        try {
          const postsRes = await axios.get(`${API_URL}/api/posts/user/${companyData.hr_id}`);
          setPosts(postsRes.data || []);
        } catch (postErr) {
          console.error('Error fetching company posts:', postErr);
        }
      }
    } catch (err) {
      console.error('Error fetching company profile:', err);
      setError('Failed to load company profile');
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleApplyClick = (e, jobTitle) => {
    e.stopPropagation();
    if (isAuthenticated) {
      navigate(`/jobs/${e.currentTarget.dataset.jobId}`);
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
              ? `url(${API_URL}${company.cover_image_url})` 
              : 'linear-gradient(135deg, #01796F 0%, #0056b3 100%)'
          }}
        />
        
        <div className="cpp-header-content">
          <div className="cpp-logo-section">
            <img 
              src={company.logo_url ? `${API_URL}${company.logo_url}` : DEFAULT_COMPANY_LOGO} 
              alt={company.name}
              className="cpp-logo"
              onError={(e) => { 
                const fallback = window.location.origin + DEFAULT_COMPANY_LOGO;
                if (e.target.src !== fallback && e.target.src !== DEFAULT_COMPANY_LOGO) {
                  e.target.src = DEFAULT_COMPANY_LOGO; 
                }
              }}
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
          className={`cpp-tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts ({posts.length})
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

                {company.size && (
                  <div className="cpp-info-item">
                    <span className="cpp-label">Company Size</span>
                    <span className="cpp-value">{company.size} employees</span>
                  </div>
                )}

                {company.company_phone && (
                  <div className="cpp-info-item">
                    <span className="cpp-label">Phone</span>
                    <span className="cpp-value">{company.company_phone}</span>
                  </div>
                )}

                {company.email && (
                  <div className="cpp-info-item">
                    <span className="cpp-label">Email</span>
                    <span className="cpp-value">{company.email}</span>
                  </div>
                )}

                {company.tax_id && (
                  <div className="cpp-info-item">
                    <span className="cpp-label">Tax ID</span>
                    <span className="cpp-value">{company.tax_id}</span>
                  </div>
                )}
                
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

              {company.benefits && (
                <div className="cpp-section-block mt-4" style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                  <h4 style={{ fontWeight: '700', color: '#1a1a1a', marginBottom: '12px' }}>🎁 Benefits & Perks</h4>
                  <p style={{ color: '#495057', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{company.benefits}</p>
                </div>
              )}

              {company.culture && (
                <div className="cpp-section-block mt-4" style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                  <h4 style={{ fontWeight: '700', color: '#1a1a1a', marginBottom: '12px' }}>🌱 Company Culture</h4>
                  <p style={{ color: '#495057', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{company.culture}</p>
                </div>
              )}
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

        {activeTab === 'posts' && (
          <div className="cpp-posts-section">
            {posts.length > 0 ? (
              <div className="cpp-posts-list">
                {posts.map((post) => (
                  <div key={post.id} className="cpp-post-card">
                    <div className="cpp-post-header">
                      <img 
                        src={post.author_avatar ? (post.author_avatar.startsWith('http') ? post.author_avatar : `${API_URL}${post.author_avatar}`) : DEFAULT_COMPANY_LOGO} 
                        alt={post.author_name} 
                        className="cpp-post-avatar"
                        onError={(e) => { 
                          const fallback = window.location.origin + DEFAULT_COMPANY_LOGO;
                          if (e.target.src !== fallback && e.target.src !== DEFAULT_COMPANY_LOGO) {
                            e.target.src = DEFAULT_COMPANY_LOGO; 
                          }
                        }}
                      />
                      <div className="cpp-post-meta">
                        <span className="cpp-post-author">{post.author_name}</span>
                        <span className="cpp-post-date">
                          {new Date(post.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                    <div className="cpp-post-content">
                      <p>{post.content}</p>
                      {post.mediaList && post.mediaList.map((media, idx) => (
                        media.media_type?.startsWith('image') ? (
                          <img key={idx} src={`${API_URL}${media.media_url}`} alt="Post attachment" className="cpp-post-image" />
                        ) : (
                          <video key={idx} src={`${API_URL}${media.media_url}`} controls className="cpp-post-video" />
                        )
                      ))}
                    </div>
                    <div className="cpp-post-footer">
                      <span>👍 {post.likes_count} Likes</span>
                      <span>💬 {post.comments_count} Comments</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="cpp-no-posts">
                <p>No community posts shared by this company yet</p>
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
