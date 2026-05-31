import { useState, useEffect, useRef } from 'react';
import './CompanyProfile.css';

const API_URL = 'http://localhost:5000';

// hr_id temporary — will be fetched from context/auth later
const TEMP_HR_ID = 1;

export default function CompanyProfile() {
  const [form, setForm] = useState({
    name: '',
    industry_id: '',
    website: '',
    address: '',
    logo_url: '',
  });

  const [industries, setIndustries] = useState([]);
  const [logoPreview, setLogoPreview] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false); // true if company data exists
  const fileInputRef = useRef();

  // Load industries + company data if exists
  useEffect(() => {
    fetchIndustries();
    fetchCompany();
  }, []);

  const fetchIndustries = async () => {
    try {
      const res = await fetch(`${API_URL}/api/company/meta/industries`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setIndustries(data);
      } else {
        throw new Error("Empty array");
      }
    } catch {
      // Default list if no data
      setIndustries([
        { id: 1, name: 'Information Technology' },
        { id: 2, name: 'Finance - Banking' },
        { id: 3, name: 'Education' },
        { id: 4, name: 'Healthcare - Pharmacy' },
        { id: 5, name: 'Retail - Commerce' },
        { id: 6, name: 'Manufacturing' },
        { id: 7, name: 'Marketing - Media' },
        { id: 8, name: 'Construction - Real Estate' },
        { id: 9, name: 'Tourism - Hospitality' },
        { id: 10, name: 'Others' },
      ]);
    }
  };

  const fetchCompany = async () => {
    try {
      const res = await fetch(`${API_URL}/api/company/${TEMP_HR_ID}`);
      if (res.ok) {
        const data = await res.json();
        setForm({
          name: data.name || '',
          industry_id: data.industry_id || '',
          website: data.website || '',
          address: data.address || '',
          logo_url: data.logo_url || '',
        });
        if (data.logo_url) setLogoPreview(data.logo_url);
        setIsEdit(true);
      }
    } catch {
      // No data -> empty form
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle logo upload (preview immediately, send base64 or URL)
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Only image files are accepted (JPG, PNG, GIF, WEBP)', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File is too large. Please select a file under 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
      setForm((prev) => ({ ...prev, logo_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setForm({ name: '', industry_id: '', website: '', address: '', logo_url: '' });
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      showToast('Please enter the company name', 'error');
      return;
    }
    if (!form.industry_id) {
      showToast('Please select an industry', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form, hr_id: TEMP_HR_ID };
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit
        ? `${API_URL}/api/company/${TEMP_HR_ID}`
        : `${API_URL}/api/company`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(isEdit ? 'Updated successfully!' : 'Company profile created successfully!', 'success');
        setIsEdit(true);
      } else {
        showToast(data.message || 'An error occurred', 'error');
      }
    } catch {
      showToast('Cannot connect to the server. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  return (
    <div className="cv-container">
      {/* Toast Notification */}
      <div
        className={`cv-toast ${toast.show ? 'show' : ''}`}
        style={{ backgroundColor: toast.type === 'error' ? '#e53e3e' : '#4CAF50' }}
      >
        {toast.message}
      </div>

      {/* Title */}
      <h1 className="cv-page-title">
        {isEdit ? 'Update Company Profile' : 'Create Company Profile'}
      </h1>

      <form onSubmit={handleSubmit}>
        {/* Card: Company Logo */}
        <div className="cv-card" style={{ marginBottom: '24px' }}>
          <div className="cv-card-header">Company Logo</div>
          <div className="cv-card-body">
            <div className="cv-logo-upload">
              {/* Logo Preview */}
              <div className="cv-logo-preview">
                {logoPreview ? (
                  <img src={logoPreview} alt="Company Logo" />
                ) : (
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                )}
              </div>

              {/* Upload Button */}
              <div className="cv-logo-info">
                <p>
                  Upload your company logo. The logo will be displayed on the recruitment page
                  and company profile.
                  <br />
                  Supported formats: <strong>JPG, PNG, GIF, WEBP</strong>. Max size:{' '}
                  <strong>5MB</strong>.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleLogoChange}
                />
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="cv-btn cv-btn-secondary"
                    onClick={() => fileInputRef.current.click()}
                  >
                    📁 Select Image
                  </button>
                  {logoPreview && (
                    <button
                      type="button"
                      className="cv-btn cv-btn-secondary"
                      onClick={() => {
                        setLogoPreview(null);
                        setForm((prev) => ({ ...prev, logo_url: '' }));
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      🗑 Remove Image
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card: Basic Information */}
        <div className="cv-card" style={{ marginBottom: '24px' }}>
          <div className="cv-card-header">Company Information</div>
          <div className="cv-card-body">
            {/* Company Name + Industry */}
            <div className="cv-form-row">
              <div className="cv-form-group half">
                <label htmlFor="name" className="cv-label">
                  Company Name <span className="required">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="cv-input"
                  placeholder="Example: ABC Company Ltd."
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="cv-form-group half">
                <label htmlFor="industry_id" className="cv-label">
                  Industry <span className="required">*</span>
                </label>
                <select
                  id="industry_id"
                  name="industry_id"
                  className="cv-input"
                  value={form.industry_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Industry --</option>
                  {industries.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Website */}
            <div className="cv-form-row">
              <div className="cv-form-group">
                <label htmlFor="website" className="cv-label">
                  Company Website
                </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  className="cv-input"
                  placeholder="https://www.companyabc.com"
                  value={form.website}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Address */}
            <div className="cv-form-row">
              <div className="cv-form-group">
                <label htmlFor="address" className="cv-label">
                  Company Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  className="cv-textarea"
                  placeholder="House number, street, ward, district, city/province..."
                  value={form.address}
                  onChange={handleChange}
                  style={{ minHeight: '100px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="cv-form-actions">
          <button
            type="button"
            className="cv-btn cv-btn-secondary"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </button>
          <button
            type="submit"
            className="cv-btn cv-btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEdit ? '💾 Update' : '✅ Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
