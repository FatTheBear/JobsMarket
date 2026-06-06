import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ApplyModal from '../ApplyModal/ApplyModal';
import './JobDetail.css';

const API_URL = 'http://localhost:5000';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Toast
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3500);
  };

  useEffect(() => {
    fetchJobDetail();
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

  const handleApplyClick = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      showToast('Vui lòng đăng nhập để ứng tuyển', 'error');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    setShowApplyModal(true);
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Đang tải...</div>;
  if (!job) return <div style={{ padding: '50px', textAlign: 'center' }}>Không tìm thấy công việc</div>;

  return (
    <div className="job-detail-container">
      {/* Toast Notification */}
      <div className={`jd-toast ${toast.show ? 'show' : ''} ${toast.type}`}>
        {toast.msg}
      </div>

      {/* Hero Header */}
      <div className="job-header-card">
        <div className="job-header-inner">
          <div className="job-header-info">
            <h1>{job.title}</h1>
            <div className="company-name">{job.company_name}</div>
            <div className="job-meta">
              <div className="job-meta-item">
                <span>💰</span>
                {(job.salary_min && job.salary_max)
                  ? `${(job.salary_min / 1000000).toLocaleString('vi-VN')} - ${(job.salary_max / 1000000).toLocaleString('vi-VN')} triệu VNĐ`
                  : (job.salary_min
                    ? `Từ ${(job.salary_min / 1000000).toLocaleString('vi-VN')} triệu VNĐ`
                    : (job.salary_max
                      ? `Đến ${(job.salary_max / 1000000).toLocaleString('vi-VN')} triệu VNĐ`
                      : 'Thỏa thuận'))
                }
              </div>
              <div className="job-meta-item">
                <span>📍</span> {job.company_address || 'Hồ Chí Minh'}
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
      </div>

      {/* Content Grid */}
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
              <div className="company-logo-placeholder">🏢</div>
            )}
            <h3>{job.company_name}</h3>
            {job.company_website && (
              <a href={job.company_website} target="_blank" rel="noreferrer" className="company-website-btn">
                Website công ty
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal — Component riêng biệt */}
      {showApplyModal && (
        <ApplyModal
          jobId={id}
          jobTitle={job.title}
          onClose={() => setShowApplyModal(false)}
          onSuccess={(msg) => {
            setShowApplyModal(false);
            showToast(msg, 'success');
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}
    </div>
  );
}
