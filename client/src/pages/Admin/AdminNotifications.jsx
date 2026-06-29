import React, { useEffect, useState } from "react";
import { Building2, Briefcase, CreditCard, ChevronRight } from "lucide-react";
import { adminApi } from "../../services/adminApi";

// Key lưu danh sách thông báo đã đọc trong localStorage
const READ_KEY = "admin_read_notifications";

// Đọc danh sách id đã đọc từ localStorage
const getReadIds = () => {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Lưu thêm 1 id vào danh sách đã đọc
const markRead = (notifId) => {
  const ids = getReadIds();
  if (!ids.includes(notifId)) {
    ids.push(notifId);
    localStorage.setItem(READ_KEY, JSON.stringify(ids));
  }
};

// Hàm build danh sách thông báo từ 3 nguồn pending.
// Export để sidebar cũng gọi được nhằm đếm số chưa đọc.
export const buildPendingNotifications = async () => {
  const notifications = [];

  // 1. Companies pending
  try {
    const companiesRes = await adminApi.getPendingCompanies();
    const companies = companiesRes.data || companiesRes || [];
    companies.forEach((c) => {
      notifications.push({
        id: `company-${c.company_id || c.id}`,
        type: "companies",
        title: "Company awaiting approval",
        message: `${c.company_name || c.name || "A company"} is waiting for approval.`,
        created_at: c.created_at,
      });
    });
  } catch (e) {
    console.error("Load pending companies failed:", e);
  }

  // 2. Jobs pending
  try {
    const jobsRes = await adminApi.getPendingJobs();
    const jobs = jobsRes.data || jobsRes || [];
    jobs.forEach((j) => {
      notifications.push({
        id: `job-${j.id}`,
        type: "jobs",
        title: "Job awaiting approval",
        message: `"${j.title}"${j.company_name ? " from " + j.company_name : ""} is waiting for approval.`,
        created_at: j.created_at,
      });
    });
  } catch (e) {
    console.error("Load pending jobs failed:", e);
  }

  // 3. Transactions pending (lọc phía frontend)
  try {
    const txRes = await adminApi.getTransactions();
    const txs = txRes.data || txRes || [];
    txs
      .filter((t) => t.status === "pending")
      .forEach((t) => {
        notifications.push({
          id: `tx-${t.id}`,
          type: "transactions",
          title: "Transaction awaiting review",
          message: `Top-up of ${Number(t.amount_fiat).toLocaleString()}đ from ${t.email || "a user"} is pending.`,
          created_at: t.created_at,
        });
      });
  } catch (e) {
    console.error("Load pending transactions failed:", e);
  }

  // Sắp xếp mới nhất lên đầu
  notifications.sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  );

  return notifications;
};

const TYPE_ICON = {
  companies: Building2,
  jobs: Briefcase,
  transactions: CreditCard,
};

const AdminNotifications = ({ onNavigate }) => {
  const [items, setItems] = useState([]);
  const [readIds, setReadIds] = useState(getReadIds());
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await buildPendingNotifications();
      setItems(list);
      setReadIds(getReadIds());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleClick = (notif) => {
    // 1. Đánh dấu đã đọc
    markRead(notif.id);
    setReadIds(getReadIds());
    // 2. Nhảy sang tab tương ứng (nếu được truyền onNavigate)
    if (onNavigate) onNavigate(notif.type);
  };

  const unreadCount = items.filter((i) => !readIds.includes(i.id)).length;

  return (
    <div className="admin-notifications">
      <h2 className="admin-title">System Notifications</h2>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
        <button
          className="admin-btn-primary"
          onClick={load}
          style={{ background: "#5a5a5a" }}
        >
          Refresh
        </button>
        <span style={{ color: "#64748b", fontSize: 14 }}>
          {unreadCount} unread / {items.length} total
        </span>
      </div>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : items.length === 0 ? (
        <p>No pending items. Everything is processed 🎉</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((notif) => {
            const isRead = readIds.includes(notif.id);
            const Icon = TYPE_ICON[notif.type] || Building2;
            return (
              <div
                key={notif.id}
                onClick={() => handleClick(notif)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  borderRadius: 10,
                  cursor: "pointer",
                  background: isRead ? "#f8fafc" : "#ecfdf5",
                  border: `1px solid ${isRead ? "#e2e8f0" : "#01796F"}`,
                  transition: "background 0.15s",
                }}
              >
                {/* Chấm xanh nếu chưa đọc */}
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: isRead ? "transparent" : "#01796F",
                    border: isRead ? "1px solid #cbd5e1" : "none",
                    flexShrink: 0,
                  }}
                />
                <Icon size={22} color="#01796F" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: isRead ? 500 : 700,
                      color: "#1e293b",
                      fontSize: 14,
                    }}
                  >
                    {notif.title}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 13 }}>
                    {notif.message}
                  </div>
                </div>
                <ChevronRight size={18} color="#94a3b8" style={{ flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;