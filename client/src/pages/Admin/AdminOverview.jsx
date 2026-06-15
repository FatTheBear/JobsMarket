import React from 'react';
import {  Users, Briefcase, FileText, CheckCircle, AlertTriangle, Building2, Wallet, Newspaper,FileBadge, Wrench } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList} from 'recharts';

export default function AdminOverview({ stats }) {
  if (!stats) return <p className="loading-text" style={{ color: '#64748b', padding: '20px' }}>Loading data...</p>;

const chartData = [
  {
    name: "Approved",
    value: stats.approvedJobs
  },
  {
    name: "Pending",
    value: stats.pendingJobs
  },
  {
    name: "Rejected",
    value: stats.rejectedJobs
  }
];

  return (
    <div>
      <h1 className="admin-title">System Overview</h1>
      
      {/* 📊 GRID CÁC THẺ THỐNG KÊ SỐ LIỆU */}
      <div className="stats-grid">
        
        {/* Thẻ 1: Users */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p>Total Users</p>
            <Users size={20} color="#01796F" />
          </div>
          <div className="stat-number" style={{ color: '#01796F' }}>{stats.totalUsers || 0}</div>
          
          <div className="stat-detail">
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Candidates:</span> 
              <strong style={{ color: '#01796F' }}>{stats.candidatesCount || 0}</strong>
            </span>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Recruiters (HR):</span> 
              <strong style={{ color: '#01796F' }}>{stats.hrCount || 0}</strong>
            </span>
          </div>
        </div>


        {/* Thẻ 2: Pending Jobs */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p>Pending Jobs</p>
            <Briefcase size={20} color="#d97706" />
          </div>
          <div className="stat-number" style={{ color: stats.pendingJobs > 0 ? '#d97706' : '#01796F' }}>
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
            <FileText size={20} color="#01796F" />
          </div>
          <div className="stat-number" style={{ color: '#01796F' }}>{stats.totalApplications || 0}</div>
          <div className="stat-detail">
            <span style={{ color: '#64748b' }}>Successful connections via system</span>
          </div>
        </div>

         {/* Companies */}
  <div className="stat-card">
    <p>Companies</p>
    <div className="stat-number">
      {stats.totalCompanies || 0}
    </div>
  </div>

  {/* Revenue */}
  <div className="stat-card">
    <p>Revenue</p>
    <div className="stat-number">
      ${(stats.totalRevenue || 0).toLocaleString()}
    </div>
  </div>

  {/* News */}
  <div className="stat-card">
    <p>News</p>
    <div className="stat-number">
      {stats.totalNews || 0}
    </div>
  </div>

  {/* CV Uploads */}
  <div className="stat-card">
    <p>CV Uploads</p>
    <div className="stat-number">
      {stats.totalCVs || 0}
    </div>
  </div>

  {/* Skills */}
  <div className="stat-card">
    <p>Skills</p>
    <div className="stat-number">
      {stats.totalSkills || 0}
    </div>
  </div>
      </div>

      

<div
  className="table-container"
  style={{
    marginTop: "24px",
    padding: "20px",
    height: "350px"
  }}
>
  <h3
    style={{
      color: "#01796F",
      marginBottom: "20px"
    }}
  >
    Job Status Overview
  </h3>

  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      data={chartData}
      margin={{
        top: 30,
        right: 20,
        left: 0,
        bottom: 10
      }}
    >
      <CartesianGrid
        stroke="#334155"
        strokeDasharray="3 3"
        vertical={false}
      />

      <XAxis
        dataKey="name"
        tick={{ fill: "#94a3b8" }}
        axisLine={false}
        tickLine={false}
      />

      <YAxis
        tick={{ fill: "#94a3b8" }}
        axisLine={false}
        tickLine={false}
      />

      <Tooltip
        contentStyle={{
          background: "#0f172a",
          border: "1px solid #334155",
          borderRadius: "8px",
          color: "#fff"
        }}
      />

      <Bar
        dataKey="value"
        radius={[8, 8, 0, 0]}
      >
        <LabelList
          dataKey="value"
          position="top"
          fill="#e2e8f0"
        />

        {chartData.map((entry, index) => (
          <Cell
            key={index}
            fill={
              entry.name === "Approved"
                ? "#01796F"
                : entry.name === "Pending"
                ? "#b0c4de"
                : "#5a5a5a"
            }
          />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>


      {/* 📋 KHU VỰC HIỂN THỊ THÔNG TIN NHANH PHÍA DƯỚI */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px', maxWidth: '1200px' }}>
        
        {/* Khối bên trái: Hoạt động gần đây */}
        <div className="table-container" style={{ padding: '20px' }}>
  <h3
    style={{
      color: '#01796F',
      marginBottom: '16px',
      fontSize: '16px'
    }}
  >
    System Status
  </h3>

  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      fontSize: '14px',
      color: '#475569'
    }}
  >
    <div className="health-box">

      <div className="health-row">
        <span>Pending Jobs</span>
        <strong>{stats.pendingJobs || 0}</strong>
      </div>

      <div className="health-row">
        <span>Rejected Jobs</span>
        <strong>{stats.rejectedJobs || 0}</strong>
      </div>

      <div className="health-row">
        <span>Pending Transactions</span>
        <strong>{stats.pendingTransactions || 0}</strong>
      </div>

      <div className="health-row">
        <span>Total Companies</span>
        <strong>{stats.totalCompanies || 0}</strong>
      </div>

    </div>

    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingBottom: '8px',
        borderBottom: '1px solid #e2e8f0'
      }}
    >
      <span>Active Postings:</span>
      <span>{stats.approvedJobs || 0} approved jobs</span>
    </div>

    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between'
      }}
    >
      <span>Total Industries:</span>
      <span>{stats.industriesCount || 0} categories</span>
    </div>
  </div>
</div>
        {/* Khối bên phải: Mẹo cho Admin */}
        <div className="table-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ color: '#01796F', marginBottom: '8px', fontSize: '16px' }}>Quick Actions Panel</h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px 0' }}>
            Use the sidebar navigation to manage company requests, review candidate reports, or update platform skills.
          </p>
        </div>
      </div>
    </div>
  );
}