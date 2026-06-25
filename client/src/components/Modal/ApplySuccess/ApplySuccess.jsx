import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ApplySuccess.css';

export default function ApplySuccess({ isOpen, onClose, job }) {
  if (!isOpen) return null;

  const navigate = useNavigate();

  const handleTrackApplication = () => {
    onClose();
    navigate('/applications');
  };

  const handleDiscoverJobs = () => {
    onClose();
    const industryId = job?.industry_id || '';
    navigate(`/jobs?industry=${industryId}`);
  };

  const handleReturnHome = () => {
    onClose();
    navigate('/dashboard');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-corner" onClick={onClose}>✕</button>
        
        <div className="icon-container">
          <div className="success-icon">✓</div>
        </div>

        <h2 className="modal-title">Application Submitted!</h2>
        
        <p className="modal-subtitle">
          Your resume has been successfully sent to the employer. The hiring team will review your profile shortly.
        </p>

        <div className="actions-container">
          <button className="btn-primary" onClick={handleTrackApplication}>
            Track Application Status
          </button>
          
          <button className="btn-secondary" onClick={handleDiscoverJobs}>
            Discover Similar Jobs
          </button>
          
          <button className="btn-text" onClick={handleReturnHome}>
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}