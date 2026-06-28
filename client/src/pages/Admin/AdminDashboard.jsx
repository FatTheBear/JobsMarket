import React, { useState, useEffect } from 'react';
import { Users, Briefcase, BarChart2, FolderTree, Newspaper, CreditCard, Coins, Bell, Building2, LogOut } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import AdminOverview from './AdminOverview';
import AdminUser from './AdminUser';
import AdminJob from './AdminJob';
import AdminCategories from './AdminCategories';
import AdminNews from './AdminNews';
import AdminTransaction from './AdminTransaction';
import AdminCoinFees from './AdminCoinFees';
import './Admin.css';
import CreateNewsModal from './CreateNewsModal';
import AdminCompanyApproval from "./AdminCompanyApproval";
import { ModalProvider } from './ModalProvider';
import { useModal } from './useModal';
import NewsDetailModal from './NewsDetailModal';
import AdminNotifications, { buildPendingNotifications } from "./AdminNotifications";


// ─── Inner component dùng được hook useModal ───────────────────────────────
const AdminDashboardInner = () => {
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  })();
  const { showAlert, showConfirm } = useModal();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [categories, setCategories] = useState({ skills: [], industry: [] });
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newsCategories, setNewsCategories] = useState([]);
  const [editingNews, setEditingNews] = useState(null);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [viewingNews, setViewingNews] = useState(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };



  // Đóng gói hàm fetch danh mục ra ngoài để dùng tái sử dụng khi Add/Delete
  useEffect(() => {
    const countUnread = async () => {
      try {
        const list = await buildPendingNotifications();
        const readRaw = localStorage.getItem("admin_read_notifications");
        const readIds = readRaw ? JSON.parse(readRaw) : [];
        setUnreadNotifCount(list.filter((n) => !readIds.includes(n.id)).length);
      } catch (e) {
        console.error(e);
      }
    };
    countUnread();
  }, [activeTab]);

  const fetchCategoriesData = async () => {
    try {
      const [skillsData, industryData] = await Promise.all([
        adminApi.getSkills(),
        adminApi.getIndustries()

      ]);
      console.log("INDUSTRY DATA:", industryData);
      setCategories({
        skills: Array.isArray(skillsData) ? skillsData : [],
        industry: Array.isArray(industryData) ? industryData : []
      });
    } catch (catErr) {
      console.error("Error fetching categories:", catErr);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // These tabs manage their own data loading internally
      if (
        activeTab === 'coin-fees' ||
        activeTab === 'transactions' ||
        activeTab === 'notifications'
      ) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        if (activeTab === 'overview') {
          const res = await adminApi.getStats();
          setStats(res.data ? res.data : res);
        } else if (activeTab === 'users') {
          const res = await adminApi.getUsers();
          setUsers(res.data || res);
        } else if (activeTab === 'companies') {
          const res = await adminApi.getPendingCompanies();
          setPendingCompanies(res.data || res);
        } else if (activeTab === 'jobs') {
          const res = await adminApi.getPendingJobs();
          setPendingJobs(res.data || res);
        } else if (activeTab === 'categories') {
          await fetchCategoriesData();
        } else if (activeTab === 'news') {
          const res = await adminApi.getNews();
          setNewsList(res.data || res);
          await fetchNewsCategories();
        }
      } catch (error) {
        console.error("Error loading tab data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const handleAddSkill = async (name) => {
    try {
      await adminApi.createSkill(name);
      await fetchCategoriesData();
    } catch (err) {
      await showAlert("Cannot add skill. Please try again.", "error");
    }
  };

  const handleDeleteSkill = async (id) => {
    const confirmed = await showConfirm("Are you sure you want to delete this skill?");
    if (!confirmed) return;
    try {
      await adminApi.deleteSkill(id);
      await fetchCategoriesData();
    } catch (err) {
      await showAlert("Error deleting skill!", "error");
    }
  };

  const handleAddIndustry = async (name) => {
    try {
      await adminApi.createIndustry(name);
      await fetchCategoriesData();
    } catch (err) {
      await showAlert("Cannot add industry. Please try again.", "error");
    }
  };

  const handleDeleteIndustry = async (id) => {
    const confirmed = await showConfirm("Are you sure you want to delete this industry?");
    if (!confirmed) return;
    try {
      await adminApi.deleteIndustry(id);
      await fetchCategoriesData();
    } catch (err) {
      await showAlert("Error deleting industry!", "error");
    }
  };

  const handleToggleUserStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Banned' ? 'Active' : 'Banned';
    const confirmed = await showConfirm(`Are you sure you want to change status to ${nextStatus}?`);
    if (!confirmed) return;
    try {
      await adminApi.updateUserStatus(id, nextStatus);
      const data = await adminApi.getUsers();
      setUsers(data.data || data);
    } catch (err) {
      await showAlert("Error updating user status!", "error");
    }
  };
  // Ban kèm lý do (gửi mail)
  const handleBanUser = async (id, reason) => {
    try {
      await adminApi.banUser(id, reason);
      const data = await adminApi.getUsers();
      setUsers(data.data || data);
      await showAlert("User banned and notified by email.", "success");
    } catch (err) {
      await showAlert("Error banning user!", "error");
    }
  };

  // Gỡ ban (không cần lý do, không gửi mail)
  const handleUnbanUser = async (id) => {
    const confirmed = await showConfirm("Unban this user?");
    if (!confirmed) return;
    try {
      await adminApi.updateUserStatus(id, 'Active');
      const data = await adminApi.getUsers();
      setUsers(data.data || data);
    } catch (err) {
      await showAlert("Error unbanning user!", "error");
    }
  };

  const handleReviewJob = async (id, decision) => {
    try {
      await adminApi.updateJobStatus(id, decision);
      const jobsData = await adminApi.getPendingJobs();
      setPendingJobs(jobsData.data || jobsData);
      const statsRes = await adminApi.getStats();
      setStats(statsRes.data ? statsRes.data : statsRes);
    } catch (err) {
      await showAlert("Error processing job status!", "error");
    }
  };

  const fetchNewsData = async () => {
    try {
      const res = await adminApi.getNews();
      setNewsList(res.data || res);
    } catch (err) {
      console.error("Error fetching news:", err);
    }
  };

  const handleCreateNews = async (data) => {
    try {
      await adminApi.createNews(data);
      await fetchNewsData();
    } catch (err) {
      await showAlert("Error creating article", "error");
    }
  };

  // edit news
  const handleEditNews = (news) => {
    setEditingNews(news);
  };

  const handleUpdateNews = async (id, data) => {
    try {
      console.log("UPDATE DATA FRONTEND:", data);
      await adminApi.updateNews(id, data);
      await fetchNewsData();
      setEditingNews(null);
    } catch (err) {
      await showAlert("Error updating article", "error");
    }
  };

  const handleDeleteNews = async (id) => {
    const confirmed = await showConfirm("Are you sure you want to delete this article?");
    if (!confirmed) return;
    try {
      await adminApi.deleteNews(id);
      await fetchNewsData();
      await showAlert("Article deleted successfully!", "success");
    } catch (err) {
      console.error(err);
      await showAlert("Error deleting article", "error");
    }
  };

  const fetchNewsCategories = async () => {
    try {
      const res = await adminApi.getNewsCategories();
      setNewsCategories(res.data || res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveCompany = async (companyId) => {
    const confirmed = await showConfirm("Approve this company?");
    if (!confirmed) return;

    try {
      await adminApi.approveCompany(companyId);
      const res = await adminApi.getPendingCompanies();
      setPendingCompanies(res.data || res);
      await showAlert("Company approved successfully!", "success");
    } catch (error) {
      await showAlert("Failed to approve company", "error");
    }
  };

  const handleViewNews = (news) => {
    console.log("VIEW NEWS DATA:", news);
    setViewingNews(news);
  };

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <h2>JobsMarket Admin</h2>
        <div className="sidebar-menu">
          <button onClick={() => setActiveTab('overview')} className={`sidebar-btn ${activeTab === 'overview' ? 'active' : ''}`}><BarChart2 size={20} /> Overview</button>
          <button onClick={() => setActiveTab('users')} className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`}><Users size={20} /> Users</button>
          <button onClick={() => setActiveTab('companies')} className={`sidebar-btn ${activeTab === 'companies' ? 'active' : ''}`}><Briefcase size={20} /> Company Approval</button>
          <button onClick={() => setActiveTab('jobs')} className={`sidebar-btn ${activeTab === 'jobs' ? 'active' : ''}`}><Building2 size={20} /> Job Approval</button>
          <button onClick={() => setActiveTab('categories')} className={`sidebar-btn ${activeTab === 'categories' ? 'active' : ''}`}><FolderTree size={20} /> Categories</button>
          <button onClick={() => setActiveTab('news')} className={`sidebar-btn ${activeTab === 'news' ? 'active' : ''}`}><Newspaper size={20} /> News Management</button>
          <button onClick={() => setActiveTab('transactions')} className={`sidebar-btn ${activeTab === 'transactions' ? 'active' : ''}`}><CreditCard size={20} /> Transactions</button>
          <button onClick={() => setActiveTab('coin-fees')} className={`sidebar-btn ${activeTab === 'coin-fees' ? 'active' : ''}`}><Coins size={20} /> Coin Fees</button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`sidebar-btn ${activeTab === "notifications" ? "active" : ""}`}
            style={{ position: "relative" }}
          >
            <Bell size={20} />Notifications
            {unreadNotifCount > 0 && (
              <span style={{
                position: "absolute", top: 8, right: 12,
                background: "#ef4444", color: "#fff",
                borderRadius: "10px", fontSize: 11, fontWeight: 700,
                minWidth: 18, height: 18, display: "flex",
                alignItems: "center", justifyContent: "center", padding: "0 5px"
              }}>
                {unreadNotifCount}
              </span>
            )}
          </button>

          <div style={{ marginTop: "auto", paddingTop: 16 }}>
            <div style={{ padding: "0 12px 10px", color: "#cbd5e1", fontSize: 13 }}>
              ADMIN<br />
              <strong style={{ color: "#fff" }}>
                {currentUser.email || currentUser.full_name || "Admin"}
              </strong>
            </div>
            <button onClick={handleLogout} className="sidebar-btn">
              <LogOut size={20} /> Log out
            </button>
          </div>


        </div>
      </div>
      <div className="admin-content">
        {loading && <p className="loading-text">Loading...</p>}
        {!loading && activeTab === 'overview' && <AdminOverview stats={stats} />}
        {!loading && activeTab === 'users' && <AdminUser users={users} onBan={handleBanUser} onUnban={handleUnbanUser} />}
        {!loading && activeTab === 'jobs' && <AdminJob pendingJobs={pendingJobs} onReviewJob={handleReviewJob} />}
        {!loading && activeTab === "notifications" && (<AdminNotifications onNavigate={setActiveTab} />)}
        {!loading && activeTab === 'categories' && (
          <AdminCategories
            categories={categories}
            onRefresh={fetchCategoriesData}
            onAddSkill={handleAddSkill}
            onAddIndustry={handleAddIndustry}
            onDeleteSkill={handleDeleteSkill}
            onDeleteIndustry={handleDeleteIndustry}
          />
        )}
        {!loading && activeTab === 'news' && (
          <AdminNews
            newsList={newsList}
            onRefresh={fetchNewsData}
            onCreate={() => setShowCreateModal(true)}
            onEdit={handleEditNews}
            onDelete={handleDeleteNews}
            onView={handleViewNews}
          />
        )}

        {showCreateModal && (
          <CreateNewsModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateNews}
            categories={newsCategories}
            onCreateCategory={async (name) => {
              const result = await adminApi.createNewsCategory(name);
              // Refresh lại danh sách categories
              const updated = await adminApi.getNewsCategories();
              setNewsCategories(updated);
              return result; // { id, name }
            }}
          />
        )}

        {editingNews && (
          <CreateNewsModal
            onClose={() => setEditingNews(null)}
            onCreate={(data) => handleUpdateNews(editingNews.id, data)}
            categories={newsCategories}
            initialData={editingNews}
            onCreateCategory={async (name) => {
              const result = await adminApi.createNewsCategory(name);
              const updated = await adminApi.getNewsCategories();
              setNewsCategories(updated);
              return result;
            }}
          />
        )}

        {!loading && activeTab === 'companies' && (
          <AdminCompanyApproval
            companies={pendingCompanies}
            onApprove={handleApproveCompany}
          />
        )}

        {viewingNews && (
          <NewsDetailModal
            news={viewingNews}
            onClose={() => setViewingNews(null)}
          />
        )}

        {!loading && activeTab === 'transactions' && <AdminTransaction />}
        {!loading && activeTab === 'coin-fees' && <AdminCoinFees />}
      </div>
    </div>
  );
};

// ─── Wrapper bọc Provider bên ngoài ───────────────────────────────────────
const AdminDashboard = () => (
  <ModalProvider>
    <AdminDashboardInner />
  </ModalProvider>
);

export default AdminDashboard;