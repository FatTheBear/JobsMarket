import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CandidateExperience from './CandidateExperience';
import CandidateEducation from './CandidateEducation';
import CandidateSkills from './CandidateSkills';

// Sub-components inline for Languages, Certifications and Awards to keep page self-contained
const CandidateLanguages = ({
  languages, onOpenModal, onDelete,
  showModal, onCloseModal, currentLanguage,
  languageForm, setLanguageForm, onSave, modalError
}) => {
  const [languageSuggestions, setLanguageSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allLanguages, setAllLanguages] = useState([]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/umpirsky/language-list/master/data/en/language.json');
        if (response.ok) {
          const data = await response.json();
          const langNames = Object.values(data).sort();
          setAllLanguages(langNames);
        }
      } catch (error) {
        console.warn('Failed to fetch languages list:', error);
      }
    };
    fetchLanguages();
  }, []);

  const handleLanguageChange = (e) => {
    const val = e.target.value;
    setLanguageForm({ ...languageForm, name: val });

    if (!val.trim()) {
      setLanguageSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = allLanguages.filter(lang => 
      lang.toLowerCase().includes(val.toLowerCase())
    );
    setLanguageSuggestions(filtered.slice(0, 10));
    setShowSuggestions(true);
  };

  const selectSuggestion = (name) => {
    setLanguageForm({ ...languageForm, name });
    setLanguageSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (!showModal) {
      setLanguageSuggestions([]);
      setShowSuggestions(false);
    }
  }, [showModal]);

  return (
    <>
      <div className="w-100">
        <div className="card border-0 shadow-sm analytics-card w-100 d-flex flex-column h-100">
          <div className="card-body p-4 d-flex flex-column h-100">
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <span className="fs-5 fw-bold text-dark">Languages</span>
              <div className="d-flex align-items-center gap-2">
                <button onClick={() => onOpenModal(null)} className="btn btn-sm btn-outline-primary rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }} title="Add Language">
                  <i className="fas fa-plus" style={{ fontSize: '0.8rem' }}></i>
                </button>
                <i className="fas fa-language text-primary fs-4"></i>
              </div>
            </div>
            {languages.length === 0 ? (
              <div className="text-center py-5 text-muted small">
                <i className="fas fa-language fs-3 mb-2 text-muted opacity-50 d-block"></i>
                <p className="mb-0">No languages added yet.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {languages.map((lang, idx) => (
                  <div key={lang.id || idx} className="d-flex justify-content-between align-items-center p-2 rounded border bg-light">
                    <div>
                      <p className="mb-0 fw-semibold text-dark small">{lang.name}</p>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{lang.level}</span>
                    </div>
                    <div className="d-flex gap-2">
                      <button onClick={() => onOpenModal(lang)} className="btn btn-link text-primary p-0" title="Edit"><i className="fas fa-pencil-alt text-muted" style={{ fontSize: '0.8rem' }}></i></button>
                      <button onClick={() => onDelete(lang.id)} className="btn btn-link text-danger p-0" title="Delete"><i className="fas fa-trash-alt text-muted" style={{ fontSize: '0.8rem' }}></i></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <div className="profile-modal-overlay" style={{ zIndex: 1100 }} onClick={onCloseModal}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h5 className="profile-modal-title"><i className="fas fa-language me-2 text-primary"></i>{currentLanguage ? 'Edit Language' : 'Add Language'}</h5>
              <button type="button" className="profile-modal-close-btn" onClick={onCloseModal}>&times;</button>
            </div>
            <form onSubmit={onSave} className="profile-modal-body p-4 d-flex flex-column gap-3">
              {modalError && <div className="alert alert-danger py-2 px-3 small border-0" role="alert"><i className="fas fa-exclamation-triangle me-1"></i> {modalError}</div>}
              <div style={{ position: 'relative' }}>
                <label className="form-label fw-semibold text-secondary small">Language Name <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={languageForm.name} 
                  onChange={handleLanguageChange} 
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onFocus={() => { if (languageSuggestions.length > 0) setShowSuggestions(true); }}
                  placeholder="e.g., English, Vietnamese, Japanese" 
                  autoComplete="off"
                  required
                />
                {showSuggestions && languageSuggestions.length > 0 && (
                  <div className="address-suggestions-dropdown" style={{ zIndex: 1200 }}>
                    {languageSuggestions.map((lang, idx) => (
                      <div
                        key={idx}
                        className="address-suggestion-item"
                        onClick={() => selectSuggestion(lang)}
                      >
                        {lang}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="form-label fw-semibold text-secondary small">Proficiency Level</label>
                <select className="form-select" value={languageForm.level} onChange={(e) => setLanguageForm({ ...languageForm, level: e.target.value })}>
                  <option>Native / Bilingual</option>
                  <option>Professional Working</option>
                  <option>Limited Working</option>
                  <option>Elementary</option>
                </select>
              </div>
              <div className="profile-modal-footer mt-3 pt-3 border-top d-flex gap-2 justify-content-end bg-white">
                <button type="button" className="btn btn-light border" onClick={onCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const CandidateCertifications = ({
  certifications, onOpenModal, onDelete,
  showModal, onCloseModal, currentCertification,
  certificationForm, setCertificationForm, onSave, modalError
}) => (
  <>
    <div className="w-100">
      <div className="card border-0 shadow-sm analytics-card w-100 d-flex flex-column h-100">
        <div className="card-body p-4 d-flex flex-column h-100">
          <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
            <span className="fs-5 fw-bold text-dark">Certifications</span>
            <div className="d-flex align-items-center gap-2">
              <button onClick={() => onOpenModal(null)} className="btn btn-sm btn-outline-primary rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }} title="Add Certification">
                <i className="fas fa-plus" style={{ fontSize: '0.8rem' }}></i>
              </button>
              <i className="fas fa-certificate text-primary fs-4"></i>
            </div>
          </div>
          {certifications.length === 0 ? (
            <div className="text-center py-5 text-muted small">
              <i className="fas fa-certificate fs-3 mb-2 text-muted opacity-50 d-block"></i>
              <p className="mb-0">No certifications added yet.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {certifications.map((cert, idx) => (
                <div key={cert.id || idx} className="d-flex justify-content-between align-items-center p-2 rounded border bg-light">
                  <p className="mb-0 fw-semibold text-dark small text-truncate flex-grow-1" style={{ minWidth: 0 }}>
                    <i className="fas fa-certificate text-primary me-2" style={{ fontSize: '0.75rem' }}></i>
                    {cert.name}
                  </p>
                  <div className="d-flex gap-1 ms-2">
                    <button onClick={() => onOpenModal(cert)} className="btn btn-link text-primary p-0" title="Edit"><i className="fas fa-pencil-alt text-muted" style={{ fontSize: '0.8rem' }}></i></button>
                    <button onClick={() => onDelete(cert.id)} className="btn btn-link text-danger p-0" title="Delete"><i className="fas fa-trash-alt text-muted" style={{ fontSize: '0.8rem' }}></i></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    {showModal && (
      <div className="profile-modal-overlay" style={{ zIndex: 1100 }} onClick={onCloseModal}>
        <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="profile-modal-header">
            <h5 className="profile-modal-title"><i className="fas fa-certificate me-2 text-primary"></i>{currentCertification ? 'Edit Certification' : 'Add Certification'}</h5>
            <button type="button" className="profile-modal-close-btn" onClick={onCloseModal}>&times;</button>
          </div>
          <form onSubmit={onSave} className="profile-modal-body p-4 d-flex flex-column gap-3">
            {modalError && <div className="alert alert-danger py-2 px-3 small border-0" role="alert"><i className="fas fa-exclamation-triangle me-1"></i> {modalError}</div>}
            <div>
              <label className="form-label fw-semibold text-secondary small">Certification Name <span className="text-danger">*</span></label>
              <input type="text" className="form-control" value={certificationForm.name} onChange={(e) => setCertificationForm({ ...certificationForm, name: e.target.value })} placeholder="e.g., AWS Certified Solutions Architect" required />
            </div>
            <div className="profile-modal-footer mt-3 pt-3 border-top d-flex gap-2 justify-content-end bg-white">
              <button type="button" className="btn btn-light border" onClick={onCloseModal}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
);

const CandidateAwards = ({
  awards, onOpenModal, onDelete,
  showModal, onCloseModal, currentAward,
  awardForm, setAwardForm, onSave, modalError
}) => (
  <>
    <div className="w-100">
      <div className="card border-0 shadow-sm analytics-card w-100 d-flex flex-column h-100">
        <div className="card-body p-4 d-flex flex-column h-100">
          <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
            <span className="fs-5 fw-bold text-dark">Awards & Achievements</span>
            <div className="d-flex align-items-center gap-2">
              <button onClick={() => onOpenModal(null)} className="btn btn-sm btn-outline-primary rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }} title="Add Award">
                <i className="fas fa-plus" style={{ fontSize: '0.8rem' }}></i>
              </button>
              <i className="fas fa-trophy text-primary fs-4"></i>
            </div>
          </div>
          {awards.length === 0 ? (
            <div className="text-center py-5 text-muted small">
              <i className="fas fa-trophy fs-3 mb-2 text-muted opacity-50 d-block"></i>
              <p className="mb-0">No awards added yet.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {awards.map((award, idx) => (
                <div key={award.id || idx} className="d-flex justify-content-between align-items-start p-2.5 rounded border bg-light">
                  <div className="flex-grow-1 text-truncate" style={{ minWidth: 0 }}>
                    <p className="mb-0.5 fw-semibold text-dark small text-truncate">
                      <i className="fas fa-award text-primary me-2" style={{ fontSize: '0.75rem' }}></i>
                      {award.title}
                    </p>
                    <p className="mb-0 text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                      {award.issuer} • {award.date}
                    </p>
                  </div>
                  <div className="d-flex gap-1 ms-2">
                    <button onClick={() => onOpenModal(award)} className="btn btn-link text-primary p-0" title="Edit"><i className="fas fa-pencil-alt text-muted" style={{ fontSize: '0.8rem' }}></i></button>
                    <button onClick={() => onDelete(award.id)} className="btn btn-link text-danger p-0" title="Delete"><i className="fas fa-trash-alt text-muted" style={{ fontSize: '0.8rem' }}></i></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    {showModal && (
      <div className="profile-modal-overlay" style={{ zIndex: 1100 }} onClick={onCloseModal}>
        <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="profile-modal-header">
            <h5 className="profile-modal-title"><i className="fas fa-trophy me-2 text-primary"></i>{currentAward ? 'Edit Award' : 'Add Award'}</h5>
            <button type="button" className="profile-modal-close-btn" onClick={onCloseModal}>&times;</button>
          </div>
          <form onSubmit={onSave} className="profile-modal-body p-4 d-flex flex-column gap-3">
            {modalError && <div className="alert alert-danger py-2 px-3 small border-0" role="alert"><i className="fas fa-exclamation-triangle me-1"></i> {modalError}</div>}
            <div>
              <label className="form-label fw-semibold text-secondary small">Award Title <span className="text-danger">*</span></label>
              <input type="text" className="form-control" value={awardForm.title} onChange={(e) => setAwardForm({ ...awardForm, title: e.target.value })} placeholder="e.g., Best Developer of the Year" required />
            </div>
            <div>
              <label className="form-label fw-semibold text-secondary small">Issuer <span className="text-danger">*</span></label>
              <input type="text" className="form-control" value={awardForm.issuer} onChange={(e) => setAwardForm({ ...awardForm, issuer: e.target.value })} placeholder="e.g., Google Inc." required />
            </div>
            <div>
              <label className="form-label fw-semibold text-secondary small">Date Received <span className="text-danger">*</span></label>
              <input type="month" className="form-control" value={awardForm.date} onChange={(e) => setAwardForm({ ...awardForm, date: e.target.value })} required />
            </div>
            <div>
              <label className="form-label fw-semibold text-secondary small">Description</label>
              <textarea className="form-control" rows="3" value={awardForm.description} onChange={(e) => setAwardForm({ ...awardForm, description: e.target.value })} placeholder="Write details about your achievement..."></textarea>
            </div>
            <div className="profile-modal-footer mt-3 pt-3 border-top d-flex gap-2 justify-content-end bg-white">
              <button type="button" className="btn btn-light border" onClick={onCloseModal}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
);

const CandidateAccountSettings = () => {
  const {
    profileData,
    setProfileData,
    skills, setSkills,
    educations, setEducations,
    workExperiences, setWorkExperiences,
    languages, setLanguages,
    certifications, setCertifications,
    awards, setAwards,
    saveToServer
  } = useOutletContext();

  const navigate = useNavigate();

  const [editProfileForm, setEditProfileForm] = useState(null);
  const [modalError, setModalError] = useState('');

  // Experience state
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [currentExperience, setCurrentExperience] = useState(null);
  const [experienceForm, setExperienceForm] = useState({ role: '', company: '', startDate: '', endDate: '', description: '' });

  // Education state
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [currentEducation, setCurrentEducation] = useState(null);
  const [educationForm, setEducationForm] = useState({ degree: '', school: '', startDate: '', gradDate: '', description: '' });

  // Skill state
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null);
  const [skillForm, setSkillForm] = useState({ name: '', level: 50 });

  // Language state
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(null);
  const [languageForm, setLanguageForm] = useState({ name: '', level: 'Professional Working' });

  // Certification state
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [currentCertification, setCurrentCertification] = useState(null);
  const [certificationForm, setCertificationForm] = useState({ name: '' });

  // Award state
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [currentAward, setCurrentAward] = useState(null);
  const [awardForm, setAwardForm] = useState({ title: '', issuer: '', date: '', description: '' });

  const [settingsAddressSuggestions, setSettingsAddressSuggestions] = useState([]);
  const [settingsFilteredAddresses, setSettingsFilteredAddresses] = useState([]);
  const [settingsShowAddressDrop, setSettingsShowAddressDrop] = useState(false);

  const [settingsJobSuggestions, setSettingsJobSuggestions] = useState([]);
  const [settingsShowJobDrop, setSettingsShowJobDrop] = useState(false);

  const [countryList, setCountryList] = useState([]);
  const [countryQuery, setCountryQuery] = useState('');
  const [showCountryDrop, setShowCountryDrop] = useState(false);
  const settingsDateInputRef = useRef(null);

  const lettersOnlyRegex = /^[\p{L}\s]*$/u;
  let settingsJobDebounce = null;

  useEffect(() => {
    if (profileData) {
      setEditProfileForm({ ...profileData });
      setCountryQuery(profileData.nationality || '');
    }
  }, [profileData]);

  // Load Vietnam provinces for Address autocomplete
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const res = await axios.get('https://provinces.open-api.vn/api/?depth=3');
        const flat = [];
        res.data.forEach(p => {
          p.districts.forEach(d => {
            flat.push({ fullName: `${d.name}, ${p.name}`, searchStr: `${d.name} ${p.name}`.toLowerCase() });
            if (d.wards) {
              d.wards.forEach(w => {
                flat.push({ fullName: `${w.name}, ${d.name}, ${p.name}`, searchStr: `${w.name} ${d.name} ${p.name}`.toLowerCase() });
              });
            }
          });
          flat.push({ fullName: p.name, searchStr: p.name.toLowerCase() });
        });
        setSettingsAddressSuggestions(flat);
      } catch (e) {
        console.warn('Provinces API unavailable', e);
      }
    };
    loadProvinces();

    const loadCountries = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get('http://localhost:5000/api/candidate/countries', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCountryList(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.warn('RestCountries API unavailable', e);
      }
    };
    loadCountries();
  }, []);

  const handleSettingsJobTitleChange = (value) => {
    setEditProfileForm(prev => ({ ...prev, jobTitle: value }));
    if (!value.trim()) {
      setSettingsJobSuggestions([]);
      setSettingsShowJobDrop(false);
      return;
    }
    clearTimeout(settingsJobDebounce);
    settingsJobDebounce = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `http://localhost:5000/api/candidate/suggest-industries?search=${encodeURIComponent(value.trim())}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSettingsJobSuggestions(res.data || []);
        setSettingsShowJobDrop(true);
      } catch (e) {
        console.warn('Job suggestions unavailable', e);
      }
    }, 300);
  };

  const handleSettingsAddressChange = (value) => {
    setEditProfileForm(prev => ({ ...prev, address: value }));
    if (!value.trim()) {
      setSettingsFilteredAddresses([]);
      setSettingsShowAddressDrop(false);
      return;
    }
    const q = value.toLowerCase();
    const matches = settingsAddressSuggestions
      .filter(item => item.searchStr.includes(q) || item.fullName.toLowerCase().includes(q))
      .slice(0, 10);
    setSettingsFilteredAddresses(matches);
    setSettingsShowAddressDrop(true);
  };

  const handleSettingsNativeDateChange = (e) => {
    const val = e.target.value; // "YYYY-MM-DD"
    if (!val) return;
    const parts = val.split('-');
    const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`; // "DD/MM/YYYY"
    setEditProfileForm(prev => ({ ...prev, birthday: formatted }));
  };

  const handleSettingsBirthdayTextChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9/]/g, '');
    if (value.length === 2 && !value.includes('/')) {
      value = value + '/';
    } else if (value.length === 5 && value.split('/').length === 2) {
      value = value + '/';
    }
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    setEditProfileForm(prev => ({ ...prev, birthday: value }));
  };

  const handleSettingsCalendarIconClick = () => {
    if (settingsDateInputRef.current) {
      try {
        settingsDateInputRef.current.showPicker();
      } catch (err) {
        settingsDateInputRef.current.click();
      }
    }
  };

  const filteredCountries = countryList.filter(c =>
    c.toLowerCase().includes(countryQuery.toLowerCase())
  );

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setModalError("Invalid file type! Only image files (png, jpg, jpeg, gif, webp) are allowed.");
      return;
    }

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

  const handleChangeEmailClick = () => {
    alert("Change Email Request:\nPlease contact the administrator at support@jobsmarket.com to verify and update your primary email address.");
  };

  const handleChangePasswordClick = () => {
    const newPassword = window.prompt("Enter your new password:");
    if (newPassword) {
      if (newPassword.length < 6) {
        alert("Password must be at least 6 characters long!");
      } else {
        alert("Password change request submitted successfully!");
      }
    }
  };

  // Duration parsers
  const parseDuration = (durationStr) => {
    let startDate = '';
    let endDate = '';
    if (durationStr) {
      const parts = durationStr.split(' - ');
      const parseMMYYYY = (val) => {
        if (!val || val === 'Present' || val === 'Hiện tại') return '';
        const subparts = val.split('/');
        if (subparts.length === 2) {
          return `${subparts[1]}-${subparts[0].padStart(2, '0')}`;
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

  // Experience handlers
  const handleOpenExperienceModal = (exp = null) => {
    setModalError('');
    if (exp) {
      setCurrentExperience(exp);
      const parsed = parseDuration(exp.duration);
      setExperienceForm({
        role: exp.role,
        company: exp.company,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        description: exp.description || ''
      });
    } else {
      setCurrentExperience(null);
      setExperienceForm({ role: '', company: '', startDate: '', endDate: '', description: '' });
    }
    setShowExperienceModal(true);
  };

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

    const startYear = parseInt(experienceForm.startDate.split('-')[0]);
    const currentYear = new Date().getFullYear();
    if (startYear > currentYear) {
      setModalError(`Start year (${startYear}) cannot be in the future (must be <= ${currentYear})!`);
      return;
    }
    if (experienceForm.endDate && experienceForm.endDate < experienceForm.startDate) {
      setModalError("End Date cannot be earlier than Start Date!");
      return;
    }

    const formatMonthYear = (val) => {
      if (!val) return '';
      const parts = val.split('-');
      if (parts.length === 2) {
        return `${parts[1]}/${parts[0]}`;
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
      endDate: experienceForm.endDate,
      description: experienceForm.description || ''
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

  const handleDeleteExperience = (id) => {
    if (window.confirm("Are you sure you want to delete this experience?")) {
      const newWorkExperiences = workExperiences.filter(item => item.id !== id);
      setWorkExperiences(newWorkExperiences);
      saveToServer({ workExperiences: newWorkExperiences });
    }
  };

  // Education handlers
  const handleOpenEducationModal = (edu = null) => {
    setModalError('');
    if (edu) {
      setCurrentEducation(edu);
      setEducationForm({
        degree: edu.degree,
        school: edu.school,
        startDate: edu.startDate || '',
        gradDate: edu.gradDate || '',
        description: edu.description || ''
      });
    } else {
      setCurrentEducation(null);
      setEducationForm({ degree: '', school: '', startDate: '', gradDate: '', description: '' });
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
    if (!educationForm.gradDate) {
      setModalError("Graduation Date is required!");
      return;
    }

    const formatMonthYear = (val) => {
      if (!val) return '';
      const parts = val.split('-');
      if (parts.length === 2) {
        return `${parts[1]}/${parts[0]}`;
      }
      return val;
    };

    const durationText = formatMonthYear(educationForm.gradDate);

    const finalEducation = {
      degree: educationForm.degree,
      school: educationForm.school,
      duration: durationText,
      startDate: '',
      gradDate: educationForm.gradDate,
      description: educationForm.description || ''
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

  const handleDeleteEducation = (id) => {
    if (window.confirm("Are you sure you want to delete this education?")) {
      const newEducations = educations.filter(item => item.id !== id);
      setEducations(newEducations);
      saveToServer({ educations: newEducations });
    }
  };

  // Skill handlers
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
    const skillNameRegex = /^[\p{L}\s0-9\+#\.\/\-&]*$/u;
    if (skillForm.name && !skillNameRegex.test(skillForm.name)) {
      setModalError("Core Skill contains invalid special characters!");
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
    if (window.confirm("Are you sure you want to delete this skill?")) {
      const newSkills = skills.filter(item => item.id !== id);
      setSkills(newSkills);
      saveToServer({ skills: newSkills });
    }
  };

  // Language handlers
  const handleOpenLanguageModal = (lang = null) => {
    setModalError('');
    if (lang) {
      setCurrentLanguage(lang);
      setLanguageForm({ name: lang.name, level: lang.level });
    } else {
      setCurrentLanguage(null);
      setLanguageForm({ name: '', level: 'Professional Working' });
    }
    setShowLanguageModal(true);
  };

  const handleSaveLanguage = (e) => {
    e.preventDefault();
    if (!languageForm.name.trim()) {
      setModalError("Language name is required!");
      return;
    }
    const finalLang = {
      name: languageForm.name.trim(),
      level: languageForm.level
    };

    let newLanguages;
    if (currentLanguage) {
      newLanguages = languages.map(item => item.id === currentLanguage.id ? { ...item, ...finalLang } : item);
    } else {
      const newId = languages.length > 0 ? Math.max(...languages.map(i => i.id)) + 1 : 1;
      newLanguages = [...languages, { id: newId, ...finalLang }];
    }
    setLanguages(newLanguages);
    setShowLanguageModal(false);
    saveToServer({ languages: newLanguages });
  };

  const handleDeleteLanguage = (id) => {
    if (window.confirm("Are you sure you want to delete this language?")) {
      const newLanguages = languages.filter(item => item.id !== id);
      setLanguages(newLanguages);
      saveToServer({ languages: newLanguages });
    }
  };

  // Certification handlers
  const handleOpenCertificationModal = (cert = null) => {
    setModalError('');
    if (cert) {
      setCurrentCertification(cert);
      setCertificationForm({ name: cert.name });
    } else {
      setCurrentCertification(null);
      setCertificationForm({ name: '' });
    }
    setShowCertificationModal(true);
  };

  const handleSaveCertification = (e) => {
    e.preventDefault();
    if (!certificationForm.name.trim()) {
      setModalError("Please fill out all required fields!");
      return;
    }
    const certNameRegex = /^[\p{L}\s0-9\(\)\-\/&,\.:'\+]*$/u;
    if (certificationForm.name && !certNameRegex.test(certificationForm.name)) {
      setModalError("Certification Name contains invalid special characters!");
      return;
    }
    const finalCert = {
      name: certificationForm.name.trim()
    };

    let newCertifications;
    if (currentCertification) {
      newCertifications = certifications.map(item => item.id === currentCertification.id ? { ...item, ...finalCert } : item);
    } else {
      const newId = certifications.length > 0 ? Math.max(...certifications.map(i => i.id)) + 1 : 1;
      newCertifications = [...certifications, { id: newId, ...finalCert }];
    }
    setCertifications(newCertifications);
    setShowCertificationModal(false);
    saveToServer({ certifications: newCertifications });
  };

  const handleDeleteCertification = (id) => {
    if (window.confirm("Are you sure you want to delete this certification?")) {
      const newCertifications = certifications.filter(item => item.id !== id);
      setCertifications(newCertifications);
      saveToServer({ certifications: newCertifications });
    }
  };

  // Award handlers
  const handleOpenAwardModal = (award = null) => {
    setModalError('');
    if (award) {
      setCurrentAward(award);
      setAwardForm({ title: award.title, issuer: award.issuer, date: award.date, description: award.description });
    } else {
      setCurrentAward(null);
      setAwardForm({ title: '', issuer: '', date: '', description: '' });
    }
    setShowAwardModal(true);
  };

  const handleSaveAward = (e) => {
    e.preventDefault();
    if (!awardForm.title.trim() || !awardForm.issuer.trim() || !awardForm.date) {
      setModalError("Please fill out all required fields!");
      return;
    }
    const finalAward = {
      title: awardForm.title.trim(),
      issuer: awardForm.issuer.trim(),
      date: awardForm.date,
      description: awardForm.description ? awardForm.description.trim() : ''
    };

    let newAwards;
    if (currentAward) {
      newAwards = awards.map(item => item.id === currentAward.id ? { ...item, ...finalAward } : item);
    } else {
      const newId = awards.length > 0 ? Math.max(...awards.map(i => i.id)) + 1 : 1;
      newAwards = [...awards, { id: newId, ...finalAward }];
    }
    setAwards(newAwards);
    setShowAwardModal(false);
    saveToServer({ awards: newAwards });
  };

  const handleDeleteAward = (id) => {
    if (window.confirm("Are you sure you want to delete this award/achievement?")) {
      const newAwards = awards.filter(item => item.id !== id);
      setAwards(newAwards);
      saveToServer({ awards: newAwards });
    }
  };

  const handleSaveProfileSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    const fullNameCombined = (editProfileForm.fullName || '').trim();

    // Validate Full Name
    if (!fullNameCombined) {
      alert('Full Name is required!');
      return;
    }
    if (!lettersOnlyRegex.test(fullNameCombined)) {
      alert('Full Name can only contain letters and spaces!');
      return;
    }
    // Validate Date of Birth
    if (!editProfileForm.birthday || !editProfileForm.birthday.trim()) {
      alert('Date of Birth is required!');
      return;
    }
    const dobRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dobRegex.test(editProfileForm.birthday.trim())) {
      alert('Date of Birth must be in DD/MM/YYYY format!');
      return;
    }
    // Validate Phone Number
    if (editProfileForm.phone && editProfileForm.phone.trim() && !/^\d{10}$/.test(editProfileForm.phone.trim())) {
      alert('Phone Number must be exactly 10 digits!');
      return;
    }

    // Validate Job Title (if provided)
    if (editProfileForm.jobTitle && editProfileForm.jobTitle.trim() && !/^[\p{L}\s-]*$/u.test(editProfileForm.jobTitle.trim())) {
      alert('Job Title can only contain letters, spaces, and hyphens!');
      return;
    }

    // Validate Nationality (if provided)
    if (editProfileForm.nationality && editProfileForm.nationality.trim() && !lettersOnlyRegex.test(editProfileForm.nationality.trim())) {
      alert('Nationality can only contain letters and spaces!');
      return;
    }

    // Validate Portfolio (if provided)
    if (editProfileForm.portfolio && editProfileForm.portfolio.trim()) {
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
      if (!urlRegex.test(editProfileForm.portfolio.trim())) {
        alert('Website / Portfolio must be a valid URL (e.g., https://myportfolio.com)!');
        return;
      }
    }
    // Validate GitHub (if provided)
    if (editProfileForm.github && editProfileForm.github.trim()) {
      const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/i;
      if (!githubRegex.test(editProfileForm.github.trim())) {
        alert('GitHub link must be a valid profile URL (e.g., https://github.com/username)!');
        return;
      }
    }
    // Validate Facebook (if provided)
    if (editProfileForm.facebook && editProfileForm.facebook.trim()) {
      const facebookRegex = /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9.-]+\/?$/i;
      if (!facebookRegex.test(editProfileForm.facebook.trim())) {
        alert('Facebook link must be a valid profile URL (e.g., https://facebook.com/username)!');
        return;
      }
    }
    // Validate Blog (if provided)
    if (editProfileForm.blog && editProfileForm.blog.trim()) {
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
      if (!urlRegex.test(editProfileForm.blog.trim())) {
        alert('Blog must be a valid URL (e.g., https://myblog.com)!');
        return;
      }
    }
    // Validate X (if provided)
    if (editProfileForm.x && editProfileForm.x.trim()) {
      const xRegex = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_-]+\/?$/i;
      if (!xRegex.test(editProfileForm.x.trim())) {
        alert('X link must be a valid profile URL (e.g., https://x.com/username)!');
        return;
      }
    }
    // Validate LinkedIn (if provided)
    if (editProfileForm.linkedin && editProfileForm.linkedin.trim()) {
      const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+\/?$/i;
      if (!linkedinRegex.test(editProfileForm.linkedin.trim())) {
        alert('LinkedIn link must be a valid profile URL (e.g., https://linkedin.com/in/username)!');
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append('full_name', fullNameCombined);
      formData.append('display_name', fullNameCombined);
      formData.append('phone', editProfileForm.phone || '');
      formData.append('headline', editProfileForm.jobTitle || '');
      formData.append('address', editProfileForm.address || '');
      formData.append('about', editProfileForm.about || '');
      formData.append('portfolio', editProfileForm.portfolio || '');
      formData.append('github', editProfileForm.github || '');
      formData.append('facebook', editProfileForm.facebook || '');
      formData.append('blog', editProfileForm.blog || '');
      formData.append('x', editProfileForm.x || '');
      formData.append('linkedin', editProfileForm.linkedin || '');
      const birthdayParts = (editProfileForm.birthday || '').trim().split('/');
      const apiBirthday = birthdayParts.length === 3 ? `${birthdayParts[2]}-${birthdayParts[1]}-${birthdayParts[0]}` : '';
      formData.append('birthday', apiBirthday);
      formData.append('languages', JSON.stringify(languages));
      formData.append('certifications', JSON.stringify(certifications));
      formData.append('awards', JSON.stringify(awards));
      formData.append('education', JSON.stringify(educations.map(edu => ({
        school: edu.school, degree: edu.degree, startDate: edu.startDate, gradDate: edu.gradDate
      }))));
      formData.append('experience', JSON.stringify(workExperiences.map(exp => ({
        company: exp.company, role: exp.role, startDate: exp.startDate, endDate: exp.endDate
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

      let calculatedAge = '';
      if (editProfileForm.birthday) {
        const parts = editProfileForm.birthday.trim().split('/');
        if (parts.length === 3) {
          const birthDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          calculatedAge = age.toString();
        }
      }

      const updatedForm = {
        ...editProfileForm,
        fullName: fullNameCombined,
        displayName: fullNameCombined,
        age: calculatedAge,
        portfolio: editProfileForm.portfolio,
        github: editProfileForm.github,
        facebook: editProfileForm.facebook,
        blog: editProfileForm.blog,
        x: editProfileForm.x,
        linkedin: editProfileForm.linkedin,
        about: editProfileForm.about,
        languages: languages,
        certifications: certifications,
        awards: awards
      };

      setProfileData(updatedForm);
      localStorage.setItem('hide_phone_' + editProfileForm.email, editProfileForm.hidePhone ? 'true' : 'false');
      alert('Account settings saved successfully!');
    } catch (err) {
      console.error("Failed to save profile settings:", err);
      alert("Error occurred while saving profile settings. Please try again.");
    }
  };

  if (!editProfileForm) {
    return <div className="text-center py-5">Loading settings...</div>;
  }

  return (
    <div className="card border-0 shadow-sm animate-fade-in">
      <div className="card-header bg-white py-3 border-bottom d-flex align-items-center">
        <h5 className="mb-0 fw-bold text-dark">
          <i className="fas fa-sliders-h me-2 text-primary"></i>Account Settings
        </h5>
      </div>
      <div className="card-body p-4">
        {modalError && (
          <div className="alert alert-danger py-2 px-3 small border-0 mb-4" role="alert">
            <i className="fas fa-exclamation-triangle me-1"></i> {modalError}
          </div>
        )}

        <div className="d-flex flex-column gap-4">
          {/* Upload Avatar */}
          <div className="d-flex flex-column align-items-center gap-2 bg-light p-3 rounded border">
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
            <span className="text-muted small text-center px-3">
              Only image formats are supported (JPG, JPEG, PNG, WEBP) and maximum file size is 5 MB.
            </span>
          </div>

          {/* General Info */}
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-semibold text-secondary small">Full Name <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                value={editProfileForm.fullName || ''}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, fullName: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-6" style={{ position: 'relative' }}>
              <label className="form-label fw-semibold text-secondary small">Job Title</label>
              <input
                type="text"
                className="form-control"
                value={editProfileForm.jobTitle || ''}
                onChange={(e) => handleSettingsJobTitleChange(e.target.value)}
                onBlur={() => setTimeout(() => setSettingsShowJobDrop(false), 200)}
                onFocus={() => { if (settingsJobSuggestions.length > 0) setSettingsShowJobDrop(true); }}
                autoComplete="off"
                placeholder="e.g., Software Engineer"
              />
              {settingsShowJobDrop && settingsJobSuggestions.length > 0 && (
                <div className="position-absolute bg-white border rounded shadow-sm w-100" style={{ zIndex: 999, top: '100%', maxHeight: '200px', overflowY: 'auto' }}>
                  {settingsJobSuggestions.map((title, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 cursor-pointer"
                      style={{ fontSize: '0.875rem' }}
                      onMouseDown={() => {
                        setEditProfileForm(prev => ({ ...prev, jobTitle: title }));
                        setSettingsJobSuggestions([]);
                        setSettingsShowJobDrop(false);
                      }}
                    >
                      <i className="fas fa-briefcase text-muted me-2" style={{ fontSize: '0.75rem' }}></i>
                      {title}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="col-12 col-md-6" style={{ position: 'relative' }}>
              <label className="form-label fw-semibold text-secondary small">Nationality</label>
              <input
                type="text"
                className="form-control"
                value={editProfileForm.nationality ? editProfileForm.nationality : (showCountryDrop ? countryQuery : '')}
                readOnly={!showCountryDrop}
                placeholder="Select a country..."
                onClick={() => {
                  setCountryQuery(editProfileForm.nationality || '');
                  setShowCountryDrop(true);
                }}
                onChange={(e) => {
                  setCountryQuery(e.target.value);
                  setEditProfileForm(prev => ({ ...prev, nationality: e.target.value }));
                }}
                onBlur={() => setTimeout(() => setShowCountryDrop(false), 200)}
                autoComplete="off"
              />
              {editProfileForm.nationality && (
                <button
                  type="button"
                  className="btn position-absolute end-0 top-50 translate-middle-y me-2 p-0 border-0 bg-transparent text-muted"
                  style={{ zIndex: 5, fontSize: '0.75rem', marginTop: '12px' }}
                  onClick={() => { setEditProfileForm(prev => ({ ...prev, nationality: '' })); setCountryQuery(''); }}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
              {showCountryDrop && (
                <div className="position-absolute bg-white border rounded shadow-sm w-100" style={{ zIndex: 999, top: '100%', maxHeight: '220px', overflowY: 'auto' }}>
                  {filteredCountries.length === 0 ? (
                    <div className="px-3 py-2 text-muted small">No countries found.</div>
                  ) : filteredCountries.map((country, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 cursor-pointer"
                      style={{ fontSize: '0.875rem' }}
                      onMouseDown={() => {
                        setEditProfileForm(prev => ({ ...prev, nationality: country }));
                        setCountryQuery(country);
                        setShowCountryDrop(false);
                      }}
                    >
                      <i className="fas fa-globe text-muted me-2" style={{ fontSize: '0.75rem' }}></i>
                      {country}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-secondary small">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                value={editProfileForm.phone || ''}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                placeholder="e.g., 0901234567"
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-secondary small">Date of Birth <span className="text-danger">*</span></label>
              <div className="custom-datepicker-wrapper">
                <input
                  type="text"
                  className="form-control datepicker-display-input"
                  placeholder="dd/mm/yyyy"
                  value={editProfileForm.birthday || ''}
                  onChange={handleSettingsBirthdayTextChange}
                  required
                />
                <input
                  type="date"
                  onChange={handleSettingsNativeDateChange}
                  ref={settingsDateInputRef}
                  className="datepicker-native-input"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="datepicker-calendar-icon"
                  viewBox="0 0 16 16"
                  onClick={handleSettingsCalendarIconClick}
                >
                  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                </svg>
              </div>
            </div>
            <div className="col-12 d-flex align-items-center">
              <div className="form-check form-switch mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="hidePhoneCheckboxSettings"
                  checked={editProfileForm.hidePhone || false}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, hidePhone: e.target.checked })}
                />
                <label className="form-check-label fw-semibold text-secondary small mb-0 ms-2" htmlFor="hidePhoneCheckboxSettings">
                  Hide phone in Contact Info
                </label>
              </div>
            </div>
            <div className="col-12" style={{ position: 'relative' }}>
              <label className="form-label fw-semibold text-secondary small">Address / Country</label>
              <input
                type="text"
                className="form-control"
                value={editProfileForm.address || ''}
                onChange={(e) => handleSettingsAddressChange(e.target.value)}
                onBlur={() => setTimeout(() => setSettingsShowAddressDrop(false), 200)}
                onFocus={() => { if (settingsFilteredAddresses.length > 0) setSettingsShowAddressDrop(true); }}
                autoComplete="off"
                placeholder="Enter your location (e.g. District, City)"
              />
              {settingsShowAddressDrop && settingsFilteredAddresses.length > 0 && (
                <div className="position-absolute bg-white border rounded shadow-sm w-100" style={{ zIndex: 999, top: '100%', maxHeight: '200px', overflowY: 'auto' }}>
                  {settingsFilteredAddresses.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 cursor-pointer"
                      style={{ fontSize: '0.875rem' }}
                      onMouseDown={() => {
                        setEditProfileForm(prev => ({ ...prev, address: item.fullName }));
                        setSettingsFilteredAddresses([]);
                        setSettingsShowAddressDrop(false);
                      }}
                    >
                      <i className="fas fa-map-marker-alt text-muted me-2" style={{ fontSize: '0.75rem' }}></i>
                      {item.fullName}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold text-secondary small">About Me</label>
              <textarea
                className="form-control"
                rows="4"
                value={editProfileForm.about || ''}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, about: e.target.value })}
                placeholder="Write a brief description about yourself, your career goals, and your core values..."
              />
            </div>
          </div>

          {/* Manage Resume sections */}
          <div className="mt-5 pt-4 border-top">
            <h4 className="fw-bold mb-4 text-dark"><i className="fas fa-tools me-2 text-primary"></i>Manage Resume sections</h4>
            <div className="row g-4">
              <div className="col-12 col-lg-4 d-flex">
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
              </div>

              <div className="col-12 col-lg-4 d-flex">
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
              </div>

              <div className="col-12 col-lg-4 d-flex">
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
              </div>

              <div className="col-12 col-lg-4 d-flex">
                <CandidateLanguages
                  languages={languages}
                  onOpenModal={handleOpenLanguageModal}
                  onDelete={handleDeleteLanguage}
                  showModal={showLanguageModal}
                  onCloseModal={() => setShowLanguageModal(false)}
                  currentLanguage={currentLanguage}
                  languageForm={languageForm}
                  setLanguageForm={setLanguageForm}
                  onSave={handleSaveLanguage}
                  modalError={modalError}
                />
              </div>

              <div className="col-12 col-lg-4 d-flex">
                <CandidateCertifications
                  certifications={certifications}
                  onOpenModal={handleOpenCertificationModal}
                  onDelete={handleDeleteCertification}
                  showModal={showCertificationModal}
                  onCloseModal={() => setShowCertificationModal(false)}
                  currentCertification={currentCertification}
                  certificationForm={certificationForm}
                  setCertificationForm={setCertificationForm}
                  onSave={handleSaveCertification}
                  modalError={modalError}
                />
              </div>

              <div className="col-12 col-lg-4 d-flex">
                <CandidateAwards
                  awards={awards}
                  onOpenModal={handleOpenAwardModal}
                  onDelete={handleDeleteAward}
                  showModal={showAwardModal}
                  onCloseModal={() => setShowAwardModal(false)}
                  currentAward={currentAward}
                  awardForm={awardForm}
                  setAwardForm={setAwardForm}
                  onSave={handleSaveAward}
                  modalError={modalError}
                />
              </div>
            </div>
          </div>

          {/* Contact & Links */}
          <h5 className="fw-bold border-bottom pb-2 mt-4 text-dark">
            <i className="fas fa-link me-2 text-primary"></i>Contact & Social Links
          </h5>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-secondary small">Website</label>
              <input
                type="url"
                className="form-control"
                value={editProfileForm.portfolio || ''}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, portfolio: e.target.value })}
                placeholder="e.g., https://myportfolio.com"
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-secondary small">Blog</label>
              <input
                type="url"
                className="form-control"
                value={editProfileForm.blog || ''}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, blog: e.target.value })}
                placeholder="e.g., https://myblog.com"
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-secondary small">GitHub</label>
              <input
                type="url"
                className="form-control"
                value={editProfileForm.github || ''}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, github: e.target.value })}
                placeholder="e.g., https://github.com/username"
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-secondary small">Facebook</label>
              <input
                type="url"
                className="form-control"
                value={editProfileForm.facebook || ''}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, facebook: e.target.value })}
                placeholder="e.g., https://facebook.com/username"
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-secondary small">X (Twitter)</label>
              <input
                type="url"
                className="form-control"
                value={editProfileForm.x || ''}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, x: e.target.value })}
                placeholder="e.g., https://x.com/username"
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-secondary small">LinkedIn</label>
              <input
                type="url"
                className="form-control"
                value={editProfileForm.linkedin || ''}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, linkedin: e.target.value })}
                placeholder="e.g., https://linkedin.com/in/username"
              />
            </div>
          </div>

          {/* Account Security Section */}
          <div className="mt-4">
            <h5 className="fw-bold border-bottom pb-2 text-dark">
              <i className="fas fa-lock me-2 text-primary"></i>Account Security
            </h5>

            {/* Email Row */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center py-3 gap-3">
              <div className="flex-grow-1" style={{ maxWidth: '400px', width: '100%' }}>
                <label className="fw-semibold text-secondary small d-block mb-1">Email Address <span className="text-danger">*</span></label>
                <input
                  type="email"
                  className="form-control bg-light"
                  value={editProfileForm.email || ''}
                  disabled
                />
              </div>
              <button
                type="button"
                className="btn btn-outline-primary rounded-pill px-4 fw-semibold align-self-sm-end"
                style={{ height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={handleChangeEmailClick}
              >
                Change email
              </button>
            </div>

            {/* Password Row */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center py-3 gap-3">
              <div className="flex-grow-1" style={{ maxWidth: '400px', width: '100%' }}>
                <label className="fw-semibold text-secondary small d-block mb-1">Password</label>
                <input
                  type="password"
                  className="form-control bg-light"
                  value="••••••••"
                  disabled
                />
              </div>
              <button
                type="button"
                className="btn btn-outline-primary rounded-pill px-4 fw-semibold align-self-sm-end"
                style={{ height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={handleChangePasswordClick}
              >
                Change password
              </button>
            </div>
          </div>

          <div className="d-flex gap-2 justify-content-end pt-3 mt-3 border-top">
            <button type="submit" className="btn btn-primary px-4" onClick={handleSaveProfileSettings}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateAccountSettings;
