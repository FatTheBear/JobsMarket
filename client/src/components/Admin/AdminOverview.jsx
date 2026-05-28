import React from 'react';
import { Users, Briefcase, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AdminOverview({ stats }) {
  if (!stats) return <p className="loading-text" style={{ color: '#94a3b8', padding: '20px' }}>Loading data...</p>;

  return (
    <div>
      <h1 className="admin-title">System Overview</h1>
      
      {/* 📊 GRID CÁC THẺ THỐNG KÊ SỐ LIỆU */}
      <div className="stats-grid">
        
        {/* Thẻ 1: Users */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p>Total Users</p>
            <Users size={20} color="#38bdf8" />
          </div>
          <div className="stat-number">{stats.totalUsers || 0}</div>
          
          {/* Tận dụng dữ liệu phân loại Role từ Backend gửi về */}
          <div className="stat-detail">
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Candidates:</span> 
              <strong style={{ color: '#fff' }}>{stats.candidatesCount || 0}</strong>
            </span>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Recruiters (HR):</span> 
              <strong style={{ color: '#fff' }}>{stats.hrCount || 0}</strong>
            </span>
          </div>
        </div>

        {/* Thẻ 2: Pending Jobs */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p>Pending Jobs</p>
            <Briefcase size={20} color="#eab308" />
          </div>
          <div className="stat-number" style={{ color: stats.pendingJobs > 0 ? '#eab308' : '#38bdf8' }}>
            {stats.pendingJobs || 0}
          </div>
          <div className="stat-detail">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: stats.pendingJobs > 0 ? '#f87171' : '#34d399' }}>
              {stats.pendingJobs > 0 ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
              {stats.pendingJobs > 0 ? 'Requires immediate review' : 'All jobs processed'}
            </span>
          </div>
        </div>

        {/* Thẻ 3: Total Applications */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p>Total Applications</p>
            <FileText size={20} color="#34d399" />
          </div>
          <div className="stat-number" style={{ color: '#34d399' }}>{stats.totalApplications || 0}</div>
          <div className="stat-detail">
            <span style={{ color: '#94a3b8' }}>Successful connections via system</span>
          </div>
        </div>

      </div>

      {/* 📋 KHU VỰC HIỂN THỊ THÔNG TIN NHANH PHÍA DƯỚI (QUY MÔ BÀI BÀI TẬP LỚN NÊN CÓ) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px', maxWidth: '1200px' }}>
        
        {/* Khối bên trái: Hoạt động gần đây */}
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#38bdf8', marginBottom: '16px', fontSize: '16px' }}>System Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #334155' }}>
              <span>Database Connection:</span>
              <span style={{ color: '#34d399', fontWeight: 'bold' }}>Connected (MySQL)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #334155' }}>
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
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ color: '#38bdf8', marginBottom: '8px', fontSize: '16px' }}>Quick Actions Panel</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 16px 0' }}>
            Use the sidebar navigation to manage company requests, review candidate reports, or update platform skills.
          </p>
        </div>

      </div>
    </div>
  );
}