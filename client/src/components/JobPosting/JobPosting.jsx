import React, { useState, useMemo } from 'react';
import './JobPosting.css';
import JobSkillsManager from '../JobSkillsManager/JobSkillsManager';

const API_URL = 'http://localhost:5000';
const TEMP_HR_ID = 1; // Tạm thời dùng HR id cố định

const TEMPLATES = [
  { id: '', label: 'Chọn mẫu tin tuyển...' },
  { id: 'frontend', label: 'Frontend Developer' },
  { id: 'backend', label: 'Backend Developer' },
  { id: 'designer', label: 'UI/UX Designer' },
];

const TEMPLATE_CONTENT = {
  frontend: {
    description:
      'Thiết kế, xây dựng giao diện web, tối ưu trải nghiệm người dùng, phối hợp với team product và dev để hiện thực hóa yêu cầu.',
    requirements:
      '- Thành thạo React/Next.js\n- Hiểu biết HTML/CSS/JavaScript\n- Có kinh nghiệm làm việc với REST API\n- Ưu tiên có kiến thức về TypeScript',
    benefits:
      '- Lương cạnh tranh\n- Thưởng theo dự án\n- Chế độ BHXH/BHYT\n- Đào tạo nội bộ thường xuyên',
  },
  backend: {
    description:
      'Xây dựng API, tối ưu hệ thống backend, quản lý database và thực hiện tích hợp giữa các service khác nhau.',
    requirements:
      '- Thành thạo Node.js/Express hoặc Python/Django\n- Hiểu biết MySQL hoặc MongoDB\n- Có kinh nghiệm thiết kế API REST\n- Ưu tiên biết Docker và CI/CD',
    benefits:
      '- Môi trường chuyên nghiệp\n- Thưởng hiệu suất\n- Khám sức khỏe định kỳ\n- Team building hàng tháng',
  },
  designer: {
    description:
      'Thiết kế giao diện web/mobile, xây dựng hệ thống nhận diện thương hiệu và phối hợp với dev để đưa sản phẩm ra mắt.',
    requirements:
      '- Có kinh nghiệm Figma/Adobe XD\n- Hiểu UX/UI cơ bản\n- Có portfolio thiết kế\n- Ưu tiên biết HTML/CSS cơ bản',
    benefits:
      '- Lương theo năng lực\n- Chế độ nghỉ lễ đầy đủ\n- Môi trường sáng tạo\n- Cơ hội thăng tiến',
  },
};

const JOB_OPTIONS = ['Chọn việc làm', 'Frontend Developer', 'Backend Developer', 'UI/UX Designer'];
const LANGUAGE_OPTIONS = ['Chọn ngôn ngữ', 'Tiếng Việt', 'Tiếng Anh', 'Tiếng Nhật'];
const DEGREE_OPTIONS = ['Chọn bằng cấp', 'Cao đẳng', 'Đại học', 'Thạc sĩ'];
const STATUS_TABS = [
  { id: 'all', label: 'Tất cả', count: 0 },
  { id: 'unread', label: 'Chưa xem', count: 0 },
  { id: 'shortlist', label: 'Hồ sơ phù hợp', count: 0 },
  { id: 'contacted', label: 'Liên hệ ứng viên', count: 0 },
  { id: 'interview', label: 'Mời phỏng vấn', count: 0 },
  { id: 'offer', label: 'Gửi offer', count: 0 },
  { id: 'hired', label: 'Hired successfully', count: 0 },
  { id: 'rejected', label: 'Từ chối', count: 0 },
];

const APPLICANTS_DATA = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@example.com',
    phone: '0909123456',
    school: 'Đại học Bách Khoa',
    major: 'Công nghệ thông tin',
    jobTitle: 'Frontend Developer',
    status: 'unread',
    language: 'Tiếng Anh',
    degree: 'Đại học',
    label: 'React, UI',
    appliedAt: '2026-05-28',
    location: 'Hồ Chí Minh',
    experience: '3 năm',
  },
  {
    id: 2,
    name: 'Trần Thị Bình',
    email: 'binh.tran@example.com',
    phone: '0912345678',
    school: 'Đại học Kinh tế Quốc dân',
    major: 'Quản trị kinh doanh',
    jobTitle: 'Backend Developer',
    status: 'shortlist',
    language: 'Tiếng Việt',
    degree: 'Đại học',
    label: 'Node.js, REST API',
    appliedAt: '2026-05-27',
    location: 'Hà Nội',
    experience: '4 năm',
  },
  {
    id: 3,
    name: 'Lê Thị Hoa',
    email: 'hoa.le@example.com',
    phone: '0987654321',
    school: 'Đại học FPT',
    major: 'Thiết kế đồ họa',
    jobTitle: 'UI/UX Designer',
    status: 'contacted',
    language: 'Tiếng Anh',
    degree: 'Cao đẳng',
    label: 'Figma, Adobe XD',
    appliedAt: '2026-05-26',
    location: 'Đà Nẵng',
    experience: '2 năm',
  },
  {
    id: 4,
    name: 'Phạm Minh Tuấn',
    email: 'tuan.pham@example.com',
    phone: '0909876543',
    school: 'Đại học Công nghệ',
    major: 'Khoa học máy tính',
    jobTitle: 'Frontend Developer',
    status: 'interview',
    language: 'Tiếng Việt',
    degree: 'Đại học',
    label: 'React, Vue',
    appliedAt: '2026-05-25',
    location: 'Hải Phòng',
    experience: '5 năm',
  },
  {
    id: 5,
    name: 'Vũ Ngọc Lan',
    email: 'lan.vu@example.com',
    phone: '0911223344',
    school: 'Đại học Ngoại thương',
    major: 'Kinh tế',
    jobTitle: 'Backend Developer',
    status: 'offer',
    language: 'Tiếng Anh',
    degree: 'Đại học',
    label: 'Java, Spring',
    appliedAt: '2026-05-24',
    location: 'Hà Nội',
    experience: '3 năm',
  },
  {
    id: 6,
    name: 'Bùi Thanh Sơn',
    email: 'son.bui@example.com',
    phone: '0933456789',
    school: 'Đại học FPT',
    major: 'Công nghệ thông tin',
    jobTitle: 'UI/UX Designer',
    status: 'hired',
    language: 'Tiếng Anh',
    degree: 'Đại học',
    label: 'Sketch, InVision',
    appliedAt: '2026-05-23',
    location: 'Cần Thơ',
    experience: '4 năm',
  },
  {
    id: 7,
    name: 'Đinh Thị Mai',
    email: 'mai.dinh@example.com',
    phone: '0945566778',
    school: 'Đại học Văn Lang',
    major: 'Thiết kế',
    jobTitle: 'UI/UX Designer',
    status: 'rejected',
    language: 'Tiếng Việt',
    degree: 'Cao đẳng',
    label: 'Figma, UX research',
    appliedAt: '2026-05-22',
    location: 'Biên Hòa',
    experience: '1 năm',
  },
];

const parseDate = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const STATUS_LABELS = {
  unread: 'Chưa xem',
  shortlist: 'Hồ sơ phù hợp',
  contacted: 'Đã liên hệ',
  interview: 'Mời phỏng vấn',
  offer: 'Gửi offer',
  hired: 'Hired successfully',
  rejected: 'Từ chối',
};

const normalizeText = (text) =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLowerCase();

const isInDateRange = (appliedAt, range) => {
  if (!range) return true;
  const parts = range.split('-').map((part) => part.trim());
  if (parts.length !== 2) return true;
  const [fromPart, toPart] = parts;
  const parseDMY = (value) => {
    const [day, month, year] = value.split('/').map(Number);
    return new Date(year, month - 1, day);
  };
  try {
    const fromDate = parseDMY(fromPart);
    const toDate = parseDMY(toPart);
    const target = parseDate(appliedAt);
    return target >= fromDate && target <= toDate;
  } catch {
    return true;
  }
};


const todayStr = () => new Date().toISOString().split('T')[0];

export default function JobPosting() {
  const [activeSection, setActiveSection] = useState('applicants');
  const [form, setForm] = useState({
    title: '',
    template: '',
    description: '',
    requirements: '',
    benefits: '',
    email: '',
    salary_min: '',
    salary_max: '',
    job_type: 'Full-time',
    deadline: '',
  });
  const [filters, setFilters] = useState({
    search: '',
    job: '',
    date: '',
    language: '',
    degree: '',
    label: '',
  });
  const [activeStatus, setActiveStatus] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [postedJobId, setPostedJobId] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const openApplicantProfile = (applicant) => setSelectedApplicant(applicant);
  const closeApplicantProfile = () => setSelectedApplicant(null);

  const filteredApplicants = useMemo(() => {
    return APPLICANTS_DATA.filter((applicant) => {
      if (activeStatus !== 'all' && applicant.status !== activeStatus) return false;
      if (filters.job && applicant.jobTitle !== filters.job) return false;
      if (filters.language && applicant.language !== filters.language) return false;
      if (filters.degree && applicant.degree !== filters.degree) return false;
      if (filters.label && !applicant.label.toLowerCase().includes(filters.label.toLowerCase())) return false;
      if (filters.search) {
        const query = normalizeText(filters.search);
        const haystack = normalizeText([
          applicant.name,
          applicant.email,
          applicant.phone,
          applicant.school,
          applicant.major,
          applicant.jobTitle,
          applicant.label,
        ]
          .join(' '));
        if (!haystack.includes(query)) return false;
      }
      if (!isInDateRange(applicant.appliedAt, filters.date)) return false;
      return true;
    });
  }, [filters, activeStatus]);

  const statusTabsWithCounts = useMemo(() => {
    return STATUS_TABS.map((tab) => {
      if (tab.id === 'all') {
        return { ...tab, count: APPLICANTS_DATA.length };
      }
      return { ...tab, count: APPLICANTS_DATA.filter((applicant) => applicant.status === tab.id).length };
    });
  }, []);

  const setTemplate = (templateId) => {
    const preset = TEMPLATE_CONTENT[templateId];
    setForm((prev) => ({
      ...prev,
      template: templateId,
      description: preset ? preset.description : prev.description,
      requirements: preset ? preset.requirements : prev.requirements,
      benefits: preset ? preset.benefits : prev.benefits,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ search: '', job: '', date: '', language: '', degree: '', label: '' });
    setActiveStatus('all');
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      showToast('Tiêu đề công việc là bắt buộc', 'error');
      return;
    }
    if (!form.description.trim()) {
      showToast('Mô tả công việc không được để trống', 'error');
      return;
    }
    if (!form.requirements.trim()) {
      showToast('Yêu cầu công việc không được để trống', 'error');
      return;
    }

    if (form.salary_min && form.salary_max && parseInt(form.salary_min) > parseInt(form.salary_max)) {
      showToast('Mức lương tối thiểu không được lớn hơn tối đa', 'error');
      return;
    }

    if (form.deadline && form.deadline < todayStr()) {
      showToast('Hạn nộp hồ sơ phải là hôm nay hoặc sau này', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        requirements: form.requirements,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
        job_type: form.job_type,
        deadline: form.deadline || null,
        hr_id: TEMP_HR_ID,
      };

      const res = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        showToast('Job posted successfully', 'success');
        setPostedJobId(data.jobId);
      } else {
        showToast(data.message || 'Job posting failed', 'error');
      }
    } catch {
      showToast('Không kết nối được tới server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      title: '',
      template: '',
      description: '',
      requirements: '',
      benefits: '',
      email: '',
      salary_min: '',
      salary_max: '',
      job_type: 'Full-time',
      deadline: '',
    });
    setPostedJobId(null);
  };

  return (
    <div className="job-posting-page">
      {/* Toast Notification */}
      <div className={`jp-toast ${toast.show ? 'show' : ''} ${toast.type}`}>
        {toast.message}
      </div>

      <div className="job-posting-shell">
        <aside className="jp-sidebar">
          <div className="jp-sidebar-brand">JobsMarket</div>
          <div className="jp-sidebar-section-title">
            <span className="jp-sidebar-icon">☰</span>
            Bảng thông tin
          </div>
          <div className="jp-menu-group">
            <div className="jp-menu-title">QUẢN LÝ TIN TUYỂN DỤNG</div>
            <button className="jp-menu-item">Danh sách việc làm <span>0</span></button>
            <button
              className={`jp-menu-item ${activeSection === 'post' ? 'active' : ''}`}
              onClick={() => setActiveSection('post')}
            >
              Tạo việc làm mới
            </button>
          </div>
          <div className="jp-menu-group">
            <div className="jp-menu-title">QUẢN LÝ ỨNG VIÊN</div>
            <button
              className={`jp-menu-item ${activeSection === 'applicants' ? 'active' : ''}`}
              onClick={() => setActiveSection('applicants')}
            >
              Ứng viên ứng tuyển <span>{APPLICANTS_DATA.length}</span>
            </button>
            <button className="jp-menu-item">Ứng viên đã lưu <span>0</span></button>
            <button className="jp-menu-item">Ứng viên đã mở contact</button>
            <button className="jp-menu-item">Ứng viên hỗ trợ <span>0</span></button>
            <button className="jp-menu-item">Ứng viên yêu cầu kết nối</button>
            <button className="jp-menu-item">Tìm kiếm ứng viên</button>
          </div>
          <div className="jp-promo-card">
            <div className="jp-promo-title">TÍNH NĂNG MỚI</div>
            <div className="jp-promo-action">Kết nối Zalo với ứng viên</div>
          </div>
        </aside>

        <main className="jp-content">
          <div className="jp-header-row">
            <div>
              <div className="jp-breadcrumb">
                Bảng thông tin / {activeSection === 'applicants' ? 'Ứng viên ứng tuyển' : 'Đăng tuyển việc làm mới'}
              </div>
              <h2 className="jp-page-heading">
                {activeSection === 'applicants' ? 'Ứng viên ứng tuyển' : 'Đăng tuyển việc làm mới'}
              </h2>
            </div>
            <button className="jp-post-button">Đăng tin tuyển dụng mới</button>
          </div>

          {activeSection === 'applicants' ? (
            <>
              <div className="jp-card jp-filter-card">
                <div className="jp-card-body jp-filter-grid">
                  <div className="jp-filter-item jp-filter-full">
                    <label>Tìm kiếm theo từ khóa</label>
                    <input
                      type="text"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Tên ứng viên, email, SDT, trường học, chuyên ngành, vị trí từng làm..."
                    />
                  </div>
                  <div className="jp-filter-item">
                    <label>Currently hiring</label>
                    <select name="job" value={filters.job} onChange={handleFilterChange}>
                      {JOB_OPTIONS.map((option) => (
                        <option key={option} value={option === 'Chọn việc làm' ? '' : option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="jp-filter-item">
                    <label>Ngày ứng tuyển</label>
                    <input
                      type="text"
                      name="date"
                      value={filters.date}
                      onChange={handleFilterChange}
                      placeholder="01/06/2025 - 01/06/2026"
                    />
                  </div>
                  <div className="jp-filter-item">
                    <label>Ngôn ngữ</label>
                    <select name="language" value={filters.language} onChange={handleFilterChange}>
                      {LANGUAGE_OPTIONS.map((option) => (
                        <option key={option} value={option === 'Chọn ngôn ngữ' ? '' : option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="jp-filter-item">
                    <label>Bằng cấp</label>
                    <select name="degree" value={filters.degree} onChange={handleFilterChange}>
                      {DEGREE_OPTIONS.map((option) => (
                        <option key={option} value={option === 'Chọn bằng cấp' ? '' : option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="jp-filter-item jp-filter-full">
                    <label>Nhãn của ứng viên</label>
                    <input
                      type="text"
                      name="label"
                      value={filters.label}
                      onChange={handleFilterChange}
                      placeholder="Chọn nhãn ứng viên"
                    />
                  </div>
                  <div className="jp-filter-footer">
                    <button type="button" className="jp-btn jp-btn-outline" onClick={resetFilters}>
                      Xóa bộ lọc
                    </button>
                  </div>
                </div>
              </div>

              <div className="jp-card jp-status-card">
                <div className="jp-status-tabs">
                  {statusTabsWithCounts.map((tab) => (
                    <button
                      key={tab.id}
                      className={`jp-status-tab ${activeStatus === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveStatus(tab.id)}
                    >
                      {tab.label} <span>{tab.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="jp-table-bar">
                <div />
                <div className="jp-export-actions">
                  <button className="jp-btn jp-btn-outline">Xuất Excel</button>
                  <button className="jp-btn jp-btn-primary">Tải toàn bộ</button>
                </div>
              </div>

              <div className="jp-card jp-table-card">
                <div className="jp-table-wrapper">
                  <table className="jp-data-table">
                    <thead>
                      <tr>
                        <th>ỨNG VIÊN</th>
                        <th>VIỆC LÀM ỨNG TUYỂN</th>
                        <th>TRẠNG THÁI</th>
                        <th>NGÀY ỨNG TUYỂN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplicants.length > 0 ? (
                        filteredApplicants.map((applicant) => (
                          <tr
                          key={applicant.id}
                          className="jp-data-row"
                          role="button"
                          tabIndex={0}
                          onClick={() => openApplicantProfile(applicant)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') openApplicantProfile(applicant);
                          }}
                        >
                            <td>
                              <div className="jp-applicant-name">{applicant.name}</div>
                              <div className="jp-applicant-meta">
                                {applicant.major} · {applicant.location} · {applicant.experience}
                              </div>
                            </td>
                            <td>
                              <div>{applicant.jobTitle}</div>
                              <div className="jp-applicant-meta">{applicant.label}</div>
                            </td>
                            <td>
                              <span className={`jp-status-badge jp-status-${applicant.status}`}>{STATUS_LABELS[applicant.status] || 'Không rõ'}</span>
                            </td>
                            <td>{new Date(applicant.appliedAt).toLocaleDateString('vi-VN')}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="jp-table-empty-cell">
                            Không tìm thấy kết quả nào.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {selectedApplicant && (
                  <div className="jp-modal-overlay" onClick={closeApplicantProfile}>
                    <div className="jp-modal" onClick={(e) => e.stopPropagation()}>
                      <div className="jp-modal-header">
                        <div>
                          <div className="jp-modal-title">{selectedApplicant.name}</div>
                          <div className="jp-modal-subtitle">
                            {selectedApplicant.jobTitle} · {selectedApplicant.location}
                          </div>
                        </div>
                        <button className="jp-close-btn" onClick={closeApplicantProfile} aria-label="Close profile modal">×</button>
                      </div>
                      <div className="jp-modal-body">
                        <div className="jp-modal-grid">
                          <div className="jp-modal-section">
                            <h3>Thông tin liên hệ</h3>
                            <p><strong>Email:</strong> {selectedApplicant.email}</p>
                            <p><strong>Điện thoại:</strong> {selectedApplicant.phone}</p>
                            <p><strong>Trường:</strong> {selectedApplicant.school}</p>
                            <p><strong>Chuyên ngành:</strong> {selectedApplicant.major}</p>
                            <p><strong>Bằng cấp:</strong> {selectedApplicant.degree}</p>
                          </div>
                          <div className="jp-modal-section">
                            <h3>Hồ sơ ứng tuyển</h3>
                            <p><strong>Vị trí ứng tuyển:</strong> {selectedApplicant.jobTitle}</p>
                            <p><strong>Nhận diện kỹ năng:</strong> {selectedApplicant.label}</p>
                            <p><strong>Ngôn ngữ:</strong> {selectedApplicant.language}</p>
                            <p><strong>Kinh nghiệm:</strong> {selectedApplicant.experience}</p>
                            <p><strong>Trạng thái:</strong> {STATUS_LABELS[selectedApplicant.status] || selectedApplicant.status}</p>
                            <p><strong>Ngày nộp:</strong> {new Date(selectedApplicant.appliedAt).toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>
                        <div className="jp-modal-section jp-modal-notes">
                          <h3>Ghi chú</h3>
                          <p>
                            Mở rộng profile thực tế bằng cách tích hợp dữ liệu Candidate Profile từ hệ thống. Hiện tại đây là dữ liệu mẫu để mô phỏng luồng xem hồ sơ ứng viên.
                          </p>
                        </div>
                        <div className="jp-modal-actions">
                          <button className="jp-btn jp-btn-primary" onClick={closeApplicantProfile}>Đóng</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="jp-pagination">{filteredApplicants.length} ứng viên</div>
              </div>
            </>
          ) : (
            <>
              <div className="jp-stepper">
                <div className="jp-step active">
                  <div className="jp-step-number">1</div>
                  <div className="jp-step-text">Thông tin cơ bản</div>
                </div>
                <div className="jp-step">
                  <div className="jp-step-number">2</div>
                  <div className="jp-step-text">Thông tin chi tiết</div>
                </div>
                <div className="jp-step">
                  <div className="jp-step-number">3</div>
                  <div className="jp-step-text">Thông tin kích hoạt</div>
                </div>
              </div>

              <div className="jp-grid">
                {postedJobId ? (
                  <section className="jp-form-panel">
                    <div className="jp-card jp-card-fit">
                      <div className="jp-card-title">🎉 Đăng tin thành công!</div>
                      <div className="jp-card-body">
                        Tin tuyển dụng của bạn đã được đăng. Hãy thêm các kỹ năng yêu cầu (Job Skills) để ứng viên có thể dễ dàng tìm kiếm.
                      </div>
                    </div>
                    <JobSkillsManager jobId={postedJobId} />
                    <div className="jp-actions" style={{ marginTop: '20px' }}>
                      <button 
                        type="button" 
                        className="jp-btn jp-btn-outline" 
                        onClick={() => {
                          setPostedJobId(null);
                          handleReset();
                        }}
                      >
                        Đăng tin khác
                      </button>
                      <button 
                        type="button" 
                        className="jp-btn jp-btn-primary" 
                        onClick={() => window.location.href = '/company-profile'}
                      >
                        Hoàn tất & Về Profile
                      </button>
                    </div>
                  </section>
                ) : (
                  <section className="jp-form-panel">
                    <div className="jp-card">
                    <div className="jp-card-title">Thông tin cơ bản</div>
                    <div className="jp-card-body">
                      <div className="jp-field">
                        <label>Tiêu đề công việc <span>*</span></label>
                        <input
                          type="text"
                          name="title"
                          value={form.title}
                          onChange={handleChange}
                          placeholder="Nhập tiêu đề công việc"
                        />
                      </div>

                      <div className="jp-field">
                        <label>Chọn từ mẫu có sẵn</label>
                        <select
                          name="template"
                          value={form.template}
                          onChange={(e) => setTemplate(e.target.value)}
                        >
                          {TEMPLATES.map((item) => (
                            <option key={item.id} value={item.id}>{item.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="jp-field">
                        <label>Mô tả công việc <span>*</span></label>
                        <textarea
                          name="description"
                          rows="6"
                          value={form.description}
                          onChange={handleChange}
                          placeholder="Mô tả nhiệm vụ, phạm vi công việc"
                        />
                      </div>

                      <div className="jp-field">
                        <label>Yêu cầu công việc <span>*</span></label>
                        <textarea
                          name="requirements"
                          rows="6"
                          value={form.requirements}
                          onChange={handleChange}
                          placeholder="Liệt kê kỹ năng và kinh nghiệm cần thiết"
                        />
                      </div>

                      <div className="jp-field">
                        <label>Quyền lợi được hưởng</label>
                        <textarea
                          name="benefits"
                          rows="4"
                          value={form.benefits}
                          onChange={handleChange}
                          placeholder="Mô tả phúc lợi, chế độ đãi ngộ"
                        />
                      </div>

                      <div className="jp-field">
                        <label>Email nhận CV ứng viên</label>
                        <input
                          type="text"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="ví dụ: hr@company.com"
                        />
                      </div>

                      <div className="jp-row jp-row-two">
                        <div className="jp-field">
                          <label>Mức lương tối thiểu</label>
                          <input
                            type="number"
                            name="salary_min"
                            value={form.salary_min}
                            onChange={handleChange}
                            placeholder="0"
                          />
                        </div>
                        <div className="jp-field">
                          <label>Mức lương tối đa</label>
                          <input
                            type="number"
                            name="salary_max"
                            value={form.salary_max}
                            onChange={handleChange}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="jp-row jp-row-two">
                        <div className="jp-field">
                          <label>Hình thức làm việc</label>
                          <select name="job_type" value={form.job_type} onChange={handleChange}>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Freelance">Freelance</option>
                          </select>
                        </div>
                        <div className="jp-field">
                          <label>Hạn nộp hồ sơ</label>
                          <input
                            type="date"
                            name="deadline"
                            value={form.deadline}
                            onChange={handleChange}
                            min={todayStr()}
                          />
                        </div>
                      </div>

                      <div className="jp-actions">
                        <button type="button" className="jp-btn jp-btn-cancel" onClick={handleReset}>
                          Hủy bỏ
                        </button>
                        <button type="button" className="jp-btn jp-btn-primary" onClick={handleSubmit} disabled={loading}>
                          {loading ? 'Posting...' : 'Post Job'}
                        </button>
                      </div>
                      </div>
                    </div>
                  </section>
                )}

                <aside className="jp-guide-panel">
                  <div className="jp-guide-card">
                    <div className="jp-guide-title">Hướng dẫn</div>
                    <ul>
                      <li>Mô tả nhiệm vụ chính, yêu cầu kỹ năng, kinh nghiệm và địa điểm làm việc.</li>
                      <li>Không nên dùng icon, biểu tượng, chỉ văn bản rõ ràng.</li>
                      <li>Phần yêu cầu cần ít nhất 3 thông tin cụ thể.</li>
                      <li>Quyền lợi nên ghi rõ: lương, thưởng, đãi ngộ.</li>
                    </ul>
                  </div>
                  <div className="jp-guide-card jp-hint-card">
                    <div className="jp-guide-title">Gợi ý JD</div>
                    <p>Nếu có mẫu tin tuyển trước đó, chọn mẫu để tự động điền nội dung.</p>
                    <p>Em sẽ tiếp tục mở rộng thành các bước chi tiết giống JobsGO nếu cần.</p>
                  </div>
                </aside>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

