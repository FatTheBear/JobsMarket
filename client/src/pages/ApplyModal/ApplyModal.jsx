import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ApplyModal.css';

const API_URL = 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * ApplyModal — Popup chọn CV và nộp đơn (pages/ApplyModal, phụ trách: Thông)
 */
export default function ApplyModal({ jobId, jobTitle, onClose, onSuccess, onError }) {
  const [myCVs, setMyCVs] = useState([]);
  const [selectedCVId, setSelectedCVId] = useState(null);
  const [applying, setApplying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingCVs, setLoadingCVs] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    fetchCandidateCVs();
  }, []);

  const fetchCandidateCVs = async () => {
    setLoadingCVs(true);
    setFetchError('');
    try {
      const res = await axios.get(`${API_URL}/api/candidate/my-cvs`, {
        headers: getAuthHeaders()
      });
      const cvs = res.data || [];
      setMyCVs(cvs);
      if (cvs.length > 0) {
        setSelectedCVId(cvs[0].id);
      }
    } catch (err) {
      setMyCVs([]);
      setFetchError('Không thể tải danh sách CV. Vui lòng đăng nhập lại hoặc thử sau.');
    } finally {
      setLoadingCVs(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onError('Dung lượng file không được vượt quá 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('cv_file', file);
      formData.append('cv_name', file.name);

      await axios.post(`${API_URL}/api/candidate/upload-cv`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      await fetchCandidateCVs();
    } catch (err) {
      onError(err.response?.data?.message || 'Tải CV lên thất bại. Vui lòng thử lại!');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedCVId) {
      onError('Vui lòng chọn CV trước khi nộp đơn');
      return;
    }

    setApplying(true);
    try {
      await axios.post(
        `${API_URL}/api/candidate/apply`,
        { job_id: Number(jobId), cv_id: selectedCVId },
        { headers: getAuthHeaders() }
      );
      onSuccess('Nộp đơn thành công! Nhà tuyển dụng sẽ sớm liên hệ với bạn 🎉');
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('already applied')) {
        onError('Bạn đã ứng tuyển vào công việc này rồi.');
      } else {
        onError(msg || 'Có lỗi xảy ra khi nộp đơn. Vui lòng thử lại!');
      }
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="apply-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="apply-modal">

        <div className="apply-modal-header">
          <div>
            <h2>Chọn CV để ứng tuyển</h2>
            <p>Ứng tuyển vào vị trí <strong>{jobTitle}</strong></p>
          </div>
          <button className="apply-modal-close" onClick={onClose} disabled={applying || uploading}>✕</button>
        </div>

        <div className="apply-modal-body">
          {fetchError && (
            <div className="apply-modal-error">{fetchError}</div>
          )}

          {loadingCVs ? (
            <div className="apply-modal-loading">Đang tải danh sách CV...</div>
          ) : myCVs.length === 0 ? (
            <div className="apply-modal-empty">
              <div className="apply-modal-empty-icon">📄</div>
              <p>Bạn chưa có CV nào. Hãy tải CV lên bên dưới để ứng tuyển!</p>
            </div>
          ) : (
            <div className="apply-cv-list">
              {myCVs.map(cv => (
                <div
                  key={cv.id}
                  className={`apply-cv-item ${selectedCVId === cv.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCVId(cv.id)}
                >
                  <div className="apply-cv-icon">{cv.type === 'application/pdf' ? '📕' : '📄'}</div>
                  <div className="apply-cv-info">
                    <div className="apply-cv-name">{cv.name || cv.cv_name}</div>
                    <div className="apply-cv-date">
                      {cv.uploadedAt || (cv.updated_at ? new Date(cv.updated_at).toLocaleDateString('vi-VN') : '')}
                      {cv.size ? ` • ${cv.size}` : ''}
                    </div>
                  </div>
                  <div className="apply-cv-radio">
                    <input type="radio" checked={selectedCVId === cv.id} readOnly />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="apply-upload-section">
            <input
              type="file"
              id="apply-upload-cv"
              className="apply-upload-input"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploading || applying}
            />
            <label htmlFor="apply-upload-cv" className={`apply-upload-label ${uploading ? 'disabled' : ''}`}>
              {uploading ? '⏳ Đang tải lên...' : '☁️ Tải CV mới lên'}
            </label>
            <p className="apply-upload-hint">Hỗ trợ PDF, DOC, DOCX (tối đa 5MB)</p>
          </div>
        </div>

        <div className="apply-modal-footer">
          <button className="apply-btn-cancel" onClick={onClose} disabled={applying || uploading}>
            Hủy
          </button>
          <button
            className="apply-btn-submit"
            onClick={handleSubmit}
            disabled={applying || uploading || !selectedCVId}
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
