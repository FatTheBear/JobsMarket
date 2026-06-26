import React, { useEffect, useState } from "react";
import { adminApi } from "../../services/adminApi";
import { useModal } from "./useModal"; // Đảm bảo đường dẫn đúng

const AdminNotifications = () => {
  const { showAlert, showConfirm } = useModal();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getNotifications();
      setNotifications(res.data || res);
    } catch (err) {
      console.error(err);
      await showAlert("Error loading notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await adminApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_read: true } : item
        )
      );
    } catch (err) {
      console.error(err);
      await showAlert("Cannot update notification", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm("Are you sure you want to delete this notification?");

    if (!confirmed) return;

    try {
      await adminApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      await showAlert("Notification deleted successfully!", "success");
    } catch (err) {
      console.error(err);
      await showAlert("Cannot delete notification", "error");
    }
  };

  return (
    <div className="admin-notifications">
      <h2 className="admin-title">System Notifications</h2>

      <button 
        className="admin-btn-primary" 
        onClick={fetchNotifications} 
        style={{ background: '#5a5a5a', marginBottom: '20px' }}
      >
        Refresh
      </button>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Content</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {notifications.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.title}</td>
                  <td>{item.content}</td>
                  <td>
                    <span className={`status-badge ${item.is_read ? 'active' : 'pending'}`}>
                      {item.is_read ? "Read" : "Unread"}
                    </span>
                  </td>
                  <td>{new Date(item.created_at).toLocaleString()}</td>
                  <td className="btn-group">
                    {!item.is_read && (
                      <button
                        className="btn-approve"
                        onClick={() => handleMarkAsRead(item.id)}
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      className="btn-reject"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;