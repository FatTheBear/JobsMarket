import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PostTemplates() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const title = searchParams.get("title");

  const articles = {
    "Job Management Guide": {
      title: "Job Management Guide",
      content:
        "Learn how to create attractive job postings, manage openings, and track recruitment performance efficiently.",
    },

    "Candidate Management Guide": {
      title: "Candidate Management Guide",
      content:
        "Learn how to review applications, schedule interviews, communicate with candidates, and manage hiring workflows.",
    },

    "Frequently Asked Questions": {
      title: "Frequently Asked Questions",
      content:
        "Find answers to common employer questions regarding job posting, candidate management, and account settings.",
    },

    "Terms of Service": {
      title: "Terms of Service",
      content:
        "Review the platform policies, responsibilities, and conditions for using JobsMarket employer services.",
    },
  };

  const article = articles[title];

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "10px 16px",
          border: "none",
          borderRadius: "6px",
          background: "#1976d2",
          color: "#fff",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        ← Back
      </button>

      {article ? (
        <div
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "8px",
          }}
        >
          <h2>{article.title}</h2>
          <p>{article.content}</p>
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "8px",
          }}
        >
          <h2>Employer Resources</h2>
          <p>Select a guide from the dashboard.</p>
        </div>
      )}
    </div>
  );
}