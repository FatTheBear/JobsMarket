import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MyApplications.css';

const STATUS_COLORS = {
  Applied:      { bg: '#eff6ff', color: '#3b82f6', label: 'Applied' },
  Reviewing:    { bg: '#fefce8', color: '#ca8a04', label: 'Reviewing' },
  Interviewing: { bg: '#f0fdf4', color: '#16a34a', label: 'Interviewing' },
  Offered:      { bg: '#f0fdf4', color: '#15803d', label: 'Offered' },
  Rejected:     { bg: '#fef2f2', color: '#dc2626', label: 'Rejected' },
};

export default function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) { setLoading(false); return; }
      const user = JSON.parse(userStr);
      const res = await axios.get(`http://localhost:5000/api/applications/candidate/${user.id}`);
      setApplications(res.data || []);
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const statuses = ['All', 'Applied', 'Reviewing', 'Interviewing', 'Offered', 'Rejected'];

  const filtered = filter === 'All'
    ? applications
    : applications.filter(a => a.status === filter);

  return (
    <div className="ma-page">
      {/* Header */}
      <div className="ma-header">
        <div>
          <div className="ma-breadcrumb">Dashboard / My Applications</div>
          <h1 className="ma-title">My Applications</h1>
          <p className="ma-subtitle">Track the status of all your job applications in one place.</p>
        </div>
        <button className="ma-find-btn" onClick={() => navigate('/jobs')}>
          🔍 Find More Jobs
        </button>
      </div>

      {/* Stats */}
      <div className="ma-stats-row">
        {statuses.slice(1).map(s => {
          const count = applications.filter(a => a.status === s).length;
          const style = STATUS_COLORS[s] || { bg: '#f1f5f9', color: '#64748b' };
          return (
            <div key={s} className="ma-stat-card" style={{ borderTop: `3px solid ${style.color}` }}>
              <span className="ma-stat-num" style={{ color: style.color }}>{count}</span>
              <span className="ma-stat-label">{s}</span>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="ma-filter-tabs">
        {statuses.map(s => (
          <button
            key={s}
            className={`ma-tab ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s}
            <span className="ma-tab-count">
              {s === 'All' ? applications.length : applications.filter(a => a.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {/* Application List */}
      <div className="ma-list">
        {loading ? (
          <div className="ma-empty">Loading your applications...</div>
        ) : filtered.length === 0 ? (
          <div className="ma-empty">
            <div className="ma-empty-icon">📋</div>
            <h3>No applications found</h3>
            <p>
              {filter === 'All'
                ? "You haven't applied to any jobs yet."
                : `No applications with status "${filter}".`}
            </p>
            {filter === 'All' && (
              <button className="ma-find-btn" onClick={() => navigate('/jobs')}>
                Browse Jobs
              </button>
            )}
          </div>
        ) : (
          filtered.map(app => {
            const style = STATUS_COLORS[app.status] || { bg: '#f1f5f9', color: '#64748b', label: app.status };
            return (
              <div key={app.id} className="ma-card">
                <div className="ma-card-logo">
                  {app.logo_url
                    ? <img src={app.logo_url} alt="logo" />
                    : <div className="ma-logo-placeholder">🏢</div>}
                </div>

                <div className="ma-card-info">
                  <h3
                    className="ma-job-title"
                    onClick={() => navigate(`/jobs/${app.job_id}`)}
                  >
                    {app.job_title}
                  </h3>
                  <div className="ma-company">{app.company_name}</div>
                  <div className="ma-meta">
                    <span>📅 Applied: {new Date(app.applied_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    {app.location && <span>📍 {app.location}</span>}
                  </div>
                </div>

                <div className="ma-card-right">
                  <span
                    className="ma-status-badge"
                    style={{ background: style.bg, color: style.color }}
                  >
                    {style.label}
                  </span>
                  <button
                    className="ma-view-btn"
                    onClick={() => navigate(`/jobs/${app.job_id}`)}
                  >
                    View Job
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
