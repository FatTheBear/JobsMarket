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
const TABS = ['Tổng quan', 'Cơ cấu', 'Hình ảnh', 'Khác'];

export default function CompanyProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef();

  const [industries, setIndustries] = useState([]);

  // Basic Info
  const [form, setForm] = useState({
    name: '',
    industry_id: '',
    website: '',
    address: '',
    logo_url: '',
    email: '',
    phone: '',
    facebook: '',
    linkedin: '',
    twitter: '',
  });

  // Company Scale
  const [scale, setScale] = useState({
    description: '',
    num_employees: '',
    num_branches: '',
    avg_age: '',
    branch_info: '',
    female_ratio: 50,
  });

  // Company Culture
  const [culture, setCulture] = useState({
    work_hours_per_day: '',
    work_days_per_week: '',
    dress_code: '',
    other_info: '',
  });

  // Benefits
  const [benefits, setBenefits] = useState({
    social_insurance: false,
    health_insurance: false,
    other_benefits: '',
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
        setForm({
          name: data.name || '',
          industry_id: data.industry_id || '',
          website: data.website || '',
          address: data.address || '',
          logo_url: data.logo_url || '',
          email: data.email || '',
          phone: data.phone || '',
          facebook: data.facebook || '',
          linkedin: data.linkedin || '',
          twitter: data.twitter || '',
        });
        if (data.logo_url) setLogoPreview(data.logo_url);
        setIsEdit(true);
      }
    } catch { /* empty form */ }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const handleFormChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleScaleChange = e => setScale({ ...scale, [e.target.name]: e.target.value });
  const handleCultureChange = e => setCulture({ ...culture, [e.target.name]: e.target.value });
  const handleBenefitChange = e => {
    const { name, type, checked, value } = e.target;
    setBenefits({ ...benefits, [name]: type === 'checkbox' ? checked : value });
  };

  const handleLogoChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      showToast('Only image files accepted (JPG, PNG, GIF, WEBP)', 'error'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File too large. Max 5MB', 'error'); return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
      setForm(prev => ({ ...prev, logo_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { showToast('Please enter company name', 'error'); return; }
    if (!form.industry_id) { showToast('Please select an industry', 'error'); return; }

    setLoading(true);
    const hrId = getHrId();
    try {
      const payload = { ...form, hr_id: hrId };
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `${API_URL}/api/company/${hrId}` : `${API_URL}/api/company`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(isEdit ? 'Profile updated successfully!' : 'Company profile created!', 'success');
        setIsEdit(true);
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
      {/* Toast */}
      <div className={`${styles.toast} ${toast.show ? styles.toastShow : ''} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
        {toast.type === 'success' ? '✅' : '❌'} {toast.message}
      </div>

      {/* Top bar */}
      <div className={styles.topBar}>
        <div>
          <div className={styles.breadcrumb}>Bảng thông tin</div>
          <h1 className={styles.pageTitle}>Hồ sơ công ty</h1>
        </div>
        <button
          className={styles.btnPostJob}
          onClick={() => navigate('/company/jobs/create')}
        >
          Đăng tin tuyển dụng mới
        </button>
      </div>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarLabel}>QUẢN LÝ TIN TUYỂN DỤNG</div>
            <button className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}><span>📄</span> Tạo việc làm mới <span className={styles.badge}>0</span></button>
            <button className={styles.sidebarItem}><span>📁</span> Danh sách việc làm <span className={styles.badge}>0</span></button>
          </div>
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarLabel}>QUẢN LÝ ỨNG VIÊN</div>
            <button className={styles.sidebarItem}><span>👤</span> Ứng viên ứng tuyển <span className={styles.badge}>0</span></button>
            <button className={styles.sidebarItem}><span>💾</span> Ứng viên đã lưu</button>
            <button className={styles.sidebarItem}><span>🔎</span> Tìm kiếm ứng viên</button>
          </div>
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarLabel}>HỒ SƠ</div>
            <button className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}><span>🏢</span> Hồ sơ công ty</button>
            <button className={styles.sidebarItem}><span>⚙️</span> Cài đặt tài khoản</button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <div className={styles.pageSubTitle}>Thông tin công ty</div>
              <h1 className={styles.pageTitle}>Hồ sơ công ty</h1>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.btnOutline}
                onClick={() => navigate('/company-profile/job-posting')}
              >
                Xem danh sách việc làm
              </button>
            </div>
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

          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryTitle}>Thông tin công ty</div>
              <div className={styles.summaryRow}><strong>Tên công ty:</strong> {form.name || 'Chưa cập nhật'}</div>
              <div className={styles.summaryRow}><strong>Ngành nghề:</strong> {industries.find(i => String(i.id) === String(form.industry_id))?.name || 'Chưa chọn'}</div>
              <div className={styles.summaryRow}><strong>Website:</strong> {form.website || 'Chưa cập nhật'}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryTitle}>Số liệu nhanh</div>
              <div className={styles.summaryRow}><strong>Việc làm:</strong> 0</div>
              <div className={styles.summaryRow}><strong>Ứng viên ứng tuyển:</strong> 0</div>
              <div className={styles.summaryRow}><strong>Hồ sơ đã lưu:</strong> 0</div>
            </div>
          </div>

          {/* ── TAB 0: Overview ── */}
          {activeTab === 0 && (
            <div className={styles.tabContent}>
              {/* Logo */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>Company Logo</div>
                <div className={styles.cardBody}>
                  <div className={styles.logoRow}>
                    <div className={styles.logoPreview}>
                      {logoPreview
                        ? <img src={logoPreview} alt="Logo" />
                        : <div className={styles.logoPlaceholder}>🏢</div>}
                    </div>
                    <div className={styles.logoActions}>
                      <p className={styles.logoHint}>Formats: <strong>JPG, PNG, GIF, WEBP</strong> · Max <strong>5MB</strong></p>
                      <div className={styles.logoButtons}>
                        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                        <button type="button" className={styles.btnSecondary} onClick={() => fileInputRef.current.click()}>
                          📁 Select Image
                        </button>
                        {logoPreview && (
                          <button type="button" className={styles.btnDanger} onClick={() => { setLogoPreview(null); setForm(p => ({ ...p, logo_url: '' })); }}>
                            🗑 Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>Basic Information</div>
                <div className={styles.cardBody}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Company Name <span className={styles.req}>*</span></label>
                      <input className={styles.input} name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. ABC Company Ltd." />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Industry <span className={styles.req}>*</span></label>
                      <select className={styles.input} name="industry_id" value={form.industry_id} onChange={handleFormChange}>
                        <option value="">-- Select Industry --</option>
                        {industries.map(ind => <option key={ind.id} value={ind.id}>{ind.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Email</label>
                      <input className={styles.input} name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="company@example.com" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Phone</label>
                      <input className={styles.input} name="phone" value={form.phone} onChange={handleFormChange} placeholder="0xxx xxx xxx" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroupFull}>
                      <label className={styles.label}>Website</label>
                      <input className={styles.input} name="website" type="url" value={form.website} onChange={handleFormChange} placeholder="https://www.company.com" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroupFull}>
                      <label className={styles.label}>Address</label>
                      <textarea className={styles.textarea} name="address" value={form.address} onChange={handleFormChange} placeholder="House number, street, district, city..." rows={3} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>Social Media</div>
                <div className={styles.cardBody}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>🔵 Facebook</label>
                      <input className={styles.input} name="facebook" value={form.facebook} onChange={handleFormChange} placeholder="https://facebook.com/yourcompany" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>🔗 LinkedIn</label>
                      <input className={styles.input} name="linkedin" value={form.linkedin} onChange={handleFormChange} placeholder="https://linkedin.com/company/yourcompany" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>🐦 Twitter / X</label>
                      <input className={styles.input} name="twitter" value={form.twitter} onChange={handleFormChange} placeholder="https://twitter.com/yourcompany" />
                    </div>
                    <div className={styles.formGroup} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 1: HR Structure ── */}
          {activeTab === 1 && (
            <div className={styles.tabContent}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>Company Scale</div>
                <div className={styles.cardBody}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroupFull}>
                      <label className={styles.label}>Company Description</label>
                      <textarea className={styles.textarea} name="description" value={scale.description} onChange={handleScaleChange} placeholder="Describe your company culture, vision, and mission..." rows={4} />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Number of Employees</label>
                      <select className={styles.input} name="num_employees" value={scale.num_employees} onChange={handleScaleChange}>
                        <option value="">-- Select --</option>
                        {EMPLOYEE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Number of Branches</label>
                      <select className={styles.input} name="num_branches" value={scale.num_branches} onChange={handleScaleChange}>
                        <option value="">-- Select --</option>
                        {BRANCH_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Average Employee Age</label>
                      <select className={styles.input} name="avg_age" value={scale.avg_age} onChange={handleScaleChange}>
                        <option value="">-- Select --</option>
                        {AGE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Female Ratio (%)</label>
                      <div className={styles.sliderRow}>
                        <input type="range" min={0} max={100} name="female_ratio" value={scale.female_ratio} onChange={handleScaleChange} className={styles.slider} />
                        <span className={styles.sliderVal}>{scale.female_ratio}%</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroupFull}>
                      <label className={styles.label}>Branch Locations</label>
                      <textarea className={styles.textarea} name="branch_info" value={scale.branch_info} onChange={handleScaleChange} placeholder="List your branch locations..." rows={3} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: Images ── */}
          {activeTab === 2 && (
            <div className={styles.tabContent}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>Company Images</div>
                <div className={styles.cardBody}>
                  <div className={styles.imageUploadArea}>
                    <div className={styles.imageUploadIcon}>🖼️</div>
                    <p className={styles.imageUploadText}>Drag & drop images here or click to browse</p>
                    <p className={styles.imageUploadHint}>Upload photos of your office, team, and work environment<br />Formats: JPG, PNG · Max 5MB each</p>
                    <button type="button" className={styles.btnSecondary}>📁 Select Images</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: Other ── */}
          {activeTab === 3 && (
            <div className={styles.tabContent}>
              {/* Culture */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>Company Culture</div>
                <div className={styles.cardBody}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Working Hours</label>
                      <div className={styles.workHoursRow}>
                        <input className={styles.inputSmall} name="work_hours_per_day" type="number" value={culture.work_hours_per_day} onChange={handleCultureChange} placeholder="e.g. 8" min={1} max={24} />
                        <span className={styles.workHoursUnit}>hrs/day</span>
                        <input className={styles.inputSmall} name="work_days_per_week" type="number" value={culture.work_days_per_week} onChange={handleCultureChange} placeholder="e.g. 5" min={1} max={7} />
                        <span className={styles.workHoursUnit}>days/week</span>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Dress Code</label>
                      <input className={styles.input} name="dress_code" value={culture.dress_code} onChange={handleCultureChange} placeholder="e.g. Business casual" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroupFull}>
                      <label className={styles.label}>Other Information</label>
                      <textarea className={styles.textarea} name="other_info" value={culture.other_info} onChange={handleCultureChange} placeholder="Other details about company culture..." rows={3} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>Benefits & Perks</div>
                <div className={styles.cardBody}>
                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxItem}>
                      <input type="checkbox" name="social_insurance" checked={benefits.social_insurance} onChange={handleBenefitChange} />
                      <span>🛡️ Social Insurance</span>
                    </label>
                    <label className={styles.checkboxItem}>
                      <input type="checkbox" name="health_insurance" checked={benefits.health_insurance} onChange={handleBenefitChange} />
                      <span>🏥 Health Insurance</span>
                    </label>
                  </div>
                  <div className={styles.formRow} style={{ marginTop: '16px' }}>
                    <div className={styles.formGroupFull}>
                      <label className={styles.label}>Other Benefits</label>
                      <textarea className={styles.textarea} name="other_benefits" value={benefits.other_benefits} onChange={handleBenefitChange} placeholder="e.g. Annual bonus, team outing, flexible work hours, remote work..." rows={3} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save / Cancel */}
          <div className={styles.formActions}>
            <button type="button" className={styles.btnCancel} onClick={fetchCompany} disabled={loading}>
              ✕ Cancel
            </button>
            <button type="button" className={styles.btnSave} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
