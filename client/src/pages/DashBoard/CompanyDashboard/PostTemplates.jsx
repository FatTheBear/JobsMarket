import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PostTemplates.module.css";

export default function PostTemplates() {
  const navigate = useNavigate();
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const templates = [
    {
      title: "Frontend Developer",
      content: "We are looking for a Frontend Developer with experience in React.js, modern JavaScript, and building responsive user interfaces.",
      icon: "💻",
      bg: "#eff6ff",
      color: "#3b82f6"
    },
    {
      title: "Backend Developer",
      content: "We are looking for a Backend Developer with experience in Node.js, Express, and MySQL to design and build scalable APIs.",
      icon: "⚙️",
      bg: "#f0fdf4",
      color: "#22c55e"
    },
    {
      title: "UI/UX Designer",
      content: "We are seeking a creative UI/UX Designer to design user-friendly web applications and create intuitive wireframes.",
      icon: "🎨",
      bg: "#fdf4ff",
      color: "#d946ef"
    },
    {
      title: "QA Engineer",
      content: "We are hiring a QA Engineer to ensure software quality through testing and automation, creating robust test suites.",
      icon: "🔍",
      bg: "#fff7ed",
      color: "#f97316"
    },
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Job Post Templates</h1>
          <p className={styles.subtitle}>Save time by using our pre-written templates for your next job posting.</p>
        </div>
        <button className={styles.createBtn} onClick={() => navigate("/company/post-job")}>
          <span>+</span> Create Blank Job
        </button>
      </div>

      <div className={styles.templatesGrid}>
        {templates.map((template) => (
          <div key={template.title} className={styles.templateCard}>
            <div className={styles.cardHeader}>
              <div 
                className={styles.iconWrapper} 
                style={{ background: template.bg, color: template.color }}
              >
                {template.icon}
              </div>
              <h3 className={styles.cardTitle}>{template.title}</h3>
            </div>
            
            <p className={styles.cardContent}>{template.content}</p>
            
            <div className={styles.cardFooter}>
              <button 
                className={styles.actionBtn}
                onClick={() => setPreviewTemplate(template)}
              >
                Preview
              </button>
              <button 
                className={`${styles.actionBtn} ${styles.useBtn}`}
                onClick={() => navigate("/company/post-job")}
              >
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className={styles.modalOverlay} onClick={() => setPreviewTemplate(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  className={styles.iconWrapper} 
                  style={{ background: previewTemplate.bg, color: previewTemplate.color, width: '40px', height: '40px', fontSize: '20px' }}
                >
                  {previewTemplate.icon}
                </div>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>{previewTemplate.title}</h2>
              </div>
              <button className={styles.closeBtn} onClick={() => setPreviewTemplate(null)}>✕</button>
            </div>
            
            <div className={styles.modalBody}>
              <h4>Job Description</h4>
              <p>{previewTemplate.content}</p>
              
              <h4>Requirements</h4>
              <p>
                • Minimum 2 years of proven experience in the related field.<br/>
                • Strong analytical and problem-solving skills.<br/>
                • Excellent teamwork and communication abilities.<br/>
                • Passion for continuous learning and adaptation.
              </p>
            </div>
            
            <div className={styles.modalFooter}>
              <button className={styles.actionBtn} onClick={() => setPreviewTemplate(null)}>Close</button>
              <button 
                className={`${styles.actionBtn} ${styles.useBtn}`}
                onClick={() => navigate("/company/post-job")}
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}