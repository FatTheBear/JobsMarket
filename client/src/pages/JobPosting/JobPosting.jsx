import React, { useState, useEffect } from 'react';
import './JobPosting.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const API_URL = 'http://localhost:5000';
const LOCATION_API = 'https://provinces.open-api.vn/api';

const JOB_LEVELS = ["Intern", "Fresher", "Junior", "Middle", "Senior", "Manager", "Director"];
const LANGUAGES = ["Any", "English", "Vietnamese", "Japanese", "Chinese", "Korean", "French"];
const EDUCATION_LEVELS = ["High School", "Associate Degree", "Bachelor", "Master", "PhD", "Other"];
const INDUSTRIES = ["Information Technology", "Marketing", "Finance", "Sales", "Design", "Human Resources", "Engineering", "Education"];
const SKILLS_DB = ["React", "Node.js", "Python", "Java", "AWS", "SQL", "Figma", "SEO", "Communication", "Project Management"];

const todayStr = () => new Date().toISOString().split('T')[0];

export default function JobPosting() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Location Data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

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
    
    industry: '',
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
    axios.get(`${LOCATION_API}/p/`).then(res => setProvinces(res.data)).catch(err => console.error(err));
  }, []);

  // Fetch Districts when Province changes
  useEffect(() => {
    if (form.province_code) {
      axios.get(`${LOCATION_API}/p/${form.province_code}?depth=2`).then(res => {
        setDistricts(res.data.districts || []);
        setWards([]); // reset wards
        setForm(f => ({ ...f, district: '', district_code: '', ward: '' }));
      }).catch(err => console.error(err));
    }
  }, [form.province_code]);

  // Fetch Wards when District changes
  useEffect(() => {
    if (form.district_code) {
      axios.get(`${LOCATION_API}/d/${form.district_code}?depth=2`).then(res => {
        setWards(res.data.wards || []);
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

  const toggleSkill = (skill) => {
    setForm(prev => {
      const skills = prev.selected_skills.includes(skill) 
        ? prev.selected_skills.filter(s => s !== skill)
        : [...prev.selected_skills, skill];
      return { ...prev, selected_skills: skills };
    });
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!form.title.trim()) {
      showToast('Please enter the job title', 'error'); return;
    }
    if (form.salary_type === 'specific') {
      if (!form.salary_min || !form.salary_max) {
        showToast('Please enter both Minimum and Maximum Salary in USD', 'error'); return;
      }
    }
    if (!form.province) {
      showToast('Please select a Province', 'error'); return;
    }

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
        requirements: form.requirements || form.selected_skills.join(", "),
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
        exact_address: form.floor_room ? `${form.floor_room}, ${form.exact_address}` : form.exact_address
      };
      
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/jobs`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 201 || res.status === 200) {
        showToast('Job successfully posted', 'success');
        setTimeout(() => navigate('/company/profile'), 1500);
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
      <div className="jp-header-row">
        <div>
          <div className="jp-breadcrumb">Dashboard / Post a New Job</div>
          <h2 className="jp-page-heading">Post a New Job</h2>
        </div>
      </div>

      <div className="jp-stepper">
        <div className="jp-step active">
          <div className="jp-step-number">1</div>
          <div className="jp-step-text">Detailed Information</div>
        </div>
        <div className="jp-step">
          <div className="jp-step-number">2</div>
          <div className="jp-step-text">Activation Info</div>
        </div>
      </div>

      <div className="jp-warning-banner">
        Note: Fields marked with <span>*</span> are required
      </div>

      <div className="jp-form-container">
        {/* BASIC INFORMATION */}
        <section className="jp-card">
          <div className="jp-card-title">Basic Information</div>
          <div className="jp-card-body">
            <div className="jp-field">
              <label>Job Title <span>*</span></label>
              <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Data Engineer" />
            </div>

            <div className="jp-row jp-row-two align-bottom">
              <div className="jp-field">
                <label>Years of Experience <span>*</span></label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label className="jp-toggle-label">
                    <input type="checkbox" checked={form.salary_type === 'negotiable'} onChange={(e) => setForm(f => ({ ...f, salary_type: e.target.checked ? 'negotiable' : 'specific' }))} />
                    Negotiable
                  </label>
                  {form.salary_type === 'specific' && (
                    <div className="jp-salary-inputs">
                      <input type="number" name="salary_min" value={form.salary_min} onChange={handleChange} placeholder="From ($)" />
                      <span>-</span>
                      <input type="number" name="salary_max" value={form.salary_max} onChange={handleChange} placeholder="To ($)" />
                    </div>
                  )}
                </div>
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
                  <input type="text" name="exact_address" value={form.exact_address} onChange={handleChange} placeholder="e.g. 123 Main St" />
                </div>
                <div>
                  <label className="jp-sub-label">Province / City <span>*</span></label>
                  <select onChange={handleProvinceChange} value={form.province_code}>
                    <option value="">Select Province</option>
                    {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                  </select>
                </div>
                {form.province_code && (
                  <div>
                    <label className="jp-sub-label">District <span>*</span></label>
                    <select onChange={handleDistrictChange} value={form.district_code}>
                      <option value="">Select District</option>
                      {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                    </select>
                  </div>
                )}
                {form.district_code && (
                  <div>
                    <label className="jp-sub-label">Ward <span>*</span></label>
                    <select onChange={handleWardChange} value={form.ward}>
                      <option value="">Select Ward</option>
                      {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
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

        {/* ADDITIONAL INFORMATION */}
        <section className="jp-card mt-20">
          <div className="jp-card-title">Additional Information</div>
          <div className="jp-card-body">
            
            <div className="jp-field">
              <label>Industry <span>*</span></label>
              <select name="industry" value={form.industry} onChange={handleChange} style={{ width: '300px' }}>
                <option value="">Select Industry</option>
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>

            <div className="jp-field">
              <label>Professional Skills</label>
              <div className="jp-skills-container">
                {form.selected_skills.map(s => (
                  <span key={s} className="jp-skill-tag selected" onClick={() => toggleSkill(s)}>
                    {s} ✕
                  </span>
                ))}
              </div>
              <label className="jp-sub-label">Suggested skills (Click to select)</label>
              <div className="jp-skills-container">
                {SKILLS_DB.filter(s => !form.selected_skills.includes(s)).map(s => (
                  <span key={s} className="jp-skill-tag" onClick={() => toggleSkill(s)}>
                    {s} +
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
                <input type="date" name="deadline" value={form.deadline} onChange={handleChange} min={todayStr()} style={{width: '200px'}} />
            </div>

          </div>
        </section>

        <div className="jp-actions mt-20" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          <button type="button" className="jp-btn jp-btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
          <button type="button" className="jp-btn jp-btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing..." : "Continue & Post Job"}
          </button>
        </div>
      </div>

      {toast.show && (
        <div className={`toast-message ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </main>
  );
}