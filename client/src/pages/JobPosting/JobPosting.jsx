import React, { useState, useEffect } from 'react';
import './JobPosting.css';
import IndustrySelector from './IndustrySelector';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useWallet } from '../../context/WalletContext';

const API_URL = 'http://localhost:5000';
const LOCATION_API = 'https://provinces.open-api.vn/api';

const JOB_LEVELS = ["Intern", "Fresher", "Junior", "Middle", "Senior", "Manager", "Director"];
const LANGUAGES = ["Any", "English", "Vietnamese", "Japanese", "Chinese", "Korean", "French"];
const EDUCATION_LEVELS = ["High School", "Associate Degree", "Bachelor", "Master", "PhD", "Other"];

const todayStr = () => new Date().toISOString().split('T')[0];

const removeAccents = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

const translateLocation = (name) => {
  if (!name) return '';
  // Strip prefix words (province/city/district level)
  const prefixes = [
    'Thành phố ', 'Tỉnh ', 'Quận ', 'Huyện ',
    'Thị xã ', 'Phường ', 'Xã ', 'Thị trấn '
  ];
  let result = name;
  for (const prefix of prefixes) {
    if (result.startsWith(prefix)) {
      result = result.slice(prefix.length);
      break;
    }
  }
  return removeAccents(result);
};


export default function JobPosting() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { coins, fetchWalletInfo } = useWallet();
  const [proPackage, setProPackage] = useState('Free');
  const [proExpiredAt, setProExpiredAt] = useState(null);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showCoinsWarningModal, setShowCoinsWarningModal] = useState(false);
  const [neededCoins, setNeededCoins] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [submittedJobId, setSubmittedJobId] = useState(null); // Track successful post

  // Location Data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // API Data
  const [dbSkills, setDbSkills] = useState([]);
  const [dbIndustries, setDbIndustries] = useState([]);

  const [form, setForm] = useState({
    title: '',
    experience_req: 'Not Required',
    salary_type: 'negotiable',
    salary_min: '',
    salary_max: '',

    floor_room: '',
    exact_address: '',
    province: '',
    province_code: '',
    district: '',
    district_code: '',
    ward: '',

    working_hour_type: 'Office hours (Off Sat, Sun)',
    working_days: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false },
    start_time: '08:00',
    end_time: '17:00',
    working_time_note: '',

    selected_industries: [],
    selected_skills: [],

    job_type: 'Full-time',
    education_level: 'Bachelor',
    job_level: 'Junior',
    vacancies: 1,
    gender_req: 'Any',
    age_req: '',
    language_req: 'Any',

    description: '',
    requirements: '',
    benefits: '',
    deadline: '',
    email: ''
  });

  // Fetch Provinces on Mount
  useEffect(() => {
    axios.get(`${LOCATION_API}/p/`).then(res => {
      const translated = res.data.map(p => ({ ...p, name: translateLocation(p.name) }));
      setProvinces(translated);
    }).catch(err => console.error(err));

    axios.get(`${API_URL}/api/skills`).then(res => setDbSkills(res.data)).catch(err => console.error(err));
    axios.get(`${API_URL}/api/industries`).then(res => setDbIndustries(res.data)).catch(err => console.error(err));

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      axios.get(`${API_URL}/api/company/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => {
        setProPackage(res.data.pro_package || 'Free');
        setProExpiredAt(res.data.pro_expired_at || null);
      }).catch(err => console.error("Failed to load company pro status:", err));
      
      if (typeof fetchWalletInfo === 'function') {
        fetchWalletInfo();
      }
    }
  }, []);

  // Fetch Districts when Province changes
  useEffect(() => {
    if (form.province_code) {
      axios.get(`${LOCATION_API}/p/${form.province_code}?depth=2`).then(res => {
        const translated = (res.data.districts || []).map(d => ({ ...d, name: translateLocation(d.name) }));
        setDistricts(translated);
        setWards([]); // reset wards
        setForm(f => ({ ...f, district: '', district_code: '', ward: '' }));
      }).catch(err => console.error(err));
    }
  }, [form.province_code]);

  // Fetch Wards when District changes
  useEffect(() => {
    if (form.district_code) {
      axios.get(`${LOCATION_API}/d/${form.district_code}?depth=2`).then(res => {
        const translated = (res.data.wards || []).map(w => ({ ...w, name: translateLocation(w.name) }));
        setWards(translated);
        setForm(f => ({ ...f, ward: '' }));
      }).catch(err => console.error(err));
    }
  }, [form.district_code]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name.startsWith('day_')) {
        const day = name.replace('day_', '');
        setForm(prev => ({ ...prev, working_days: { ...prev.working_days, [day]: checked } }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleProvinceChange = (e) => {
    const code = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setForm(prev => ({ ...prev, province_code: code, province: name }));
  };

  const handleDistrictChange = (e) => {
    const code = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setForm(prev => ({ ...prev, district_code: code, district: name }));
  };

  const handleWardChange = (e) => {
    const name = e.target.options[e.target.selectedIndex].text;
    setForm(prev => ({ ...prev, ward: name }));
  };

  const toggleSkill = (skillId) => {
    setForm(prev => {
      const skills = prev.selected_skills.includes(skillId)
        ? prev.selected_skills.filter(id => id !== skillId)
        : [...prev.selected_skills, skillId];
      return { ...prev, selected_skills: skills };
    });
  };

  const toggleIndustry = (indId) => {
    setForm(prev => {
      const inds = prev.selected_industries.includes(indId)
        ? prev.selected_industries.filter(id => id !== indId)
        : [...prev.selected_industries, indId];
      return { ...prev, selected_industries: inds };
    });
  };

  const [errors, setErrors] = useState({});

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleNext = () => {
    let newErrors = {};
    if (currentStep === 1) {
       const trimmedTitle = form.title.trim();
       if (!trimmedTitle) newErrors.title = "Job Title cannot be empty.";
       else if (trimmedTitle.length < 10) newErrors.title = "Job Title must be at least 10 characters long.";
       else if (/^\d+$/.test(trimmedTitle)) newErrors.title = "Job Title cannot contain only numbers.";

       if (!form.description.trim()) newErrors.description = "Job Description cannot be empty.";
       if (!form.requirements.trim()) newErrors.requirements = "Requirements cannot be empty.";
       if (!form.benefits.trim()) newErrors.benefits = "Benefits cannot be empty.";
       
       if (!form.province) newErrors.province = "Please select a Province / City.";
       if (!form.district_code && provinces.length > 0) newErrors.district = "Please select a District.";
       if (!form.exact_address.trim()) newErrors.exact_address = "Please enter a specific location.";
    } else if (currentStep === 2) {
        if (form.salary_type === 'specific') {
          if (!form.salary_min || !form.salary_max) newErrors.salary = "Please enter both Minimum and Maximum Salary.";
          else if (Number(form.salary_min) < 0 || Number(form.salary_max) < 0) newErrors.salary = "Salary cannot be negative.";
          else if (Number(form.salary_min) > Number(form.salary_max)) newErrors.salary = "Minimum salary cannot exceed maximum salary.";
        }
        if (form.selected_industries.length === 0) newErrors.industries = "Please select at least one industry.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const isProCurrentlyActive = proExpiredAt && new Date(proExpiredAt) >= new Date();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    let newErrors = {};

    // Validate Job Title
    const trimmedTitle = form.title.trim();
    if (!trimmedTitle) {
      newErrors.title = "Job Title cannot be empty.";
    } else if (trimmedTitle.length < 10) {
      newErrors.title = "Job Title must be at least 10 characters long.";
    } else if (/^\d+$/.test(trimmedTitle)) {
      newErrors.title = "Job Title cannot contain only numbers.";
    }

    // Validate Salary
    if (form.salary_type === 'specific') {
      if (!form.salary_min || !form.salary_max) {
        newErrors.salary = "Please enter both Minimum and Maximum Salary.";
      } else if (Number(form.salary_min) < 0 || Number(form.salary_max) < 0) {
        newErrors.salary = "Salary cannot be negative.";
      } else if (Number(form.salary_min) > Number(form.salary_max)) {
        newErrors.salary = "Minimum salary cannot exceed maximum salary.";
      }
    }

    // Validate Location
    if (!form.province) {
      newErrors.province = "Please select a Province / City.";
    }
    if (!form.district_code && provinces.length > 0) {
      newErrors.district = "Please select a District.";
    }
    if (!form.exact_address.trim()) {
      newErrors.exact_address = "Please enter a specific location.";
    }

    // Validate Industries
    if (form.selected_industries.length === 0) {
      newErrors.industries = "Please select at least one industry.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    if (isProCurrentlyActive) {
      submitJob('Free');
    } else {
      setShowPackageModal(true);
    }
  };

  const handleSelectPackage = (type) => {
    setShowPackageModal(false);
    if (type === 'Free') {
      submitJob('Free');
    } else {
      const required = type === 'Pro_Day' ? 20 : 500;
      if (coins < required) {
        setNeededCoins(required);
        setShowCoinsWarningModal(true);
      } else {
        submitJob(type);
      }
    }
  };

  const handleBuyCoinsRedirect = () => {
    setShowCoinsWarningModal(false);
    localStorage.setItem('walletActiveTab', 'topup');
    navigate('/company/wallet');
  };

  const submitJob = async (postType) => {
    setLoading(true);
    try {
      const working_hours = {
        type: form.working_hour_type,
        days: form.working_days,
        time: `${form.start_time} - ${form.end_time}`,
        note: form.working_time_note
      };

      const payload = {
        title: form.title,
        description: form.description || form.title,
        requirements: form.requirements || form.selected_skills.map(id => dbSkills.find(s => s.id === id)?.name).filter(Boolean).join(", "),
        selected_skills: form.selected_skills,
        selected_industries: form.selected_industries,
        salary_min: form.salary_type === 'specific' ? parseInt(form.salary_min) : null,
        salary_max: form.salary_type === 'specific' ? parseInt(form.salary_max) : null,
        job_type: form.job_type,
        deadline: form.deadline || null,

        experience_req: form.experience_req,
        working_hours: working_hours,
        job_level: form.job_level,
        vacancies: form.vacancies,
        gender_req: form.gender_req,
        age_req: form.age_req,
        language_req: form.language_req,

        province: form.province,
        district: form.district,
        ward: form.ward,
        exact_address: form.floor_room ? `${form.floor_room}, ${form.exact_address}` : form.exact_address,
        post_type: postType
      };

      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/jobs`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 201 || res.status === 200) {
        showToast(
          res.data.message || 'Job posted successfully!',
          'success'
        );
        if (typeof fetchWalletInfo === 'function') {
          fetchWalletInfo();
        }
        setTimeout(() => navigate('/company/profile'), 3000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to post job';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-form">

      {/* ── PENDING APPROVAL SCREEN ── */}
      {submittedJobId && (
        <div className="jp-pending-screen">
          <div className="jp-pending-card">
            <div className="jp-pending-icon">🎉</div>
            <h2 className="jp-pending-title">Job Post Submitted!</h2>
            <p className="jp-pending-desc">
              Your job posting has been submitted and is currently <strong>waiting for Admin approval</strong>.
              You will be notified once it is reviewed.
            </p>

            {/* Status Timeline */}
            <div className="jp-status-track">
              <div className="jp-track-step done">
                <div className="jp-track-dot"><span>✓</span></div>
                <div className="jp-track-label">Submitted</div>
              </div>
              <div className="jp-track-line active"></div>
              <div className="jp-track-step active">
                <div className="jp-track-dot"><span>⏳</span></div>
                <div className="jp-track-label">Pending Review</div>
              </div>
              <div className="jp-track-line"></div>
              <div className="jp-track-step">
                <div className="jp-track-dot"><span>✓</span></div>
                <div className="jp-track-label">Approved</div>
              </div>
              <div className="jp-track-line"></div>
              <div className="jp-track-step">
                <div className="jp-track-dot"><span>🌐</span></div>
                <div className="jp-track-label">Published</div>
              </div>
            </div>

            <div className="jp-pending-info">
              <span>📋 Job ID: <strong>#{submittedJobId}</strong></span>
              <span>⏱ Estimated review time: <strong>1–2 business days</strong></span>
            </div>

            <div className="jp-pending-actions">
              <button className="jp-btn jp-btn-cancel" onClick={() => navigate('/company')}>
                Back to Dashboard
              </button>
              <button className="jp-btn jp-btn-primary" onClick={() => { setSubmittedJobId(null); }}>
                Post Another Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN FORM (hidden after submit) ── */}
      {!submittedJobId && (
        <div>
      <div className="jp-header-row">
        <div>
          <div className="jp-breadcrumb">Dashboard / Post a New Job</div>
          <h2 className="jp-page-heading">Post a New Job</h2>
        </div>
      </div>

      {isProCurrentlyActive && (
        <div className="jp-pro-banner" style={{
          background: 'linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)',
          border: '1px solid #ffeeba',
          borderRadius: '8px',
          padding: '15px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <span style={{ fontSize: '24px', animation: 'pulse 2s infinite' }}>⚡</span>
          <div>
            <h5 style={{ margin: 0, fontWeight: 'bold', color: '#856404' }}>
              Active Pro Plan ({proPackage === 'Pro_Day' ? 'Pro Day' : 'Pro Month'})
            </h5>
            <p style={{ margin: 0, fontSize: '14px', color: '#533f03' }}>
              You are currently enjoying Pro package benefits. Expired at: <strong>{proExpiredAt ? new Date(proExpiredAt).toLocaleString('en-US') : ''}</strong>. 
              Limit maximum 2 job posts every 24 hours.
            </p>
          </div>
        </div>
      )}

      <div className="jp-stepper">
        <div className={`jp-step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="jp-step-number">1</div>
          <div className="jp-step-text">Basic Information</div>
        </div>
        <div className={`jp-step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="jp-step-number">2</div>
          <div className="jp-step-text">Detailed Information</div>
        </div>
        <div className={`jp-step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="jp-step-number">3</div>
          <div className="jp-step-text">Activation Info</div>
        </div>
      </div>

      <div className="jp-warning-banner">
        Note: Fields marked with <span>*</span> are required
      </div>

      <div className="jp-form-container">
        {currentStep === 1 && (
        <section className="jp-card">
          <div className="jp-card-title">Basic Information</div>
          <div className="jp-card-body">
            <div className="jp-field">
              <label>Job Title <span>*</span></label>
              <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Data Engineer" className={errors.title ? 'has-error' : ''} />
              {errors.title && <span className="jp-error-text">{errors.title}</span>}
            </div>

            <div className="jp-field mt-10">
              <label>Job Description <span>*</span></label>
              <textarea name="description" value={form.description} onChange={handleChange} rows="6" placeholder="Describe the job responsibilities..." style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '15px' }} />
              {errors.description && <span className="jp-error-text">{errors.description}</span>}
            </div>

            <div className="jp-field mt-10">
              <label>Requirements <span>*</span></label>
              <textarea name="requirements" value={form.requirements} onChange={handleChange} rows="6" placeholder="Describe the job requirements..." style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '15px' }} />
              {errors.requirements && <span className="jp-error-text">{errors.requirements}</span>}
            </div>

            <div className="jp-field mt-10">
              <label>Benefits <span>*</span></label>
              <textarea name="benefits" value={form.benefits} onChange={handleChange} rows="6" placeholder="Describe the benefits..." style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '15px' }} />
              {errors.benefits && <span className="jp-error-text">{errors.benefits}</span>}
            </div>

            <div className="jp-row jp-row-two">
              <div className="jp-field">
                <label>Years of Experience <span>*</span></label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minHeight: '44px' }}>
                  <select name="experience_req" value={form.experience_req} onChange={handleChange} disabled={form.experience_req === 'Not Required'}>
                    <option value="Not Required">Not Required</option>
                    <option value="Under 1 year">Under 1 year</option>
                    <option value="1 - 3 years">1 - 3 years</option>
                    <option value="3 - 5 years">3 - 5 years</option>
                    <option value="Over 5 years">Over 5 years</option>
                  </select>
                  <label className="jp-toggle-label">
                    <input type="checkbox" checked={form.experience_req === 'Not Required'} onChange={(e) => setForm(f => ({ ...f, experience_req: e.target.checked ? 'Not Required' : '1 - 3 years' }))} />
                    Not Required
                  </label>
                </div>
              </div>

              <div className="jp-field">
                <label>Salary (USD $) <span>*</span></label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minHeight: '44px' }}>
                  <label className="jp-toggle-label">
                    <input type="checkbox" checked={form.salary_type === 'negotiable'} onChange={(e) => setForm(f => ({ ...f, salary_type: e.target.checked ? 'negotiable' : 'specific' }))} />
                    Negotiable
                  </label>
                  {form.salary_type === 'specific' && (
                    <div className="jp-salary-inputs">
                      <input type="number" name="salary_min" value={form.salary_min} onChange={handleChange} placeholder="From ($)" min="0" className={errors.salary ? 'has-error' : ''} />
                      <span>-</span>
                      <input type="number" name="salary_max" value={form.salary_max} onChange={handleChange} placeholder="To ($)" min="0" className={errors.salary ? 'has-error' : ''} />
                    </div>
                  )}
                </div>
                {errors.salary && <span className="jp-error-text">{errors.salary}</span>}
              </div>
            </div>

            <div className="jp-field">
              <label>Work Location <span>*</span></label>
              <div className="jp-location-grid">
                <div>
                  <label className="jp-sub-label">Floor / Room</label>
                  <input type="text" name="floor_room" value={form.floor_room} onChange={handleChange} placeholder="Floor/Room" />
                </div>
                <div>
                  <label className="jp-sub-label">Specific Location <span>*</span></label>
                  <input type="text" name="exact_address" value={form.exact_address} onChange={handleChange} placeholder="e.g. 123 Main St" className={errors.exact_address ? 'has-error' : ''} />
                  {errors.exact_address && <span className="jp-error-text">{errors.exact_address}</span>}
                </div>
                <div>
                  <label className="jp-sub-label">Province / City <span>*</span></label>
                  <select onChange={handleProvinceChange} value={form.province_code} className={errors.province ? 'has-error' : ''}>
                    <option value="">Select</option>
                    {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                  </select>
                  {errors.province && <span className="jp-error-text">{errors.province}</span>}
                </div>
                {form.province_code && (
                  <div>
                    <label className="jp-sub-label">District <span>*</span></label>
                    <select onChange={handleDistrictChange} value={form.district_code} className={errors.district ? 'has-error' : ''}>
                      <option value="">Select</option>
                      {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                    </select>
                    {errors.district && <span className="jp-error-text">{errors.district}</span>}
                  </div>
                )}
                {form.district_code && (
                  <div>
                    <label className="jp-sub-label">Ward <span>*</span></label>
                    <select onChange={handleWardChange} value={form.ward}>
                      <option value="">Select Ward</option>
                      {wards.map(w => <option key={w.code} value={w.name}>{w.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="jp-field mt-10">
              <label>Working Hours <span>*</span></label>
              <label className="jp-sub-label">Working Hour Type</label>
              <select name="working_hour_type" value={form.working_hour_type} onChange={handleChange} style={{ width: '300px' }}>
                <option value="Office hours (Off Sat, Sun)">Office hours (Off Sat, Sun)</option>
                <option value="Shift work">Shift work</option>
                <option value="Flexible">Flexible</option>
              </select>

              <div className="jp-days-toggles">
                {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                  <label key={day} className={`jp-day-btn ${form.working_days[day] ? 'active' : ''}`}>
                    <input type="checkbox" name={`day_${day}`} checked={form.working_days[day]} onChange={handleChange} style={{ display: 'none' }} />
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </label>
                ))}

                <div className="jp-time-inputs">
                  <span>From:</span>
                  <input type="time" name="start_time" value={form.start_time} onChange={handleChange} />
                  <span>To:</span>
                  <input type="time" name="end_time" value={form.end_time} onChange={handleChange} />
                </div>

                <button type="button" className="jp-btn-outline jp-add-slot">+ Add time slot</button>
              </div>

              <label className="jp-sub-label">Working time note</label>
              <input type="text" name="working_time_note" value={form.working_time_note} onChange={handleChange} placeholder="e.g. Lunch break 12:00 - 13:00" />
            </div>
          </div>
        </section>
        )}

        {currentStep === 2 && (
        <section className="jp-card mt-20">
          <div className="jp-card-title">Detailed Information</div>
          <div className="jp-card-body">
            
            <IndustrySelector 
              industries={dbIndustries}
              selectedIds={form.selected_industries}
              onToggle={toggleIndustry}
            />
            {errors.industries && <span className="jp-error-text">{errors.industries}</span>}

            <div className="jp-field">
              <label>Professional Skills</label>
              <div className="jp-skills-container">
                {form.selected_skills.map(id => {
                  const s = dbSkills.find(i => i.id === id);
                  return s ? (
                    <span key={id} className="jp-skill-tag selected" onClick={() => toggleSkill(id)}>
                      {s.name} ✕
                    </span>
                  ) : null;
                })}
              </div>
              <label className="jp-sub-label">Suggested skills (Click to select)</label>
              <div className="jp-skills-container">
                {dbSkills.filter(s => !form.selected_skills.includes(s.id)).map(s => (
                  <span key={s.id} className="jp-skill-tag" onClick={() => toggleSkill(s.id)}>
                    {s.name} +
                  </span>
                ))}
              </div>
            </div>

            <div className="jp-field">
              <label>Job Nature <span>*</span></label>
              <select name="job_type" value={form.job_type} onChange={handleChange} style={{ width: '200px' }}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div className="jp-row jp-row-three">
              <div className="jp-field">
                <label>Minimum Education <span>*</span></label>
                <select name="education_level" value={form.education_level} onChange={handleChange}>
                  {EDUCATION_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                </select>
              </div>
              <div className="jp-field">
                <label>Job Level <span>*</span></label>
                <select name="job_level" value={form.job_level} onChange={handleChange}>
                  {JOB_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                </select>
              </div>
              <div className="jp-field">
                <label>Number of Vacancies</label>
                <input type="number" name="vacancies" value={form.vacancies} onChange={handleChange} min="1" />
              </div>
            </div>

            <div className="jp-row jp-row-three">
              <div className="jp-field">
                <label>Gender Requirement</label>
                <select name="gender_req" value={form.gender_req} onChange={handleChange}>
                  <option value="Any">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="jp-field">
                <label>Age Requirement</label>
                <input type="text" name="age_req" value={form.age_req} onChange={handleChange} placeholder="e.g. 20-30" />
              </div>
              <div className="jp-field">
                <label>Language Requirement</label>
                <select name="language_req" value={form.language_req} onChange={handleChange}>
                  {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
            </div>

            <div className="jp-field">
              <label>Application Deadline</label>
              <input type="date" name="deadline" value={form.deadline} onChange={handleChange} min={todayStr()} style={{ width: '200px' }} />
            </div>

          </div>
        </section>
        )}

        {currentStep === 3 && (
        <section className="jp-card mt-20">
          <div className="jp-card-title">Activation Info</div>
          <div className="jp-card-body">
            <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.6' }}>
              You have completed the job information. Please review the details.
              <br /><br />
              Click <strong>"Continue & Post Job"</strong> below to submit your job posting. Our admin team will review and approve it within 1-2 business days.
            </p>
          </div>
        </section>
        )}

        <div className="jp-actions mt-20" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          {currentStep > 1 && (
            <button type="button" className="jp-btn jp-btn-cancel" onClick={() => { setCurrentStep(prev => prev - 1); window.scrollTo(0, 0); }}>
              Back
            </button>
          )}
          
          {currentStep < 3 ? (
            <button type="button" className="jp-btn jp-btn-primary" onClick={handleNext}>
              Next Step
            </button>
          ) : (
            <button type="button" className="jp-btn jp-btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Processing..." : "Continue & Post Job"}
            </button>
          )}
        </div>
      </div>
      </div>
      )}

      {toast.show && (
        <div className="toast-overlay">
          <div className={`toast-modal ${toast.type}`}>
            <h3>{toast.type === 'success' ? 'Success' : 'Error'}</h3>
            <p>{toast.message}</p>
          </div>
        </div>
      )}

      {/* ── PACKAGE SELECTION MODAL ── */}
      {showPackageModal && (
        <div className="jp-modal-overlay">
          <div className="jp-modal-content">
            <h3 style={{ fontWeight: '800', color: '#111827', marginBottom: '8px', fontSize: '1.8rem' }}>Select Job Posting Plan</h3>
            <p style={{ color: '#4b5563', marginBottom: '30px', fontSize: '15px' }}>
              Your current balance: <strong style={{ color: '#d97706', fontSize: '1.2rem' }}>{coins || 0} Coins 🪙</strong>
            </p>
            
            <div className="jp-plans-grid">
              {/* Free Plan */}
              <div className="jp-plan-card jp-plan-free">
                <span className="jp-plan-badge">FREE PLAN</span>
                <h4 className="jp-plan-title">Free</h4>
                <div className="jp-plan-price">
                  0 Coins
                </div>
                <ul className="jp-plan-features">
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <span>Max <strong>1 job post / 24 hours</strong></span>
                  </li>
                </ul>
                <button 
                  onClick={() => handleSelectPackage('Free')}
                  className="jp-plan-button"
                >
                  Select Free
                </button>
              </div>

              {/* Pro Day Plan */}
              <div className="jp-plan-card jp-plan-pro-day">
                <span className="jp-plan-badge">FEATURED</span>
                <h4 className="jp-plan-title">Pro Day</h4>
                <div className="jp-plan-price">
                  20 Coins <span>/ 24 Hours</span>
                </div>
                <ul className="jp-plan-features">
                  <li className="pro-feature">
                    <i className="fas fa-check-circle"></i>
                    <span>Activate Pro features for <strong>24 hours</strong></span>
                  </li>
                  <li className="pro-feature">
                    <i className="fas fa-check-circle"></i>
                    <span>Max <strong>2 job posts / 24 hours</strong></span>
                  </li>
                </ul>
                <button 
                  onClick={() => handleSelectPackage('Pro_Day')}
                  className="jp-plan-button"
                >
                  Select Pro Day
                </button>
              </div>

              {/* Pro Month Plan */}
              <div className="jp-plan-card jp-plan-pro-month">
                <span className="jp-plan-badge">BEST VALUE</span>
                <h4 className="jp-plan-title">Pro Month</h4>
                <div className="jp-plan-price">
                  500 Coins <span>/ 30 Days</span>
                </div>
                <ul className="jp-plan-features">
                  <li className="pro-feature">
                    <i className="fas fa-check-circle"></i>
                    <span>Activate Pro features for <strong>30 days</strong></span>
                  </li>
                  <li className="pro-feature">
                    <i className="fas fa-check-circle"></i>
                    <span>Max <strong>2 job posts every day</strong></span>
                  </li>
                  <li className="pro-feature">
                    <i className="fas fa-check-circle"></i>
                    <span>Save up to 16% in cost</span>
                  </li>
                </ul>
                <button 
                  onClick={() => handleSelectPackage('Pro_Month')}
                  className="jp-plan-button"
                >
                  Select Pro Month
                </button>
              </div>
            </div>

            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
              <button 
                type="button" 
                onClick={() => setShowPackageModal(false)}
                className="jp-modal-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── COINS WARNING MODAL ── */}
      {showCoinsWarningModal && (
        <div className="jp-modal-overlay">
          <div className="jp-modal-content jp-modal-warning-content">
            <div style={{ fontSize: '50px', marginBottom: '15px' }}>🪙</div>
            <h3 style={{ fontWeight: '800', color: '#dc2626', marginBottom: '12px', fontSize: '1.5rem' }}>Insufficient Balance!</h3>
            <p style={{ color: '#374151', fontSize: '15px', lineHeight: '1.6' }}>
              Your account does not have enough coins to purchase this plan (Required: <strong>{neededCoins} Coins</strong>, current balance: <strong>{coins || 0} Coins</strong>).
            </p>
            <p style={{ color: '#4b5563', fontSize: '14.5px', marginBottom: '30px' }}>
              Would you like to recharge coins now to use this featured service?
            </p>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button 
                type="button" 
                onClick={() => setShowCoinsWarningModal(false)}
                className="jp-modal-cancel-btn"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleBuyCoinsRedirect}
                className="jp-modal-confirm-btn"
                style={{ flex: 1 }}
              >
                Recharge Now
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}