import { useState, useEffect, useRef } from 'react';
import './CompanyProfile.css';
import HRPostJob from '../HR/HRPostJob';

const API_URL = 'http://localhost:5000';
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
  const [isEdit, setIsEdit] = useState(false);
  const [showPostJob, setShowPostJob] = useState(false);
  const fileInputRef = useRef();

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
      setIndustries([
        { id: 1, name: 'Công nghệ thông tin' },
        { id: 2, name: 'Tài chính - Ngân hàng' },
        { id: 3, name: 'Giáo dục' },
        { id: 4, name: 'Y tế - Dược phẩm' },
        { id: 5, name: 'Bán lẻ - Thương mại' },
        { id: 6, name: 'Sản xuất' },
        { id: 7, name: 'Marketing - Truyền thông' },
        { id: 8, name: 'Xây dựng - Bất động sản' },
        { id: 9, name: 'Du lịch - Khách sạn' },
        { id: 10, name: 'Khác' },
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
    } catch {}
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File quá lớn. Vui lòng chọn file dưới 5MB', 'error');
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
    if (e) e.preventDefault();
    if (!form.name.trim() || !form.industry_id) {
      showToast('Vui lòng điền đầy đủ các trường bắt buộc', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(isEdit ? `${API_URL}/api/company/${TEMP_HR_ID}` : `${API_URL}/api/company`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, hr_id: TEMP_HR_ID }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(isEdit ? 'Cập nhật thành công!' : 'Tạo hồ sơ thành công!', 'success');
        setIsEdit(true);
      } else {
        showToast(data.message || 'Có lỗi xảy ra', 'error');
      }
    } catch {
      showToast('Không thể kết nối server.', 'error');
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
      <div className={`cv-toast ${toast.show ? 'show' : ''}`} style={{ backgroundColor: toast.type === 'error' ? '#e53e3e' : '#4CAF50' }}>
        {toast.message}
      </div>

      <h1 className="cv-page-title">{isEdit ? 'Cập nhật thông tin công ty' : 'Tạo hồ sơ công ty'}</h1>

      <div>
        <div className="cv-card" style={{ marginBottom: '24px' }}>
          <div className="cv-card-header">Logo công ty</div>
          <div className="cv-card-body">
            <div className="cv-logo-upload">
              <div className="cv-logo-preview">
                {logoPreview ? <img src={logoPreview} alt="Logo" /> : <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>}
              </div>
              <div className="cv-logo-info">
                <p>Tải lên logo công ty của bạn. Dung lượng tối đa: <strong>5MB</strong>.</p>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                <button type="button" className="cv-btn cv-btn-secondary" onClick={() => fileInputRef.current.click()}>📁 Chọn ảnh</button>
                {logoPreview && <button type="button" className="cv-btn cv-btn-secondary" onClick={() => { setLogoPreview(null); setForm(prev => ({...prev, logo_url: ''})); }}>🗑 Xóa ảnh</button>}
              </div>
            </div>
          </div>
        </div>

        <div className="cv-card" style={{ marginBottom: '24px' }}>
          <div className="cv-card-header">Thông tin công ty</div>
          <div className="cv-card-body">
            <div className="cv-form-row">
              <div className="cv-form-group half">
                <label className="cv-label">Tên công ty <span className="required">*</span></label>
                <input name="name" className="cv-input" value={form.name} onChange={handleChange} required />
              </div>
              <div className="cv-form-group half">
                <label className="cv-label">Ngành nghề <span className="required">*</span></label>
                <select name="industry_id" className="cv-input" value={form.industry_id} onChange={handleChange} required>
                  <option value="">-- Chọn ngành nghề --</option>
                  {industries.map(ind => <option key={ind.id} value={ind.id}>{ind.name}</option>)}
                </select>
              </div>
            </div>
            <div className="cv-form-row">
              <div className="cv-form-group">
                <label className="cv-label">Website</label>
                <input name="website" type="url" className="cv-input" value={form.website} onChange={handleChange} />
              </div>
            </div>
            <div className="cv-form-row">
              <div className="cv-form-group">
                <label className="cv-label">Địa chỉ</label>
                <textarea name="address" className="cv-textarea" value={form.address} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="cv-card" style={{ marginBottom: '24px', border: '1px dashed #38bdf8' }}>
          <div className="cv-card-header">Quản lý tuyển dụng</div>
          <div className="cv-card-body" style={{ textAlign: 'center', padding: '20px' }}>
            <button type="button" className="cv-btn cv-btn-primary" onClick={() => setShowPostJob(!showPostJob)}>
              {showPostJob ? 'Đóng form đăng tin' : '➕ Đăng tin tuyển dụng mới'}
            </button>
          </div>
        </div>

        {showPostJob && (
          <div className="cv-card" style={{ marginBottom: '24px' }}>
            <div className="cv-card-header">Đăng tin tuyển dụng</div>
            <div className="cv-card-body"><HRPostJob /></div>
          </div>
        )}

        <div className="cv-form-actions">
          <button type="button" className="cv-btn cv-btn-secondary" onClick={handleReset}>Đặt lại</button>
         <button
  type="button"
  className="cv-btn cv-btn-primary"
  disabled={loading}
  onClick={handleSubmit}
>{loading ? 'Đang lưu...' : isEdit ? '💾 Cập nhật' : '✅ Tạo hồ sơ'}</button>
        </div>
      </div>
    </div>
  );
}