import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AppliedCandidates.css';

export default function ViewAppliedCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/company/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidates(response.data);
    } catch (err) {
      setError("Failed to load candidates.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      setCandidates(candidates.map(cand => 
        cand.application_id === applicationId ? { ...cand, status: newStatus } : cand
      ));

      await axios.patch(`${API_URL}/api/company/applications/${applicationId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );

    } catch (err) {
      alert("Failed to update status.");
      fetchCandidates(); 
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Applied': return 'status-applied';
      case 'In-Review': return 'status-review';
      case 'Interview': return 'status-interview';
      case 'Hired': return 'status-hired';
      case 'Rejected': return 'status-rejected';
      default: return '';
    }
  };

  if (loading) return <div className="p-5 text-center theme-text-primary">Loading candidates...</div>;
  if (error) return <div className="p-5 text-center text-danger">{error}</div>;

  return (
    <div className="container-fluid py-4">
      <h4 className="mb-4 fw-bold theme-heading">Applied Candidates</h4>
      
      <div className="card border-0 shadow-sm custom-card-shadow">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 custom-table">
            <thead className="theme-table-header">
              <tr>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3">Applied Role</th>
                <th className="py-3">Employment Type</th>
                <th className="py-3">Applied Date</th>
                <th className="py-3">Skills</th>
                <th className="py-3 text-center">Attachment</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No applications found.</td>
                </tr>
              ) : (
                candidates.map((cand) => (
                  <tr key={cand.application_id}>
                    
                    <td className="px-4">
                      <div className="d-flex align-items-center gap-3">
                        <Link to={`/candidate/${cand.candidate_id}`}>
                          <img 
                            src={cand.candidate_avatar ? (cand.candidate_avatar.startsWith('http') ? cand.candidate_avatar : `${API_URL}${cand.candidate_avatar}`) : '/default-avatar.png'} 
                            alt="avatar" 
                            className="rounded-circle object-fit-cover avatar-border"
                          />
                        </Link>
                        <Link to={`/candidate/${cand.candidate_id}`} className="fw-semibold text-decoration-none text-primary hover-underline">
                          {cand.candidate_name}
                        </Link>
                      </div>
                    </td>

                    <td>
                      <div className="fw-semibold text-dark">{cand.applied_job}</div>
                    </td>

                    <td>
                      <span className="text-muted fw-medium">{cand.employment_type}</span>
                    </td>

                    <td className="text-muted">{new Date(cand.applied_at).toLocaleDateString('en-US')}</td>

                    <td>
                      <div className="text-truncate text-muted" style={{ maxWidth: '200px' }} title={cand.skills}>
                        {cand.skills || 'No skills listed'}
                      </div>
                    </td>

                    <td className="text-center">
                      <a 
                        href={`${API_URL}${cand.cv_url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-theme-outline rounded-pill px-3 fw-medium"
                      >
                        <i className="far fa-file-pdf me-1"></i> View CV
                      </a>
                    </td>

                    <td>
                      <select 
                        className={`form-select form-select-sm fw-semibold custom-status-select ${getStatusClass(cand.status)}`}
                        value={cand.status}
                        onChange={(e) => handleStatusChange(cand.application_id, e.target.value)}
                      >
                        <option value="Applied" className="text-dark">Applied</option>
                        <option value="In-Review" className="text-dark">In-Review</option>
                        <option value="Interview" className="text-dark">Interview</option>
                        <option value="Hired" className="text-dark">Hired</option>
                        <option value="Rejected" className="text-dark">Rejected</option>
                      </select>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}