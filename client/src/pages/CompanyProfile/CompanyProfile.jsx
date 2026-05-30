import { useState, useEffect, useRef } from 'react';
import './CompanyProfile.css';

const API_URL = 'http://localhost:5000';

// hr_id tạm thời — sau này sẽ lấy từ context/auth
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
  const [isEdit, setIsEdit] = useState(false); // true nếu đã có dữ liệu công ty
  const fileInputRef = useRef();

  // Load danh sách ngành nghề + dữ liệu công ty nếu có
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
      // Nếu chưa có dữ liệu ngành nghề thì dùng danh sách mặc định
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
    } catch {
      // Chưa có dữ liệu → form trống
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Xử lý upload logo (preview ngay, gửi base64 hoặc URL)
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
    e.preventDefault();

    if (!form.name.trim()) {
      showToast('Vui lòng nhập tên công ty', 'error');
      return;
    }
    if (!form.industry_id) {
      showToast('Vui lòng chọn ngành nghề', 'error');
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
        showToast(isEdit ? 'Cập nhật thành công!' : 'Tạo hồ sơ công ty thành công!', 'success');
        setIsEdit(true);
      } else {
        showToast(data.message || 'Có lỗi xảy ra', 'error');
      }
    } catch {
      showToast('Không thể kết nối server. Vui lòng thử lại.', 'error');
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

      {/* Tiêu đề */}
      <h1 className="cv-page-title">
        {isEdit ? 'Cập nhật thông tin công ty' : 'Tạo hồ sơ công ty'}
      </h1>

      <form onSubmit={handleSubmit}>
        {/* Card: Logo công ty */}
        <div className="cv-card" style={{ marginBottom: '24px' }}>
          <div className="cv-card-header">Logo công ty</div>
          <div className="cv-card-body">
            <div className="cv-logo-upload">
              {/* Preview logo */}
              <div className="cv-logo-preview">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo công ty" />
                ) : (
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                )}
              </div>

              {/* Nút upload */}
              <div className="cv-logo-info">
                <p>
                  Tải lên logo công ty của bạn. Logo sẽ hiển thị trên trang tuyển dụng
                  và hồ sơ công ty.
                  <br />
                  Định dạng hỗ trợ: <strong>JPG, PNG, GIF, WEBP</strong>. Dung lượng tối đa:{' '}
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
                    📁 Chọn ảnh
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
                      🗑 Xóa ảnh
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card: Thông tin cơ bản */}
        <div className="cv-card" style={{ marginBottom: '24px' }}>
          <div className="cv-card-header">Thông tin công ty</div>
          <div className="cv-card-body">
            {/* Tên công ty + Ngành nghề */}
            <div className="cv-form-row">
              <div className="cv-form-group half">
                <label htmlFor="name" className="cv-label">
                  Tên công ty <span className="required">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="cv-input"
                  placeholder="Ví dụ: Công ty TNHH ABC"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="cv-form-group half">
                <label htmlFor="industry_id" className="cv-label">
                  Ngành nghề <span className="required">*</span>
                </label>
                <select
                  id="industry_id"
                  name="industry_id"
                  className="cv-input"
                  value={form.industry_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Chọn ngành nghề --</option>
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
                  Website công ty
                </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  className="cv-input"
                  placeholder="https://www.congtyabc.com"
                  value={form.website}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="cv-form-row">
              <div className="cv-form-group">
                <label htmlFor="address" className="cv-label">
                  Địa chỉ công ty
                </label>
                <textarea
                  id="address"
                  name="address"
                  className="cv-textarea"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  value={form.address}
                  onChange={handleChange}
                  style={{ minHeight: '100px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="cv-form-actions">
          <button
            type="button"
            className="cv-btn cv-btn-secondary"
            onClick={handleReset}
            disabled={loading}
          >
            Đặt lại
          </button>
          <button
            type="submit"
            className="cv-btn cv-btn-primary"
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : isEdit ? '💾 Cập nhật' : '✅ Tạo hồ sơ'}
          </button>
        </div>
      </form>
    </div>
  );
}
