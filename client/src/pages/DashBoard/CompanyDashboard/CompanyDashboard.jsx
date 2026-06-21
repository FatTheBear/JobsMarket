import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import CompanySidebar from "../../../components/Layout/CompanySidebar";
import styles from "./CompanyDashBoard.module.css";

export default function CompanyDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ jobs: 0, applications: 0, views: 0 });

  const isDashboard =
    location.pathname === "/company" ||
    location.pathname === "/company/dashboard";

  // Mock fetch stats
  useEffect(() => {
    if (isDashboard) {
      setStats({
        jobs: 12,
        applications: 145,
        views: 1250
      });
    }
  }, [isDashboard]);

  if (!isDashboard) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <div style={{ width: "250px", flexShrink: 0 }}>
          <CompanySidebar />
        </div>
        <div style={{ flex: 1, minWidth: 0, backgroundColor: "#f5f7fa", padding: "20px" }}>
          <Outlet />
        </div>
      </div>
    );
  }

  const GUIDES = [
    {
      title: "Job Management Guide",
      desc: "Tips and templates for creating attractive job posts that convert.",
      icon: "📝",
      path: "/company/templates"
    },
    {
      title: "Candidate Management",
      desc: "Best practices for screening and managing applicants effectively.",
      icon: "👥",
      path: "/company/applicants"
    },
    {
      title: "Frequently Asked Questions",
      desc: "Answers to the most common questions from top employers.",
      icon: "❓",
      path: "#"
    },
    {
      title: "Platform Policies",
      desc: "Read the platform terms, conditions and employer policies.",
      icon: "⚖️",
      path: "#"
    },
  ];

  const handleCardClick = (path) => {
    if (path === "#") {
      alert("This feature is currently under development (Coming soon)!");
    } else {
      navigate(path);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ width: "250px", flexShrink: 0 }}>
        <CompanySidebar />
      </div>

      <div className={styles.dashboardContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dashboard Overview</h1>
          <p className={styles.subtitle}>Welcome back! Here's what's happening with your job postings today.</p>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#eff6ff', color: '#3b82f6' }}>💼</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.jobs}</span>
              <span className={styles.statLabel}>Active Jobs</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#f0fdf4', color: '#22c55e' }}>📄</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.applications}</span>
              <span className={styles.statLabel}>Total Applications</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#fef2f2', color: '#ef4444' }}>👁️</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.views.toLocaleString()}</span>
              <span className={styles.statLabel}>Profile Views</span>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className={styles.chartSection}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Applicant Statistics</h2>
            <select className={styles.chartSelect}>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          
          <div className={styles.chartPlaceholder}>
            <div className={styles.chartPlaceholderIcon}>📊</div>
            <div className={styles.chartPlaceholderText}>Not enough data to generate chart for this period.</div>
          </div>
        </div>

        {/* Guides Section */}
        <h2 className={styles.guidesTitle}>Resources & Guides</h2>
        <div className={styles.guidesGrid}>
          {GUIDES.map((card) => (
            <div
              key={card.title}
              onClick={() => handleCardClick(card.path)}
              className={styles.guideCard}
            >
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
              <div className={styles.guideIcon}>{card.icon}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}