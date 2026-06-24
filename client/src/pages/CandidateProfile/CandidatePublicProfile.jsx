import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from 'axios';
import './Candidate_profile.css';
import CandidatePersonalInfoModal from './CandidatePersonalInfoModal';
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
      <div className="animate-fade-in container py-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
      
      {/* Navigation back */}
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-link text-secondary text-decoration-none d-inline-flex align-items-center gap-2 fw-semibold p-0" style={{ fontSize: '0.95rem' }}>
          <i className="fas fa-chevron-left" style={{ fontSize: '0.8rem' }}></i> Back
        </button>
      </div>

      <div className="row g-4">
        
        {/* ── Left Column (Overview & Social Profiles) ── */}
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
              
              {/* Dropdown list of public CVs */}
              <div className="position-relative w-100">
                <button
                  type="button"
                  className="btn w-100 rounded-pill fw-bold py-2 btn-outline-secondary transition-all d-flex align-items-center justify-content-center gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCvDropdown(!showCvDropdown);
                  }}
                >
                  <i className="far fa-file-pdf"></i> CV <i className={`fas fa-chevron-${showCvDropdown ? 'up' : 'down'}`} style={{ fontSize: '0.75rem' }}></i>
                </button>
                {showCvDropdown && (
                  <div 
                    className="dropdown-menu show position-absolute start-0 mt-2 p-2 shadow border-0 w-100" 
                    style={{ 
                      zIndex: 1000, 
                      borderRadius: '8px',
                      background: '#fff',
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
                {profileData.about || 'No bio added yet.'}
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
            <div className="border-top pt-3">
              <CandidatePosts candidatePosts={candidatePosts} setCandidatePosts={setCandidatePosts} />
            </div>
          </div>

        </div>

      </div>

      {/* Personal Contact Info Modal */}
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
    </section>
  );
}
