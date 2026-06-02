import React from 'react';

const CandidateCV = ({ cvFile, setCvFile, setModalError }) => {
  const handleCvUpload = (e) => {
    setModalError('');
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const fileExt = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !['pdf', 'doc', 'docx'].includes(fileExt)) {
      setModalError("Invalid file type! Only PDF, DOC, or DOCX files are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setModalError("File size exceeds 10MB! Please upload a smaller document.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const cvObj = {
        name: file.name,
        type: file.type,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        uploadedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        dataUrl: reader.result
      };
      setCvFile(cvObj);
      localStorage.setItem('candidate_cv', JSON.stringify(cvObj));
    };
    reader.readAsDataURL(file);
  };

  const handleCvDelete = () => {
    setCvFile(null);
    localStorage.removeItem('candidate_cv');
  };

  return (
    <div className="d-flex flex-column gap-3">
      <h6 className="fw-bold border-bottom pb-2 text-dark">
        <i className="far fa-file-pdf me-1.5 text-primary"></i> 
        Manage Curriculum Vitae (CV)
      </h6>
      
      {cvFile ? (
        <div className="p-4 bg-light border rounded-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center bg-white shadow-sm" style={{ width: '48px', height: '48px' }}>
              <i className={cvFile.name.endsWith('.pdf') ? "far fa-file-pdf text-danger fs-3" : "far fa-file-word text-primary fs-3"}></i>
            </div>
            <div>
              <h6 className="fw-bold mb-1 text-dark small" style={{ wordBreak: 'break-all' }}>{cvFile.name}</h6>
              <p className="mb-0 text-muted small">{cvFile.size} &bull; Uploaded on {cvFile.uploadedAt}</p>
            </div>
          </div>
          <div className="d-flex gap-2">
            <a href={cvFile.dataUrl} download={cvFile.name} className="btn btn-sm btn-outline-success px-3 rounded-pill fw-semibold">
              <i className="fas fa-download"></i> Download
            </a>
            <button type="button" onClick={handleCvDelete} className="btn btn-sm btn-outline-danger px-3 rounded-pill fw-semibold">
              <i className="fas fa-trash-alt"></i> Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 border border-2 rounded-3 text-center bg-light hover-bg-light-dark transition-all" style={{ borderStyle: 'dashed', cursor: 'pointer' }} onClick={() => document.getElementById('cvFileInput').click()}>
          <i className="fas fa-cloud-upload-alt text-primary fs-1 mb-3"></i>
          <h6 className="fw-bold text-dark mb-1">Drag and drop your CV here, or click to browse</h6>
          <p className="text-secondary small mb-0">Supports PDF, DOC, DOCX formats up to 10MB</p>
          <input
            type="file"
            id="cvFileInput"
            accept=".pdf,.doc,.docx"
            onChange={handleCvUpload}
            className="d-none"
          />
        </div>
      )}
    </div>
  );
};

export default CandidateCV;
