import React from 'react';

const CandidatePersonalInfoModal = ({ show, onClose, profileData }) => {
  if (!show) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h5 className="profile-modal-title">
            <i className="fas fa-user-circle me-2 text-primary"></i>
            Contact Info
          </h5>
          <button
            type="button"
            className="profile-modal-close-btn"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="profile-modal-body">
          <table className="table table-hover table-borderless mb-0">
            <tbody>
              {profileData.phone && !profileData.hidePhone && (
                <tr>
                  <th scope="row" style={{ width: '35%' }} className="text-secondary fw-semibold">Phone</th>
                  <td className="text-dark fw-medium">{profileData.phone}</td>
                </tr>
              )}
              {profileData.email && (
                <tr>
                  <th scope="row" style={{ width: '35%' }} className="text-secondary fw-semibold">Email</th>
                  <td className="text-dark fw-medium">{profileData.email}</td>
                </tr>
              )}
              {profileData.portfolio && (
                <tr>
                  <th scope="row" className="text-secondary fw-semibold">Website</th>
                  <td className="text-dark fw-medium">
                    <a href={profileData.portfolio} target="_blank" rel="noopener noreferrer">
                      {profileData.portfolio}
                    </a>
                  </td>
                </tr>
              )}
              {profileData.blog && (
                <tr>
                  <th scope="row" className="text-secondary fw-semibold">Blog</th>
                  <td className="text-dark fw-medium">
                    <a href={profileData.blog} target="_blank" rel="noopener noreferrer">
                      {profileData.blog}
                    </a>
                  </td>
                </tr>
              )}
              {profileData.github && (
                <tr>
                  <th scope="row" className="text-secondary fw-semibold">Github</th>
                  <td className="text-dark fw-medium">
                    <a href={profileData.github} target="_blank" rel="noopener noreferrer">
                      {profileData.github}
                    </a>
                  </td>
                </tr>
              )}
              {profileData.facebook && (
                <tr>
                  <th scope="row" className="text-secondary fw-semibold">Facebook</th>
                  <td className="text-dark fw-medium">
                    <a href={profileData.facebook} target="_blank" rel="noopener noreferrer">
                      {profileData.facebook}
                    </a>
                  </td>
                </tr>
              )}
              {profileData.x && (
                <tr>
                  <th scope="row" className="text-secondary fw-semibold">X (Twitter)</th>
                  <td className="text-dark fw-medium">
                    <a href={profileData.x} target="_blank" rel="noopener noreferrer">
                      {profileData.x}
                    </a>
                  </td>
                </tr>
              )}
              {profileData.linkedin && (
                <tr>
                  <th scope="row" className="text-secondary fw-semibold">LinkedIn</th>
                  <td className="text-dark fw-medium">
                    <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer">
                      {profileData.linkedin}
                    </a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CandidatePersonalInfoModal;
