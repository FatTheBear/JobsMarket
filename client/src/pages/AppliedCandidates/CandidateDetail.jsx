import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaMapMarkerAlt, 
  FaBirthdayCake, 
  FaBriefcase, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaFacebook 
} from 'react-icons/fa';
import './CandidateDetail.css';

export default function CandidateDetail() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Education');
  const API_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchCandidateDetail();
  }, [id]);

  const fetchCandidateDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/candidate/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidate(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarSrc = (avatar) => {
    if (!avatar) return '/default-avatar.png';
    if (avatar.startsWith('http') || avatar.startsWith('data:image')) return avatar;
    return `${API_URL}/${avatar.replace(/^\//, '')}`;
  };

  if (loading) {
    return <div className="loading-container">Loading profile...</div>;
  }

  if (!candidate) {
    return <div className="error-container">Candidate not found.</div>;
  }

  return (
    <div className="profile-page-wrapper">
      <h3 className="profile-page-title">Candidate Profile</h3>

      <div className="profile-grid">
        <div className="profile-left-column">
          <div className="profile-card text-center">
            <div className="avatar-wrapper">
              <img 
                src={getAvatarSrc(candidate.avatar)} 
                alt="Profile" 
                className="profile-avatar"
                onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
              />
            </div>
            
            <h2 className="profile-name">{candidate.display_name || candidate.full_name}</h2>
            <p className="profile-headline">{candidate.headline || 'Candidate'}</p>

            {candidate.about && (
              <p className="profile-about">{candidate.about}</p>
            )}

            <div className="profile-divider"></div>

            <div className="profile-info-list">
              <div className="info-item">
                <FaMapMarkerAlt className="info-icon" />
                <span className="info-text">{candidate.address || candidate.nationality || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <FaBirthdayCake className="info-icon" />
                <span className="info-text">{candidate.dob ? new Date(candidate.dob).toLocaleDateString('en-US') : 'Not specified'}</span>
              </div>
              <div className="info-item">
                <FaBriefcase className="info-icon" />
                <span className="info-text">{candidate.years_of_experience ? `${candidate.years_of_experience} Years` : 'Not specified'}</span>
              </div>
              {candidate.phone && (
                <div className="info-item">
                  <FaPhoneAlt className="info-icon" />
                  <span className="info-text">{candidate.phone}</span>
                </div>
              )}
              {candidate.email && (
                <div className="info-item">
                  <FaEnvelope className="info-icon" />
                  <span className="info-text">{candidate.email}</span>
                </div>
              )}
            </div>

            <div className="profile-social-links">
              {candidate.facebook && <a href={candidate.facebook} target="_blank" rel="noreferrer"><FaFacebook /></a>}
            </div>
          </div>
        </div>

        <div className="profile-right-column">
          <div className="profile-card">
            <div className="profile-tabs">
              <button 
                className={`tab-item ${activeTab === 'Education' ? 'active' : ''}`}
                onClick={() => setActiveTab('Education')}
              >
                Education
              </button>
              <button 
                className={`tab-item ${activeTab === 'Certifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('Certifications')}
              >
                Certifications
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'Education' && (
                <div className="data-list">
                  {candidate.education && candidate.education.length > 0 ? (
                    candidate.education.map((edu, index) => (
                      <div key={index} className="data-row">
                        <div className="data-icon-placeholder">
                          {edu.school_name ? edu.school_name.charAt(0).toUpperCase() : 'E'}
                        </div>
                        <div className="data-details">
                          <h4>{edu.school_name}</h4>
                          <p className="data-subtitle">{edu.degree} in {edu.field_of_study}</p>
                          <span className="data-time">{edu.start_date} - {edu.end_date || 'Present'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">No education history provided.</div>
                  )}
                </div>
              )}

              {activeTab === 'Certifications' && (
                <div className="data-list">
                  {candidate.certifications && candidate.certifications.length > 0 ? (
                    candidate.certifications.map((cert, index) => (
                      <div key={index} className="data-row">
                        <div className="data-icon-placeholder cert-icon">
                          {cert.name ? cert.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div className="data-details">
                          <h4>{cert.name}</h4>
                          <p className="data-subtitle">{cert.issuing_organization}</p>
                          <span className="data-time">Issued: {cert.issue_date}</span>
                        </div>
                        {cert.credential_url && (
                          <div className="data-action">
                            <a href={cert.credential_url} target="_blank" rel="noreferrer" className="view-link">
                              View Credential
                            </a>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">No certifications provided.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}