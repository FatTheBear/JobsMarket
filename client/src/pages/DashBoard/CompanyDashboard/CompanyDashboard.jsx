import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import CompanySidebar from "../../../components/Layout/CompanySidebar";

export default function CompanyDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard =
    location.pathname === "/company" ||
    location.pathname === "/company/dashboard";

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
              height: "300px",
              border: "1px solid #ddd",
              position: "relative",
              background: "#fff",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                borderTop: "2px solid #1976d2",
              }}
            />

            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                color: "#1976d2",
                fontWeight: "bold",
              }}
            >
              # Applications
            </div>
          </div>
        </div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {[
            {
              title: "Job Management Guide",
              desc: "Tips and templates for creating attractive job posts.",
            },
            {
              title: "Candidate Management Guide",
              desc: "Best practices for managing applicants effectively.",
            },
            {
              title: "Frequently Asked Questions",
              desc: "Answers to the most common employer questions.",
            },
            {
              title: "Terms of Service",
              desc: "Read the platform terms and employer policies.",
            },
          ].map((card) => (
            <div
              key={card.title}
              onClick={() => navigate("/company/templates")}
              style={{
                background: "#fff",
                borderRadius: "8px",
                padding: "20px",
                cursor: "pointer",
                transition: "0.2s",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  color: "#1976d2",
                }}
              >
                {card.title}
              </h3>

              <p style={{ color: "#666" }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}