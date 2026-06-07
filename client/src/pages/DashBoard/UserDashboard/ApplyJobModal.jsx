import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApplyJobModal = ({ show, onClose, job, onApplySuccess }) => {
  const [cvList, setCvList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fetchCVs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/candidate/my-cvs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCvList(response.data);
      if (response.data.length > 0) {
        setSelectedCvId(response.data[0].id); // Mặc định chọn CV đầu tiên
      }
    } catch (err) {
      console.error('Error loading CV:', err);
      setError('Cannot load CV list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      fetchCVs();
      setError('');
    }
  }, [show]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('cv_file', file);
      formData.append('cv_name', file.name);

      await axios.post('http://localhost:5000/api/candidate/upload-cv', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Fetch lại danh sách sau khi upload
      await fetchCVs();
    } catch (err) {
      console.error('Error uploading CV:', err);
      setError('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedCvId) {
      setError('Please select a CV to apply.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      await axios.post('http://localhost:5000/api/candidate/apply', {
        job_id: job.id,
        cv_id: selectedCvId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onApplySuccess();
      onClose();
    } catch (err) {
      console.error('Error applying for job:', err);
      setError(err.response?.data?.message || 'An error occurred while submitting application.');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className="modal-content bg-white rounded shadow-lg" style={{ width: '90%', maxWidth: '500px', overflow: 'hidden' }}>
        <div className="modal-header border-bottom p-3 d-flex justify-content-between align-items-center bg-light">
          <h5 className="mb-0 fw-bold text-primary">
            <i className="fas fa-paper-plane me-2"></i>Apply for {job?.title}
          </h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        
        <div className="modal-body p-4">
          {error && (
            <div className="alert alert-danger py-2 px-3 small border-0 shadow-sm" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>{error}
            </div>
          )}

          <h6 className="fw-semibold mb-3">Select a CV to Apply:</h6>
          
          {loading && !cvList.length ? (
            <div className="text-center py-4 text-muted">
              <div className="spinner-border spinner-border-sm text-primary mb-2"></div>
              <div>Loading CVs...</div>
            </div>
          ) : (
            <div className="cv-list d-flex flex-column gap-2 mb-4" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {cvList.length === 0 ? (
                <div className="text-center p-3 border rounded bg-light text-muted small">
                  You don't have any CVs. Please upload one!
                </div>
              ) : (
                cvList.map(cv => (
                  <label key={cv.id} className={`border rounded p-3 d-flex align-items-center gap-3 cursor-pointer transition-all ${selectedCvId === cv.id ? 'border-primary bg-primary-subtle' : 'border-secondary-subtle'}`}>
                    <input 
                      type="radio" 
                      name="cvSelection" 
                      className="form-check-input mt-0"
                      checked={selectedCvId === cv.id}
                      onChange={() => setSelectedCvId(cv.id)}
                    />
                    <div className="d-flex align-items-center gap-2 flex-grow-1 overflow-hidden">
                      <i className={cv.type === 'application/pdf' ? 'far fa-file-pdf fs-4 text-danger' : 'far fa-file-word fs-4 text-primary'}></i>
                      <div className="text-truncate">
                        <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '0.9rem' }}>{cv.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{cv.uploadedAt} • {cv.size}</div>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          )}

          <div className="upload-section border border-dashed rounded p-3 text-center bg-light">
            <input 
              type="file" 
              id="uploadNewCv" 
              className="d-none" 
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <label htmlFor="uploadNewCv" className={`btn btn-outline-secondary btn-sm rounded-pill px-4 ${uploading ? 'disabled' : ''}`} style={{ cursor: 'pointer' }}>
              {uploading ? (
                <><i className="fas fa-spinner fa-spin me-2"></i>Uploading...</>
              ) : (
                <><i className="fas fa-cloud-upload-alt me-2"></i>Upload New CV</>
              )}
            </label>
            <div className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>Supports PDF, DOC, DOCX (Max 5MB)</div>
          </div>

        </div>
        
        <div className="modal-footer border-top p-3 d-flex justify-content-end gap-2 bg-light">
          <button type="button" className="btn btn-light border" onClick={onClose}>Cancel</button>
          <button 
            type="button" 
            className="btn btn-primary px-4 fw-semibold" 
            onClick={handleApply}
            disabled={loading || uploading || (!selectedCvId && cvList.length === 0)}
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyJobModal;
