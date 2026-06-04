import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CompanyProfile.module.css';

const API_URL = 'http://localhost:5000';
const TEMP_HR_ID = 1;

const EMPLOYEE_OPTIONS = ['Under 10', '10 - 50', '50 - 100', '100 - 300', '300 - 500', '500 - 1000', 'Over 1000'];
const BRANCH_OPTIONS = ['1', '2 - 5', '5 - 10', '10 - 20', 'Over 20'];
const AGE_OPTIONS = ['Under 22', '22 - 25', '25 - 30', '30 - 35', 'Over 35'];
const TABS = ['Tổng quan', 'Cơ cấu', 'Hình ảnh', 'Khác'];

export default function CompanyProfile_2() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const fileInputRef = useRef();
  const multipleImagesRef = useRef();

  const [industries, setIndustries] = useState([]);

  // TAB 0: Thông tin cơ bản
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
  const [logoPreview, setLogoPreview] = useState(null);

  // TAB 1: Quy mô & Cơ cấu
  const [scale, setScale] = useState({
    description: '',
    num_employees: '',
    num_branches: '',
    avg_age: '',
    branch_info: '',
    female_ratio: 50,
  });

  // TAB 2: Danh sách hình ảnh công ty
  const [companyImages, setCompanyImages] = useState([]);

  // TAB 3: Khác (Văn hóa & Đãi ngộ)
  const [culture, setCulture] = useState({
    work_hours_per_day: '',
    work_days_per_week: '',
    dress_code: '',
    other_info: '',
  });

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
      const res = await fetch(`${API_URL}/api/company/${TEMP_HR_ID}`);
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

        setScale({
          description: data.description || '',
          num_employees: data.num_employees || '',
          num_branches: data.num_branches || '',
          avg_age: data.avg_age || '',
          branch_info: data.branch_info || '',
          female_ratio: data.female_ratio !== undefined ? data.female_ratio : 50,
        });

        if (data.images && Array.isArray(data.images)) {
          setCompanyImages(data.images);
        }

        setCulture({
          work_hours_per_day: data.work_hours_per_day || '',
          work_days_per_week: data.work_days_per_week || '',
          dress_code: data.dress_code || '',
          other_info: data.other_info || '',
        });

        setBenefits({
          social_insurance: !!data.social_insurance,
          health_insurance: !!data.health_insurance,
          other_benefits: data.other_benefits || '',
        });

        setIsEdit(true);
      }
    } catch (error) {
      console.error("Lỗi tải thông tin cấu hình:", error);
    }
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
      showToast('Hệ thống chỉ nhận file ảnh (JPG, PNG, GIF, WEBP)', 'error'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Kích thước ảnh quá lớn. Tối đa 5MB', 'error'); return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
      setForm(prev => ({ ...prev, logo_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleMultipleImagesChange = e => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (['image/jpeg', 'image/png'].includes(file.type) && file.size <= 5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCompanyImages(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      } else {
        showToast(`File ${file.name} sai định dạng JPG/PNG hoặc lớn hơn 5MB`, 'error');
      }
    });
  };

  const removeCompanyImage = index => {
    setCompanyImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { showToast('Vui lòng điền tên công ty', 'error'); return; }
    if (!form.industry_id) { showToast('Vui lòng chọn lĩnh vực hoạt động', 'error'); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        ...scale,
        ...culture,
        ...benefits,
        images: companyImages,
        hr_id: TEMP_HR_ID
      };

      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `${API_URL}/api/company/${TEMP_HR_ID}` : `${API_URL}/api/company`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        showToast(isEdit ? 'Cập nhật hồ sơ thành công!' : 'Tạo hồ sơ công ty thành công!', 'success');
        setIsEdit(true);
      } else {
        showToast(data.message || 'Lưu dữ liệu thất bại', 'error');
      }
    } catch {
      showToast('Không thể kết nối đến server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={`${styles.toast} ${toast.show ? styles.toastShow : ''} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
        {toast.type === 'success' ? '✅' : '❌'} {toast.message}
      </div>

      {/* Top Bar giữ nguyên làm tiêu đề trang lớn */}
      <div className={styles.topBar}>
        <div>
          <div className={styles.breadcrumb}>Bảng thông tin</div>
          <h1 className={styles.pageTitle}>Hồ sơ công ty</h1>
        </div>
        <button
          className={styles.btnPostJob}
          onClick={() => navigate('/company-profile/job-posting')}
        >
          Đăng tin tuyển dụng mới
        </button>
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarLabel}>QUẢN LÝ TIN TUYỂN DỤNG</div>
            <button className={styles.sidebarItem} onClick={() => navigate('/company-profile/job-posting')}><span>📄</span> Tạo việc làm mới <span className={styles.badge}>0</span></button>
            <button className={styles.sidebarItem}><span>📁</span> Danh sách việc làm <span className={styles.badge}>0</span></button>
          </div>
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarLabel}>QUẢN LÝ ỨNG VIÊN</div>
            <button
              className={styles.sidebarItem}
              onClick={() => navigate('/company-profile/job-posting')}
            >
              <span>👤</span> Ứng viên ứng tuyển <span className={styles.badge}>0</span>
            </button>

            <button className={styles.sidebarItem}><span>💾</span> Ứng viên đã lưu</button>
            <button className={styles.sidebarItem}><span>🔎</span> Tìm kiếm ứng viên</button>
          </div>
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarLabel}>HỒ SƠ</div>
            <button className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}><span>🏢</span> Hồ sơ công ty</button>
            <button className={styles.sidebarItem}><span>⚙️</span> Cài đặt tài khoản</button>
          </div>
        </aside>

        <main className={styles.main}>
          {/* Cụm dọn dẹp UX/UI: Gộp Tabs và Nút Xem việc làm thẳng hàng song song */}
          <div className={styles.tabsContainer}>
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
            <button
              type="button"
              className={styles.btnOutline}
              onClick={() => navigate('/company-profile/job-posting')}
            >
              Xem danh sách việc làm
            </button>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryTitle}>Thông tin công ty sơ bộ</div>
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

          {/* ── TAB 0: TỔNG QUAN ── */}
          {activeTab === 0 && (
            <div className={styles.tabContent}>
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
                      <p className={styles.logoHint}>Định dạng: <strong>JPG, PNG, GIF, WEBP</strong> · Tối đa <strong>5MB</strong></p>
                      <div className={styles.logoButtons}>
                        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                        <button type="button" className={styles.btnSecondary} onClick={() => fileInputRef.current.click()}>
                          📁 Chọn hình ảnh
                        </button>
                        {logoPreview && (
                          <button type="button" className={styles.btnDanger} onClick={() => { setLogoPreview(null); setForm(p => ({ ...p, logo_url: '' })); }}>
                            🗑 Gỡ ảnh
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>Thông tin cơ bản</div>
                <div className={styles.cardBody}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Tên công ty <span className={styles.req}>*</span></label>
                      <input className={styles.input} name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. ABC Company Ltd." />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Lĩnh vực hoạt động <span className={styles.req}>*</span></label>
                      <select className={styles.input} name="industry_id" value={form.industry_id} onChange={handleFormChange}>
                        <option value="">-- Chọn lĩnh vực --</option>
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
                      <label className={styles.label}>Số điện thoại</label>
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
                      <label className={styles.label}>Địa chỉ</label>
                      <textarea className={styles.textarea} name="address" value={form.address} onChange={handleFormChange} placeholder="Số nhà, tên đường, quận, thành phố..." rows={3} />
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>Mạng xã hội</div>
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

          {/* ── TAB 1: CƠ CẤU ── */}
          {activeTab === 1 && (
            <div className={styles.tabContent}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>Quy mô nhân sự</div>
                <div className={styles.cardBody}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroupFull}>
                      <label className={styles.label}>Mô tả chi tiết công ty</label>
                      <textarea className={styles.textarea} name="description" value={scale.description} onChange={handleScaleChange} placeholder="Mô tả văn hóa, tầm nhìn, sứ mệnh..." rows={4} />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Số lượng nhân viên</label>
                      <select className={styles.input} name="num_employees" value={scale.num_employees} onChange={handleScaleChange}>
                        <option value="">-- Chọn quy mô --</option>
                        {EMPLOYEE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Số lượng chi nhánh</label>
                      <select className={styles.input} name="num_branches" value={scale.num_branches} onChange={handleScaleChange}>
                        <option value="">-- Chọn số lượng --</option>
                        {BRANCH_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Độ tuổi trung bình</label>
                      <select className={styles.input} name="avg_age" value={scale.avg_age} onChange={handleScaleChange}>
                        <option value="">-- Chọn độ tuổi --</option>
                        {AGE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Tỷ lệ nhân viên Nữ (%)</label>
                      <div className={styles.sliderRow}>
                        <input type="range" min={0} max={100} name="female_ratio" value={scale.female_ratio} onChange={handleScaleChange} className={styles.slider} />
                        <span className={styles.sliderVal}>{scale.female_ratio}%</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroupFull}>
                      <label className={styles.label}>Vị trí các chi nhánh</label>
                      <textarea className={styles.textarea} name="branch_info" value={scale.branch_info} onChange={handleScaleChange} placeholder="Địa chỉ các văn phòng đại diện..." rows={3} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: HÌNH ẢNH ── */}
          {activeTab === 2 && (
            <div className={styles.tabContent}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>Hình ảnh công ty</div>
                <div className={styles.cardBody}>
                  <div className={styles.imageUploadArea} onClick={() => multipleImagesRef.current.click()} style={{ cursor: 'pointer' }}>
                    <div className={styles.imageUploadIcon}>🖼️</div>
                    <p className={styles.imageUploadText}>Kéo thả hình ảnh vào đây hoặc nhấp để chọn file</p>
                    <p className={styles.imageUploadHint}>Định dạng hỗ trợ: JPG, PNG · Tối đa 5MB mỗi ảnh</p>
                    <input
                      ref={multipleImagesRef}
                      type="file"
                      multiple
                      accept="image/png, image/jpeg"
                      style={{ display: 'none' }}
                      onChange={handleMultipleImagesChange}
                    />
                    <button type="button" className={styles.btnSecondary}>📁 Chọn hình ảnh</button>
                  </div>

                  {companyImages.length > 0 && (
                    <div className={styles.imageGrid}>
                      {companyImages.map((img, idx) => (
                        <div key={idx} className={styles.imageItem}>
                          <img src={img} alt={`Preview ${idx}`} />
                          <button type="button" className={styles.btnRemoveImg} onClick={(e) => { e.stopPropagation(); removeCompanyImage(idx); }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: KHÁC ── */}
          {activeTab === 3 && (
            <div className={styles.tabContent}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>Văn hóa công ty</div>
                <div className={styles.cardBody}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Thời gian làm việc</label>
                      <div className={styles.workHoursRow}>
                        <input className={styles.inputSmall} name="work_hours_per_day" type="number" value={culture.work_hours_per_day} onChange={handleCultureChange} placeholder="8" min={1} max={24} />
                        <span className={styles.workHoursUnit}>giờ/ngày</span>
                        <input className={styles.inputSmall} name="work_days_per_week" type="number" value={culture.work_days_per_week} onChange={handleCultureChange} placeholder="5" min={1} max={7} />
                        <span className={styles.workHoursUnit}>ngày/tuần</span>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Dress Code</label>
                      <input className={styles.input} name="dress_code" value={culture.dress_code} onChange={handleCultureChange} placeholder="e.g. Business casual" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroupFull}>
                      <label className={styles.label}>Thông tin văn hóa khác</label>
                      <textarea className={styles.textarea} name="other_info" value={culture.other_info} onChange={handleCultureChange} placeholder="Thông tin bổ sung..." rows={3} />
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>Chế độ & Phúc lợi</div>
                <div className={styles.cardBody}>
                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxItem}>
                      <input type="checkbox" name="social_insurance" checked={benefits.social_insurance} onChange={handleBenefitChange} />
                      <span>🛡️ Bảo hiểm xã hội</span>
                    </label>
                    <label className={styles.checkboxItem}>
                      <input type="checkbox" name="health_insurance" checked={benefits.health_insurance} onChange={handleBenefitChange} />
                      <span>🏥 Bảo hiểm sức khỏe cá nhân</span>
                    </label>
                  </div>
                  <div className={styles.formRow} style={{ marginTop: '16px' }}>
                    <div className={styles.formGroupFull}>
                      <label className={styles.label}>Phúc lợi khác</label>
                      <textarea className={styles.textarea} name="other_benefits" value={benefits.other_benefits} onChange={handleBenefitChange} placeholder="Lương tháng 13, du lịch, trợ cấp..." rows={3} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.formActions}>
            <button type="button" className={styles.btnCancel} onClick={fetchCompany} disabled={loading}>
              ✕ Hủy bỏ
            </button>
            <button type="button" className={styles.btnSave} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Đang lưu...' : '💾 Lưu thay đổi'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}