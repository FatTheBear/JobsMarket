import React, { useState } from 'react';
import './Candidate_profile.css';

const CandidateProfile = () => {
  const [showEdit, setShowEdit] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [activeEditTab, setActiveEditTab] = useState('info'); // 'info' or 'profile'

  // Dynamic Profile Data State
  const [profileData, setProfileData] = useState({
    displayName: 'Sang 215',
    jobTitle: 'Full Stack Developer',
    address: 'TP. Thu Duc, TP. Ho Chi Minh, Viet Nam',
    fullName: 'Ho Hoang Sang',
    email: 'sang215@example.com',
    nationality: 'Viet Nam',
    portfolio: 'https://sang215.com',
    github: 'https://github.com/sang215',
    facebook: 'https://facebook.com/sang215',
    avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp'
  });

  // Dynamic Skills State
  const [skills, setSkills] = useState([
    { id: 1, name: 'Web Design', level: 80 },
    { id: 2, name: 'Website Markup', level: 72 },
    { id: 3, name: 'One Page', level: 89 },
    { id: 4, name: 'Mobile Template', level: 55 },
    { id: 5, name: 'Backend API', level: 66 }
  ]);

  const [workExperiences, setWorkExperiences] = useState([
    {
      id: 1,
      role: 'Chuyên viên Phát triển Phần mềm (Full Stack)',
      company: 'FPT Software',
      duration: 'Tháng 09/2024 - Hiện tại'
    },
    {
      id: 2,
      role: 'Lập trình viên Frontend',
      company: 'VNG Corporation',
      duration: 'Tháng 06/2023 - Tháng 08/2024'
    },
    {
      id: 3,
      role: 'Thực tập sinh Lập trình Web',
      company: 'Viettel Group',
      duration: 'Tháng 12/2022 - Tháng 05/2023'
    },
    {
      id: 4,
      role: 'Student at FPT Aptech',
      company: 'FPT Aptech',
      duration: 'Tháng 12/2020 - Tháng 11/2022'
    }
  ]);

  const [followedBusinesses, setFollowedBusinesses] = useState([
    {
      id: 1,
      name: 'Google',
      category: 'Technology & Services',
      followers: '30M followers'
    },
    {
      id: 2,
      name: 'Microsoft',
      category: 'Computer Software',
      followers: '18M followers'
    },
    {
      id: 3,
      name: 'FPT Software',
      category: 'IT Services',
      followers: '450K followers'
    },
    {
      id: 4,
      name: 'VNG Corporation',
      category: 'Entertainment & Internet',
      followers: '120K followers'
    }
  ]);

  const [candidatePosts, setCandidatePosts] = useState([
    {
      id: 1,
      author: 'Ho Hoang Sang',
      avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp',
      time: '2 ngày trước',
      content: 'Hôm nay mình rất vui được chia sẻ dự án mới "JobsMarket" - Nền tảng tuyển dụng hiện đại dành cho lập trình viên! Dự án sử dụng React, Vite, Bootstrap 5 và Node.js. Cảm ơn mọi người đã luôn đồng hành và hỗ trợ mình! 🚀💻\n\n#developer #jobsmarket #webdev',
      likes: 42,
      comments: 8,
      shares: 3
    },
    {
      id: 2,
      author: 'Ho Hoang Sang',
      avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp',
      time: '1 tuần trước',
      content: 'Chính thức hoàn thành khóa học Full Stack Web Development tại FPT Aptech! 🎓 Suốt 2 năm qua là một hành trình đầy thử thách nhưng vô cùng xứng đáng. Sẵn sàng cho những chặng đường mới phía trước!\n\n#fptaptech #graduation #fullstack',
      likes: 85,
      comments: 15,
      shares: 5
    }
  ]);

  // Temporary Form States for Modals
  const [editProfileForm, setEditProfileForm] = useState(null);

  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [currentExperience, setCurrentExperience] = useState(null);
  const [experienceForm, setExperienceForm] = useState({ role: '', company: '', duration: '' });

  const [showSkillModal, setShowSkillModal] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null);
  const [skillForm, setSkillForm] = useState({ name: '', level: 50 });

  // Event Handlers for General Info & Avatar Upload
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileData(editProfileForm);
    setShowEdit(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size under 5MB (5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      alert("Avatar file size must be under 5MB!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditProfileForm(prev => ({
        ...prev,
        avatar: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  // Event Handlers for Experience CRUD
  const handleOpenExperienceModal = (exp = null) => {
    if (exp) {
      setCurrentExperience(exp);
      setExperienceForm({ role: exp.role, company: exp.company, duration: exp.duration });
    } else {
      setCurrentExperience(null);
      setExperienceForm({ role: '', company: '', duration: '' });
    }
    setShowExperienceModal(true);
  };

  const handleSaveExperience = (e) => {
    e.preventDefault();
    if (!experienceForm.role || !experienceForm.company || !experienceForm.duration) {
      alert("Please fill in all fields!");
      return;
    }

    if (currentExperience) {
      // Edit
      setWorkExperiences(prev => prev.map(item => item.id === currentExperience.id ? { ...item, ...experienceForm } : item));
    } else {
      // Add
      const newId = workExperiences.length > 0 ? Math.max(...workExperiences.map(i => i.id)) + 1 : 1;
      setWorkExperiences(prev => [...prev, { id: newId, ...experienceForm }]);
    }
    setShowExperienceModal(false);
  };

  const handleDeleteExperience = (id) => {
    if (window.confirm("Are you sure you want to delete this experience?")) {
      setWorkExperiences(prev => prev.filter(item => item.id !== id));
    }
  };

  // Event Handlers for Skill CRUD
  const handleOpenSkillModal = (skill = null) => {
    if (skill) {
      setCurrentSkill(skill);
      setSkillForm({ name: skill.name, level: skill.level });
    } else {
      setCurrentSkill(null);
      setSkillForm({ name: '', level: 50 });
    }
    setShowSkillModal(true);
  };

  const handleSaveSkill = (e) => {
    e.preventDefault();
    if (!skillForm.name) {
      alert("Please enter a skill name!");
      return;
    }

    if (currentSkill) {
      // Edit
      setSkills(prev => prev.map(item => item.id === currentSkill.id ? { ...item, ...skillForm } : item));
    } else {
      // Add
      const newId = skills.length > 0 ? Math.max(...skills.map(i => i.id)) + 1 : 1;
      setSkills(prev => [...prev, { id: newId, ...skillForm }]);
    }
    setShowSkillModal(false);
  };

  const handleDeleteSkill = (id) => {
    if (window.confirm("Are you sure you want to delete this skill?")) {
      setSkills(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <section className="profile-section">
      <div className="container py-5">
        <div className="row">
          <div className="col">
            <nav aria-label="breadcrumb" className="bg-body-tertiary rounded-3 p-3 mb-4">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="#">Home</a></li>
                <li className="breadcrumb-item active" aria-current="page">Candidate Profile</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-body d-flex flex-column flex-md-row justify-content-between">

                <div className="d-flex flex-column flex-md-row align-items-center text-center text-md-start">
                  <img
                    src={profileData.avatar}
                    alt="avatar"
                    className="rounded-circle img-fluid avatar-img mb-3 mb-md-0 me-md-4"
                    style={{ width: '150px' }}
                  />
                  <div className="text-center text-md-start mt-md-2">
                    <h4 className="mb-1">{profileData.displayName}</h4>
                    <p className="text-muted mb-1">{profileData.jobTitle}</p>
                    <p className="text-muted mb-3">{profileData.address}</p>
                    <div>
                      <button type="button" className="btn btn-primary me-2">
                        Follow
                      </button>
                      <button type="button" className="btn btn-outline-primary">
                        Message
                      </button>
                    </div>
                  </div>
                </div>

                <div className="d-flex mt-4 mt-md-2 gap-3">
                  <a href="#" className="text-primary text-decoration-none fw-medium" onClick={(e) => { e.preventDefault(); setShowPersonalInfo(!showPersonalInfo); }}>Personal Information</a>
                  <a href="#" className="text-primary text-decoration-none fw-medium" onClick={(e) => { e.preventDefault(); setEditProfileForm({ ...profileData }); setShowEdit(true); }}>Edit Profile</a>
                </div>
              </div>
            </div>
          </div>

          <div className='col-12'>
            <div className="card mb-4 border-0 shadow-sm analytics-card">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                  <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
                    <span className="fs-5 fw-bold text-dark mb-0">Analysis</span>
                    <span className="badge bg-light text-muted border rounded-pill d-inline-flex align-items-center py-1.5 px-2.5 fw-normal small">
                      <i className="fas fa-lock text-warning me-1.5" style={{ fontSize: '0.8rem' }}></i>
                      Privacy with you (Only you can see)
                    </span>
                  </div>
                  <i className="fas fa-chart-line text-primary fs-4"></i>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <div className="p-3 rounded bg-light border-start border-primary border-3 hover-shadow-sm transition-all h-100">
                      <p className="text-secondary small fw-semibold mb-1">Views</p>
                      <div className="d-flex align-items-baseline gap-2">
                        <span className="fs-3 fw-bold text-dark">428</span>
                        <span className="text-success small fw-bold">
                          <i className="fas fa-arrow-up me-1"></i>12.4%
                        </span>
                      </div>
                      <p className="text-muted small mb-0">Last 7 days</p>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="p-3 rounded bg-light border-start border-success border-3 hover-shadow-sm transition-all h-100">
                      <p className="text-secondary small fw-semibold mb-1">Post</p>
                      <div className="d-flex align-items-baseline gap-2">
                        <span className="fs-3 fw-bold text-dark">1,254</span>
                        <span className="text-success small fw-bold">
                          <i className="fas fa-arrow-up me-1"></i>28.6%
                        </span>
                      </div>
                      <p className="text-muted small mb-0">Last 7 days</p>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="p-3 rounded bg-light border-start border-info border-3 hover-shadow-sm transition-all h-100">
                      <p className="text-secondary small fw-semibold mb-1">Follower Rate</p>
                      <div className="d-flex align-items-baseline gap-2">
                        <span className="fs-3 fw-bold text-dark">8.5%</span>
                        <span className="text-success small fw-bold">
                          <i className="fas fa-arrow-up me-1"></i>Tăng
                        </span>
                      </div>
                      <p className="text-muted small mb-0">Tổng cộng 295 người follow</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Modal */}
          {showPersonalInfo && (
            <div className="profile-modal-overlay" onClick={() => setShowPersonalInfo(false)}>
              <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="profile-modal-header">
                  <h5 className="profile-modal-title">
                    <i className="fas fa-user-circle me-2 text-primary"></i>
                    Personal Information
                  </h5>
                  <button
                    type="button"
                    className="profile-modal-close-btn"
                    onClick={() => setShowPersonalInfo(false)}
                  >
                    &times;
                  </button>
                </div>
                <div className="profile-modal-body">
                  <table className="table table-hover table-borderless mb-0">
                    <tbody>
                      <tr>
                        <th scope="row" style={{ width: '35%' }} className="text-secondary fw-semibold">Full Name</th>
                        <td className="text-dark fw-medium">{profileData.fullName}</td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-secondary fw-semibold">Email</th>
                        <td className="text-dark fw-medium">{profileData.email}</td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-secondary fw-semibold">Nationality</th>
                        <td className="text-dark fw-medium">{profileData.nationality}</td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-secondary fw-semibold">Portfolio</th>
                        <td className="text-dark fw-medium">
                          <a href={profileData.portfolio} target="_blank" rel="noopener noreferrer">
                            {profileData.portfolio}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-secondary fw-semibold">Github</th>
                        <td className="text-dark fw-medium">
                          <a href={profileData.github} target="_blank" rel="noopener noreferrer">
                            {profileData.github}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-secondary fw-semibold">Facebook</th>
                        <td className="text-dark fw-medium">
                          <a href={profileData.facebook} target="_blank" rel="noopener noreferrer">
                            {profileData.facebook}
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Column 1: Experience */}
          <div className="col-12 col-lg-4 mb-4 d-flex">
            <div className="card border-0 shadow-sm analytics-card w-100 d-flex flex-column h-100">
              <div className="card-body p-4 d-flex flex-column h-100">
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-5 fw-bold text-dark mb-0">Experience</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button onClick={() => handleOpenExperienceModal(null)} className="btn btn-sm btn-outline-primary rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }} title="Add Experience">
                      <i className="fas fa-plus" style={{ fontSize: '0.8rem' }}></i>
                    </button>
                    <i className="fas fa-briefcase text-primary fs-4"></i>
                  </div>
                </div>

                <div className="d-flex flex-column gap-3 flex-grow-1">
                  {workExperiences.map((exp, index) => (
                    <div key={exp.id || index} className="experience-item p-3 rounded border bg-light flex-grow-1 d-flex flex-column justify-content-between position-relative">
                      <div className="position-absolute top-0 end-0 mt-2 me-2 d-flex gap-2">
                        <button onClick={() => handleOpenExperienceModal(exp)} className="btn btn-link text-primary p-0" title="Edit experience">
                          <i className="fas fa-pencil-alt text-muted hover-primary" style={{ fontSize: '0.8rem' }}></i>
                        </button>
                        <button onClick={() => handleDeleteExperience(exp.id)} className="btn btn-link text-danger p-0" title="Delete experience">
                          <i className="fas fa-trash-alt text-muted hover-danger" style={{ fontSize: '0.8rem' }}></i>
                        </button>
                      </div>
                      <h6 className="fw-bold mb-2 text-dark text-hover-primary" style={{ fontSize: '0.9rem', paddingRight: '40px' }}>
                        {exp.role}
                      </h6>
                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-auto">
                        <span className="text-muted small fw-semibold" style={{ fontSize: '0.75rem' }}>
                          <i className="fas fa-building text-primary me-1.5"></i>
                          {exp.company}
                        </span>
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-1 fw-normal d-inline-flex align-items-center" style={{ fontSize: '0.7rem' }}>
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

          {/* Column 2: Skill */}
          <div className="col-12 col-lg-4 mb-4 d-flex">
            <div className="card border-0 shadow-sm analytics-card w-100 d-flex flex-column h-100">
              <div className="card-body p-4 d-flex flex-column h-100">
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-5 fw-bold text-dark mb-0">Skill</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button onClick={() => handleOpenSkillModal(null)} className="btn btn-sm btn-outline-primary rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }} title="Add Skill">
                      <i className="fas fa-plus" style={{ fontSize: '0.8rem' }}></i>
                    </button>
                    <i className="fas fa-laptop-code text-primary fs-4"></i>
                  </div>
                </div>

                <div className="d-flex flex-column justify-content-between flex-grow-1">
                  {skills.map((skill, index) => (
                    <div key={skill.id || index} className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <p className="mb-0 text-small fw-semibold text-dark">{skill.name}</p>
                        <div className="d-flex gap-2">
                          <button onClick={() => handleOpenSkillModal(skill)} className="btn btn-link text-primary p-0" title="Edit skill">
                            <i className="fas fa-pencil-alt text-muted hover-primary" style={{ fontSize: '0.8rem' }}></i>
                          </button>
                          <button onClick={() => handleDeleteSkill(skill.id)} className="btn btn-link text-danger p-0" title="Delete skill">
                            <i className="fas fa-trash-alt text-muted hover-danger" style={{ fontSize: '0.8rem' }}></i>
                          </button>
                        </div>
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

          {/* Column 3: Interests */}
          <div className="col-12 col-lg-4 mb-4 d-flex">
            <div className="card border-0 shadow-sm analytics-card w-100 d-flex flex-column h-100">
              <div className="card-body p-4 d-flex flex-column h-100">
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-5 fw-bold text-dark mb-0">Interests</span>
                  </div>
                  <i className="fas fa-heart text-primary fs-4"></i>
                </div>

                <div className="d-flex flex-column gap-3 flex-grow-1 justify-content-between">
                  {followedBusinesses.map((biz) => (
                    <div key={biz.id} className="experience-item p-3 rounded border bg-light hover-shadow-sm transition-all flex-grow-1 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <div className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm" style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                          <i className="fas fa-building text-primary fs-6"></i>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.85rem' }}>{biz.name}</h6>
                          <p className="mb-0 text-muted" style={{ fontSize: '0.7rem' }}>{biz.category}</p>
                        </div>
                      </div>
                      <button className="btn btn-xs btn-outline-primary rounded-pill px-2.5 py-0.5 fw-semibold d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                        <i className="fas fa-check" style={{ fontSize: '0.6rem' }}></i> Followed
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Posts */}
          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm analytics-card">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-5 fw-bold text-dark mb-0">Recent Posts</span>
                    <span className="badge bg-light text-muted border rounded-pill d-inline-flex align-items-center py-1.5 px-2.5 fw-normal small">
                      <i className="fas fa-history text-primary me-1.5" style={{ fontSize: '0.8rem' }}></i>
                      Your activity
                    </span>
                  </div>
                  <i className="fas fa-paper-plane text-primary fs-4"></i>
                </div>

                <div className="d-flex flex-column gap-4">
                  {candidatePosts.map((post) => (
                    <div key={post.id} className="p-3.5 rounded border bg-light">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <img
                          src={post.avatar}
                          alt="author avatar"
                          className="rounded-circle shadow-sm border"
                          style={{ width: '48px', height: '48px' }}
                        />
                        <div>
                          <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.95rem' }}>{post.author}</h6>
                          <p className="mb-0 text-muted small fw-medium">
                            Full Stack Developer • {post.time} <i className="fas fa-globe-asia ms-1"></i>
                          </p>
                        </div>
                      </div>

                      <div className="post-text text-dark mb-3" style={{ fontSize: '0.92rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                        {post.content}
                      </div>

                      <div className="d-flex align-items-center justify-content-between border-top pt-3 text-muted small">
                        <div className="d-flex align-items-center gap-4">
                          <span className="d-inline-flex align-items-center gap-1.5 hover-text-primary cursor-pointer transition-all">
                            <i className="far fa-thumbs-up fs-6"></i>
                            <span className="fw-semibold">{post.likes} Likes</span>
                          </span>
                          <span className="d-inline-flex align-items-center gap-1.5 hover-text-primary cursor-pointer transition-all">
                            <i className="far fa-comment-dots fs-6"></i>
                            <span className="fw-semibold">{post.comments} Comments</span>
                          </span>
                        </div>
                        <span className="d-inline-flex align-items-center gap-1.5 hover-text-primary cursor-pointer transition-all">
                          <i className="far fa-share-square fs-6"></i>
                          <span className="fw-semibold">{post.shares} Shares</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Edit Profile Modal */}
      {showEdit && editProfileForm && (
        <div className="profile-modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="profile-modal-card profile-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h5 className="profile-modal-title">
                <i className="fas fa-edit me-2 text-primary"></i>
                Edit Profile
              </h5>
              <button
                type="button"
                className="profile-modal-close-btn"
                onClick={() => setShowEdit(false)}
              >
                &times;
              </button>
            </div>

            {/* Tab Headers */}
            <div className="d-flex border-bottom bg-light px-3">
              <button
                type="button"
                className={`btn btn-link nav-tab-btn py-3 text-decoration-none fw-semibold ${activeEditTab === 'info' ? 'active text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                onClick={() => setActiveEditTab('info')}
                style={{ borderRadius: '0' }}
              >
                <i className="fas fa-info-circle me-1.5"></i> Information
              </button>
              <button
                type="button"
                className={`btn btn-link nav-tab-btn py-3 text-decoration-none fw-semibold ${activeEditTab === 'profile' ? 'active text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                onClick={() => setActiveEditTab('profile')}
                style={{ borderRadius: '0' }}
              >
                <i className="fas fa-list me-1.5"></i> Profile Sections
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="profile-modal-body p-4 scrollable-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {activeEditTab === 'info' ? (
                <div className="d-flex flex-column gap-3">
                  {/* Upload Avatar */}
                  <div className="d-flex flex-column align-items-center gap-2 mb-3 bg-light p-3 rounded border">
                    <img
                      src={editProfileForm.avatar}
                      alt="avatar preview"
                      className="rounded-circle shadow border"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                    <label className="btn btn-sm btn-outline-primary mt-2 position-relative cursor-pointer">
                      <i className="fas fa-upload me-1.5"></i> Upload Avatar
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="position-absolute opacity-0 top-0 start-0 w-100 h-100 cursor-pointer"
                        style={{ zIndex: 2 }}
                      />
                    </label>
                    <span className="text-muted small">Max size: 5MB</span>
                  </div>

                  {/* General Info */}
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-secondary small">Display Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editProfileForm.displayName}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, displayName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-secondary small">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editProfileForm.fullName}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-secondary small">Job Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editProfileForm.jobTitle}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, jobTitle: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-secondary small">Nationality</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editProfileForm.nationality}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, nationality: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold text-secondary small">Address / Country</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editProfileForm.address}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, address: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Contact & Links */}
                  <h6 className="fw-bold border-bottom pb-2 mt-4 text-dark"><i className="fas fa-link me-1.5 text-primary"></i> Contact & Social Links</h6>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-secondary small">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={editProfileForm.email}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-secondary small">Portfolio</label>
                      <input
                        type="url"
                        className="form-control"
                        value={editProfileForm.portfolio}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, portfolio: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-secondary small">GitHub</label>
                      <input
                        type="url"
                        className="form-control"
                        value={editProfileForm.github}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, github: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-secondary small">Facebook</label>
                      <input
                        type="url"
                        className="form-control"
                        value={editProfileForm.facebook}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, facebook: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {/* Manage Experience */}
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                      <h6 className="fw-bold mb-0 text-dark"><i className="fas fa-briefcase me-1.5 text-primary"></i> Experience</h6>
                      <button type="button" onClick={() => handleOpenExperienceModal(null)} className="btn btn-xs btn-primary rounded-pill px-2.5 py-1 fw-semibold small">
                        <i className="fas fa-plus me-1"></i> Add New
                      </button>
                    </div>
                    <div className="d-flex flex-column gap-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {workExperiences.map((exp) => (
                        <div key={exp.id} className="d-flex justify-content-between align-items-center p-2.5 rounded border bg-light">
                          <div>
                            <p className="fw-bold mb-0 text-dark small">{exp.role}</p>
                            <p className="mb-0 text-muted small">{exp.company} • {exp.duration}</p>
                          </div>
                          <div className="d-flex gap-1">
                            <button type="button" onClick={() => handleOpenExperienceModal(exp)} className="btn btn-sm btn-outline-primary px-2 py-1 rounded">
                              <i className="fas fa-pencil-alt" style={{ fontSize: '0.75rem' }}></i>
                            </button>
                            <button type="button" onClick={() => handleDeleteExperience(exp.id)} className="btn btn-sm btn-outline-danger px-2 py-1 rounded">
                              <i className="fas fa-trash-alt" style={{ fontSize: '0.75rem' }}></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Manage Skill */}
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                      <h6 className="fw-bold mb-0 text-dark"><i className="fas fa-laptop-code me-1.5 text-primary"></i> Skill</h6>
                      <button type="button" onClick={() => handleOpenSkillModal(null)} className="btn btn-xs btn-primary rounded-pill px-2.5 py-1 fw-semibold small">
                        <i className="fas fa-plus me-1"></i> Add New
                      </button>
                    </div>
                    <div className="d-flex flex-column gap-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {skills.map((skill) => (
                        <div key={skill.id} className="d-flex justify-content-between align-items-center p-2.5 rounded border bg-light">
                          <div className="w-75">
                            <p className="fw-bold mb-1 text-dark small">{skill.name} ({skill.level}%)</p>
                            <div className="progress rounded" style={{ height: '6px' }}>
                              <div className="progress-bar" role="progressbar" style={{ width: `${skill.level}%` }}></div>
                            </div>
                          </div>
                          <div className="d-flex gap-1">
                            <button type="button" onClick={() => handleOpenSkillModal(skill)} className="btn btn-sm btn-outline-primary px-2 py-1 rounded">
                              <i className="fas fa-pencil-alt" style={{ fontSize: '0.75rem' }}></i>
                            </button>
                            <button type="button" onClick={() => handleDeleteSkill(skill.id)} className="btn btn-sm btn-outline-danger px-2 py-1 rounded">
                              <i className="fas fa-trash-alt" style={{ fontSize: '0.75rem' }}></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Form Footer */}
              <div className="profile-modal-footer mt-4 pt-3 border-top d-flex gap-2 justify-content-end bg-white">
                <button type="button" className="btn btn-light border" onClick={() => setShowEdit(false)}>
                  {activeEditTab === 'info' ? 'Cancel' : 'Close'}
                </button>
                {activeEditTab === 'info' && <button type="submit" className="btn btn-primary px-4">Save Changes</button>}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Experience Modal */}
      {showExperienceModal && (
        <div className="profile-modal-overlay" style={{ zIndex: 1100 }} onClick={() => setShowExperienceModal(false)}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h5 className="profile-modal-title">
                <i className="fas fa-briefcase me-2 text-primary"></i>
                {currentExperience ? 'Edit Experience' : 'Add Experience'}
              </h5>
              <button
                type="button"
                className="profile-modal-close-btn"
                onClick={() => setShowExperienceModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveExperience} className="profile-modal-body p-4 d-flex flex-column gap-3">
              <div>
                <label className="form-label fw-semibold text-secondary small">Job Title / Role</label>
                <input
                  type="text"
                  className="form-control"
                  value={experienceForm.role}
                  onChange={(e) => setExperienceForm({ ...experienceForm, role: e.target.value })}
                  placeholder="e.g. Senior Frontend Developer"
                  required
                />
              </div>
              <div>
                <label className="form-label fw-semibold text-secondary small">Company Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={experienceForm.company}
                  onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                  placeholder="e.g. Google Corporation"
                  required
                />
              </div>
              <div>
                <label className="form-label fw-semibold text-secondary small">Working Time / Duration</label>
                <input
                  type="text"
                  className="form-control"
                  value={experienceForm.duration}
                  onChange={(e) => setExperienceForm({ ...experienceForm, duration: e.target.value })}
                  placeholder="e.g. Tháng 09/2024 - Hiện tại"
                  required
                />
              </div>
              <div className="profile-modal-footer mt-3 pt-3 border-top d-flex gap-2 justify-content-end bg-white">
                <button type="button" className="btn btn-light border" onClick={() => setShowExperienceModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Skill Modal */}
      {showSkillModal && (
        <div className="profile-modal-overlay" style={{ zIndex: 1100 }} onClick={() => setShowSkillModal(false)}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h5 className="profile-modal-title">
                <i className="fas fa-laptop-code me-2 text-primary"></i>
                {currentSkill ? 'Edit Skill' : 'Add Skill'}
              </h5>
              <button
                type="button"
                className="profile-modal-close-btn"
                onClick={() => setShowSkillModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveSkill} className="profile-modal-body p-4 d-flex flex-column gap-3">
              <div>
                <label className="form-label fw-semibold text-secondary small">Skill Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  placeholder="e.g. React.js, Tailwind CSS"
                  required
                />
              </div>
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-semibold text-secondary small mb-0">Progress Level / Competence</label>
                  <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 fw-bold">{skillForm.level}%</span>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <span className="text-muted small">0%</span>
                  <input
                    type="range"
                    className="form-range flex-grow-1"
                    min="0"
                    max="100"
                    value={skillForm.level}
                    onChange={(e) => setSkillForm({ ...skillForm, level: parseInt(e.target.value) })}
                  />
                  <span className="text-muted small">100%</span>
                </div>
              </div>
              <div className="profile-modal-footer mt-3 pt-3 border-top d-flex gap-2 justify-content-end bg-white">
                <button type="button" className="btn btn-light border" onClick={() => setShowSkillModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default CandidateProfile;