import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './JobDetail.css';

const API_URL = 'http://localhost:5000';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal CV state
  const [showModal, setShowModal] = useState(false);
  const [myCVs, setMyCVs] = useState([]);
  const [selectedCVId, setSelectedCVId] = useState(null);
  const [applying, setApplying] = useState(false);
  
  // Toast
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3000);
  };

  useEffect(() => {
    fetchJobDetail();
    // Simulate fetching CVs of the logged-in candidate
    fetchCandidateCVs();
  }, [id]);

  const fetchJobDetail = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/jobs/${id}`);
      setJob(res.data);
    } catch (err) {
      showToast('Không thể tải thông tin công việc', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidateCVs = async () => {
    // In a real app, you would fetch CVs for the logged in user via token
    // For now we mock it to simulate TopCV/JobsGo UX
    const mockCVs = [
      { id: 1, name: 'CV_Frontend_Dev.pdf', updatedAt: '2026-06-01' },
      { id: 2, name: 'CV_English_Version.pdf', updatedAt: '2026-05-20' }
    ];
    setMyCVs(mockCVs);
  };

  const handleApplyClick = () => {
    // Ideally check if user is logged in here
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      showToast('Vui lòng đăng nhập để ứng tuyển', 'error');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    setShowModal(true);
  };

  const submitApplication = async () => {
    if (!selectedCVId) {
      showToast('Vui lòng chọn CV', 'error');
      return;
    }
    setApplying(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.post(`${API_URL}/api/applications`, {
        user_id: user.id,
        job_id: id,
        cv_id: selectedCVId
      });
      showToast('Nộp đơn thành công! Nhà tuyển dụng sẽ sớm liên hệ', 'success');
      setShowModal(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Có lỗi xảy ra khi nộp đơn', 'error');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Đang tải...</div>;
  if (!job) return <div style={{ padding: '50px', textAlign: 'center' }}>Không tìm thấy công việc</div>;

  return (
    <div className="job-detail-container">
      {/* Toast Notification */}
      <div className={`jd-toast ${toast.show ? 'show' : ''} ${toast.type}`}>
        {toast.msg}
      </div>

      <div className="job-header-card">
        <div className="job-header-info">
          <h1>{job.title}</h1>
          <div className="company-name">{job.company_name}</div>
          <div className="job-meta">
            <div className="job-meta-item">
              <span>💰</span> {job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max} VNĐ` : 'Thỏa thuận'}
            </div>
            <div className="job-meta-item">
              <span>📍</span> Hồ Chí Minh
            </div>
            <div className="job-meta-item">
              <span>⏳</span> Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>
        <button className="apply-btn" onClick={handleApplyClick}>
          Ứng tuyển ngay
        </button>
      </div>

      <div className="job-content-grid">
        <div className="job-main-col">
          <div className="job-section">
            <h2>Mô tả công việc</h2>
            <p>{job.description}</p>
          </div>
          <div className="job-section">
            <h2>Yêu cầu ứng viên</h2>
            <p>{job.requirements}</p>
          </div>
        </div>

        <div className="job-side-col">
          <div className="company-card">
            {job.logo_url ? (
              <img src={job.logo_url} alt="Company Logo" className="company-logo" />
            ) : (
              <div className="company-logo" style={{ background: '#e2e8f0', display: 'inline-block' }}></div>
            )}
            <h3>{job.company_name}</h3>
            {job.company_website && <p><a href={job.company_website} target="_blank" rel="noreferrer">Website công ty</a></p>}
          </div>
        </div>
      </div>

      {/* CV Selection Modal */}
      {showModal && (
        <div className="cv-modal-overlay">
          <div className="cv-modal">
            <h2>Chọn CV để ứng tuyển</h2>
            <p style={{ marginBottom: 16, color: '#4a5568' }}>Bạn muốn dùng CV nào để ứng tuyển vào vị trí <strong>{job.title}</strong>?</p>
            
            <div className="cv-list">
              {myCVs.map(cv => (
                <div 
                  key={cv.id} 
                  className={`cv-item ${selectedCVId === cv.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCVId(cv.id)}
                >
                  <div>
                    <div className="cv-name">{cv.name}</div>
                    <div className="cv-date">Cập nhật: {cv.updatedAt}</div>
                  </div>
                  <div>
                    <input type="radio" checked={selectedCVId === cv.id} readOnly />
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)} disabled={applying}>Hủy</button>
              <button className="btn-submit" onClick={submitApplication} disabled={applying}>
                {applying ? 'Đang gửi...' : 'Nộp CV này'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
