import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NotificationDropdown.css';

export default function NotificationDropdown({ role }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/candidate/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Error fetching navbar notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Fast polling every 5s

    const handleRefresh = () => fetchNotifications();
    window.addEventListener('refreshNotifications', handleRefresh);

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshNotifications', handleRefresh);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.put(`http://localhost:5000/api/candidate/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.put('http://localhost:5000/api/candidate/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const handleNotificationClick = (item) => {
    if (!item.is_read) {
      markAsRead(item.id);
    }
    setIsOpen(false);

    // If notification is tied to a community post (Requirement 4)
    if (item.post_id) {
      window.dispatchEvent(new CustomEvent('openPostDetail', { detail: item.post_id }));
    } else {
      const titleLower = (item.title || '').toLowerCase();
      const contentLower = (item.content || '').toLowerCase();
      
      const isApplicationNoti = titleLower.includes('application') || 
                                titleLower.includes('interview') || 
                                titleLower.includes('hired') || 
                                titleLower.includes('rejected') ||
                                titleLower.includes('review') ||
                                contentLower.includes('application') ||
                                contentLower.includes('updated to');

      if (role === 'candidate') {
        if (isApplicationNoti) {
          navigate('/candidate/my-profile/applied-jobs');
        } else {
          navigate('/candidate/my-profile');
        }
      } else if (role === 'company') {
        if (isApplicationNoti) {
          navigate('/company/applicants');
        } else {
          navigate('/company/activity-history');
        }
      }
    }
  };

  const getNotificationIcon = (title) => {
    if (title.includes('Like')) return 'fas fa-thumbs-up';
    if (title.includes('Comment')) return 'fas fa-comment-alt';
    if (title.includes('Application')) return 'fas fa-file-alt';
    if (title.includes('Interview')) return 'fas fa-calendar-check';
    if (title.includes('Hired')) return 'fas fa-award';
    return 'fas fa-bell';
  };

  return (
    <div className="notification-dropdown-wrapper" ref={dropdownRef}>
      <button 
        className="nav-bell-btn" 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        title="Notifications"
      >
        <i className="far fa-bell"></i>
        {unreadCount > 0 && (
          <span className="nav-bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-popover">
          <div className="popover-header" style={{ padding: '18px 20px' }}>
            <h6 className="popover-title" style={{ margin: 0, padding: 0 }}>Notifications</h6>
            {unreadCount > 0 && (
              <button className="mark-all-read-btn" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>

          <div className="popover-body">
            {loading && notifications.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                <i className="far fa-bell-slash fs-4 mb-2 opacity-50 d-block"></i>
                No notifications yet.
              </div>
            ) : (
              notifications.slice(0, 10).map((item) => (
                <div 
                  key={item.id} 
                  className={`notification-item ${!item.is_read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(item)}
                >
                  <div className="noti-icon-wrapper">
                    <i className={getNotificationIcon(item.title)}></i>
                  </div>
                  <div className="noti-content-wrap">
                    <div className="noti-item-title">{item.title}</div>
                    <div className="noti-item-text">{item.content}</div>
                    <div className="noti-item-time">{item.created_at}</div>
                  </div>
                  {!item.is_read && <span className="unread-dot"></span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
