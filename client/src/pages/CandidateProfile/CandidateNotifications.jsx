import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const CandidateNotifications = () => {
  const {
    notifications,
    loadingNotis,
    notisError,
    handleMarkAllAsRead,
    handleMarkAsRead,
    fetchNotifications
  } = useOutletContext();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="card border-0 shadow-sm animate-fade-in">
      <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
        <h5 className="mb-0 fw-bold text-dark">
          <i className="far fa-bell me-2 text-primary"></i>Notifications
        </h5>
        {notifications.length > 0 && (
          <button
            type="button"
            className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5 border"
            onClick={handleMarkAllAsRead}
            disabled={notifications.every(n => n.is_read)}
          >
            <i className="fas fa-check-double"></i> Mark all as read
          </button>
        )}
      </div>

      <div className="card-body p-4 scrollable-notifications" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {loadingNotis ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : notisError ? (
          <div className="alert alert-danger" role="alert">
            {notisError}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="far fa-bell fs-2 mb-2 text-muted opacity-40"></i>
            <p className="mb-0">You have no notifications yet.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {notifications.map((noti) => (
              <div
                key={noti.id}
                className={`p-3 rounded border d-flex gap-3 align-items-start transition-all cursor-pointer hover-shadow-sm notification-item ${!noti.is_read ? 'unread-bg border-primary-light' : 'bg-white'}`}
                onClick={() => {
                  if (!noti.is_read) {
                    handleMarkAsRead(noti.id);
                  }
                }}
              >
                <div className={`rounded-circle p-2.5 d-flex align-items-center justify-content-center ${!noti.is_read ? 'bg-primary-light text-primary' : 'bg-light text-secondary'}`}>
                  <i className={`fas ${noti.title.includes('Welcome') ? 'fa-gift' : noti.title.includes('Secure') ? 'fa-shield-alt' : 'fa-bell'}`}></i>
                </div>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <h6 className={`mb-1 text-dark text-truncate ${!noti.is_read ? 'fw-bold' : 'fw-medium'}`} style={{ fontSize: '0.9rem' }}>
                      {noti.title}
                    </h6>
                    {!noti.is_read && (
                      <span className="badge bg-danger small px-2 py-0.5 rounded-pill animate-pulse" style={{ fontSize: '0.7rem' }}>
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-secondary mb-1 small" style={{ lineHeight: '1.4' }}>
                    {noti.content}
                  </p>
                  <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                    <i className="far fa-clock me-1"></i>{noti.created_at}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateNotifications;
