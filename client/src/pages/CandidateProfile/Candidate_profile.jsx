import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Candidate_profile.css';
import CandidatePersonalInfoModal from './CandidatePersonalInfoModal';
import CandidateExperience, { CandidateExperienceManager } from './CandidateExperience';
import CandidateEducation, { CandidateEducationManager } from './CandidateEducation';
import CandidateSkills, { CandidateSkillsManager } from './CandidateSkills';
import CandidatePosts from './CandidatePosts';
import CandidateWallet from './CandidateWallet';
import CandidateCV from './CandidateCV';
import CandidateExportModal from './CandidateExportModal';
import CandidateApplications from './CandidateApplications';
import CandidateAppliedJobs from './CandidateAppliedJobs';
import { useWallet } from '../../context/WalletContext';


const CandidateProfile = () => {
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [activeEditTab, setActiveEditTab] = useState('info'); // 'info' or 'profile'
  const [showWallet, setShowWallet] = useState(false);
  const [modalError, setModalError] = useState('');


  // Real Wallet Data
  const { coins } = useWallet();

  // Dynamic Profile Data State
  const [profileData, setProfileData] = useState({
    displayName: '',
    jobTitle: '',
    address: '',
    fullName: '',
    email: '',
    phone: '',
    hidePhone: false,
    nationality: '',
    portfolio: '',
    github: '',
    facebook: '',
    avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp'
  });

  // Dynamic Skills State
  const [skills, setSkills] = useState([]);

  const [educations, setEducations] = useState([]);
  const [workExperiences, setWorkExperiences] = useState([]);

  const [followedBusinesses, setFollowedBusinesses] = useState([]);

  const [candidatePosts, setCandidatePosts] = useState([]);

  const [cvList, setCvList] = useState([]); // Mảng chứa danh sách CV

  // Hàm gọi API lấy danh sách CV
  const fetchCVs = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:5000/api/candidate/my-cvs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCvList(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách CV:", err);
    }
  };


  const [showExportModal, setShowExportModal] = useState(false);
  const [showCVModal, setShowCVModal] = useState(false); // Trạng thái mở/đóng cửa sổ CV
  const [showAppliedJobsModal, setShowAppliedJobsModal] = useState(false); // Trạng thái mở/đóng lịch sử ứng tuyển

  // Temporary Form States for Modals
  const [editProfileForm, setEditProfileForm] = useState(null);

  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [currentExperience, setCurrentExperience] = useState(null);
  const [experienceForm, setExperienceForm] = useState({ role: '', company: '', startDate: '', endDate: '' });

  const [showEducationModal, setShowEducationModal] = useState(false);
  const [currentEducation, setCurrentEducation] = useState(null);
  const [educationForm, setEducationForm] = useState({ degree: '', school: '', startDate: '', gradDate: '' });

  const [showSkillModal, setShowSkillModal] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null);
  const [skillForm, setSkillForm] = useState({ name: '', level: 50 });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const loadProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/candidate/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profile = res.data;

        // Map database fields to react state
        setProfileData(prev => ({
          ...prev,
          displayName: profile.display_name || profile.full_name || prev.displayName,
          fullName: profile.full_name || prev.fullName,
          jobTitle: profile.headline || prev.jobTitle,
          address: profile.address || prev.address,
          email: profile.email || prev.email,
          phone: profile.phone || prev.phone || '',
          hidePhone: localStorage.getItem('hide_phone_' + profile.email) === 'true',
          avatar: profile.avatar_url || prev.avatar
        }));

        if (profile.skills && Array.isArray(profile.skills)) {
          setSkills(profile.skills.map((s, idx) => ({ id: idx + 1, name: s.name, level: s.level })));
        }

        if (profile.education && Array.isArray(profile.education)) {
          const formatMonthYear = (val) => {
            if (!val) return '';
            const parts = val.split('-');
            if (parts.length === 2) {
              return `${parts[1]}/${parts[0]}`; // MM/YYYY
            }
            return val;
          };

          setEducations(profile.education.map((e, idx) => {
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
              startDate: e.startDate,
              gradDate: e.gradDate
            };
          }));
        }

        if (profile.experience && Array.isArray(profile.experience)) {
          const formatMonthYear = (val) => {
            if (!val) return '';
            const parts = val.split('-');
            if (parts.length === 2) {
              return `${parts[1]}/${parts[0]}`; // MM/YYYY
            }
            return val;
          };

          setWorkExperiences(profile.experience.map((e, idx) => {
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
              startDate: e.startDate,
              endDate: e.endDate
            };
          }));
        }

        // Fetch followed companies to fill interests
        try {
          const followRes = await axios.get('http://localhost:5000/api/candidate/companies', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (followRes.data && Array.isArray(followRes.data)) {
            const followedOnly = followRes.data.filter(c => c.is_followed);
            if (followedOnly.length > 0) {
              setFollowedBusinesses(followedOnly.map(c => ({
                id: c.id,
                name: c.name,
                category: c.industry_name || 'Technology',
                followers: 'Premium Recruiter'
              })));
            }
          }
        } catch (followErr) {
          console.error("Failed to load followed companies:", followErr);
        }

      } catch (err) {
        console.error("Failed to load database profile, using mock fallbacks:", err);
      }
    };

    loadProfile();
    fetchCVs(); // lấy danh sách CV
  }, []);

  // Helper: save data to server directly (bypasses React state timing issues)
  const saveToServer = async (overrideData = {}) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const formData = new FormData();
      formData.append('full_name', profileData.fullName);
      formData.append('display_name', profileData.displayName);
      formData.append('phone', profileData.phone || '');
      formData.append('headline', profileData.jobTitle || '');
      formData.append('address', profileData.address || '');

      const currentEdu = overrideData.educations || educations;
      const currentExp = overrideData.workExperiences || workExperiences;
      const currentSkills = overrideData.skills || skills;

      formData.append('education', JSON.stringify(currentEdu.map(edu => ({
        school: edu.school, degree: edu.degree, startDate: edu.startDate, gradDate: edu.gradDate
      }))));
      formData.append('experience', JSON.stringify(currentExp.map(exp => ({
        company: exp.company, role: exp.role, startDate: exp.startDate, endDate: exp.endDate
      }))));
      formData.append('skills', JSON.stringify(currentSkills.map(s => ({ name: s.name, level: s.level }))));

      await axios.put('http://localhost:5000/api/candidate/profile', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      console.log('Auto-saved successfully!');
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    // Validate Display Name
    if (!editProfileForm.displayName.trim()) {
      setModalError('Display Name is required!');
      return;
    }
    if (!lettersOnlyRegex.test(editProfileForm.displayName.trim())) {
      setModalError('Display Name can only contain letters and spaces!');
      return;
    }
    // Validate Full Name
    if (editProfileForm.fullName.trim() && !lettersOnlyRegex.test(editProfileForm.fullName.trim())) {
      setModalError('Full Name can only contain letters and spaces!');
      return;
    }
    // Validate Phone Number
    if (editProfileForm.phone && editProfileForm.phone.trim() && !/^\d{10}$/.test(editProfileForm.phone.trim())) {
      setModalError('Phone Number must be exactly 10 digits!');
      return;
    }

    try {
      // Tạo đối tượng FormData để chứa cả text và file
      const formData = new FormData();
      formData.append('full_name', editProfileForm.fullName);
      formData.append('display_name', editProfileForm.displayName);
      formData.append('phone', editProfileForm.phone || '');
      formData.append('headline', editProfileForm.jobTitle || '');
      formData.append('address', editProfileForm.address || '');
      // Các trường dạng mảng thì phải chuyển thành chuỗi JSON trước khi nhét vào FormData
      formData.append('education', JSON.stringify(educations.map(edu => ({
        school: edu.school,
        degree: edu.degree,
        startDate: edu.startDate,
        gradDate: edu.gradDate
      }))));

      formData.append('experience', JSON.stringify(workExperiences.map(exp => ({
        company: exp.company,
        role: exp.role,
        startDate: exp.startDate,
        endDate: exp.endDate
      }))));

      formData.append('skills', JSON.stringify(skills.map(skill => ({ name: skill.name, level: skill.level }))));

      if (editProfileForm.avatarFile) {
        formData.append('avatar', editProfileForm.avatarFile);
      }

      await axios.put('http://localhost:5000/api/candidate/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setProfileData(editProfileForm);
      localStorage.setItem('hide_phone_' + editProfileForm.email, editProfileForm.hidePhone ? 'true' : 'false');
      if (e.type !== 'autosave') {
        setShowEdit(false);
      }
    } catch (err) {
      console.error("Failed to save profile changes:", err);
      setModalError("Error occurred while saving profile. Please try again.");
    }
  };



  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type (only images allowed)
    if (!file.type.startsWith('image/')) {
      setModalError("Invalid file type! Only image files (png, jpg, jpeg, gif, webp) are allowed.");
      return;
    }

    // Validate size under 5MB (5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      setModalError("Avatar file size must be under 5MB!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditProfileForm(prev => ({
        ...prev,
        avatar: reader.result,
        avatarFile: file
      }));
    };
    reader.readAsDataURL(file);
  };

  // Event Handlers for Experience CRUD
  const parseDuration = (durationStr) => {
    let startDate = '';
    let endDate = '';
    if (durationStr) {
      const parts = durationStr.split(' - ');
      const parseMMYYYY = (val) => {
        if (!val || val === 'Present' || val === 'Hiện tại') return '';
        const subparts = val.split('/');
        if (subparts.length === 2) {
          return `${subparts[1]}-${subparts[0].padStart(2, '0')}`; // YYYY-MM
        }
        return '';
      };
      if (parts.length === 2) {
        startDate = parseMMYYYY(parts[0]);
        endDate = parseMMYYYY(parts[1]);
      } else if (parts.length === 1) {
        startDate = parseMMYYYY(parts[0]);
      }
    }
    return { startDate, endDate };
  };

  const handleOpenExperienceModal = (exp = null) => {
    setModalError('');
    if (exp) {
      setCurrentExperience(exp);
      const parsed = parseDuration(exp.duration);
      setExperienceForm({
        role: exp.role,
        company: exp.company,
        startDate: parsed.startDate,
        endDate: parsed.endDate
      });
    } else {
      setCurrentExperience(null);
      setExperienceForm({ role: '', company: '', startDate: '', endDate: '' });
    }
    setShowExperienceModal(true);
  };

  const lettersOnlyRegex = /^[\p{L}\s]*$/u;

  const handleSaveExperience = (e) => {
    e.preventDefault();

    if (experienceForm.role && !lettersOnlyRegex.test(experienceForm.role)) {
      setModalError("Job Title / Role cannot contain numbers or special characters!");
      return;
    }
    if (experienceForm.company && !lettersOnlyRegex.test(experienceForm.company)) {
      setModalError("Company Name cannot contain numbers or special characters!");
      return;
    }

    if (!experienceForm.startDate) {
      setModalError("Start Date is required!");
      return;
    }

    // Validate start year <= current year
    const startYear = parseInt(experienceForm.startDate.split('-')[0]);
    const currentYear = new Date().getFullYear();
    if (startYear > currentYear) {
      setModalError(`Start year (${startYear}) cannot be in the future (must be <= ${currentYear})!`);
      return;
    }

    // Validate end date >= start date
    if (experienceForm.endDate && experienceForm.endDate < experienceForm.startDate) {
      setModalError("End Date cannot be earlier than Start Date!");
      return;
    }

    // Format output duration text
    const formatMonthYear = (val) => {
      if (!val) return '';
      const parts = val.split('-');
      if (parts.length === 2) {
        return `${parts[1]}/${parts[0]}`; // MM/YYYY
      }
      return val;
    };

    const formattedStart = formatMonthYear(experienceForm.startDate);
    const formattedEnd = experienceForm.endDate ? formatMonthYear(experienceForm.endDate) : 'Present';
    const durationText = `${formattedStart} - ${formattedEnd}`;

    const finalExperience = {
      role: experienceForm.role,
      company: experienceForm.company,
      duration: durationText,
      startDate: experienceForm.startDate,
      endDate: experienceForm.endDate
    };

    let newWorkExperiences;
    if (currentExperience) {
      newWorkExperiences = workExperiences.map(item => item.id === currentExperience.id ? { ...item, ...finalExperience } : item);
    } else {
      const newId = workExperiences.length > 0 ? Math.max(...workExperiences.map(i => i.id)) + 1 : 1;
      newWorkExperiences = [...workExperiences, { id: newId, ...finalExperience }];
    }
    setWorkExperiences(newWorkExperiences);
    setShowExperienceModal(false);
    saveToServer({ workExperiences: newWorkExperiences });
  };

  const handleOpenEducationModal = (edu = null) => {
    setModalError('');
    if (edu) {
      setCurrentEducation(edu);
      setEducationForm({
        degree: edu.degree,
        school: edu.school,
        startDate: edu.startDate || '',
        gradDate: edu.gradDate || ''
      });
    } else {
      setCurrentEducation(null);
      setEducationForm({ degree: '', school: '', startDate: '', gradDate: '' });
    }
    setShowEducationModal(true);
  };

  const handleSaveEducation = (e) => {
    e.preventDefault();

    if (educationForm.degree && !lettersOnlyRegex.test(educationForm.degree)) {
      setModalError("Degree / Field of Study cannot contain numbers or special characters!");
      return;
    }
    if (educationForm.school && !lettersOnlyRegex.test(educationForm.school)) {
      setModalError("School / Institute cannot contain numbers or special characters!");
      return;
    }

    if (!educationForm.startDate) {
      setModalError("Start Date is required!");
      return;
    }

    const startYear = parseInt(educationForm.startDate.split('-')[0]);
    const currentYear = new Date().getFullYear();
    if (startYear > currentYear) {
      setModalError(`Start year (${startYear}) cannot be in the future (must be <= ${currentYear})!`);
      return;
    }

    if (educationForm.gradDate && educationForm.gradDate < educationForm.startDate) {
      setModalError("Graduation Date cannot be earlier than Start Date!");
      return;
    }

    const formatMonthYear = (val) => {
      if (!val) return '';
      const parts = val.split('-');
      if (parts.length === 2) {
        return `${parts[1]}/${parts[0]}`; // MM/YYYY
      }
      return val;
    };

    const formattedStart = formatMonthYear(educationForm.startDate);
    const formattedGrad = educationForm.gradDate ? formatMonthYear(educationForm.gradDate) : 'Present';
    const durationText = `${formattedStart} - ${formattedGrad}`;

    const finalEducation = {
      degree: educationForm.degree,
      school: educationForm.school,
      duration: durationText,
      startDate: educationForm.startDate,
      gradDate: educationForm.gradDate
    };

    let newEducations;
    if (currentEducation) {
      newEducations = educations.map(item => item.id === currentEducation.id ? { ...item, ...finalEducation } : item);
    } else {
      const newId = educations.length > 0 ? Math.max(...educations.map(i => i.id)) + 1 : 1;
      newEducations = [...educations, { id: newId, ...finalEducation }];
    }
    setEducations(newEducations);
    setShowEducationModal(false);
    saveToServer({ educations: newEducations });
  };

  const handleDeleteExperience = (id) => {
    const newWorkExperiences = workExperiences.filter(item => item.id !== id);
    setWorkExperiences(newWorkExperiences);
    saveToServer({ workExperiences: newWorkExperiences });
  };

  const handleDeleteEducation = (id) => {
    const newEducations = educations.filter(item => item.id !== id);
    setEducations(newEducations);
    saveToServer({ educations: newEducations });
  };

  // Event Handlers for Skill CRUD
  const handleOpenSkillModal = (skill = null) => {
    setModalError('');
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

    if (skillForm.name && !lettersOnlyRegex.test(skillForm.name)) {
      setModalError("Core Skill cannot contain numbers or special characters!");
      return;
    }

    let newSkills;
    if (currentSkill) {
      newSkills = skills.map(item => item.id === currentSkill.id ? { ...item, ...skillForm } : item);
    } else {
      const newId = skills.length > 0 ? Math.max(...skills.map(i => i.id)) + 1 : 1;
      newSkills = [...skills, { id: newId, ...skillForm }];
    }
    setSkills(newSkills);
    setShowSkillModal(false);
    saveToServer({ skills: newSkills });
  };

  const handleDeleteSkill = (id) => {
    const newSkills = skills.filter(item => item.id !== id);
    setSkills(newSkills);
    saveToServer({ skills: newSkills });
  };

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
                      <button
                        type="button"
                        onClick={() => setShowCVModal(true)}
                        className="btn btn-outline-success d-inline-flex align-items-center gap-1.5 fw-semibold shadow-sm rounded"
                      >
                        <i className="far fa-file-pdf text-success"></i> Manage My CVs ({cvList.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAppliedJobsModal(true)}
                        className="btn btn-outline-primary d-inline-flex align-items-center gap-1.5 fw-semibold shadow-sm rounded"
                      >
                        <i className="fas fa-history text-primary"></i> Applied Jobs
                      </button>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-column align-items-center align-items-md-end justify-content-start mt-4 mt-md-0 align-self-start">
                  <div className="d-flex align-items-center gap-3">
                    {/* Wallet Pill */}
                    <div
                      className="d-flex align-items-center gap-2 bg-light px-3 py-2 rounded-pill shadow-sm border hover-shadow-sm transition-all"
                      onClick={() => setShowWallet(true)}
                      style={{ cursor: 'pointer', border: '1px solid #dee2e6' }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>🪙</span>
                      <span className="fw-bold text-dark">{coins || 0} Coins</span>
                      <button className="btn btn-sm btn-primary rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                        <i className="fas fa-wallet" style={{ fontSize: '0.8rem' }}></i>
                      </button>
                    </div>

                    {/* Export CV Button has been moved */}

                    {/* Edit Profile (Settings Gear Icon) */}
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                      style={{ width: '42px', height: '42px', border: '1px solid #dee2e6', background: '#ffffff' }}
                      title="Edit Profile"
                      onClick={() => { setEditProfileForm({ ...profileData }); setModalError(''); setShowEdit(true); }}
                    >
                      <i className="fas fa-cog text-secondary" style={{ fontSize: '1.1rem' }}></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* Sub-Components extracted for cleaner layout */}
          <CandidatePersonalInfoModal
            show={showPersonalInfo}
            onClose={() => setShowPersonalInfo(false)}
            profileData={profileData}
          />

          <CandidateEducation
            educations={educations}
            onOpenModal={handleOpenEducationModal}
            onDelete={handleDeleteEducation}
            showModal={showEducationModal}
            onCloseModal={() => setShowEducationModal(false)}
            currentEducation={currentEducation}
            educationForm={educationForm}
            setEducationForm={setEducationForm}
            onSave={handleSaveEducation}
            modalError={modalError}
          />

          <CandidateExperience
            workExperiences={workExperiences}
            onOpenModal={handleOpenExperienceModal}
            onDelete={handleDeleteExperience}
            showModal={showExperienceModal}
            onCloseModal={() => setShowExperienceModal(false)}
            currentExperience={currentExperience}
            experienceForm={experienceForm}
            setExperienceForm={setExperienceForm}
            onSave={handleSaveExperience}
            modalError={modalError}
          />

          <CandidateSkills
            skills={skills}
            onOpenModal={handleOpenSkillModal}
            onDelete={handleDeleteSkill}
            showModal={showSkillModal}
            onCloseModal={() => setShowSkillModal(false)}
            currentSkill={currentSkill}
            skillForm={skillForm}
            setSkillForm={setSkillForm}
            onSave={handleSaveSkill}
            modalError={modalError}
          />

          {/* Wallet Modal */}
          <CandidateWallet
            show={showWallet}
            onClose={() => setShowWallet(false)}
          />

          {/* Column 3: Interests */}
          <div className="col-12 col-lg-3 mb-4 d-flex">
            <div className="card border-0 shadow-sm analytics-card w-100 d-flex flex-column h-100">
              <div className="card-body p-4 d-flex flex-column h-100">
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-5 fw-bold text-dark mb-0">Interests</span>
                  </div>
                  <i className="fas fa-heart text-primary fs-4"></i>
                </div>

                <div className="d-flex flex-column gap-3 flex-grow-1 justify-content-start">
                  {followedBusinesses.length === 0 ? (
                    <div className="text-center py-5 text-muted small">
                      <i className="far fa-heart fs-3 mb-2 text-muted opacity-50"></i>
                      <p className="mb-0">No followed recruiters yet.</p>
                    </div>
                  ) : (
                    followedBusinesses.map((biz) => (
                      <div key={biz.id} className="experience-item p-3 rounded border bg-light hover-shadow-sm transition-all d-flex flex-column align-items-start gap-2">
                        <div className="d-flex align-items-center gap-2 w-100">
                          <div className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm" style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                            <i className="fas fa-building text-primary fs-6"></i>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <h6 className="fw-bold mb-0 text-dark text-truncate" style={{ fontSize: '0.85rem' }} title={biz.name}>{biz.name}</h6>
                            <p className="mb-0 text-muted text-truncate" style={{ fontSize: '0.7rem' }}>{biz.category}</p>
                          </div>
                        </div>
                        <button className="btn btn-xs btn-outline-primary rounded-pill px-3 py-1 fw-semibold d-flex align-items-center justify-content-center gap-1 w-100 mt-1" style={{ fontSize: '0.75rem' }}>
                          <i className="fas fa-check" style={{ fontSize: '0.6rem' }}></i> Followed
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <CandidatePosts
            candidatePosts={candidatePosts}
          />
          
          <CandidateApplications />
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
            </div>

            <form onSubmit={handleSaveProfile} className="profile-modal-body p-4 scrollable-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {modalError && (
                <div className="alert alert-danger py-2 px-3 mb-3 small border-0 shadow-sm" role="alert">
                  <i className="fas fa-exclamation-triangle me-1.5"></i> {modalError}
                </div>
              )}

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
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-secondary small">Nationality</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editProfileForm.nationality}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, nationality: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-secondary small">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={editProfileForm.phone || ''}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                      placeholder="e.g., +84 901 234 567"
                    />
                  </div>
                  <div className="col-12 col-md-6 d-flex align-items-center">
                    <div className="form-check form-switch mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="hidePhoneCheckbox"
                        checked={editProfileForm.hidePhone || false}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, hidePhone: e.target.checked })}
                      />
                      <label className="form-check-label fw-semibold text-secondary small mb-0" htmlFor="hidePhoneCheckbox">
                        Hide phone in Contact Info
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold text-secondary small">Address / Country</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editProfileForm.address}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, address: e.target.value })}
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
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-secondary small">GitHub</label>
                    <input
                      type="url"
                      className="form-control"
                      value={editProfileForm.github}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, github: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-secondary small">Facebook</label>
                    <input
                      type="url"
                      className="form-control"
                      value={editProfileForm.facebook}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, facebook: e.target.value })}
                    />
                  </div>
                </div>
              </div>              {/* Form Footer */}
              <div className="profile-modal-footer mt-4 pt-3 border-top d-flex gap-2 justify-content-end bg-white">
                <button type="button" className="btn btn-light border" onClick={() => setShowEdit(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage CV Modal */}
      {showCVModal && (
        <div className="profile-modal-overlay" onClick={() => setShowCVModal(false)}>
          <div className="profile-modal-card profile-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header d-flex justify-content-between align-items-center">
              <h5 className="profile-modal-title mb-0 d-flex align-items-center">
                <i className="far fa-file-pdf me-2 text-primary"></i>
                Manage My CVs
              </h5>
              <div className="d-flex align-items-center gap-3">
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm d-flex align-items-center gap-2 px-3 fw-semibold rounded-pill"
                  title="Export CV from Profile"
                  onClick={() => setShowExportModal(true)}
                >
                  <i className="fas fa-file-export"></i> Auto-Generate CV
                </button>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowCVModal(false)}></button>
              </div>
            </div>
            <div className="profile-modal-body p-4 scrollable-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <CandidateCV
                cvList={cvList}
                fetchCVs={fetchCVs}
                setModalError={setModalError}
              />
            </div>
          </div>
        </div>
      )}

      {/* Export CV Modal */}
      <CandidateExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        profileData={profileData}
        educations={educations}
        workExperiences={workExperiences}
        skills={skills}
        setModalError={setModalError}
      />

      {/* Modal Applied Jobs */}
      <CandidateAppliedJobs
        show={showAppliedJobsModal}
        onClose={() => setShowAppliedJobsModal(false)}
      />
    </section>
  );
};

export default CandidateProfile;