import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import CustomDatePicker, { parseDisplayDate, formatDisplayDate } from '../../components/CustomDatePicker';
import './SetupProfilePage.css';

// Global timer for job title search debounce
let jobDebounceTimer;

export default function SetupProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialDisplayName = location.state?.full_name || '';

  const formatIsoToDisplay = (isoDate) => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Form State
  // Only full_name is mandatory. All other fields are optional and can be left empty.
  const [formData, setFormData] = useState({
    display_name: initialDisplayName,
    birthday: '',
    phone: '',
    avatar_url: '', // Allowed to be blank/empty
    headline: '',
    address: '',
    education: [], // Allowed to be empty list
    experience: [], // Allowed to be empty list
    skills: [],    // Allowed to be empty list
    followedCompanyIds: [] // Allowed to be empty list
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [placeholderJobTitle, setPlaceholderJobTitle] = useState('e.g., Senior Full Stack Developer | React Specialist');

  // Job title (Industry) autocomplete suggestions state
  const [jobSuggestions, setJobSuggestions] = useState([]);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);

  // Retrieve JWT Token
  const token = localStorage.getItem('token');

  // Set default auth headers
  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  // Load address data (depth=2) and placeholder job titles
  useEffect(() => {
    if (!token) {
      setApiError('Authentication token missing. Please log in again.');
      return;
    }

    const loadAddressData = async () => {
      try {
        const res = await axios.get('https://provinces.open-api.vn/api/?depth=2');
        setProvinces(res.data || []);
      } catch (error) {
        console.error('Failed to load address data from open API.', error);
      }
    };

    const loadPlaceholderTitle = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/industry/search-titles', getHeaders());
        if (res.data && res.data.success && res.data.data.length > 0) {
          setPlaceholderJobTitle(`e.g., ${res.data.data.join(', ')}`);
        }
      } catch (err) {
        console.error('Failed to load job title placeholders:', err);
      }
    };

    loadAddressData();
    loadPlaceholderTitle();
  }, [token]);

  // Sync selected province and district when provinces or profile address changes
  useEffect(() => {
    if (provinces.length === 0 || !formData.address) return;

    const parts = formData.address.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      const provinceName = parts[parts.length - 1];
      const districtName = parts[parts.length - 2];

      const foundProvince = provinces.find(p => p.name === provinceName);
      if (foundProvince) {
        setSelectedProvince(foundProvince.name);
        setDistricts(foundProvince.districts || []);
        
        const foundDistrict = foundProvince.districts.find(d => d.name === districtName);
        if (foundDistrict) {
          setSelectedDistrict(foundDistrict.name);
        }
      }
    } else if (parts.length === 1 && parts[0]) {
      const provinceName = parts[0];
      const foundProvince = provinces.find(p => p.name === provinceName);
      if (foundProvince) {
        setSelectedProvince(foundProvince.name);
        setDistricts(foundProvince.districts || []);
      }
    }
  }, [provinces, formData.address]);

  // Load existing profile if any
  useEffect(() => {
    if (!token) return;

    const loadExistingProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/candidate/profile', getHeaders());
        if (res.data) {
          const profile = res.data;
          setFormData(prev => ({
            ...prev,
            display_name: profile.display_name || profile.full_name || prev.display_name,
            phone: profile.phone || prev.phone,
            avatar_url: profile.avatar_url || prev.avatar_url,
            headline: profile.headline || prev.headline,
            address: profile.address || prev.address,
            birthday: profile.birthday ? formatIsoToDisplay(profile.birthday.substring(0, 10)) : prev.birthday,
          }));
        }
      } catch (err) {
        console.error("Failed to load existing profile in setup wizard:", err);
      }
    };

    loadExistingProfile();
  }, [token]);

  // Handle simple input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setApiError('');
  };

  // Handle living address province change
  const handleProvinceChange = (e) => {
    const provinceName = e.target.value;
    setSelectedProvince(provinceName);
    setSelectedDistrict('');
    
    if (!provinceName) {
      setDistricts([]);
      setFormData(prev => ({ ...prev, address: '' }));
      return;
    }

    const foundProvince = provinces.find(p => p.name === provinceName);
    const newDistricts = foundProvince ? foundProvince.districts : [];
    setDistricts(newDistricts);
    
    setFormData(prev => ({ ...prev, address: provinceName }));
  };

  // Handle living address district change
  const handleDistrictChange = (e) => {
    const districtName = e.target.value;
    setSelectedDistrict(districtName);

    if (!districtName) {
      setFormData(prev => ({ ...prev, address: selectedProvince }));
      return;
    }

    const fullAddress = `${districtName}, ${selectedProvince}`;
    setFormData(prev => ({ ...prev, address: fullAddress }));
  };

  // Handle autocomplete input changes for job title / headline
  const handleJobTitleChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, headline: value }));
    setApiError('');

    if (!value.trim()) {
      setJobSuggestions([]);
      return;
    }

    clearTimeout(jobDebounceTimer);
    jobDebounceTimer = setTimeout(async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/candidate/suggest-industries?search=${encodeURIComponent(value.trim())}`,
          getHeaders()
        );
        setJobSuggestions(res.data || []);
        setShowJobSuggestions(true);
      } catch (err) {
        console.error('Failed to suggest job titles from backend:', err);
      }
    }, 300);
  };

  // Select a job title suggestion
  const selectJobSuggestion = (name) => {
    setFormData(prev => ({ ...prev, headline: name }));
    setJobSuggestions([]);
    setShowJobSuggestions(false);
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

  const lettersOnlyRegex = /^[\p{L}\s]*$/u;

  const handleFinishSetup = async () => {
    if (!formData.display_name.trim()) {
      setApiError('Full Name is mandatory!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!lettersOnlyRegex.test(formData.display_name.trim())) {
      setApiError('Full Name can only contain letters and spaces!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.birthday.trim()) {
      setApiError('Date of Birth is mandatory!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Validate DD/MM/YYYY format
    const dobRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/;
    if (!dobRegex.test(formData.birthday.trim())) {
      setApiError('Date of Birth must be in DD/MM/YYYY format (e.g. 30/12/2000)!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (formData.phone.trim() && !/^\d{10}$/.test(formData.phone.trim())) {
      setApiError('Phone Number must be exactly 10 digits!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const parts = formData.birthday.trim().split('/');
      const apiBirthday = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
      const payload = {
        ...formData,
        birthday: apiBirthday
      };

      const response = await axios.post('http://localhost:5000/api/candidate/onboarding', payload, getHeaders());

      localStorage.setItem('userName', formData.display_name.trim());
      localStorage.setItem('avatarUrl', response.data?.avatar_url || '/default-avatar.png');

      navigate('/dashboard');
      window.location.reload();
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
          <p>Let's personalize your candidate profile.</p>
        </div>

        {apiError && (
          <div style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', padding: '15px 40px', fontSize: '0.95rem', fontWeight: '500' }}>
            ⚠️ {apiError}
          </div>
        )}

        {/* Wizard Main Body */}
        <div className="setup-wizard-body">

          <div className="step-view">
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '5px' }}>Basic Information</h2>
            <p style={{ color: 'var(--neutral-color)', fontSize: '0.95rem', marginTop: '-15px', marginBottom: '10px' }}>
              Provide your contact info. Only Full Name is required, everything else is optional.
            </p>

            <div className="avatar-upload-wrapper">
              <div className="avatar-preview-box">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Profile Preview" />
                ) : (
                  '👤'
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                <label className="avatar-upload-btn-label" style={{ display: 'inline-block', marginBottom: 0, padding: '8px 16px', fontSize: '0.85rem' }}>
                  Upload avatar
                  <input
                    type="file"
                    id="avatarFileInput"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                <span style={{ color: 'var(--neutral-color)', fontSize: '0.75rem', marginTop: '-2px', maxWidth: '380px', lineHeight: '1.3' }}>
                  Only image formats are supported (JPG, JPEG, PNG, WEBP) and maximum file size is 5 MB.
                </span>
                {formData.avatar_url && (
                  <button
                    type="button"
                    onClick={clearAvatar}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', padding: 0, textAlign: 'left', marginTop: '4px' }}
                  >
                    ✕ Remove Photo
                  </button>
                )}
              </div>
            </div>

            <div className="form-group-grid">
              <div className="form-field">
                <label htmlFor="display_name">
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  id="display_name"
                  name="display_name"
                  placeholder="Enter your full name"
                  value={formData.display_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-field">
                <label htmlFor="birthday">
                  Date of Birth <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <CustomDatePicker
                  id="birthday"
                  selectedDate={parseDisplayDate(formData.birthday)}
                  onChange={(date) => {
                    setFormData(prev => ({ ...prev, birthday: formatDisplayDate(date) }));
                    setApiError('');
                  }}
                  maxDate={new Date()}
                  placeholder="dd/mm/yyyy"
                />
              </div>
            </div>

            <div className="form-group-grid">
              <div className="form-field">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="e.g., 0901234567"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-field" style={{ position: 'relative' }}>
                <label htmlFor="headline">Job Title / Headline</label>
                <input
                  type="text"
                  id="headline"
                  name="headline"
                  placeholder={placeholderJobTitle}
                  value={formData.headline}
                  onChange={handleJobTitleChange}
                  onBlur={() => setTimeout(() => setShowJobSuggestions(false), 200)}
                  onFocus={() => { if (jobSuggestions.length > 0) setShowJobSuggestions(true); }}
                  autoComplete="off"
                />
                {showJobSuggestions && jobSuggestions.length > 0 && (
                  <div className="address-suggestions-dropdown">
                    {jobSuggestions.map((title, idx) => (
                      <div
                        key={idx}
                        className="address-suggestion-item"
                        onClick={() => selectJobSuggestion(title)}
                      >
                        {title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group-grid">
              <div className="form-field">
                <label htmlFor="province">City / Province</label>
                <select
                  id="province"
                  value={selectedProvince}
                  onChange={handleProvinceChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-color)',
                    fontSize: '0.95rem',
                    color: 'var(--text-color)',
                    backgroundColor: '#fff',
                    outline: 'none',
                    transition: 'border-color 0.2s ease-in-out'
                  }}
                >
                  <option value="">-- Select City / Province --</option>
                  {provinces.map((p, idx) => (
                    <option key={idx} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="district">District</label>
                <select
                  id="district"
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  disabled={!selectedProvince}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-color)',
                    fontSize: '0.95rem',
                    color: 'var(--text-color)',
                    backgroundColor: selectedProvince ? '#fff' : '#f3f4f6',
                    cursor: selectedProvince ? 'pointer' : 'not-allowed',
                    outline: 'none',
                    transition: 'border-color 0.2s ease-in-out'
                  }}
                >
                  <option value="">-- Select District --</option>
                  {districts.map((d, idx) => (
                    <option key={idx} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Navigation Footer Controls */}
        <div className="setup-wizard-footer" style={{ justifyContent: 'center' }}>
          <button
            type="button"
            onClick={handleFinishSetup}
            className="wizard-btn-finish"
            style={{ width: '100%', maxWidth: '300px' }}
            disabled={loading}
          >
            {loading ? <span className="wizard-spinner" /> : 'Finish'}
          </button>
        </div>

      </div>
    </div>
  );
}
