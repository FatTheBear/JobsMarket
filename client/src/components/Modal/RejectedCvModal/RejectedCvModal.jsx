import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RejectedCvModal.css';

export default function RejectedCvModal({ notification, onClose }) {
  const navigate = useNavigate();

  if (!notification) return null;

  const handleFindJobs = () => {
    onClose();
    navigate('/find-job');
  };

  return (
    <div className="rejected-cv-overlay" onClick={onClose}>
      <div className="rejected-cv-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="rejected-cv-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="rejected-cv-icon">✕</div>
        <h3 className="rejected-cv-title">CV Rejected</h3>
        <p className="rejected-cv-message">{notification.content}</p>
        <p className="rejected-cv-hint">
          Don&apos;t be discouraged — many great opportunities are still waiting for you.
        </p>
        <button type="button" className="rejected-cv-find-btn" onClick={handleFindJobs}>
          Find Jobs
        </button>
      </div>
    </div>
  );
}
