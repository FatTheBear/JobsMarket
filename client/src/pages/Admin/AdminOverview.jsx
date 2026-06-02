import React from 'react';
import { Users, Briefcase, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AdminOverview({ stats }) {
  if (!stats) return <p className="loading-text" style={{ color: '#64748b', padding: '20px' }}>Loading data...</p>;

  return (
    <div>
      <h1 className="admin-title">System Overview</h1>
      
      {/* 📊 GRID CÁC THẺ THỐNG KÊ SỐ LIỆU */}
      <div className="stats-grid">
        
        {/* Thẻ 1: Users */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p>Total Users</p>
            <Users size={20} color="#2563eb" />
          </div>
          <div className="stat-number" style={{ color: '#0f172a' }}>{stats.totalUsers || 0}</div>
          
          <div className="stat-detail">
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Candidates:</span> 
              <strong style={{ color: '#1e293b' }}>{stats.candidatesCount || 0}</strong>
            </span>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Recruiters (HR):</span> 
              <strong style={{ color: '#1e293b' }}>{stats.hrCount || 0}</strong>
            </span>
          </div>
        </div>

        {/* Thẻ 2: Pending Jobs */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p>Pending Jobs</p>
            <Briefcase size={20} color="#d97706" />
          </div>
          <div className="stat-number" style={{ color: stats.pendingJobs > 0 ? '#d97706' : '#2563eb' }}>
            {stats.pendingJobs || 0}
          </div>
          <div className="stat-detail">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: stats.pendingJobs > 0 ? '#dc2626' : '#059669' }}>
              {stats.pendingJobs > 0 ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
              {stats.pendingJobs > 0 ? 'Requires immediate review' : 'All jobs processed'}
            </span>
          </div>
        </div>

        {/* Thẻ 3: Total Applications */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p>Total Applications</p>
            <FileText size={20} color="#059669" />
          </div>
          <div className="stat-number" style={{ color: '#059669' }}>{stats.totalApplications || 0}</div>
          <div className="stat-detail">
            <span style={{ color: '#64748b' }}>Successful connections via system</span>
          </div>
        </div>
      </div>

      {/* 📋 KHU VỰC HIỂN THỊ THÔNG TIN NHANH PHÍA DƯỚI */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px', maxWidth: '1200px' }}>
        
        {/* Khối bên trái: Hoạt động gần đây */}
        <div className="table-container" style={{ padding: '20px' }}>
          <h3 style={{ color: '#2563eb', marginBottom: '16px', fontSize: '16px' }}>System Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#475569' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
              <span>Database Connection:</span>
              <span style={{ color: '#059669', fontWeight: 'bold' }}>Connected (MySQL)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
              <span>Active Postings:</span>
              <span>{stats.activeJobs || 0} approved jobs</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Industries:</span>
              <span>{stats.industriesCount || 0} categories</span>
            </div>
          </div>
        </div>

        {/* Khối bên phải: Mẹo cho Admin */}
        <div className="table-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ color: '#2563eb', marginBottom: '8px', fontSize: '16px' }}>Quick Actions Panel</h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px 0' }}>
            Use the sidebar navigation to manage company requests, review candidate reports, or update platform skills.
          </p>
        </div>
      </div>
    </div>
  );
}