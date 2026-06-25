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
    <div className="animate-fade-in container py-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
      <div className="row g-4">
        
        {/* ── Left Column (Overview & Personal Details) ── */}
        <div className="col-12 col-lg-4">
          
          {/* Candidate Overview Card */}
          <div className="card border-0 shadow-sm p-4 text-center" style={{ borderRadius: '12px', background: '#fff' }}>
            <div className="position-relative mx-auto mb-3" style={{ width: '120px', height: '120px' }}>
              <img
                src={profileData.avatar || '/default-avatar.png'}
                alt="candidate avatar"
                className="rounded-circle border border-2 shadow-sm w-100 h-100"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <h4 className="fw-bold text-dark mb-1">{profileData.displayName || 'Candidate Name'}</h4>
            <p className="text-primary small fw-semibold mb-3">{profileData.jobTitle || 'Full Stack Web Developer'}</p>
            
            <div className="d-flex justify-content-center gap-4 border-top border-bottom py-2.5 my-3 text-muted small">
              <div>
                <span className="d-block fw-bold text-dark fs-5">{calculateCustomExperienceYears(workExperiences)}</span>
                Years Exp
              </div>
              <div className="border-end"></div>
              <div>
                <span className="d-block fw-bold text-dark fs-5">{profileData.age || 'N/A'}</span>
                Age
              </div>
            </div>

            <div className="d-flex flex-column gap-2 mt-3">
              <button
                type="button"
                className="btn w-100 rounded-pill fw-bold py-2 text-white transition-all"
                onClick={() => setShowPersonalInfo(true)}
                style={{ backgroundColor: '#01796F', borderColor: '#01796F' }}
              >
                Contact Info
              </button>
              <Link
                to="/candidate/my-profile/manage-cvs"
                className="btn w-100 rounded-pill fw-bold py-2 btn-outline-secondary transition-all text-decoration-none d-flex align-items-center justify-content-center"
              >
                Manage CVs
              </Link>
            </div>
          </div>

          {/* Social Profiles Card */}
          <div className="card border-0 shadow-sm p-4 mt-4" style={{ borderRadius: '12px', background: '#fff' }}>
            <h5 className="fw-bold text-dark mb-3">
              <i className="fas fa-share-alt text-primary me-2"></i>Social Profiles
            </h5>
            <div className="d-flex gap-3 flex-wrap justify-content-center">
              <a
                href={profileData.portfolio || '#'}
                target={profileData.portfolio ? "_blank" : undefined}
                rel="noopener noreferrer"
                title={profileData.portfolio ? "Website/Portfolio" : "No Portfolio"}
                style={{
                  pointerEvents: profileData.portfolio ? 'auto' : 'none',
                  opacity: profileData.portfolio ? 1 : 0.35,
                  color: '#0d6efd',
                  fontSize: '1.25rem'
                }}
              >
                <i className="fas fa-globe"></i>
              </a>
              <a
                href={profileData.blog || '#'}
                target={profileData.blog ? "_blank" : undefined}
                rel="noopener noreferrer"
                title={profileData.blog ? "Blog" : "No Blog"}
                style={{
                  pointerEvents: profileData.blog ? 'auto' : 'none',
                  opacity: profileData.blog ? 1 : 0.35,
                  color: '#198754',
                  fontSize: '1.25rem'
                }}
              >
                <i className="fas fa-blog"></i>
              </a>
              <a
                href={profileData.github || '#'}
                target={profileData.github ? "_blank" : undefined}
                rel="noopener noreferrer"
                title={profileData.github ? "GitHub" : "No GitHub"}
                style={{
                  pointerEvents: profileData.github ? 'auto' : 'none',
                  opacity: profileData.github ? 1 : 0.35,
                  color: '#212529',
                  fontSize: '1.25rem'
                }}
              >
                <i className="fab fa-github"></i>
              </a>
              <a
                href={profileData.facebook || '#'}
                target={profileData.facebook ? "_blank" : undefined}
                rel="noopener noreferrer"
                title={profileData.facebook ? "Facebook" : "No Facebook"}
                style={{
                  pointerEvents: profileData.facebook ? 'auto' : 'none',
                  opacity: profileData.facebook ? 1 : 0.35,
                  color: '#1877f2',
                  fontSize: '1.25rem'
                }}
              >
                <i className="fab fa-facebook"></i>
              </a>
              <a
                href={profileData.x || '#'}
                target={profileData.x ? "_blank" : undefined}
                rel="noopener noreferrer"
                title={profileData.x ? "X (Twitter)" : "No X Profile"}
                style={{
                  pointerEvents: profileData.x ? 'auto' : 'none',
                  opacity: profileData.x ? 1 : 0.35,
                  color: '#0f1419',
                  fontSize: '1.25rem'
                }}
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href={profileData.linkedin || '#'}
                target={profileData.linkedin ? "_blank" : undefined}
                rel="noopener noreferrer"
                title={profileData.linkedin ? "LinkedIn" : "No LinkedIn"}
                style={{
                  pointerEvents: profileData.linkedin ? 'auto' : 'none',
                  opacity: profileData.linkedin ? 1 : 0.35,
                  color: '#0a66c2',
                  fontSize: '1.25rem'
                }}
              >
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>


        </div>

        {/* ── Right Column (Profile details: About, Exp, Edu, Skills, Posts) ── */}
        <div className="col-12 col-lg-8">
          
          {/* Candidate Profile Details Card (About, Exp, Edu, Skills) */}
          <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '12px', background: '#fff' }}>
            
            {/* About Me Section */}
            <div className="mb-4">
              <h5 className="fw-bold text-dark mb-3">
                <i className="far fa-user text-primary me-2"></i>About Me
              </h5>
              <p className="text-secondary small mb-0" style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {profileData.about || 'No bio added yet. Go to Account Settings to add a description about yourself.'}
              </p>
            </div>

            {/* Work Experience Section */}
            <div className="border-top pt-4 mb-4">
              <h5 className="fw-bold text-dark mb-4">
                <i className="fas fa-briefcase text-primary me-2"></i>Work Experience
              </h5>
              <div className="d-flex flex-column gap-3.5">
                {workExperiences && workExperiences.length > 0 ? (
                  workExperiences.map((exp, idx) => (
                    <div key={exp.id || idx} className="mb-4 profile-text-entry">
                      <div>
                        <h5 className="m-0 fw-bold text-dark" style={{ fontSize: '1.05rem' }}>
                          {exp.role}
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
            </div>

            {/* Education Section */}
            <div className="border-top pt-4 mb-4">
              <h5 className="fw-bold text-dark mb-4">
                <i className="fas fa-university text-primary me-2"></i>Education
              </h5>
              <div className="d-flex flex-column gap-3.5">
                {educations && educations.length > 0 ? (
                  educations.map((edu, idx) => (
                    <div key={edu.id || idx} className="mb-4 profile-text-entry">
                      <div>
                        <h5 className="m-0 fw-bold text-dark" style={{ fontSize: '1.05rem' }}>
                          {edu.degree}
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
            </div>

            {/* Skills & Qualifications Section */}
            <div className="border-top pt-4">
              <h5 className="fw-bold text-dark mb-4">
                <i className="fas fa-star text-primary me-2"></i>Skills & Qualifications
              </h5>
              
              {/* Skills section */}
              <div className="mb-4">
                <div className="fw-bold text-dark mb-2" style={{ fontSize: '0.95rem' }}>Technical Skills</div>
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

              {/* Languages section */}
              <div className="mb-4 border-top pt-3">
                <div className="fw-bold text-dark mb-2" style={{ fontSize: '0.95rem' }}>Languages</div>
                <div className="skills-container d-flex flex-wrap gap-2">
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
              </div>

              {/* Certifications section */}
              <div className="mb-4 border-top pt-3">
                <div className="fw-bold text-dark mb-2" style={{ fontSize: '0.95rem' }}>Certifications</div>
                <div className="skills-container d-flex flex-wrap gap-2">
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
              </div>

              {/* Awards section */}
              <div className="border-top pt-3">
                <div className="fw-bold text-dark mb-2" style={{ fontSize: '0.95rem' }}>Awards & Achievements</div>
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
            </div>

          </div>

          {/* Recent Activity Card */}
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '12px', background: '#fff' }}>
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

        </div>

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
