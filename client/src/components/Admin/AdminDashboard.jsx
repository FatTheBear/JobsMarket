import React, { useState, useEffect } from 'react';
import { Users, Briefcase, BarChart2 } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import AdminOverview from './AdminOverview';
import AdminUser from './AdminUser';
import AdminJob from './AdminJob';
import '../../admin.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(false);

 useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'overview') {
          const res = await adminApi.getStats();
          // Kiểm tra log xem server trả về cái gì
          console.log("Dữ liệu stats:", res);
          // Gán dữ liệu (thường Axios trả về qua res.data, nếu bạn dùng fetch thì khác)
          setStats(res.data || res); 
        } 
        else if (activeTab === 'users') {
          const res = await adminApi.getUsers();
          setUsers(res.data || res);
        } 
        else if (activeTab === 'jobs') {
          const res = await adminApi.getPendingJobs();
          setPendingJobs(res.data || res);
        }
      } catch (error) {
        console.error("Lỗi khi fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const handleToggleUserStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Banned' ? 'Active' : 'Banned';
    if (window.confirm(`Xác nhận chuyển đổi trạng thái sang ${nextStatus}?`)) {
      try {
        await adminApi.updateUserStatus(id, nextStatus);
        const data = await adminApi.getUsers();
        setUsers(data.data || data);
      } catch (err) { alert("Lỗi!"); }
    }
  };

 const handleReviewJob = async (id, decision) => {
    try {
      await adminApi.updateJobStatus(id, decision);
      
      // Cập nhật lại danh sách công việc sau khi duyệt
      const jobsData = await adminApi.getPendingJobs();
      setPendingJobs(jobsData.data || jobsData);
      
      // CẬP NHẬT LẠI STATS NGAY TẠI ĐÂY
      const statsData = await adminApi.getStats();
      setStats(statsData.data || statsData);
      
    } catch (err) { alert("Lỗi cập nhật!"); }
  };
  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <h2>JobsMarket Admin</h2>
        <div className="sidebar-menu">
          <button onClick={() => setActiveTab('overview')} className={`sidebar-btn ${activeTab === 'overview' ? 'active' : ''}`}><BarChart2 size={20} /> Tổng quan</button>
          <button onClick={() => setActiveTab('users')} className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`}><Users size={20} /> Người dùng</button>
          <button onClick={() => setActiveTab('jobs')} className={`sidebar-btn ${activeTab === 'jobs' ? 'active' : ''}`}><Briefcase size={20} /> Duyệt việc làm</button>
        </div>
      </div>
      <div className="admin-content">
        {loading && <p>Đang tải...</p>}
        {!loading && activeTab === 'overview' && <AdminOverview stats={stats} />}
        {!loading && activeTab === 'users' && <AdminUser users={users} onToggleStatus={handleToggleUserStatus} />}
        {!loading && activeTab === 'jobs' && <AdminJob pendingJobs={pendingJobs} onReviewJob={handleReviewJob} />}
      </div>
    </div>
  );
};

export default AdminDashboard;