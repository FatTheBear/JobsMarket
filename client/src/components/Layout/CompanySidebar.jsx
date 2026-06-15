import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function CompanySidebar() {
  // Lấy URL hiện tại để biết tab nào đang được chọn (active)
  const location = useLocation();

  // Biến tạm để giả lập số lượng (bạn có thể thay bằng props sau)
  const APPLICANTS_DATA = [];

  return (
    <aside className="jp-sidebar">
      <div className="jp-sidebar-brand">JobsMarket</div>

      <div className="jp-sidebar-section-title">
        <span className="jp-sidebar-icon">☰</span>
        Dashboard
      </div>
      <Link
        to="/company/dashboard"
        className={`jp-menu-item ${location.pathname === "/company/dashboard" ? "active" : ""
          }`}
      >
        Dashboard
      </Link>

      <div className="jp-menu-group">
        <div className="jp-menu-title">JOB MANAGEMENT</div>

        <Link to="/company/jobs" className="jp-menu-item">
          Job List <span>0</span>
        </Link>

        <Link
          to="/company/post-job"
          className={`jp-menu-item ${location.pathname.includes('/post-job') ? 'active' : ''}`}
        >
          Post a New Job
        </Link>
      </div>

      <div className="jp-menu-group">
        <div className="jp-menu-title">CANDIDATE MANAGEMENT</div>

        <Link
          to="/company/applicants"
          className={`jp-menu-item ${location.pathname.includes('/applicants') ? 'active' : ''}`}
        >
          Applied Candidates <span>{APPLICANTS_DATA.length}</span>
        </Link>

        <Link to="/company/saved-candidates" className="jp-menu-item">
          Saved Candidates <span>0</span>
        </Link>

        <Link to="/company/unlocked-contacts" className="jp-menu-item">
          Unlocked Contacts
        </Link>

        <Link to="/company/supported" className="jp-menu-item">
          Supported Candidates <span>0</span>
        </Link>

        <Link to="/company/connection-requests" className="jp-menu-item">
          Connection Requests
        </Link>

        <Link to="/company/search" className="jp-menu-item">
          Search Candidates
        </Link>
      </div>

      <div className="jp-promo-card">
        <div className="jp-promo-title">NEW FEATURE</div>
        <div className="jp-promo-action">Connect via Zalo</div>
      </div>
    </aside>
  );
}