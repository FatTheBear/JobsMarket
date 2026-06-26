import React from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinUsModal.css';

export default function JoinUsModal({ isOpen, onClose, jobTitle }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    navigate('/login');
    onClose();
  };

  const handleSignup = () => {
    navigate('/auth');
    onClose();
  };

  return (
    <div className="jum-overlay" onClick={onClose}>
      <div className="jum-modal" onClick={(e) => e.stopPropagation()}>
        <button className="jum-close" onClick={onClose}>×</button>

        <div className="jum-content">
          <div className="jum-icon">🚀</div>
          
          <h2 className="jum-title">Join Us to Explore More</h2>
          
          <p className="jum-description">
            Join thousands of talented professionals exploring exciting career opportunities at top Vietnamese companies.
          </p>

          {jobTitle && (
            <div className="jum-job-highlight">
              <p className="jum-job-label">Interested in:</p>
              <p className="jum-job-title">{jobTitle}</p>
            </div>
          )}

          <div className="jum-benefits">
            <div className="jum-benefit-item">
              <span className="jum-benefit-icon">✓</span>
              <span>Browse thousands of job opportunities</span>
            </div>
            <div className="jum-benefit-item">
              <span className="jum-benefit-icon">✓</span>
              <span>Apply directly to companies</span>
            </div>
            <div className="jum-benefit-item">
              <span className="jum-benefit-icon">✓</span>
              <span>Track your applications</span>
            </div>
            <div className="jum-benefit-item">
              <span className="jum-benefit-icon">✓</span>
              <span>Get notifications for new opportunities</span>
            </div>
          </div>

          <div className="jum-buttons">
            <button className="jum-btn jum-btn-primary" onClick={handleLogin}>
              Login
            </button>
            <button className="jum-btn jum-btn-secondary" onClick={handleSignup}>
              Sign Up
            </button>
          </div>

          <p className="jum-footer">
            Already exploring? Login to continue your journey.
          </p>
        </div>
      </div>
    </div>
  );
}
