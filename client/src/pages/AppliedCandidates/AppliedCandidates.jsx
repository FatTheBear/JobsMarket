import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './AppliedCandidates.css';

const API_URL = 'http://localhost:5000';

const STATUS_LABELS = {
  Applied: 'Applied',
  Reviewing: 'Reviewing',
  Interviewing: 'Interviewing',
  Offered: 'Offered',
  Rejected: 'Rejected',
};

const normalizeText = (text) =>
  text ? text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';

export default function AppliedCandidates() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({ search: '', status: 'all' });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const currentUserId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/applications/hr/${currentUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (applicant, e) => {
    e.stopPropagation(); // Prevent opening modal
    try {
      const currentUserId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/company/${currentUserId}/saved-candidates/${applicant.candidate_id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setApplications(prev => prev.map(app => {
        if (app.candidate_id === applicant.candidate_id) {
          return { ...app, is_saved: res.data.is_saved ? 1 : 0 };
        }
        return app;
      }));
    } catch (error) {
      console.error("Error saving candidate:", error);
      alert("Failed to save candidate");
    }
  };

  const filteredApplicants = useMemo(() => {
    return applications.filter((app) => {
      if (filters.status !== 'all' && app.status !== filters.status) return false;
      if (filters.search) {
        const query = normalizeText(filters.search);
        const haystack = normalizeText([
          app.candidate_name,
          app.phone,
          app.job_title,
          app.candidate_skills
        ].join(' '));
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [filters, applications]);

  const openApplicantProfile = (applicant) => setSelectedApplicant(applicant);
  const closeApplicantProfile = () => setSelectedApplicant(null);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading applicants...</div>;

  return (
    <div className="ac-container">
      <div className="ac-header">
        <div className="ac-breadcrumb">Dashboard / Applied Candidates</div>
        <h2 className="ac-title">Applied Candidates</h2>
      </div>

      <div className="ac-card ac-filter-card">
        <div className="ac-filter-grid">
          <div className="ac-filter-item ac-filter-full">
            <label>Search candidates</label>
            <input
              type="text"
              placeholder="Name, phone, job title, skills..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div className="ac-filter-item">
            <label>Status</label>
            <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}>
              <option value="all">All</option>
              <option value="Applied">Applied</option>
              <option value="Reviewing">Reviewing</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offered">Offered</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="ac-card ac-table-card">
        <div className="ac-table-wrapper">
          <table className="ac-data-table">
            <thead>
              <tr>
                <th>CANDIDATE</th>
                <th>APPLIED JOB</th>
                <th>STATUS</th>
                <th>DATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.length > 0 ? (
                filteredApplicants.map((app) => (
                  <tr key={app.id} className="ac-data-row" onClick={() => openApplicantProfile(app)}>
                    <td>
                      <div className="ac-applicant-name">{app.candidate_name}</div>
                      <div className="ac-applicant-meta">
                        {app.phone} • {app.years_of_experience ? `${app.years_of_experience} yrs exp` : 'No exp data'}
                      </div>
                    </td>
                    <td>
                      <div className="ac-job-title">{app.job_title}</div>
                      <div className="ac-applicant-meta">CV: {app.cv_name || 'Attached file'}</div>
                    </td>
                    <td>
                      <span className={`ac-status-badge ac-status-${app.status.toLowerCase()}`}>
                        {STATUS_LABELS[app.status] || app.status}
                      </span>
                    </td>
                    <td>{new Date(app.applied_at).toLocaleDateString('en-US')}</td>
                    <td>
                      <button 
                        className={`ac-save-btn ${app.is_saved > 0 ? 'saved' : ''}`}
                        onClick={(e) => handleToggleSave(app, e)}
                        title={app.is_saved > 0 ? "Unsave candidate" : "Save candidate"}
                      >
                        {app.is_saved > 0 ? '🔖 Saved' : '🔖 Save'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="ac-table-empty">
                    No candidates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PROFILE */}
      {selectedApplicant && (
        <div className="ac-modal-overlay" onClick={closeApplicantProfile}>
          <div className="ac-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ac-modal-header">
              <div>
                <div className="ac-modal-title">{selectedApplicant.candidate_name}</div>
                <div className="ac-modal-subtitle">{selectedApplicant.job_title}</div>
              </div>
              <button className="ac-close-btn" onClick={closeApplicantProfile}>×</button>
            </div>
            <div className="ac-modal-body">
              <div className="ac-modal-section">
                <h3>Contact Info</h3>
                <p>Phone: {selectedApplicant.phone}</p>
              </div>
              <div className="ac-modal-section">
                <h3>Application Details</h3>
                <p>Job: {selectedApplicant.job_title}</p>
                <p>Status: {selectedApplicant.status}</p>
                <p>Applied At: {new Date(selectedApplicant.applied_at).toLocaleString('en-US')}</p>
                <p>Skills: {selectedApplicant.candidate_skills || 'N/A'}</p>
              </div>
              <div className="ac-modal-section">
                <h3>CV Document</h3>
                {selectedApplicant.file_url ? (
                  <a href={selectedApplicant.file_url} target="_blank" rel="noreferrer" className="ac-btn-outline">
                    📄 View/Download CV
                  </a>
                ) : (
                  <p>No CV file available (Mock Data)</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
