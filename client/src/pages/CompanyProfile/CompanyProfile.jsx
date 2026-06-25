
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CompanyProfile.module.css';
const API_URL = 'http://localhost:5000';

const getHrId = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      return decoded.id || 1;
    } catch (e) {
      return 1;
    }
  }
  return 1;
};

const EMPLOYEE_OPTIONS = ['Under 10', '10 - 50', '50 - 100', '100 - 300', '300 - 500', '500 - 1000', 'Over 1000'];
const BRANCH_OPTIONS = ['1', '2 - 5', '5 - 10', '10 - 20', 'Over 20'];
const AGE_OPTIONS = ['Under 22', '22 - 25', '25 - 30', '30 - 35', 'Over 35'];
const TABS = ['Overview', 'Structure', 'Images', 'Other'];

export default function CompanyProfile() {
const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef();
  const [industries, setIndustries] = useState([]);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: '',
    industry_id: '',
    website: '',
    address: '',
    email: '',
    company_phone: '',
    tax_id: '',
    size: '',
    description: '',
    logoFile: null
  });

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
      } else throw new Error();
    } catch {
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
      const hrId = getHrId();
      const res = await fetch(`${API_URL}/api/company/${hrId}`);
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({
          ...prev,
          name: data.name || '',
          industry_id: data.industry_id || '',
          website: data.website || '',
          address: data.address || '',
          email: data.email || '',
          company_phone: data.company_phone || '',
          tax_id: data.tax_id || '',
          size: data.size || '',
          description: data.description || ''
        }));
        if (data.logo_url) setLogoPreview(`${API_URL}${data.logo_url}`);
        setIsEdit(true);
      }
    } catch { 
    }
  };

  const handleFormChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogoChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      showToast('Only image files accepted (JPG, PNG, GIF, WEBP)', 'error'); 
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showToast('File too large. Max 5MB', 'error'); 
      return;
    }

    setForm(prev => ({ ...prev, logoFile: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleSubmit = async () => {
    let newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Company name cannot be empty.";
    }
    if (!form.industry_id) {
      newErrors.industry_id = "Please select an industry.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    const hrId = getHrId();
    
    try {
      const submitData = new FormData();
      submitData.append('hr_id', hrId);
      submitData.append('name', form.name);
      submitData.append('industry_id', form.industry_id);
      submitData.append('website', form.website);
      submitData.append('address', form.address);
      submitData.append('email', form.email);
      submitData.append('company_phone', form.company_phone);
      submitData.append('tax_id', form.tax_id);
      submitData.append('size', form.size);
      submitData.append('description', form.description);

      if (form.logoFile) {
        submitData.append('logo', form.logoFile);
      }

      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `${API_URL}/api/company/${hrId}` : `${API_URL}/api/company`;
      
      const token = localStorage.getItem('token');

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: submitData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        showToast(isEdit ? 'Profile updated successfully!' : 'Company profile created!', 'success');
        setIsEdit(true);
        window.dispatchEvent(new Event('profileUpdated'));
      } else {
        showToast(data.message || 'An error occurred', 'error');
      }
    } catch {
      showToast('Cannot connect to server. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

return (
    <div className={styles.page}>
      <div className={`${styles.toast} ${toast.show ? styles.toastShow : ''} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
        {toast.message}
      </div>
      <div className={styles.layout}>
        <main className={styles.main}>
          
          <div>
            <h1 className={styles.pageTitle}>Company Profile</h1>
          </div>

          <div className={styles.tabs}>
            {TABS.map((tab, i) => (
              <button
                key={i}
                className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(i)}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 0 && (
            <div className={styles.tabContent}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>Company Logo</div>
                <div className={styles.cardBody}>
                  <div className={styles.logoRow}>
                    <div className={styles.logoPreview}>
                      {logoPreview
                        ? <img src={logoPreview} alt="Logo" />
                        : <div className={styles.logoPlaceholder}>LOGO</div>}
                    </div>
                    <div className={styles.logoActions}>
                      <p className={styles.logoHint}>Formats: JPG, PNG, GIF, WEBP · Max 5MB</p>
                      <div className={styles.logoButtons}>
                        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                        <button type="button" className={styles.btnSecondary} onClick={() => fileInputRef.current.click()}>
                          Select Image
                        </button>
                        {logoPreview && (
                          <button type="button" className={styles.btnDanger} onClick={() => { setLogoPreview(null); setForm(p => ({ ...p, logoFile: null, logo_url: '' })); }}>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>Basic Information</div>
                <div className={styles.cardBody}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Company Name <span className={styles.req}>*</span></label>
                      <input className={`${styles.input} ${errors.name ? styles.hasError : ''}`} name="name" value={form.name} onChange={handleFormChange} placeholder="Company Ltd." />
                      {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Tax ID <span className={styles.req}>*</span></label>
                      <input className={`${styles.input} ${errors.taxId ? styles.hasError : ''}`} name="tax_id" value={form.tax_id} onChange={handleFormChange} placeholder="Tax Identification Number" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Industry <span className={styles.req}>*</span></label>
                      <select className={`${styles.input} ${errors.industry_id ? styles.hasError : ''}`} name="industry_id" value={form.industry_id} onChange={handleFormChange}>
                        <option value="">-- Select Industry --</option>
                        {industries.map(ind => <option key={ind.id} value={ind.id}>{ind.name}</option>)}
                      </select>
                      {errors.industry_id && <span className={styles.errorText}>{errors.industry_id}</span>}
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Company Email <span className={styles.req}>*</span></label>
                      <input className={styles.input} name="email" type="email" value={form.email} onChange={handleFormChange} />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Company Phone</label>
                      <input className={styles.input} name="company_phone" value={form.company_phone} onChange={handleFormChange} placeholder="Company contact number" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Website</label>
                      <input className={styles.input} name="website" type="url" value={form.website} onChange={handleFormChange} placeholder="https://www.company.com" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroupFull}>
                      <label className={styles.label}>Headquarters Address</label>
                      <textarea className={styles.textarea} name="address" value={form.address} onChange={handleFormChange} placeholder="Full company address..." rows={3} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className={styles.tabContent}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>Company Details</div>
                <div className={styles.cardBody}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Company Size</label>
                      <select className={styles.input} name="size" value={form.size} onChange={handleFormChange}>
                        <option value="">-- Select Size --</option>
                        <option value="1-50">1 - 50 Employees</option>
                        <option value="51-200">51 - 200 Employees</option>
                        <option value="201-1000">201 - 1000 Employees</option>
                        <option value="1000+">1000+ Employees</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroupFull}>
                      <label className={styles.label}>Company Description</label>
                      <textarea className={styles.textarea} name="description" value={form.description} onChange={handleFormChange} placeholder="Describe your company culture, vision, and mission..." rows={5} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.formActions}>
            <button type="button" className={styles.btnCancel} onClick={fetchCompany} disabled={loading}>
              Cancel
            </button>
            <button type="button" className={styles.btnSave} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

