import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

// Format timestamp to relative time (e.g., "2 hours ago")
const formatRelativeTime = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  if (diffMonth < 12) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Get icon class and color based on notification title
const getNotificationStyle = (title) => {
  if (title.includes('Welcome')) return { icon: 'fa-gift', color: '#f59e0b', bg: '#fef3c7' };
  if (title.includes('Secure')) return { icon: 'fa-shield-alt', color: '#10b981', bg: '#d1fae5' };
  if (title.includes('In Review')) return { icon: 'fa-search', color: '#3b82f6', bg: '#dbeafe' };
  if (title.includes('Interview')) return { icon: 'fa-calendar-check', color: '#8b5cf6', bg: '#ede9fe' };
  if (title.includes('Hired')) return { icon: 'fa-trophy', color: '#f59e0b', bg: '#fef3c7' };
  if (title.includes('Application Update')) return { icon: 'fa-file-alt', color: '#6b7280', bg: '#f3f4f6' };
  if (title.includes('Application Received')) return { icon: 'fa-envelope-open-text', color: '#06b6d4', bg: '#cffafe' };
  return { icon: 'fa-bell', color: '#6b7280', bg: '#f3f4f6' };
};

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
            {notifications.map((noti) => {
              const style = getNotificationStyle(noti.title);
              return (
                <div
                  key={noti.id}
                  className={`p-3 rounded border d-flex gap-3 align-items-start transition-all cursor-pointer hover-shadow-sm notification-item ${!noti.is_read ? 'unread-bg border-primary-light' : 'bg-white'}`}
                  onClick={() => {
                    if (!noti.is_read) {
                      handleMarkAsRead(noti.id);
                    }
                  }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: !noti.is_read ? style.bg : '#f3f4f6',
                      color: !noti.is_read ? style.color : '#9ca3af'
                    }}
                  >
                    <i className={`fas ${style.icon}`}></i>
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
                      <i className="far fa-clock me-1"></i>{formatRelativeTime(noti.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateNotifications;

