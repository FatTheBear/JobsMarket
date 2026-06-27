import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import CandidatePosts from './CandidatePosts';
import PostCreator from '../../components/Community/PostCreator';

const formatAwardDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 2) {
    return `${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const calculateCustomExperienceYears = (experiences) => {
  if (!experiences || experiences.length === 0) return 0;

  const getMonths = (exp) => {
    let startStr = exp.startDate;
    let endStr = exp.endDate;

    if (!startStr && exp.duration) {
      const parts = exp.duration.split(' - ');
      if (parts.length === 2) {
        const startParts = parts[0].split('/');
        if (startParts.length === 2) {
          startStr = `${startParts[1]}-${startParts[0]}`;
        }
        if (parts[1] !== 'Present' && parts[1] !== 'Hiện tại') {
          const endParts = parts[1].split('/');
          if (endParts.length === 2) {
            endStr = `${endParts[1]}-${endParts[0]}`;
          }
        }
      }
    }

    if (startStr) {
      const startParts = startStr.split('-');
      const startYear = parseInt(startParts[0]);
      const startMonth = parseInt(startParts[1]) - 1;
      const start = new Date(startYear, startMonth, 1);

      let end = new Date();
      if (endStr) {
        const endParts = endStr.split('-');
        const endYear = parseInt(endParts[0]);
        const endMonth = parseInt(endParts[1]) - 1;
        end = new Date(endYear, endMonth, 1);
      }

      const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      return diffMonths > 0 ? diffMonths : 0;
    }
    return 0;
  };

  if (experiences.length === 1) {
    const months = getMonths(experiences[0]);
    return Math.floor(months / 12);
  } else {
    let totalYears = 0;
    experiences.forEach(exp => {
      const months = getMonths(exp);
      totalYears += Math.floor(months / 12);
    });
    return totalYears;
  }
};

const CandidateMyProfile = () => {
  const {
    profileData,
    skills,
    educations,
    workExperiences,
    languages,
    certifications,
    awards,
    candidatePosts,
    setCandidatePosts
  } = useOutletContext();

  const navigate = useNavigate();
  const [selectedAward, setSelectedAward] = useState(null);

  if (!profileData) {
    return <div className="text-center py-5">Loading profile...</div>;
  }

  const handlePostCreated = (newPost) => {
    const formattedPost = {
      id: newPost.id,
      author: newPost.author_name || profileData.displayName || 'Candidate',
      avatar: newPost.author_avatar || profileData.avatar,
      time: 'Just now',
      content: newPost.content,
      mediaList: newPost.mediaList || [],
      likes: 0,
      comments: 0,
      shares: 0
    };
    if (setCandidatePosts) {
      setCandidatePosts(prev => [formattedPost, ...prev]);
    }
  };

  const handleEditClick = () => {
    navigate('/candidate/my-profile/account-settings');
  };

  return (
    <div className="profile-main-container-card p-4 animate-fade-in" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── Header Card with Gradient Banner ── */}
      <div className="profile-header-card shadow-sm m-0 mb-4">
        <div className="profile-details-banner"></div>
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-end justify-content-between profile-header-info">
          <div className="d-flex align-items-end gap-3 profile-avatar-container-wrap">
            <div className="profile-avatar-container">
              <img
                src={profileData.avatar || '/default-avatar.png'}
                alt="candidate avatar"
                className="profile-avatar-circle"
              />
            </div>
            <div className="mb-2 ms-sm-2">
              <h3 className="fw-bold text-dark m-0" style={{ fontSize: '1.6rem' }}>
                {profileData.fullName || profileData.displayName || 'Candidate Name'}
              </h3>
              <p className="text-primary small fw-semibold m-0 mt-1">
                {profileData.jobTitle || 'Full Stack Web Developer'}
              </p>
              {workExperiences && workExperiences.length > 0 && (
                <p className="text-muted small fw-medium m-0 mt-1.5" style={{ fontSize: '0.85rem' }}>
                  Experience: <span className="text-dark fw-semibold">{calculateCustomExperienceYears(workExperiences)} Years</span>
                </p>
              )}
            </div>
          </div>
          
          <div className="mb-2 me-sm-2 mt-3 mt-sm-0">
            <button
              onClick={handleEditClick}
              className="btn btn-outline-secondary fw-semibold rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-2"
              style={{ fontSize: '0.9rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
            >
              <i className="fas fa-pencil-alt" style={{ fontSize: '0.8rem' }}></i> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* ── Contact Card (Only Real Database Data) ── */}
      <div className="profile-details-card shadow-sm mb-4">
        <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
          <h5 className="fw-bold text-dark m-0" style={{ fontSize: '1.1rem' }}>
            Contact
          </h5>
        </div>

        <div className="row g-4">
          {/* Column 1 */}
          <div className="col-12 col-md-4 d-flex flex-column gap-3">
            {/* Full Name */}
            {profileData.fullName && (
              <div className="detail-grid-item m-0">
                <div className="detail-item-icon">
                  <i className="far fa-user"></i>
                </div>
                <div className="detail-item-content">
                  <span className="detail-item-label">Full Name</span>
                  <span className="detail-item-value">{profileData.fullName}</span>
                </div>
              </div>
            )}

            {/* Address */}
            {profileData.address && (
              <div className="detail-grid-item m-0">
                <div className="detail-item-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="detail-item-content">
                  <span className="detail-item-label">Address</span>
                  <span className="detail-item-value">{profileData.address}</span>
                </div>
              </div>
            )}

            {/* Website / Portfolio */}
            {profileData.portfolio && (
              <div className="detail-grid-item m-0">
                <div className="detail-item-icon">
                  <i className="fas fa-external-link-alt"></i>
                </div>
                <div className="detail-item-content">
                  <span className="detail-item-label">Website / Portfolio</span>
                  <span className="detail-item-value">
                    <a href={profileData.portfolio} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-primary">
                      {profileData.portfolio}
                    </a>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Column 2 */}
          <div className="col-12 col-md-4 d-flex flex-column gap-3">
            {/* Email */}
            {profileData.email && (
              <div className="detail-grid-item m-0">
                <div className="detail-item-icon">
                  <i className="far fa-envelope"></i>
                </div>
                <div className="detail-item-content">
                  <span className="detail-item-label">Email</span>
                  <span className="detail-item-value">{profileData.email}</span>
                </div>
              </div>
            )}

            {/* Nationality */}
            {profileData.nationality && (
              <div className="detail-grid-item m-0">
                <div className="detail-item-icon">
                  <i className="fas fa-globe"></i>
                </div>
                <div className="detail-item-content">
                  <span className="detail-item-label">Nationality</span>
                  <span className="detail-item-value">{profileData.nationality}</span>
                </div>
              </div>
            )}
          </div>

          {/* Column 3 */}
          <div className="col-12 col-md-4 d-flex flex-column gap-3">
            {/* Phone number */}
            {profileData.phone && (
              <div className="detail-grid-item m-0">
                <div className="detail-item-icon">
                  <i className="fas fa-phone-alt"></i>
                </div>
                <div className="detail-item-content">
                  <span className="detail-item-label">Phone number</span>
                  <span className="detail-item-value">{profileData.phone}</span>
                </div>
              </div>
            )}

            {/* Date of birth */}
            {profileData.birthday && (
              <div className="detail-grid-item m-0">
                <div className="detail-item-icon">
                  <i className="far fa-calendar"></i>
                </div>
                <div className="detail-item-content">
                  <span className="detail-item-label">Date of birth</span>
                  <span className="detail-item-value">{profileData.birthday}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Social Link Badges if present */}
        {(profileData.github || profileData.linkedin || profileData.facebook || profileData.x || profileData.blog) && (
          <div className="mt-4 border-top pt-3">
            <div className="d-flex gap-3 flex-wrap">
              {profileData.github && (
                <a href={profileData.github} target="_blank" rel="noopener noreferrer" className="text-secondary d-flex align-items-center gap-1.5 text-decoration-none">
                  <i className="fab fa-github fs-5 text-dark"></i> GitHub
                </a>
              )}
              {profileData.linkedin && (
                <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className="text-secondary d-flex align-items-center gap-1.5 text-decoration-none">
                  <i className="fab fa-linkedin fs-5" style={{ color: '#0a66c2' }}></i> LinkedIn
                </a>
              )}
              {profileData.facebook && (
                <a href={profileData.facebook} target="_blank" rel="noopener noreferrer" className="text-secondary d-flex align-items-center gap-1.5 text-decoration-none">
                  <i className="fab fa-facebook fs-5" style={{ color: '#1877f2' }}></i> Facebook
                </a>
              )}
              {profileData.x && (
                <a href={profileData.x} target="_blank" rel="noopener noreferrer" className="text-secondary d-flex align-items-center gap-1.5 text-decoration-none">
                  <i className="fab fa-twitter fs-5 text-dark"></i> X
                </a>
              )}
              {profileData.blog && (
                <a href={profileData.blog} target="_blank" rel="noopener noreferrer" className="text-secondary d-flex align-items-center gap-1.5 text-decoration-none">
                  <i className="fas fa-blog fs-5 text-success"></i> Blog
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Career Details Card (Unified) ── */}
      <div className="profile-details-card shadow-sm mb-4">
        {/* About Me */}
        <div className="mb-4">
          <h5 className="fw-bold text-dark mb-3">
            <i className="far fa-user text-primary me-2"></i>About Me
          </h5>
          <p className="text-secondary small mb-0" style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>
            {profileData.about || 'No bio added yet. Go to Account Settings to add a description about yourself.'}
          </p>
        </div>

        <hr className="my-4 text-muted opacity-25" />

        {/* Row 1: Experience & Education */}
        <div className="row g-4">
          {/* Work Experience */}
          <div className="col-12 col-md-6">
            <h5 className="fw-bold text-dark mb-4">
              <i className="fas fa-briefcase text-primary me-2"></i>Work Experience
            </h5>
            <div className="d-flex flex-column gap-3">
              {workExperiences && workExperiences.length > 0 ? (
                workExperiences.map((exp, idx) => (
                  <div key={exp.id || idx} className="mb-2 profile-text-entry">
                    <div>
                      {(() => {
                        let displayRole = exp.role || '';
                        if (displayRole.includes(' - ')) {
                          const parts = displayRole.split(/\s*[-–—]\s*/);
                          displayRole = parts[1]?.trim() || displayRole;
                        }
                        return (
                          <h6 className="m-0 fw-bold text-dark" style={{ fontSize: '1.05rem' }}>
                            {displayRole}
                          </h6>
                        );
                      })()}
                      <div className="d-flex align-items-center flex-wrap gap-2 mt-1" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        <span className="fw-semibold text-secondary">{exp.company}</span>
                        <span>•</span>
                        <span className="d-flex align-items-center gap-1.5">
                          <i className="far fa-calendar-alt" style={{ fontSize: '0.8rem' }}></i>
                          {exp.duration}
                        </span>
                      </div>
                    </div>
                    {exp.description && (
                      <div className="mt-2 text-secondary small" style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                        {exp.description}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted small mb-0">No experience added yet.</p>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="col-12 col-md-6">
            <h5 className="fw-bold text-dark mb-4">
              <i className="fas fa-university text-primary me-2"></i>Education
            </h5>
            <div className="d-flex flex-column gap-3">
              {educations && educations.length > 0 ? (
                educations.map((edu, idx) => (
                  <div key={edu.id || idx} className="mb-2 profile-text-entry">
                    <div>
                      {(() => {
                        let displayDegree = edu.degree || '';
                        if (displayDegree.includes(' - ')) {
                          const parts = displayDegree.split(/\s*[-–—]\s*/);
                          displayDegree = parts[1]?.trim() || displayDegree;
                        }
                        return (
                          <h6 className="m-0 fw-bold text-dark" style={{ fontSize: '1.05rem' }}>
                            {displayDegree}
                          </h6>
                        );
                      })()}
                      <div className="d-flex align-items-center flex-wrap gap-2 mt-1" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        <span className="fw-semibold text-secondary">{edu.school}</span>
                        <span>•</span>
                        <span className="d-flex align-items-center gap-1.5">
                          <i className="far fa-calendar-alt" style={{ fontSize: '0.8rem' }}></i>
                          {edu.duration}
                        </span>
                      </div>
                    </div>
                    {edu.description && (
                      <div className="mt-2 text-secondary small" style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                        {edu.description}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted small mb-0">No education added yet.</p>
              )}
            </div>
          </div>
        </div>

        <hr className="my-4 text-muted opacity-25" />

        {/* Row 2: Skills & Languages */}
        <div className="row g-4">
          {/* Technical Skills */}
          <div className="col-12 col-md-6">
            <h5 className="fw-bold text-dark mb-4">
              <i className="fas fa-star text-primary me-2"></i>Technical Skills
            </h5>
            <div className="skills-container d-flex flex-wrap gap-2">
              {skills && skills.length > 0 ? (
                skills.map(s => (
                  <span key={s.id || s.name} className="skill-tag-chip">{s.name} ({s.level}%)</span>
                ))
              ) : (
                <p className="text-muted small mb-0">No skills added yet.</p>
              )}
            </div>
          </div>

          {/* Languages */}
          <div className="col-12 col-md-6">
            <h5 className="fw-bold text-dark mb-4">
              <i className="fas fa-globe text-primary me-2"></i>Languages
            </h5>
            <div className="skills-container d-flex flex-wrap gap-2">
              {languages && languages.length > 0 ? (
                languages.map((lang, idx) => (
                  <span key={lang.id || idx} className="skill-tag-chip">{lang.name} ({lang.level})</span>
                ))
              ) : (
                <p className="text-muted small mb-0">No languages added yet.</p>
              )}
            </div>
          </div>
        </div>

        <hr className="my-4 text-muted opacity-25" />

        {/* Row 3: Certifications & Awards */}
        <div className="row g-4">
          {/* Certifications */}
          <div className="col-12 col-md-6">
            <h5 className="fw-bold text-dark mb-4">
              <i className="fas fa-certificate text-primary me-2"></i>Certifications
            </h5>
            <div className="skills-container d-flex flex-wrap gap-2">
              {certifications && certifications.length > 0 ? (
                certifications.map((cert, idx) => (
                  <span key={cert.id || idx} className="skill-tag-chip">
                    <i className="fas fa-certificate text-primary me-1.5" style={{ fontSize: '0.75rem' }}></i>
                    {cert.name}
                  </span>
                ))
              ) : (
                <p className="text-muted small mb-0">No certifications added yet.</p>
              )}
            </div>
          </div>

          {/* Awards & Achievements */}
          <div className="col-12 col-md-6">
            <h5 className="fw-bold text-dark mb-4">
              <i className="fas fa-award text-primary me-2"></i>Awards & Achievements
            </h5>
            <div className="skills-container d-flex flex-wrap gap-2">
              {awards && awards.length > 0 ? (
                awards.map((award, idx) => (
                  <span
                    key={award.id || idx}
                    className="skill-tag-chip cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedAward(award)}
                    title="Click to view details"
                  >
                    {award.title} ({formatAwardDate(award.date)})
                  </span>
                ))
              ) : (
                <p className="text-muted small mb-0">No awards added yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Community Posts Section ── */}
      <div className="profile-details-card shadow-sm mb-0">
        <h5 className="fw-bold text-dark mb-4">
          <i className="fas fa-history text-primary me-2"></i>Community Posts
        </h5>
        
        <div className="mb-4">
          <PostCreator
            onPostCreated={handlePostCreated}
            placeholder="What's on your mind? Post an update directly to your profile and community feed..."
          />
        </div>
        
        <div className="border-top pt-3">
          <CandidatePosts candidatePosts={candidatePosts} setCandidatePosts={setCandidatePosts} />
        </div>
      </div>

      {/* Award Details Modal */}
      {selectedAward && (
        <div className="profile-modal-overlay" onClick={() => setSelectedAward(null)}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h5 className="profile-modal-title">
                <i className="fas fa-award text-primary me-2"></i>Award Details
              </h5>
              <button type="button" className="profile-modal-close-btn" onClick={() => setSelectedAward(null)}>&times;</button>
            </div>
            <div className="profile-modal-body">
              <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '1.05rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                {selectedAward.title}
              </h6>
              <div className="d-flex flex-column gap-2 mb-3">
                <div className="small text-secondary">
                  <i className="fas fa-building me-2 text-muted" style={{ width: '16px' }}></i>
                  <strong>Issued by:</strong> {selectedAward.issuer}
                </div>
                <div className="small text-secondary">
                  <i className="far fa-calendar-alt me-2 text-muted" style={{ width: '16px' }}></i>
                  <strong>Date:</strong> {formatAwardDate(selectedAward.date)}
                </div>
              </div>
              {selectedAward.description ? (
                <div className="border-top pt-2.5 mt-2.5">
                  <strong className="small text-dark d-block mb-1.5">Description:</strong>
                  <p className="text-secondary small mb-0" style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                    {selectedAward.description}
                  </p>
                </div>
              ) : (
                <p className="text-muted small italic mb-0">No description provided.</p>
              )}
            </div>
            <div className="profile-modal-footer">
              <button type="button" className="btn btn-secondary btn-sm rounded" onClick={() => setSelectedAward(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CandidateMyProfile;
