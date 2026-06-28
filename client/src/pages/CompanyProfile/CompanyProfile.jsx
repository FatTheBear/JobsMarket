
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CompanyProfile.module.css';
const API_URL = 'http://localhost:5000';

// Keep industry names in English by default; no translation map.

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
const TABS = ['Overview', 'Structure', 'Other'];

export default function CompanyProfile() {
const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const fileInputRef = useRef();
  const coverInputRef = useRef();
  const [industries, setIndustries] = useState([]);
  const [errors, setErrors] = useState({});

  const [originalName, setOriginalName] = useState('');
  const [originalAddress, setOriginalAddress] = useState('');
  const [nameLocked, setNameLocked] = useState(false);
  const [addressLocked, setAddressLocked] = useState(false);

  // Change password flow
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldownMs, setOtpCooldownMs] = useState(0);
  const [changePwd, setChangePwd] = useState({ otp: '', newPassword: '', confirmPassword: '' });

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
        setOriginalName(data.name || '');
        setOriginalAddress(data.address || '');
        const hrIdKey = getHrId();
        const nameFlag = localStorage.getItem(`company_name_changed_hr_${hrIdKey}`) === '1';
        const addrFlag = localStorage.getItem(`company_address_changed_hr_${hrIdKey}`) === '1';
        setNameLocked(!!nameFlag);
        setAddressLocked(!!addrFlag);
        if (data.logo_url) {
          const raw = data.logo_url;
          // If stored as absolute URL or data URI, use directly. Otherwise prepend API_URL and ensure leading slash.
          if (raw.startsWith('http') || raw.startsWith('data:')) {
            setLogoPreview(raw);
          } else {
            const path = raw.startsWith('/') ? raw : `/${raw}`;
            setLogoPreview(`${API_URL}${path}`);
          }
        }
        if (data.cover_image_url) {
          const raw = data.cover_image_url;
          if (raw.startsWith('http') || raw.startsWith('data:')) {
            setCoverPreview(raw);
          } else {
            const path = raw.startsWith('/') ? raw : `/${raw}`;
            setCoverPreview(`${API_URL}${path}`);
          }
        }
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

  const handleCoverChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Only image files accepted for cover', 'error');
      return;
    }

    setForm(prev => ({ ...prev, coverFile: file }));

    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result);
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

      if (form.logoFile) submitData.append('logo', form.logoFile);
      if (form.coverFile) submitData.append('cover_image', form.coverFile);

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
        // If name/address changed, lock edits once
        const hrIdKey = getHrId();
        if (form.name && form.name !== originalName) {
          localStorage.setItem(`company_name_changed_hr_${hrIdKey}`, '1');
          setNameLocked(true);
        }
        if (form.address && form.address !== originalAddress) {
          localStorage.setItem(`company_address_changed_hr_${hrIdKey}`, '1');
          setAddressLocked(true);
        }
        console.log('CompanyProfile - dispatching profileUpdated');
        window.dispatchEvent(new Event('profileUpdated'));
        // Also dispatch the new avatar so NavBar can update immediately
        try {
          let newAvatar = null;
          if (form.logoFile && logoPreview) {
            newAvatar = logoPreview;
          } else if (data && data.logo_url) {
            const raw = data.logo_url;
            if (raw.startsWith('http') || raw.startsWith('data:')) newAvatar = raw;
            else newAvatar = `${API_URL}${raw.startsWith('/') ? raw : `/${raw}`}`;
          }
          console.log('CompanyProfile - logoPreview:', logoPreview ? (logoPreview.substring ? logoPreview.substring(0,100) : logoPreview) : null, 'data.logo_url:', data?.logo_url, 'computed newAvatar:', newAvatar ? (newAvatar.substring ? newAvatar.substring(0,200) : newAvatar) : null);
          if (newAvatar) {
            // add cache-buster to force reload in navbar
            let dispatchedAvatar = newAvatar;
            try {
              if (dispatchedAvatar.startsWith('http')) {
                const sep = dispatchedAvatar.includes('?') ? '&' : '?';
                dispatchedAvatar = `${dispatchedAvatar}${sep}_cb=${Date.now()}`;
              }
            } catch (e) {}
            console.log('CompanyProfile - dispatching profileUpdatedWithAvatar ->', dispatchedAvatar.substring ? dispatchedAvatar.substring(0,200) : dispatchedAvatar);
            window.dispatchEvent(new CustomEvent('profileUpdatedWithAvatar', { detail: { avatar: dispatchedAvatar } }));
          } else {
            console.log('CompanyProfile - no avatar to dispatch');
          }
        } catch (e) {
          console.error('CompanyProfile - avatar dispatch error', e);
        }
      } else {
        showToast(data.message || 'An error occurred', 'error');
      }
    } catch {
      showToast('Cannot connect to server. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Password change flows
  const handleSendOtp = async () => {
    try {
      const token = localStorage.getItem('token');
      setOtpCooldownMs(60000);
      setOtpSent(true);
      const res = await fetch(`${API_URL}/api/auth/change-password/request`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.message || 'Cannot send OTP', 'error');
        setOtpSent(false);
        setOtpCooldownMs(0);
        return;
      }
      showToast('OTP sent to your email', 'success');
      // start cooldown timer
      const interval = setInterval(() => {
        setOtpCooldownMs(prev => {
          if (prev <= 1000) { clearInterval(interval); return 0; }
          return prev - 1000;
        });
      }, 1000);
    } catch (err) {
      showToast('Error sending OTP', 'error');
      setOtpSent(false);
      setOtpCooldownMs(0);
    }
  };

  const handleConfirmPassword = async () => {
    if (!changePwd.otp || !changePwd.newPassword || !changePwd.confirmPassword) {
      showToast('Please fill all fields', 'error');
      return;
    }
    if (changePwd.newPassword !== changePwd.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/auth/change-password/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ otp: changePwd.otp, newPassword: changePwd.newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Password updated', 'success');
        setChangePwd({ otp: '', newPassword: '', confirmPassword: '' });
        setOtpSent(false);
      } else {
        showToast(data.message || 'Error', 'error');
      }
    } catch (err) {
      showToast('Cannot connect to server', 'error');
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
              {/* Preview header similar to public company profile (cover, logo, name, industry) */}
              {/* removed preview header - reverted to simpler Images card */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>Company Images</div>
                <div className={styles.cardBody}>
                  { (logoPreview || coverPreview) ? (
                    <div className={styles.logoRow}>
                      <div className={styles.coverPreview}>
                        {coverPreview ? <img src={coverPreview} alt="Cover" /> : null}
                      </div>
                      <div className={styles.logoPreview}>
                        {logoPreview ? <img src={logoPreview} alt="Logo" /> : null}
                      </div>
                      <div className={styles.logoActions}>
                        <p className={styles.logoHint}>Formats: JPG, PNG, GIF, WEBP · Max 5MB</p>
                        <div className={styles.logoButtons}>
                          <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverChange} />
                          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                          <button type="button" className={styles.btnSecondary} onClick={() => fileInputRef.current.click()}>Select Logo</button>
                          <button type="button" className={styles.btnSecondary} onClick={() => coverInputRef.current.click()}>Select Cover</button>
                          {logoPreview && (
                            <button type="button" className={styles.btnDanger} onClick={() => { setLogoPreview(null); setForm(p => ({ ...p, logoFile: null, logo_url: '' })); }}>Remove Logo</button>
                          )}
                          {coverPreview && (
                            <button type="button" className={styles.btnDanger} onClick={() => { setCoverPreview(null); setForm(p => ({ ...p, coverFile: null, cover_image_url: '' })); }}>Remove Cover</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.logoActions}>
                      <p className={styles.logoHint}>Formats: JPG, PNG, GIF, WEBP · Max 5MB</p>
                      <div className={styles.logoButtons}>
                        <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverChange} />
                        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                        <button type="button" className={styles.btnSecondary} onClick={() => fileInputRef.current.click()}>Select Logo</button>
                        <button type="button" className={styles.btnSecondary} onClick={() => coverInputRef.current.click()}>Select Cover</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>Basic Information</div>
                <div className={styles.cardBody}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Company Name <span className={styles.req}>*</span></label>
                      <input className={`${styles.input} ${errors.name ? styles.hasError : ''}`} name="name" value={form.name} onChange={handleFormChange} placeholder="Company Ltd." disabled={nameLocked} />
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
                      <textarea className={styles.textarea} name="address" value={form.address} onChange={handleFormChange} placeholder="Full company address..." rows={3} disabled={addressLocked} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className={styles.tabContent}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>Account & Security</div>
                <div className={styles.cardBody}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroupFull}>
                      <label className={styles.label}>Change Password</label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button type="button" className={styles.btnSecondary} onClick={handleSendOtp} disabled={otpCooldownMs > 0}>
                          {otpCooldownMs > 0 ? `Wait ${Math.ceil(otpCooldownMs/1000)}s` : 'Send OTP'}
                        </button>
                        <span style={{ color: '#666' }}>{otpSent ? 'OTP sent — check your email' : ''}</span>
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <input className={styles.input} placeholder="OTP code" value={changePwd.otp} onChange={e => setChangePwd(p => ({ ...p, otp: e.target.value }))} />
                        <input className={styles.input} placeholder="New password" type="password" value={changePwd.newPassword} onChange={e => setChangePwd(p => ({ ...p, newPassword: e.target.value }))} />
                        <input className={styles.input} placeholder="Confirm new password" type="password" value={changePwd.confirmPassword} onChange={e => setChangePwd(p => ({ ...p, confirmPassword: e.target.value }))} />
                        <div style={{ marginTop: 8 }}>
                          <button type="button" className={styles.btnSave} onClick={handleConfirmPassword}>Update Password</button>
                        </div>
                      </div>
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

          {/* Images shown in Overview tab */}

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

