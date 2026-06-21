import { Outlet, useLocation, useNavigate } from "react-router-dom";
import CompanySidebar from "../../../components/Layout/CompanySidebar";
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function CompanyDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard =
    location.pathname === "/company" ||
    location.pathname === "/company/dashboard";

  const [stats, setStats] = useState([]);
  const [newsList, setNewsList] = useState([]);//begin
  useEffect(() => {
    fetch("http://localhost:5000/api/company/dashboard/applications")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);
  useEffect(() => {
    fetch("http://localhost:5000/api/public/news")
      .then((res) => {
        if (!res.ok) throw new Error("Server response not ok");
        return res.json();
      })
      .then((data) => {
        console.log("Dữ liệu nhận được từ server:", data);
        if (Array.isArray(data)) {
          setNewsList(data.slice(0, 4));
        }
      })
      .catch((err) => console.error("Error fetching news:", err));
  }, []);



  const chartData = {
    labels: stats.map((item) =>
      new Date(item.day).toLocaleDateString()
    ),
    datasets: [
      {
        label: "# Applications",
        data: stats.map((item) => item.total),
        borderColor: "#1976d2",
        backgroundColor: "#1976d2",
        tension: 0.3,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  if (!isDashboard) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <div style={{ width: "250px" }}>
          <CompanySidebar />
        </div>

        <div
          style={{
            flex: 1,
            padding: "20px",
            backgroundColor: "#f5f7fa",
          }}
        >
          <Outlet />
        </div>
      </div>
    );
  }



  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ width: "250px" }}>
        <CompanySidebar />
      </div>

      <div
        style={{
          flex: 1,
          padding: "20px",
          backgroundColor: "#f5f7fa",
        }}
      >
        {/* Chart */}
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ margin: 0 }}>Applicant Statistics</h2>

            <select
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            >
              <option>Last 7 Days</option>
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