import { Outlet, useLocation, useNavigate } from "react-router-dom";
import CompanySidebar from "../../../components/Layout/CompanySidebar";
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

import styles from './CompanyDashBoard.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function CompanyDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ jobs: 0, applications: 0, views: 0 });


  const isDashboard =
    location.pathname === "/company" ||
    location.pathname === "/company/dashboard";

  const [appStats, setAppStats] = useState([]);
  const [newsList, setNewsList] = useState([]);//begin
  const [pipeline, setPipeline] = useState(null);
  useEffect(() => {
    fetch("http://localhost:5000/api/company/dashboard/applications")
      .then(res => res.json())
      .then(data => setAppStats(data))
      .catch(err => console.error(err));
  }, []);
  useEffect(() => {
    fetch("http://localhost:5000/api/public/news?category=Hiring%20Insights")
      .then((res) => {
        if (!res.ok) throw new Error("Server response not ok");
        return res.json();
      })
      .then((data) => {
        console.log("data from server:", data);
        if (Array.isArray(data)) {
          setNewsList(data.slice(0, 4));
        }
      })
      .catch((err) => console.error("Error fetching news:", err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/company/dashboard/stats", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.jobs !== "undefined") {
          setStats({
            jobs: data.jobs || 0,
            applications: data.applications || 0,
            views: data.views || 0
          });
        }
      })
      .catch(err => console.error("Error fetching stats:", err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/company/dashboard/application-pipeline", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPipeline(data))
      .catch(err => console.error("Error fetching pipeline:", err));
  }, []);



  const chartData = {
    labels: Array.isArray(appStats)
      ? appStats.map((item) => new Date(item.day).toLocaleDateString())
      : [],
    datasets: [
      {
        label: "# Applications",
        data: Array.isArray(appStats) ? appStats.map((item) => item.total) : [],
        borderColor: "#1976d2",
        backgroundColor: "#1976d2",
        tension: 0.3,
      },
    ],
  };
  const pipelineData = {
    labels: ['Applied', 'Reviewing', 'Interviewing', 'Offered', 'Rejected'],
    datasets: [
      {
        label: '# Applications',
        data: pipeline
          ? [pipeline.Applied, pipeline.Reviewing, pipeline.Interviewing, pipeline.Offered, pipeline.Rejected]
          : [0, 0, 0, 0, 0],
        backgroundColor: ['#01796F', '#0ea5e9', '#8b5cf6', '#10b981', '#ef4444'],
        borderRadius: 6,
      },
    ],
  };

  const pipelineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

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

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "400px",
              }}
            >
              <Line
                data={chartData}
                options={chartOptions}
              />
            </div>
          </div>

        </div>

        {/* Application Pipeline — riêng cho công ty này */}
        <div className={styles.chartSection} style={{ marginTop: 20 }}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Application Pipeline</h2>
          </div>
          <div style={{ background: "#fff", padding: "20px", borderRadius: "8px" }}>
            <div style={{ width: "100%", height: "320px" }}>
              <Bar data={pipelineData} options={pipelineOptions} />
            </div>
          </div>
        </div>

        {/* Cards */}
        <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {newsList.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/news-detail/${item.id}`)}
              style={{
                background: "#fff",
                borderRadius: "8px",
                padding: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "15px",
                border: "1px solid #e2e8f0"
              }}
            >
              <img
                src={item.thumbnail_url
                  ? (item.thumbnail_url.startsWith("http") ? item.thumbnail_url : `http://localhost:5000${item.thumbnail_url}`)
                  : "https://picsum.photos/100/70"}
                alt="thumbnail"
                style={{ width: "100px", height: "70px", objectFit: "cover", borderRadius: "4px" }}
              />
              <div>
                <h4 style={{ margin: "0 0 5px 0", fontSize: "15px" }}>{item.title}</h4>
                <span style={{ fontSize: "12px", color: "#01796F", fontWeight: "bold" }}>
                  {item.category_name || "General"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}