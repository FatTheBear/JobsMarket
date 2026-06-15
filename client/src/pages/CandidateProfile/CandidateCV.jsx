import React, { useState } from 'react';
import axios from 'axios';

const CandidateCV = ({ cvList, fetchCVs, setModalError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const processFile = async (file) => {
    if (!file) return;
    setModalError('');

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const fileExt = file.name.split('.').pop().toLowerCase();

    // Check type
    if (!allowedTypes.includes(file.type) && !['pdf', 'doc', 'docx'].includes(fileExt)) {
      setModalError("Invalid file type! Only PDF, DOC, or DOCX files are allowed.");
      return;
    }

    // Check size 10MB
    if (file.size > 10 * 1024 * 1024) {
      setModalError("File size exceeds 10MB! Please upload a smaller document.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('cv_file', file);
    formData.append('cv_name', file.name);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/candidate/upload-cv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      alert("🎉 " + response.data.message);

      // Load lại danh sách CV ngay lập tức sau khi upload thành công
      if (fetchCVs) await fetchCVs();

    } catch (error) {
      console.error(error);
      setModalError(error.response?.data?.message || "Error uploading CV! Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCvUpload = (e) => {
    const file = e.target.files[0];
    processFile(file);
    // Reset ô input file để có thể chọn lại đúng file đó nếu muốn
    e.target.value = null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleCvDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this CV? This action cannot be undone.")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/candidate/cvs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("🗑️ CV deleted successfully!");

      // Load lại danh sách
      if (fetchCVs) await fetchCVs();

    } catch (error) {
      console.error(error);
      setModalError(error.response?.data?.message || "Error deleting CV! Please try again.");
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      <h6 className="fw-bold border-bottom pb-2 text-dark mb-0">
        <i className="far fa-file-pdf me-1.5 text-primary"></i>
        Manage Curriculum Vitae (CV)
      </h6>

      {/* 1. HIỂN THỊ DANH SÁCH CV */}
      {cvList && cvList.length > 0 && (
        <div className="d-flex flex-column gap-3">
          {cvList.map((cv) => (
            <div key={cv.id} className="p-3 bg-light border rounded-3 d-flex align-items-center justify-content-between hover-shadow-sm transition-all">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center bg-white shadow-sm" style={{ width: '45px', height: '45px', minWidth: '45px' }}>
                  <i className={cv.type === 'application/pdf' ? "far fa-file-pdf text-danger fs-4" : "far fa-file-word text-primary fs-4"}></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1 text-dark small" style={{ wordBreak: 'break-all' }}>{cv.name}</h6>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{cv.size} &bull; Uploaded on {cv.uploadedAt}</p>
                </div>
              </div>
              <div className="d-flex gap-2 ms-3">
                <a href={cv.dataUrl} download={cv.name} className="btn btn-sm btn-outline-success px-3 rounded-pill fw-semibold d-flex align-items-center gap-1">
                  <i className="fas fa-download"></i> <span className="d-none d-sm-inline">Download</span>
                </a>
                <button type="button" onClick={() => handleCvDelete(cv.id)} className="btn btn-sm btn-outline-danger px-3 rounded-pill fw-semibold d-flex align-items-center gap-1">
                  <i className="fas fa-trash-alt"></i> <span className="d-none d-sm-inline">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. KHU VỰC UPLOAD THÊM CV */}
      <div
        className="p-5 border border-2 rounded-3 text-center transition-all mt-2"
        style={{
          borderStyle: 'dashed',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          borderColor: isDragging ? '#22c55e' : '#cbd5e1',
          backgroundColor: isDragging ? '#f0fdf4' : '#f8fafc',
          opacity: isUploading ? 0.6 : 1
        }}
        onClick={() => !isUploading && document.getElementById('cvFileInput').click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <i className={`fas fa-cloud-upload-alt fs-1 mb-3 transition-all ${isDragging ? 'text-success scale-110' : 'text-primary'}`}></i>

        {isUploading ? (
          <h6 className="fw-bold text-primary mb-1">Uploading...n...</h6>
        ) : (
          <>
            <h6 className="fw-bold text-dark mb-1">Drag and drop your CV here, or click to upload</h6>
            <p className="text-secondary small mb-0">Only support files type PDF, DOC, DOCX. Max size 10MB.</p>
          </>
        )}

        <input
          type="file"
          id="cvFileInput"
          accept=".pdf,.doc,.docx"
          onChange={handleCvUpload}
          className="d-none"
          disabled={isUploading}
        />
      </div>
    </div>
  );
};

export default CandidateCV;
