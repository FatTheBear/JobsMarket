import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ApplyModal.css';

const API_URL = 'http://localhost:5000';

/**
 * ApplyModal - Component popup chọn CV và nộp đơn ứng tuyển
 *
 * Props:
 *  - jobId      : ID của công việc đang ứng tuyển
 *  - jobTitle   : Tên công việc (hiển thị trong modal)
 *  - onClose    : Callback khi đóng modal
 *  - onSuccess  : Callback khi nộp đơn thành công
 *  - onError    : Callback khi có lỗi (nhận string message)
 */
export default function ApplyModal({ jobId, jobTitle, onClose, onSuccess, onError }) {
  const [myCVs, setMyCVs] = useState([]);
  const [selectedCVId, setSelectedCVId] = useState(null);
  const [applying, setApplying] = useState(false);
  const [loadingCVs, setLoadingCVs] = useState(true);

  useEffect(() => {
    fetchCandidateCVs();
  }, []);

  const fetchCandidateCVs = async () => {
    setLoadingCVs(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/candidate/cvs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyCVs(res.data || []);
    } catch (err) {
      // Nếu chưa có API upload CV, dùng mock tạm thời
      setMyCVs([
        { id: 1, cv_name: 'CV_Frontend_Dev.pdf', updated_at: '2026-06-01' },
        { id: 2, cv_name: 'CV_English_Version.pdf', updated_at: '2026-05-20' }
      ]);
    } finally {
      setLoadingCVs(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCVId) {
      onError('Vui lòng chọn CV trước khi nộp đơn');
      return;
    }

    setApplying(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.post(`${API_URL}/api/applications`, {
        user_id: user.id,
        job_id: jobId,
        cv_id: selectedCVId
      });
      onSuccess('Nộp đơn thành công! Nhà tuyển dụng sẽ sớm liên hệ với bạn 🎉');
    } catch (err) {
      onError(err.response?.data?.message || 'Có lỗi xảy ra khi nộp đơn. Vui lòng thử lại!');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="apply-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="apply-modal">

        {/* Header */}
        <div className="apply-modal-header">
          <div>
            <h2>Chọn CV để ứng tuyển</h2>
            <p>Ứng tuyển vào vị trí <strong>{jobTitle}</strong></p>
          </div>
          <button className="apply-modal-close" onClick={onClose} disabled={applying}>✕</button>
        </div>

        {/* CV List */}
        <div className="apply-modal-body">
          {loadingCVs ? (
            <div className="apply-modal-loading">Đang tải danh sách CV...</div>
          ) : myCVs.length === 0 ? (
            <div className="apply-modal-empty">
              <div className="apply-modal-empty-icon">📄</div>
              <p>Bạn chưa có CV nào. Hãy tạo CV trước khi ứng tuyển!</p>
            </div>
          ) : (
            <div className="apply-cv-list">
              {myCVs.map(cv => (
                <div
                  key={cv.id}
                  className={`apply-cv-item ${selectedCVId === cv.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCVId(cv.id)}
                >
                  <div className="apply-cv-icon">📄</div>
                  <div className="apply-cv-info">
                    <div className="apply-cv-name">{cv.cv_name}</div>
                    <div className="apply-cv-date">
                      Cập nhật: {new Date(cv.updated_at).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <div className="apply-cv-radio">
                    <input type="radio" checked={selectedCVId === cv.id} readOnly />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="apply-modal-footer">
          <button className="apply-btn-cancel" onClick={onClose} disabled={applying}>
            Hủy
          </button>
          <button
            className="apply-btn-submit"
            onClick={handleSubmit}
            disabled={applying || myCVs.length === 0}
          >
            {applying ? (
              <span className="apply-spinner">⏳ Đang gửi...</span>
            ) : (
              '📨 Nộp CV này'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
