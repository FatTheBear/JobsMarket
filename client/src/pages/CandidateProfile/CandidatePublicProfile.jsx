import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CandidatePublicProfile.css';
import CandidatePersonalInfoModal from './CandidatePersonalInfoModal';
import CandidatePosts from './CandidatePosts';

export default function CandidatePublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [educations, setEducations] = useState([]);
  const [workExperiences, setWorkExperiences] = useState([]);
  const [followedBusinesses, setFollowedBusinesses] = useState([]);
  const [candidatePosts, setCandidatePosts] = useState([]);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        const res = await axios.get(`http://localhost:5000/api/candidate/public/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profile = res.data;

        setProfileData({
          id: profile.id,
          user_id: profile.user_id,
          displayName: profile.display_name || profile.full_name || 'Candidate',
          fullName: profile.full_name || 'Candidate',
          jobTitle: profile.headline || '',
          address: profile.address || '',
          email: profile.email || '',
          phone: profile.phone || '',
          hidePhone: localStorage.getItem('hide_phone_' + profile.email) === 'true',
          avatar: profile.avatar_url || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cccccc'><circle cx='12' cy='12' r='10' fill='%23e4e6eb'/><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' fill='%23ffffff'/></svg>",
          cvFile: profile.cv_url ? JSON.parse(profile.cv_url) : null
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
                duration: durationText
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
                duration: durationText
              };
            }));
          }
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

        setCandidatePosts([
          {
            id: 1,
            author: authorName,
            avatar: authorAvatar,
            time: '3 days ago',
            content: `Chào mọi người, đây là bài viết đầu tiên của tôi trên JobsMarket. Chúc các ứng viên sớm tìm được công việc mơ ước và các doanh nghiệp tuyển được nhân tài thích hợp!`,
            likes: 18,
            comments: 3,
            shares: 1
          },
          {
            id: 2,
            author: authorName,
            avatar: authorAvatar,
            time: '2 weeks ago',
            content: `Làm sao để thiết kế một CV lập trình viên thu hút nhà tuyển dụng? Đối với tôi, việc tập trung vào các dự án thực tế, mô tả công nghệ sử dụng và kết quả đạt được luôn là chìa khóa quan trọng nhất.`,
            likes: 35,
            comments: 8,
            shares: 4
          }
        ]);

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
      <div className="container py-5">

        {/* Navigation back */}
        <div className="mb-4">
          <button onClick={() => navigate('/dashboard')} className="btn btn-outline-secondary d-inline-flex align-items-center gap-1.5 fw-semibold shadow-sm rounded-pill">
            <i className="fas fa-arrow-left"></i> Back to Home
          </button>
        </div>

        <div className="row">
          {/* Main Info Card */}
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-stretch">
                <div className="d-flex flex-column flex-md-row align-items-center text-center text-md-start">
                  <div className="d-flex flex-column align-items-center mb-3 mb-md-0 me-md-4">
                    <img
                      src={profileData.avatar}
                      alt="avatar"
                      className="rounded-circle img-fluid avatar-img"
                      style={{ width: '150px' }}
                    />
                  </div>

                  <div className="text-center text-md-start mt-md-2">
                    <h4
                      className="mb-1 user-name-glow d-inline-flex align-items-center gap-2"
                      onClick={() => setShowPersonalInfo(true)}
                      title="Click to view contact information"
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      {profileData.displayName}
                      <i className="far fa-address-card contact-card-icon" style={{ fontSize: '0.95rem', transition: 'all 0.2s' }}></i>
                    </h4>
                    {profileData.jobTitle && <p className="text-muted mb-1">{profileData.jobTitle}</p>}
                    {profileData.address && <p className="text-muted mb-3">{profileData.address}</p>}
                    <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
                      <button type="button" className="btn btn-primary">
                        Follow
                      </button>
                      {cvFile && (
                        <a href={cvFile.dataUrl} download={cvFile.name} className="btn btn-outline-success d-inline-flex align-items-center gap-1.5 fw-semibold shadow-sm rounded">
                          <i className={cvFile.name.endsWith('.pdf') ? "far fa-file-pdf text-danger" : "far fa-file-word text-primary"}></i> Download CV
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left Main Content */}
          {(workExperiences.length > 0 || educations.length > 0 || skills.length > 0) && (
            <div className="col-12 d-flex flex-column gap-4 mb-4">

              {/* Experience Section */}
              {workExperiences.length > 0 && (
                <div className="w-100">
                  <div className="card border-0 shadow-sm analytics-card w-100 d-flex flex-column h-100">
                    <div className="card-body p-4 d-flex flex-column h-100">
                      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fs-5 fw-bold text-dark mb-0">Experience</span>
                        </div>
                        <i className="fas fa-briefcase text-primary fs-4"></i>
                      </div>

                      <div className="d-flex flex-column gap-3">
                        {workExperiences.map((exp, index) => (
                          <div key={exp.id || index} className="experience-item p-3 rounded border bg-light d-flex flex-column position-relative">
                            <h6 className="fw-bold mb-3 text-dark text-hover-primary" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                              {exp.role}
                            </h6>
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                              <span className="text-muted small fw-semibold" style={{ fontSize: '0.75rem' }}>
                                <i className="fas fa-building text-primary me-1.5"></i>
                                {exp.company}
                              </span>
                              <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1 fw-normal d-inline-flex align-items-center" style={{ fontSize: '0.7rem' }}>
                                <i className="far fa-calendar-alt me-1"></i>
                                {exp.duration}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Education Section */}
              {educations.length > 0 && (
                <div className="w-100">
                  <div className="card border-0 shadow-sm analytics-card w-100 d-flex flex-column h-100">
                    <div className="card-body p-4 d-flex flex-column h-100">
                      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fs-5 fw-bold text-dark mb-0">Education</span>
                        </div>
                        <i className="fas fa-graduation-cap text-primary fs-4"></i>
                      </div>

                      <div className="d-flex flex-column gap-3">
                        {educations.map((edu, index) => (
                          <div key={edu.id || index} className="experience-item p-3 rounded border bg-light d-flex flex-column position-relative">
                            <h6 className="fw-bold mb-3 text-dark text-hover-primary" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                              {edu.degree}
                            </h6>
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                              <span className="text-muted small fw-semibold" style={{ fontSize: '0.75rem' }}>
                                <i className="fas fa-university text-primary me-1.5"></i>
                                {edu.school}
                              </span>
                              <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1 fw-normal d-inline-flex align-items-center" style={{ fontSize: '0.7rem' }}>
                                <i className="far fa-calendar-alt me-1"></i>
                                {edu.duration}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Section */}
              {skills.length > 0 && (
                <div className="w-100">
                  <div className="card border-0 shadow-sm analytics-card w-100 d-flex flex-column h-100">
                    <div className="card-body p-4 d-flex flex-column h-100">
                      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fs-5 fw-bold text-dark mb-0">Skill</span>
                        </div>
                        <i className="fas fa-laptop-code text-primary fs-4"></i>
                      </div>

                      <div className="row g-3 justify-content-start">
                        {skills.map((skill, index) => (
                          <div key={skill.id || index} className="col-12 col-md-6 mb-2">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <p className="mb-0 text-small fw-semibold text-dark">{skill.name}</p>
                              <span className="badge bg-light text-secondary rounded-pill px-2 py-0.5 fw-bold small">{skill.level}%</span>
                            </div>
                            <div className="progress rounded progress-custom">
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${skill.level}%` }}
                                aria-valuenow={skill.level}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          <CandidatePosts
            candidatePosts={candidatePosts}
          />
        </div>
      </div>

      <CandidatePersonalInfoModal
        show={showPersonalInfo}
        onClose={() => setShowPersonalInfo(false)}
        profileData={profileData}
      />
    </section>
  );
}
