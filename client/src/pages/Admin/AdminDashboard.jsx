import React, { useState, useEffect } from 'react';
import { Users, Briefcase, BarChart2, FolderTree, Newspaper, CreditCard, Coins, Bell } from 'lucide-react';
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
import AdminNotifications from "./AdminNotifications";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [categories, setCategories] = useState({ skills: [], industries: [] });
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newsCategories, setNewsCategories] = useState([]);
  const [editingNews, setEditingNews] = useState(null);

  // Đóng gói hàm fetch danh mục ra ngoài để dùng tái sử dụng khi Add/Delete
  const fetchCategoriesData = async () => {
    try {
      const [skillsData, industriesData] = await Promise.all([
        adminApi.getSkills(),
        adminApi.getIndustries()
      ]);
      setCategories({
        skills: Array.isArray(skillsData) ? skillsData : [],
        industries: Array.isArray(industriesData) ? industriesData : []
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
      alert("Cannot add skill. Please try again.");
    }
  };

  const handleDeleteSkill = async (id) => {
    if (window.confirm("Are you sure you want to delete this skill?")) {
      try {
        await adminApi.deleteSkill(id);
        await fetchCategoriesData();
      } catch (err) {
        alert("Error deleting skill!");
      }
    }
  };

  const handleAddIndustry = async (name) => {
    try {
      await adminApi.createIndustry(name);
      await fetchCategoriesData();
    } catch (err) {
      alert("Cannot add industry. Please try again.");
    }
  };

  const handleDeleteIndustry = async (id) => {
    if (window.confirm("Are you sure you want to delete this industry?")) {
      try {
        await adminApi.deleteIndustry(id);
        await fetchCategoriesData();
      } catch (err) {
        alert("Error deleting industry!");
      }
    }
  };

  const handleToggleUserStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Banned' ? 'Active' : 'Banned';
    if (window.confirm(`Are you sure you want to change status to ${nextStatus}?`)) {
      try {
        await adminApi.updateUserStatus(id, nextStatus);
        const data = await adminApi.getUsers();
        setUsers(data.data || data);
      } catch (err) {
        alert("Error updating user status!");
      }
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
      alert("Error processing job status!");
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
      alert("Error creating article");
    }
  };
  //edit news
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
      alert("Error updating article");
    }
  };

  const handleDeleteNews = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this article?");
    if (!confirmed) return;
    try {
      await adminApi.deleteNews(id);
      await fetchNewsData();
      alert("Article deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Error deleting article");
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

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <h2>JobsMarket Admin</h2>
        <div className="sidebar-menu">
          <button onClick={() => setActiveTab('overview')} className={`sidebar-btn ${activeTab === 'overview' ? 'active' : ''}`}><BarChart2 size={20} /> Overview</button>
          <button onClick={() => setActiveTab('users')} className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`}><Users size={20} /> Users</button>
          <button onClick={() => setActiveTab('jobs')} className={`sidebar-btn ${activeTab === 'jobs' ? 'active' : ''}`}><Briefcase size={20} /> Job Approval</button>
          <button onClick={() => setActiveTab('categories')} className={`sidebar-btn ${activeTab === 'categories' ? 'active' : ''}`}><FolderTree size={20} /> Categories</button>
          <button onClick={() => setActiveTab('news')} className={`sidebar-btn ${activeTab === 'news' ? 'active' : ''}`}><Newspaper size={20} /> News Management</button>
          <button onClick={() => setActiveTab('transactions')} className={`sidebar-btn ${activeTab === 'transactions' ? 'active' : ''}`}><CreditCard size={20} /> Transactions</button>
          <button onClick={() => setActiveTab('coin-fees')} className={`sidebar-btn ${activeTab === 'coin-fees' ? 'active' : ''}`}><Coins size={20} /> Coin Fees</button>
          <button onClick={() => setActiveTab("notifications")} className={`sidebar-btn ${activeTab === "notifications" ? "active" : ""}`}><Bell size={20} />Notifications</button>
        </div>
      </div>
      <div className="admin-content">
        {loading && <p className="loading-text">Loading...</p>}
        {!loading && activeTab === 'overview' && <AdminOverview stats={stats} />}
        {!loading && activeTab === 'users' && <AdminUser users={users} onToggleStatus={handleToggleUserStatus} />}
        {!loading && activeTab === 'jobs' && <AdminJob pendingJobs={pendingJobs} onReviewJob={handleReviewJob} />}
        {!loading && activeTab === "notifications" && (<AdminNotifications />)}
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
          />
        )}

        {showCreateModal && (
          <CreateNewsModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateNews}
            categories={newsCategories}
          />
        )}

        {editingNews && (
          <CreateNewsModal
            onClose={() => setEditingNews(null)}
            onCreate={(data) => handleUpdateNews(editingNews.id, data)}
            categories={newsCategories}
            initialData={editingNews}
          />
        )}

        {/* ĐÃ THÊM: Khớp nối render nội dung component AdminTransaction khi bấm nút */}
        {!loading && activeTab === 'transactions' && <AdminTransaction />}
        {!loading && activeTab === 'coin-fees' && <AdminCoinFees />}
      </div>
    </div>


  );
};

export default AdminDashboard;