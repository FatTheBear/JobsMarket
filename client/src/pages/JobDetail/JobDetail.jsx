import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ApplyModal from '../ApplyModal/ApplyModal';
import './JobDetail.css';

const API_URL = 'http://localhost:5000';

const saveAppliedJobId = (jobId) => {
  const ids = JSON.parse(localStorage.getItem('appliedJobIds') || '[]');
  const numId = Number(jobId);
  if (!ids.includes(numId)) {
    localStorage.setItem('appliedJobIds', JSON.stringify([...ids, numId]));
  }
};

const isLocallyApplied = (jobId) => {
  const ids = JSON.parse(localStorage.getItem('appliedJobIds') || '[]');
  return ids.includes(Number(jobId));
};

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3500);
  };

  useEffect(() => {
    fetchJobDetail();
  }, [id]);

  useEffect(() => {
    if (job) {
      checkAppliedStatus(job.title);
    }
  }, [job, id]);

  const fetchJobDetail = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/jobs/${id}`);
      setJob(res.data);
    } catch (err) {
      showToast('Không thể tải thông tin công việc', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkAppliedStatus = async (jobTitle) => {
    if (isLocallyApplied(id)) {
      setHasApplied(true);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get(`${API_URL}/api/candidate/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const alreadyApplied = (res.data || []).some(
        (app) => app.jobTitle === jobTitle
      );
      if (alreadyApplied) {
        setHasApplied(true);
        saveAppliedJobId(id);
      }
    } catch {
      // Bỏ qua — user chưa đăng nhập hoặc chưa có profile
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
      <div className={`jd-toast ${toast.show ? 'show' : ''} ${toast.type}`}>
        {toast.msg}
      </div>

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
          {hasApplied ? (
            <button className="apply-btn applied" disabled>
              ✓ Đã ứng tuyển
            </button>
          ) : (
            <button className="apply-btn" onClick={handleApplyClick}>
              Ứng tuyển ngay
            </button>
          )}
        </div>
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

      {showApplyModal && (
        <ApplyModal
          jobId={id}
          jobTitle={job.title}
          onClose={() => setShowApplyModal(false)}
          onSuccess={(msg) => {
            setShowApplyModal(false);
            setHasApplied(true);
            saveAppliedJobId(id);
            showToast(msg, 'success');
          }}
          onError={(msg) => {
            if (msg.includes('đã ứng tuyển')) {
              setHasApplied(true);
              saveAppliedJobId(id);
            }
            showToast(msg, 'error');
          }}
        />
      )}
    </div>
  );
}
