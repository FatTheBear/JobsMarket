import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from 'axios';
import './Candidate_profile.css';
import CandidatePosts from './CandidatePosts';

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

export default function CandidatePublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [educations, setEducations] = useState([]);
  const [workExperiences, setWorkExperiences] = useState([]);
  const [followedBusinesses, setFollowedBusinesses] = useState([]);
  const [candidatePosts, setCandidatePosts] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [awards, setAwards] = useState([]);
  const [cvList, setCvList] = useState([]);
  const [showCvDropdown, setShowCvDropdown] = useState(false);
  const [selectedAward, setSelectedAward] = useState(null);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleOutsideClick = () => {
      setShowCvDropdown(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Please log in to view this profile.");
      setLoading(false);
      return;
    }

    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`http://localhost:5000/api/candidate/public/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profile = res.data;

        // Tính tuổi dựa vào birthday
        let calculatedAge = '';
        if (profile.birthday) {
          const birthDate = new Date(profile.birthday);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          calculatedAge = age.toString();
        }

        setProfileData({
          id: profile.id,
          user_id: profile.user_id,
          displayName: profile.display_name || profile.full_name || 'Candidate',
          fullName: profile.full_name || profile.display_name || 'Candidate',
          jobTitle: profile.headline || '',
          about: profile.about || '',
          address: profile.address || '',
          email: profile.email || '',
          phone: profile.phone || '',
          age: calculatedAge || '',
          nationality: profile.nationality || '',
          hidePhone: localStorage.getItem('hide_phone_' + profile.email) === 'true',
          avatar: profile.avatar_url || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cccccc'><circle cx='12' cy='12' r='10' fill='%23e4e6eb'/><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' fill='%23ffffff'/></svg>",
          cvFile: profile.cv_url ? JSON.parse(profile.cv_url) : null,
          portfolio: profile.portfolio || '',
          github: profile.github || '',
          facebook: profile.facebook || '',
          blog: profile.blog || '',
          x: profile.x || '',
          linkedin: profile.linkedin || ''
        });

        if (profile.skills) {
          const parsedSkills = typeof profile.skills === 'string' ? JSON.parse(profile.skills) : profile.skills;
          if (Array.isArray(parsedSkills)) {
            setSkills(parsedSkills.map((s, idx) => ({ id: idx + 1, name: s.name, level: s.level })));
          }
        }

        if (profile.education) {
          const parsedEdu = typeof profile.education === 'string' ? JSON.parse(profile.education) : profile.education;
          if (Array.isArray(parsedEdu)) {
            const formatMonthYear = (val) => {
              if (!val) return '';
              const parts = val.split('-');
              if (parts.length === 2) {
                return `${parts[1]}/${parts[0]}`; // MM/YYYY
              }
              return val;
            };

            setEducations(parsedEdu.map((e, idx) => {
              let durationText = '';
              if (e.startDate && e.gradDate) {
                durationText = `${formatMonthYear(e.startDate)} - ${formatMonthYear(e.gradDate)}`;
              } else if (e.startDate) {
                durationText = `${formatMonthYear(e.startDate)} - Present`;
              } else if (e.gradDate) {
                durationText = formatMonthYear(e.gradDate);
              } else {
                durationText = 'Present';
              }

              return {
                id: idx + 1,
                degree: e.degree || 'Degree / Field of Study',
                school: e.school || 'School / Institute',
                duration: durationText,
                description: e.description || ''
              };
            }));
          }
        }

        if (profile.experience) {
          const parsedExp = typeof profile.experience === 'string' ? JSON.parse(profile.experience) : profile.experience;
          if (Array.isArray(parsedExp)) {
            const formatMonthYear = (val) => {
              if (!val) return '';
              const parts = val.split('-');
              if (parts.length === 2) {
                return `${parts[1]}/${parts[0]}`; // MM/YYYY
              }
              return val;
            };

            setWorkExperiences(parsedExp.map((e, idx) => {
              let durationText = '';
              if (e.startDate && e.endDate) {
                durationText = `${formatMonthYear(e.startDate)} - ${formatMonthYear(e.endDate)}`;
              } else if (e.startDate) {
                durationText = `${formatMonthYear(e.startDate)} - Present`;
              } else if (e.endDate) {
                durationText = formatMonthYear(e.endDate);
              } else {
                durationText = 'Present';
              }

              return {
                id: idx + 1,
                role: e.role || 'Job Title',
                company: e.company || 'Company Name',
                duration: durationText,
                description: e.description || ''
              };
            }));
          }
        }

        // Parse new profile detail fields
        if (profile.languages) {
          const parsed = typeof profile.languages === 'string' ? JSON.parse(profile.languages) : profile.languages;
          if (Array.isArray(parsed)) setLanguages(parsed);
        }
        if (profile.certifications) {
          const parsed = typeof profile.certifications === 'string' ? JSON.parse(profile.certifications) : profile.certifications;
          if (Array.isArray(parsed)) setCertifications(parsed);
        }
        if (profile.awards) {
          const parsed = typeof profile.awards === 'string' ? JSON.parse(profile.awards) : profile.awards;
          if (Array.isArray(parsed)) setAwards(parsed);
        }

        // Load followed businesses (Interests) directly from the public profile
        if (profile.interests && Array.isArray(profile.interests) && profile.interests.length > 0) {
          setFollowedBusinesses(profile.interests.map(c => ({
            id: c.id,
            name: c.name,
            category: c.industry_name || 'Professional',
            avatar: c.avatar_url || ''
          })));
        } else {
          setFollowedBusinesses([
            { id: 991, name: 'Alice Smith', category: 'Senior UX/UI Designer', avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp' },
            { id: 992, name: 'David Lee', category: 'Lead DevOps Engineer', avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava4.webp' },
            { id: 993, name: 'Emma Watson', category: 'Product Manager', avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava5.webp' }
          ]);
        }

        // Load mock candidate posts
        const authorName = profile.full_name || 'Candidate';
        const authorAvatar = profile.avatar_url || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cccccc'><circle cx='12' cy='12' r='10' fill='%23e4e6eb'/><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' fill='%23ffffff'/></svg>";

        try {
          const postsRes = await axiosInstance.get(`http://localhost:5000/api/posts/user/${profile.user_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (postsRes.data && Array.isArray(postsRes.data)) {
            setCandidatePosts(postsRes.data.map(p => ({
              id: p.id,
              user_id: p.user_id,
              author: p.author_name || authorName,
              avatar: p.author_avatar || authorAvatar,
              time: p.created_at ? new Date(p.created_at).toLocaleDateString('vi-VN') : 'Just now',
              content: p.content,
              mediaList: p.mediaList || [],
              likes: p.likes_count || 0,
              comments: p.comments_count || 0,
              shares: p.reposts_count || 0,
              is_liked: p.is_liked || 0,
              user_role: p.user_role,
              parent_post_id: p.parent_post_id,
              parent_author_id: p.parent_author_id,
              parent_content: p.parent_content,
              parent_media_url: p.parent_media_url,
              parent_media_type: p.parent_media_type,
              parent_author_name: p.parent_author_name,
              parent_author_avatar: p.parent_author_avatar,
              parent_user_role: p.parent_user_role,
              parent_author_title: p.parent_author_title,
              parent_created_at: p.parent_created_at
            })));
          }
        } catch (postsErr) {
          console.error("Failed to load user posts from DB for public profile:", postsErr);
          setCandidatePosts([]);
        }

        // Load public CVs list
        try {
          const cvsRes = await axiosInstance.get(`http://localhost:5000/api/candidate/public/${id}/cvs`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCvList(cvsRes.data || []);
        } catch (cvsErr) {
          console.error("Failed to load CVs for public profile:", cvsErr);
          setCvList([]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to load public profile:", err);
        setError(err.response?.data?.message || "Failed to load candidate profile.");
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [id]);

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

  const cvFile = profileData.cvFile;

  return (
    <section className="profile-section">
      <div className="animate-fade-in container py-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-link text-secondary text-decoration-none d-inline-flex align-items-center gap-2 fw-semibold p-0" style={{ fontSize: '0.95rem' }}>
          <i className="fas fa-chevron-left" style={{ fontSize: '0.8rem' }}></i> Back
        </button>
      </div>

      <div className="profile-main-container-card p-4 animate-fade-in">
        
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
          </div>
        </div>

        {/* ── Contact Card (Only Real Database Data) ── */}
        <div className="profile-details-card shadow-sm mb-4">
          <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
            <h5 className="fw-bold text-dark m-0" style={{ fontSize: '1.1rem' }}>
              Contact
            </h5>
            <div className="position-relative">
              <button
                type="button"
                className="btn btn-outline-secondary fw-semibold rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-2 transition-all"
                style={{ fontSize: '0.9rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCvDropdown(!showCvDropdown);
                }}
              >
                <i className="far fa-file-pdf text-danger"></i> CV <i className={`fas fa-chevron-${showCvDropdown ? 'up' : 'down'}`} style={{ fontSize: '0.75rem' }}></i>
              </button>
              {showCvDropdown && (
                <div 
                  className="dropdown-menu show position-absolute end-0 mt-2 p-2 shadow border-0" 
                  style={{ 
                    zIndex: 1000, 
                    borderRadius: '8px',
                    background: '#fff',
                    width: '240px',
                    maxHeight: '280px',
                    overflowY: 'auto'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {cvList.length > 0 ? (
                    cvList.map(cv => (
                      <a
                        key={cv.id}
                        href={cv.dataUrl}
                        download={cv.name}
                        className="dropdown-item d-flex flex-column align-items-start gap-1 py-2 px-3 rounded hover-bg-light text-decoration-none"
                        style={{ borderBottom: '1px solid #f1f5f9' }}
                      >
                        <span className="fw-semibold text-dark text-truncate w-100" style={{ fontSize: '0.85rem' }} title={cv.name}>
                          {cv.name}
                        </span>
                        <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                          {cv.uploadedAt} • {cv.size}
                        </span>
                      </a>
                    ))
                  ) : (
                    <div className="text-muted text-center py-2 small">No CV uploaded.</div>
                  )}
                </div>
              )}
            </div>
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

              {/* Age */}
              {profileData.age && (
                <div className="detail-grid-item m-0">
                  <div className="detail-item-icon">
                    <i className="fas fa-birthday-cake text-muted"></i>
                  </div>
                  <div className="detail-item-content">
                    <span className="detail-item-label">Age</span>
                    <span className="detail-item-value">{profileData.age}</span>
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
          
          {/* About Me Section */}
          <div className="mb-4">
            <h5 className="fw-bold text-dark mb-3">
              <i className="far fa-user text-primary me-2"></i>About Me
            </h5>
            <p className="text-secondary small mb-0" style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {profileData.about || 'No bio added yet.'}
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
                    <span key={lang.id || idx} className="skill-tag-chip">
                      <i className="fas fa-globe text-primary me-1.5" style={{ fontSize: '0.75rem' }}></i>
                      <strong className="text-dark">{lang.name}</strong>
                      <span className="text-muted small ms-1.5">({lang.level})</span>
                    </span>
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
                      <i className="fas fa-award text-primary me-1.5" style={{ fontSize: '0.75rem' }}></i>
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

        {/* ── Community Posts Section ── */}
        <div className="profile-details-card shadow-sm mb-0">
          <h5 className="fw-bold text-dark mb-4">
            <i className="fas fa-history text-primary me-2"></i>Community Posts
          </h5>
          <div className="border-top pt-3">
            <CandidatePosts candidatePosts={candidatePosts} setCandidatePosts={setCandidatePosts} />
          </div>
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
    </section>
  );
}
