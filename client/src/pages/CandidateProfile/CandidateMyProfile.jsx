import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import CandidatePersonalInfoModal from './CandidatePersonalInfoModal';
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

const calculateExperienceYears = (experiences) => {
  if (!experiences || experiences.length === 0) return 0;
  let totalMonths = 0;

  experiences.forEach(exp => {
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
      if (diffMonths > 0) {
        totalMonths += diffMonths;
      }
    }
  });

  const years = Math.floor(totalMonths / 12);
  return years;
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

  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [selectedAward, setSelectedAward] = useState(null);

  if (!profileData) {
    return <div className="text-center py-5">Loading profile...</div>;
  }

  return (
    <div className="animate-fade-in d-flex flex-column gap-4">
      {/* ── Profile Hero Card ── */}
      <div className="candidate-new-hero">
        <div className="row align-items-center g-4">
          <div className="col-12 col-md-auto text-center text-md-start">
            <div className="hero-avatar-container">
              <img src={profileData.avatar} alt="avatar" />
            </div>
          </div>
          <div className="col-12 col-md flex-grow-1 text-center text-md-start">
            <h2 className="hero-candidate-name m-0">{profileData.displayName || 'Candidate Name'}</h2>
            <div className="hero-candidate-title fw-semibold" style={{ fontSize: '1.15rem', color: '#01796F', marginTop: '4px' }}>
              {profileData.jobTitle || 'Full stack web developer'}
            </div>
            <div className="hero-action-buttons justify-content-center justify-content-md-start mt-3">
              <button type="button" className="btn btn-new-contact" onClick={() => setShowPersonalInfo(true)}>Contact</button>
              <Link to="/candidate/my-profile/manage-cvs" className="btn btn-new-resume text-decoration-none d-inline-flex align-items-center justify-content-center">Resume</Link>
            </div>
          </div>
          <div className="col-12 col-md-4 border-start px-md-4">
            <ul className="hero-detail-list">
              <li>
                <span className="detail-label">Age:</span>
                <span className="detail-value">{profileData.age || '32'}</span>
              </li>
              <li>
                <span className="detail-label">Nationality:</span>
                <span className="detail-value">{profileData.nationality || 'Not specified'}</span>
              </li>
              <li>
                <span className="detail-label">Location:</span>
                <span className="detail-value text-truncate" style={{ maxWidth: '180px' }} title={profileData.address || 'Sank Petersburg, Russia'}>
                  {profileData.address || 'Sank Petersburg, Russia'}
                </span>
              </li>
              <li>
                <span className="detail-label">Years Experience:</span>
                <span className="detail-value text-truncate" style={{ maxWidth: '180px' }}>
                  {calculateCustomExperienceYears(workExperiences)} Years
                </span>
              </li>
            </ul>
            <div className="hero-social-icons gap-3 mt-3" style={{ justifyContent: 'flex-start' }}>
              <a
                href={profileData.portfolio || '#'}
                target={profileData.portfolio ? "_blank" : undefined}
                rel="noopener noreferrer"
                title={profileData.portfolio ? "Website/Portfolio: " + profileData.portfolio : "Website/Portfolio (Not added)"}
                style={{
                  pointerEvents: profileData.portfolio ? 'auto' : 'none',
                  opacity: profileData.portfolio ? 1 : 0.35,
                  color: profileData.portfolio ? '#0d6efd' : '#cbd5e1',
                  fontSize: '1.35rem'
                }}
              >
                <i className="fas fa-globe"></i>
              </a>
              <a
                href={profileData.blog || '#'}
                target={profileData.blog ? "_blank" : undefined}
                rel="noopener noreferrer"
                title={profileData.blog ? "Blog: " + profileData.blog : "Blog (Not added)"}
                style={{
                  pointerEvents: profileData.blog ? 'auto' : 'none',
                  opacity: profileData.blog ? 1 : 0.35,
                  color: profileData.blog ? '#198754' : '#cbd5e1',
                  fontSize: '1.35rem'
                }}
              >
                <i className="fas fa-blog"></i>
              </a>
              <a
                href={profileData.github || '#'}
                target={profileData.github ? "_blank" : undefined}
                rel="noopener noreferrer"
                title={profileData.github ? "GitHub: " + profileData.github : "GitHub (Not added)"}
                style={{
                  pointerEvents: profileData.github ? 'auto' : 'none',
                  opacity: profileData.github ? 1 : 0.35,
                  color: profileData.github ? '#212529' : '#cbd5e1',
                  fontSize: '1.35rem'
                }}
              >
                <i className="fab fa-github"></i>
              </a>
              <a
                href={profileData.facebook || '#'}
                target={profileData.facebook ? "_blank" : undefined}
                rel="noopener noreferrer"
                title={profileData.facebook ? "Facebook: " + profileData.facebook : "Facebook (Not added)"}
                style={{
                  pointerEvents: profileData.facebook ? 'auto' : 'none',
                  opacity: profileData.facebook ? 1 : 0.35,
                  color: profileData.facebook ? '#1877f2' : '#cbd5e1',
                  fontSize: '1.35rem'
                }}
              >
                <i className="fab fa-facebook"></i>
              </a>
              <a
                href={profileData.x || '#'}
                target={profileData.x ? "_blank" : undefined}
                rel="noopener noreferrer"
                title={profileData.x ? "X (Twitter): " + profileData.x : "X (Twitter) (Not added)"}
                style={{
                  pointerEvents: profileData.x ? 'auto' : 'none',
                  opacity: profileData.x ? 1 : 0.35,
                  color: profileData.x ? '#0f1419' : '#cbd5e1',
                  fontSize: '1.35rem'
                }}
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href={profileData.linkedin || '#'}
                target={profileData.linkedin ? "_blank" : undefined}
                rel="noopener noreferrer"
                title={profileData.linkedin ? "LinkedIn: " + profileData.linkedin : "LinkedIn (Not added)"}
                style={{
                  pointerEvents: profileData.linkedin ? 'auto' : 'none',
                  opacity: profileData.linkedin ? 1 : 0.35,
                  color: profileData.linkedin ? '#0a66c2' : '#cbd5e1',
                  fontSize: '1.35rem'
                }}
              >
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Community Post Creator */}
      <PostCreator
        onPostCreated={handlePostCreated}
        placeholder="What's on your mind? Post an update directly to your profile and community feed..."
      />

      {/* ── Main Profile Details (About, Experience, Education, Skills, Languages, Certifications, Awards) ── */}
      <div className="column-card border-0 shadow-sm rounded-3">
        <div className="column-card-section-title" style={{ marginTop: 0 }}>About</div>
        <div className="about-text">
          {profileData.about || 'No bio added yet. Go to Account Settings to add a description about yourself.'}
        </div>

        <div className="column-card-section-title">Experience</div>
        <div className="d-flex flex-column gap-3.5 mt-2">
          {workExperiences && workExperiences.length > 0 ? (
            workExperiences.map((exp, idx) => (
              <div key={exp.id || idx} className="mb-4 profile-text-entry">
                <div>
                  <h5 className="m-0 fw-bold text-dark" style={{ fontSize: '1.05rem' }}>
                    <i className="fas fa-briefcase text-primary me-2" style={{ fontSize: '0.9rem' }}></i>{exp.role}
                  </h5>
                  <div className="d-flex align-items-center flex-wrap gap-2 mt-1.5" style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    <span className="fw-semibold text-secondary">{exp.company}</span>
                    <span>•</span>
                    <span className="d-flex align-items-center gap-1.5">
                      <i className="far fa-calendar-alt" style={{ fontSize: '0.85rem' }}></i>
                      {exp.duration}
                    </span>
                  </div>
                </div>
                {exp.description && (
                  <div className="mt-2 text-secondary small" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                    {exp.description}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted small mb-0">No experience added yet.</p>
          )}
        </div>

        <div className="column-card-section-title">Education</div>
        <div className="d-flex flex-column gap-3.5 mt-2">
          {educations && educations.length > 0 ? (
            educations.map((edu, idx) => (
              <div key={edu.id || idx} className="mb-4 profile-text-entry">
                <div>
                  <h5 className="m-0 fw-bold text-dark" style={{ fontSize: '1.05rem' }}>
                    <i className="fas fa-university text-primary me-2" style={{ fontSize: '0.9rem' }}></i>{edu.degree}
                  </h5>
                  <div className="d-flex align-items-center flex-wrap gap-2 mt-1.5" style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    <span className="fw-semibold text-secondary">{edu.school}</span>
                    <span>•</span>
                    <span className="d-flex align-items-center gap-1.5">
                      <i className="far fa-calendar-alt" style={{ fontSize: '0.85rem' }}></i>
                      {edu.duration}
                    </span>
                  </div>
                </div>
                {edu.description && (
                  <div className="mt-2 text-secondary small" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                    {edu.description}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted small mb-0">No education added yet.</p>
          )}
        </div>

        <div className="column-card-section-title">Skills</div>
        <div className="skills-container">
          {skills && skills.length > 0 ? (
            skills.map(s => (
              <span key={s.id || s.name} className="skill-tag-chip">{s.name} ({s.level}%)</span>
            ))
          ) : (
            <p className="text-muted small mb-0">No skills added yet.</p>
          )}
        </div>

        <div className="column-card-section-title">Languages</div>
        <div className="skills-container">
          {languages && languages.length > 0 ? (
            languages.map((lang, idx) => (
              <span key={lang.id || idx} className="skill-tag-chip">
                <i className="fas fa-globe text-primary me-1.5" style={{ fontSize: '0.8rem' }}></i>
                <strong className="text-dark">{lang.name}</strong>
                <span className="text-muted small ms-1.5">({lang.level})</span>
              </span>
            ))
          ) : (
            <p className="text-muted small mb-0">No languages added yet.</p>
          )}
        </div>

        <div className="column-card-section-title">Certifications</div>
        <div className="skills-container">
          {certifications && certifications.length > 0 ? (
            certifications.map((cert, idx) => (
              <span key={cert.id || idx} className="skill-tag-chip">
                <i className="fas fa-certificate text-primary me-1.5" style={{ fontSize: '0.8rem' }}></i>
                {cert.name}
              </span>
            ))
          ) : (
            <p className="text-muted small mb-0">No certifications added yet.</p>
          )}
        </div>

        <div className="column-card-section-title">Awards & Achievements</div>
        <div className="skills-container">
          {awards && awards.length > 0 ? (
            awards.map((award, idx) => (
              <span
                key={award.id || idx}
                className="skill-tag-chip cursor-pointer"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedAward(award)}
                title="Click to view details"
              >
                <i className="fas fa-award text-primary me-1.5" style={{ fontSize: '0.8rem' }}></i>
                <strong className="text-dark">{award.title}</strong>
                <span className="text-muted small ms-1.5">({formatAwardDate(award.date)})</span>
                <span className="text-secondary small ms-1.5">• {award.issuer}</span>
              </span>
            ))
          ) : (
            <p className="text-muted small mb-0">No awards added yet.</p>
          )}
        </div>
      </div>

      {/* Recent Posts Section */}
      <div className="mt-4 pt-3 border-top w-100">
        <CandidatePosts candidatePosts={candidatePosts} setCandidatePosts={setCandidatePosts} />
      </div>

      {/* Personal Info Modal */}
      {showPersonalInfo && (
        <CandidatePersonalInfoModal
          show={showPersonalInfo}
          profileData={profileData}
          onClose={() => setShowPersonalInfo(false)}
        />
      )}

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
