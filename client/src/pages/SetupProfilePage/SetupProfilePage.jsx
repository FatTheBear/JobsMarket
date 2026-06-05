import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SetupProfilePage.css';

export default function SetupProfilePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Form State
  // Only full_name is mandatory. All other fields are optional and can be left empty.
  const [formData, setFormData] = useState({
    display_name: '',
    phone: '',
    avatar_url: '', // Allowed to be blank/empty
    headline: '',
    address: '',
    education: [], // Allowed to be empty list
    experience: [], // Allowed to be empty list
    skills: [],    // Allowed to be empty list
    followedCompanyIds: [] // Allowed to be empty list
  });

  // Custom skills adder input state
  const [newSkillName, setNewSkillName] = useState('');

  // Recommended Companies list
  const [companies, setCompanies] = useState([]);

  // Default fallback companies if backend is empty
  const defaultCompanies = [
    { id: 1, name: 'VNG Corporation', industry_name: 'Tech & Gaming', logo_url: '🎮', website: 'vng.com.vn', address: 'Ho Chi Minh City' },
    { id: 2, name: 'FPT Software', industry_name: 'IT Services', logo_url: '💻', website: 'fpt-software.com', address: 'Hanoi' },
    { id: 3, name: 'Google Vietnam', industry_name: 'Internet & Search', logo_url: '🔍', website: 'google.com', address: 'Hanoi Office' },
    { id: 4, name: 'Microsoft Vietnam', industry_name: 'Cloud & Software', logo_url: '☁️', website: 'microsoft.com', address: 'Ho Chi Minh City' }
  ];

  // Retrieve JWT Token
  const token = localStorage.getItem('token');

  // Set default auth headers
  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  // Load recommended companies
  useEffect(() => {
    if (!token) {
      setApiError('Authentication token missing. Please log in again.');
      return;
    }

    const fetchCompanies = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/candidate/companies', getHeaders());
        if (res.data && res.data.length > 0) {
          setCompanies(res.data);
        } else {
          setCompanies(defaultCompanies);
        }
      } catch (err) {
        console.error('Failed to load companies, using premium fallbacks.', err);
        setCompanies(defaultCompanies);
      }
    };

    fetchCompanies();
  }, [token]);

  // Handle simple input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setApiError('');
  };

  // Handle real avatar file uploads (<5MB or left blank)
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    setApiError('');

    if (!file) {
      setFormData(prev => ({ ...prev, avatar_url: '' }));
      return;
    }

    // Validate file type (only images allowed)
    if (!file.type.startsWith('image/')) {
      setApiError('Invalid file type! Only image files (png, jpg, jpeg, gif, webp) are allowed.');
      e.target.value = ''; // Reset file input
      return;
    }

    // Size limit verification: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setApiError('Avatar file size must be less than 5MB!');
      e.target.value = ''; // Reset file input
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for high-performance frontend image compression
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; // Perfect resolution for avatar pictures
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Export as high-quality compressed JPEG (0.75 quality)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
        setFormData(prev => ({ ...prev, avatar_url: compressedBase64 }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Clear avatar image completely
  const clearAvatar = () => {
    setFormData(prev => ({ ...prev, avatar_url: '' }));
    const fileInput = document.getElementById('avatarFileInput');
    if (fileInput) fileInput.value = '';
  };

  // Education item management
  const handleEducationChange = (index, field, value) => {
    const updated = [...formData.education];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, education: updated }));
    setApiError('');
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [...prev.education, { school: '', degree: '', startDate: '', gradDate: '' }]
    }));
  };

  const removeEducation = (index) => {
    const updated = formData.education.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, education: updated }));
  };

  // Experience item management
  const handleExperienceChange = (index, field, value) => {
    const updated = [...formData.experience];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, experience: updated }));
    setApiError('');
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [...prev.experience, { company: '', role: '', startDate: '', endDate: '' }]
    }));
  };

  const removeExperience = (index) => {
    const updated = formData.experience.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, experience: updated }));
  };

  // Skills dynamic list management
  const addSkill = () => {
    if (!newSkillName.trim()) return;

    if (!lettersOnlyRegex.test(newSkillName.trim())) {
      setApiError('Core Skill cannot contain numbers or special characters!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (formData.skills.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      setApiError('This skill is already added!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, { name: newSkillName.trim(), level: 80 }]
    }));
    setNewSkillName('');
  };

  const removeSkill = (index) => {
    const updated = formData.skills.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, skills: updated }));
  };

  const handleSkillLevelChange = (index, value) => {
    const updated = [...formData.skills];
    updated[index].level = parseInt(value);
    setFormData((prev) => ({ ...prev, skills: updated }));
  };

  // Company following logic
  const toggleFollowCompany = (companyId) => {
    setFormData((prev) => {
      const isAlreadyFollowed = prev.followedCompanyIds.includes(companyId);
      const updatedFollowed = isAlreadyFollowed
        ? prev.followedCompanyIds.filter(id => id !== companyId)
        : [...prev.followedCompanyIds, companyId];
      return { ...prev, followedCompanyIds: updatedFollowed };
    });
  };

  const lettersOnlyRegex = /^[\p{L}\s]*$/u;

  const validateEducation = () => {
    for (let i = 0; i < formData.education.length; i++) {
      const edu = formData.education[i];
      const hasContent = edu.school.trim() || edu.degree.trim() || edu.startDate || edu.gradDate;
      if (hasContent) {
        if (edu.school.trim() && !lettersOnlyRegex.test(edu.school)) {
          setApiError(`School / Institute cannot contain numbers or special characters!`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return false;
        }
        if (edu.degree.trim() && !lettersOnlyRegex.test(edu.degree)) {
          setApiError(`Degree / Field of Study cannot contain numbers or special characters!`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return false;
        }
        if (!edu.startDate) {
          setApiError(`Start Date is required if education is filled!`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return false;
        }

        // Start date year must be <= current year
        const startYear = parseInt(edu.startDate.split('-')[0]);
        const currentYear = new Date().getFullYear();
        if (startYear > currentYear) {
          setApiError(`Start year (${startYear}) cannot be in the future (must be <= ${currentYear})!`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return false;
        }

        // Graduation date cannot be earlier than start date
        if (edu.gradDate) {
          if (edu.gradDate < edu.startDate) {
            setApiError(`Graduation Date cannot be earlier than Start Date!`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return false;
          }
        }
      }
    }
    return true;
  };

  const validateExperience = () => {
    for (let i = 0; i < formData.experience.length; i++) {
      const exp = formData.experience[i];
      const hasContent = exp.company.trim() || exp.role.trim() || exp.startDate || exp.endDate;
      if (hasContent) {
        if (exp.company.trim() && !lettersOnlyRegex.test(exp.company)) {
          setApiError(`Company Name cannot contain numbers or special characters!`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return false;
        }
        if (exp.role.trim() && !lettersOnlyRegex.test(exp.role)) {
          setApiError(`Job Title / Role cannot contain numbers or special characters!`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return false;
        }
        if (!exp.startDate) {
          setApiError(`Start Date is required if experience is filled!`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return false;
        }

        // Start date year must be <= current year
        const startYear = parseInt(exp.startDate.split('-')[0]);
        const currentYear = new Date().getFullYear();
        if (startYear > currentYear) {
          setApiError(`Start year (${startYear}) cannot be in the future (must be <= ${currentYear})!`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return false;
        }

        // End date cannot be earlier than start date
        if (exp.endDate) {
          if (exp.endDate < exp.startDate) {
            setApiError(`End Date cannot be earlier than Start Date!`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return false;
          }
        }
      }
    }
    return true;
  };

  // Navigation validation (only full_name is required!)
  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.display_name.trim()) {
        setApiError('Display Name is mandatory!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (formData.headline.trim() && !lettersOnlyRegex.test(formData.headline)) {
        setApiError('Job Title / Headline cannot contain numbers or special characters!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    if (currentStep === 2) {
      if (!validateEducation() || !validateExperience()) {
        return;
      }
    }
    setApiError(''); // clear any errors when stepping forward!
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setApiError(''); // clear errors when going back
    setCurrentStep((prev) => prev - 1);
  };

  // Finish and submit to server
  // Finish and submit to server
  const handleFinishSetup = async () => {
    if (!formData.display_name.trim()) {
      setApiError('Display Name is mandatory!');
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!validateEducation() || !validateExperience()) {
      setCurrentStep(2);
      return;
    }

    setLoading(true);
    setApiError('');
    try {
      await axios.post('http://localhost:5000/api/candidate/onboarding', formData, getHeaders());
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setApiError(error.response?.data?.message || 'Error occurred while saving profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-wizard-container">
      <div className="setup-wizard-card">

        {/* Header Section */}
        <div className="setup-wizard-header">
          <h1>Welcome to JobsMarket!</h1>
          <p>Let's personalize your candidate profile in just 3 quick steps.</p>

          {/* Progress Indicator */}
          <div className="progress-steps-container">
            <div
              className="progress-line-active"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
            <div className={`step-node ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              {currentStep > 1 ? '✓' : '1'}
            </div>
            <div className={`step-node ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              {currentStep > 2 ? '✓' : '2'}
            </div>
            <div className={`step-node ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
              3
            </div>
          </div>
        </div>

        {apiError && (
          <div style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', padding: '15px 40px', fontSize: '0.95rem', fontWeight: '500' }}>
            ⚠️ {apiError}
          </div>
        )}

        {/* Wizard Main Body */}
        <div className="setup-wizard-body">

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="step-view">
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '5px' }}>Step 1: Tell Us About Yourself</h2>
              <p style={{ color: 'var(--neutral-color)', fontSize: '0.95rem', marginTop: '-15px', marginBottom: '10px' }}>
                Provide your contact info. Only display name is required, everything else is optional.
              </p>

              <div className="avatar-upload-wrapper">
                <div className="avatar-preview-box">
                  {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="Profile Preview" />
                  ) : (
                    '👤'
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="avatar-upload-btn-label" style={{ display: 'inline-block' }}>
                    Upload Photo (&lt; 5MB)
                    <input
                      type="file"
                      id="avatarFileInput"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {formData.avatar_url && (
                    <button
                      type="button"
                      onClick={clearAvatar}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', padding: 0, textAlign: 'left' }}
                    >
                      ✕ Remove Photo
                    </button>
                  )}
                </div>
              </div>

              <div className="form-group-grid">
                <div className="form-field">
                  <label htmlFor="display_name">Display Name *</label>
                  <input
                    type="text"
                    id="display_name"
                    name="display_name"
                    placeholder="Enter your full display name"
                    value={formData.display_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="phone">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="e.g., +84 901 234 567"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="headline">Job Title / Headline (Optional)</label>
                <input
                  type="text"
                  id="headline"
                  name="headline"
                  placeholder="e.g., Senior Full Stack Developer | React Specialist"
                  value={formData.headline}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-field">
                <label htmlFor="address">Living Address (Optional)</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="e.g., District 1, Ho Chi Minh City, Vietnam"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          {/* Step 2: Education & Skills */}
          {currentStep === 2 && (
            <div className="step-view">
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '5px' }}>Step 2: Education & Professional Skills (Optional)</h2>
              <p style={{ color: 'var(--neutral-color)', fontSize: '0.95rem', marginTop: '-15px', marginBottom: '10px' }}>
                Feel free to skip this page entirely, or add your details below.
              </p>

              {/* Dynamic Education Section */}
              <div className="dynamic-list-wrapper">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#334155' }}>Educational Background</h3>
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="education-card">
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeEducation(idx)}
                      style={{ position: 'absolute', top: '12px', right: '12px' }}
                      title="Remove record"
                    >
                      ✕
                    </button>

                    {/* Line 1: School & Degree */}
                    <div className="form-group-grid">
                      <div className="form-field">
                        <label style={{ fontSize: '0.85rem' }}>School / Institute</label>
                        <input
                          type="text"
                          placeholder="e.g., FPT Aptech"
                          value={edu.school || ''}
                          onChange={(e) => handleEducationChange(idx, 'school', e.target.value)}
                        />
                      </div>
                      <div className="form-field">
                        <label style={{ fontSize: '0.85rem' }}>Degree / Field of Study</label>
                        <input
                          type="text"
                          placeholder="e.g., Software Engineering"
                          value={edu.degree || ''}
                          onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Line 2: Start Date & Graduation Date */}
                    <div className="date-fields-aligned-row" style={{ marginTop: '15px' }}>
                      <div className="form-field">
                        <label style={{ fontSize: '0.85rem' }}>Start Date</label>
                        <input
                          type="month"
                          value={edu.startDate || ''}
                          onChange={(e) => handleEducationChange(idx, 'startDate', e.target.value)}
                        />
                      </div>
                      <div className="form-field">
                        <label style={{ fontSize: '0.85rem' }}>Graduation Date</label>
                        <input
                          type="month"
                          value={edu.gradDate || ''}
                          onChange={(e) => handleEducationChange(idx, 'gradDate', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" className="add-dynamic-btn" onClick={addEducation}>
                  + Add Education Record
                </button>
              </div>

              {/* Dynamic Experience Section */}
              <div className="dynamic-list-wrapper" style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#334155' }}>Work Experience</h3>
                {formData.experience.map((exp, idx) => (
                  <div key={idx} className="education-card" style={{ position: 'relative' }}>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeExperience(idx)}
                      style={{ position: 'absolute', top: '12px', right: '12px' }}
                      title="Remove record"
                    >
                      ✕
                    </button>

                    {/* Line 1: Company & Role */}
                    <div className="form-group-grid">
                      <div className="form-field">
                        <label style={{ fontSize: '0.85rem' }}>Company Name</label>
                        <input
                          type="text"
                          placeholder="e.g., Google Corporation"
                          value={exp.company || ''}
                          onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                        />
                      </div>
                      <div className="form-field">
                        <label style={{ fontSize: '0.85rem' }}>Job Title / Role</label>
                        <input
                          type="text"
                          placeholder="e.g., Senior Software Developer"
                          value={exp.role || ''}
                          onChange={(e) => handleExperienceChange(idx, 'role', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Line 2: Start Date & End Date */}
                    <div className="date-fields-aligned-row" style={{ marginTop: '15px' }}>
                      <div className="form-field">
                        <label style={{ fontSize: '0.85rem' }}>Start Date</label>
                        <input
                          type="month"
                          value={exp.startDate || ''}
                          onChange={(e) => handleExperienceChange(idx, 'startDate', e.target.value)}
                        />
                      </div>
                      <div className="form-field">
                        <label style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>End Date <span style={{ fontWeight: 'normal', fontSize: '0.75rem' }}>(Leave blank if current)</span></label>
                        <input
                          type="month"
                          value={exp.endDate || ''}
                          onChange={(e) => handleExperienceChange(idx, 'endDate', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" className="add-dynamic-btn" onClick={addExperience}>
                  + Add Work Experience
                </button>
              </div>

              {/* Dynamic Skills Section */}
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#334155', marginBottom: '15px' }}>Core Skills</h3>

                {/* Skill input adder */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <input
                    type="text"
                    placeholder="e.g., React, SQL, Python"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    style={{ flexGrow: 1, padding: '10px 16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                    onKeyDown={(e) => { if (e.key === 'Enter') addSkill(); }}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    style={{ padding: '10px 20px', background: 'var(--primary-color)', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Add Skill
                  </button>
                </div>

                {/* Skill slider list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {formData.skills.map((skill, idx) => (
                    <div key={idx} className="skill-slider-card">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span className="skill-name-label">{skill.name}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(idx)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          ✕
                        </button>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={skill.level}
                        onChange={(e) => handleSkillLevelChange(idx, e.target.value)}
                        className="skill-slider-input"
                      />
                      <span className="skill-percentage-value">{skill.level}%</span>
                    </div>
                  ))}
                  {formData.skills.length === 0 && (
                    <p style={{ color: 'var(--neutral-color)', fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center' }}>No skills added yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Recommended Companies */}
          {currentStep === 3 && (
            <div className="step-view">
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '5px' }}>Step 3: Keep Track of Premium Recruiters (Optional)</h2>
              <p style={{ color: 'var(--neutral-color)', fontSize: '0.95rem', marginTop: '-15px', marginBottom: '15px' }}>
                Follow hiring companies to stay updated. This step is entirely optional.
              </p>

              <div className="company-recommendation-grid">
                {companies.map((company) => {
                  const isFollowed = formData.followedCompanyIds.includes(company.id);
                  return (
                    <div key={company.id} className="company-card-premium">
                      <div className="company-card-logo-box">
                        {company.logo_url && company.logo_url.length > 2 ? (
                          <img src={company.logo_url} alt={company.name} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '🏢'; }} />
                        ) : (
                          company.logo_url || '🏢'
                        )}
                      </div>
                      <h3 className="company-card-name">{company.name}</h3>
                      <span className="company-card-industry">{company.industry_name || 'Technology'}</span>
                      <p style={{ fontSize: '0.8rem', color: 'var(--neutral-color)', margin: '-5px 0 15px 0' }}>
                        📍 {company.address || 'Vietnam'}
                      </p>
                      <button
                        type="button"
                        onClick={() => toggleFollowCompany(company.id)}
                        className={`company-follow-btn ${isFollowed ? 'followed' : ''}`}
                      >
                        {isFollowed ? '✓ Followed' : '+ Follow'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Navigation Footer Controls */}
        <div className="setup-wizard-footer">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="wizard-btn-back"
              disabled={loading}
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="wizard-btn-next"
            >
              Next Step
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishSetup}
              className="wizard-btn-finish"
              disabled={loading}
            >
              {loading ? <span className="wizard-spinner" /> : 'Finish'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
