import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../CandidateProfile/Candidate_profile.css'; // Tái sử dụng CSS đồng bộ của profile

const API_URL = 'http://localhost:5000';

export default function CompanyPublicProfile() {
  const { id } = useParams(); // company_id
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    fetchCompanyPublic();
  }, [id]);

  const fetchCompanyPublic = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_URL}/api/company/public/${id}`, { headers });
      
      if (res.data) {
        setData(res.data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load company profile.');
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to follow this company.');
      return;
    }

    try {
      setFollowLoading(true);
      const res = await axios.post(`${API_URL}/api/company/${id}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data) {
        // Cập nhật state cục bộ
        setData(prev => {
          const isNowFollowed = res.data.followed;
          const diff = isNowFollowed ? 1 : -1;
          return {
            ...prev,
            isFollowed: isNowFollowed,
            company: {
              ...prev.company,
              followers_count: Math.max(0, (prev.company.followers_count || 0) + diff)
            }
          };
        });
      }
      setFollowLoading(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error occurred while updating follow status.');
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger shadow-sm max-w-500 mx-auto" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i> {error}
        </div>
        <button className="btn btn-primary mt-3 px-4" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const { company, isFollowed, jobs } = data;

  // Parse JSON fields safely
  const scale = company.scale ? (typeof company.scale === 'string' ? JSON.parse(company.scale) : company.scale) : {};
  const culture = company.culture ? (typeof company.culture === 'string' ? JSON.parse(company.culture) : company.culture) : {};
  const benefits = company.benefits ? (typeof company.benefits === 'string' ? JSON.parse(company.benefits) : company.benefits) : {};

  return (
    <section className="profile-section">
      <div className="container py-5">
        
        {/* Navigation back */}
        <div className="mb-4">
          <button onClick={() => navigate(-1)} className="btn btn-link text-secondary text-decoration-none d-inline-flex align-items-center gap-2 fw-semibold p-0" style={{ fontSize: '0.95rem' }}>
            <i className="fas fa-chevron-left" style={{ fontSize: '0.8rem' }}></i> Back
          </button>
        </div>

        <div className="animate-fade-in d-flex flex-column gap-4">
          
          {/* ── Company Hero Card ── */}
          <div className="candidate-new-hero">
            <div className="row align-items-center g-4">
              
              {/* Logo */}
              <div className="col-12 col-md-auto text-center text-md-start">
                <div className="hero-avatar-container" style={{ borderRadius: '16px' }}>
                  {company.logo_url ? (
                    <img src={company.logo_url} alt="Logo" style={{ borderRadius: '16px' }} />
                  ) : (
                    <div style={{ fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#e2e8f0', color: '#64748b', borderRadius: '16px' }}>🏢</div>
                  )}
                </div>
              </div>

              {/* Company Meta Info */}
              <div className="col-12 col-md flex-grow-1 text-center text-md-start">
                <h2 className="hero-candidate-name m-0">{company.name}</h2>
                <div className="hero-candidate-title fw-semibold" style={{ fontSize: '1.15rem', color: '#01796F', marginTop: '4px' }}>
                  <i className="fas fa-building me-2"></i>{company.industry_name || 'General Industry'}
                </div>
                
                <div className="hero-action-buttons justify-content-center justify-content-md-start mt-3 gap-2">
                  {/* Follow Button */}
                  <button 
                    type="button" 
                    className="btn btn-new-contact d-inline-flex align-items-center gap-2"
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    style={isFollowed ? { backgroundColor: '#cbd5e1', borderColor: '#cbd5e1', color: '#1e293b' } : {}}
                  >
                    <i className={isFollowed ? "fas fa-check" : "fas fa-plus"}></i>
                    {isFollowed ? 'Following' : 'Follow'} ({company.followers_count || 0})
                  </button>

                  {/* Website link */}
                  {company.website && (
                    <a 
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-new-resume text-decoration-none d-inline-flex align-items-center justify-content-center gap-2"
                    >
                      <i className="fas fa-globe"></i> Website
                    </a>
                  )}
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="col-12 col-md-4 border-start px-md-4">
                <ul className="hero-detail-list">
                  <li>
                    <span className="detail-label">Employees:</span>
                    <span className="detail-value">{scale.num_employees || 'Not specified'}</span>
                  </li>
                  <li>
                    <span className="detail-label">Branches:</span>
                    <span className="detail-value">{scale.num_branches || 'Not specified'}</span>
                  </li>
                  <li>
                    <span className="detail-label">Working Hours:</span>
                    <span className="detail-value text-truncate" style={{ maxWidth: '180px' }} title={culture.work_hours_per_day ? `${culture.work_hours_per_day}h/day • ${culture.work_days_per_week}days/week` : 'Not specified'}>
                      {culture.work_hours_per_day ? `${culture.work_hours_per_day}h/day • ${culture.work_days_per_week}days/week` : 'Not specified'}
                    </span>
                  </li>
                  <li>
                    <span className="detail-label">Headquarters:</span>
                    <span className="detail-value text-truncate" style={{ maxWidth: '180px' }} title={company.address || 'Not specified'}>
                      {company.address || 'Not specified'}
                    </span>
                  </li>
                </ul>

                {/* Social links */}
                <div className="hero-social-icons gap-3 mt-3" style={{ justifyContent: 'flex-start' }}>
                  {company.website && (
                    <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" title="Company Website" style={{ color: '#0d6efd', fontSize: '1.35rem' }}>
                      <i className="fas fa-globe"></i>
                    </a>
                  )}
                  {company.facebook && (
                    <a href={company.facebook} target="_blank" rel="noopener noreferrer" title="Facebook" style={{ color: '#1877f2', fontSize: '1.35rem' }}>
                      <i className="fab fa-facebook"></i>
                    </a>
                  )}
                  {company.linkedin && (
                    <a href={company.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ color: '#0a66c2', fontSize: '1.35rem' }}>
                      <i className="fab fa-linkedin"></i>
                    </a>
                  )}
                  {company.twitter && (
                    <a href={company.twitter} target="_blank" rel="noopener noreferrer" title="Twitter / X" style={{ color: '#0f1419', fontSize: '1.35rem' }}>
                      <i className="fab fa-twitter"></i>
                    </a>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ── Main Details Card ── */}
          <div className="column-card border-0 shadow-sm rounded-3">
            
            {/* About / Description */}
            <div className="column-card-section-title" style={{ marginTop: 0 }}>Company Overview</div>
            <div className="about-text" style={{ whiteSpace: 'pre-line', lineHeight: '1.7' }}>
              {scale.description || 'No description provided by the company yet.'}
            </div>

            {/* Benefits & Perks */}
            <div className="column-card-section-title">Benefits & Perks</div>
            <div className="d-flex flex-column gap-2 mb-3">
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <span className="skill-tag-chip" style={{ fontSize: '0.9rem', padding: '6px 16px', background: benefits.social_insurance ? '#ecfdf5' : '#f1f5f9', color: benefits.social_insurance ? '#065f46' : '#64748b', border: benefits.social_insurance ? '1px solid #a7f3d0' : '1px solid #cbd5e1' }}>
                  🛡️ Social Insurance: {benefits.social_insurance ? 'Covered' : 'Not specified'}
                </span>
                <span className="skill-tag-chip" style={{ fontSize: '0.9rem', padding: '6px 16px', background: benefits.health_insurance ? '#ecfdf5' : '#f1f5f9', color: benefits.health_insurance ? '#065f46' : '#64748b', border: benefits.health_insurance ? '1px solid #a7f3d0' : '1px solid #cbd5e1' }}>
                  🏥 Health Insurance: {benefits.health_insurance ? 'Covered' : 'Not specified'}
                </span>
              </div>
              {benefits.other_benefits && (
                <div className="mt-3 p-3 rounded bg-light text-secondary small" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                  <strong>Other benefits:</strong>
                  <div className="mt-1">{benefits.other_benefits}</div>
                </div>
              )}
            </div>

            {/* Environment & Culture */}
            <div className="column-card-section-title">Work Environment & Culture</div>
            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <div className="p-3 rounded border bg-light d-flex flex-column gap-1">
                  <span className="text-muted small">Average Age</span>
                  <span className="fw-bold text-dark">{scale.avg_age || 'Not specified'}</span>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div className="p-3 rounded border bg-light d-flex flex-column gap-1">
                  <span className="text-muted small">Female Ratio</span>
                  <span className="fw-bold text-dark">{scale.female_ratio ? `${scale.female_ratio}%` : 'Not specified'}</span>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div className="p-3 rounded border bg-light d-flex flex-column gap-1">
                  <span className="text-muted small">Dress Code</span>
                  <span className="fw-bold text-dark">{culture.dress_code || 'Not specified'}</span>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div className="p-3 rounded border bg-light d-flex flex-column gap-1">
                  <span className="text-muted small">Office Locations</span>
                  <span className="fw-bold text-dark text-truncate" title={scale.branch_info || 'Not specified'}>
                    {scale.branch_info || 'Not specified'}
                  </span>
                </div>
              </div>
              {culture.other_info && (
                <div className="col-12">
                  <div className="p-3 rounded border bg-light">
                    <span className="text-muted small d-block mb-1">Additional Culture Info</span>
                    <span className="text-secondary small" style={{ whiteSpace: 'pre-line' }}>{culture.other_info}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Active Job Openings */}
            <div className="column-card-section-title">Active Job Openings</div>
            <div className="d-flex flex-column gap-3 mt-3">
              {jobs && jobs.length > 0 ? (
                jobs.map(job => (
                  <div 
                    key={job.id} 
                    className="p-3 rounded-3 border hover-shadow transition d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3"
                    style={{ background: '#fff' }}
                  >
                    <div>
                      <h5 className="m-0 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>{job.title}</h5>
                      <div className="d-flex align-items-center flex-wrap gap-2.5 mt-2 text-muted small" style={{ fontSize: '0.85rem' }}>
                        <span className="fw-semibold text-secondary">
                          <i className="fas fa-coins me-1 text-warning"></i>
                          {job.salary_min && job.salary_max 
                            ? `${(job.salary_min / 1000000).toFixed(0)} - ${(job.salary_max / 1000000).toFixed(0)}M VND` 
                            : 'Negotiable'}
                        </span>
                        <span>•</span>
                        <span><i className="fas fa-map-marker-alt me-1"></i>{job.province || 'Remote'}</span>
                        <span>•</span>
                        <span className="badge bg-secondary-subtle text-secondary">{job.job_type}</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold"
                      style={{ color: '#01796F', borderColor: '#01796F' }}
                    >
                      View Details
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted small">
                  <i className="far fa-folder-open d-block fs-3 mb-2"></i>
                  No active job openings found for this company.
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
