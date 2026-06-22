import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CandidateApplications = ({ candidatePosts }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      // In a real app we'd get candidate ID from the logged-in user via token
      // We will assume the user object is stored in localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const res = await axios.get(`http://localhost:5000/api/applications/candidate/${user.id}`);
      setApplications(res.data || []);
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'bg-info text-white';
      case 'Reviewing': return 'bg-warning text-dark';
      case 'Interviewing': return 'bg-primary text-white';
      case 'Offered': return 'bg-success text-white';
      case 'Rejected': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  };

  return (
    <div className="col-12 mt-4">
      <div className="card border-0 shadow-sm analytics-card">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
            <div className="d-flex align-items-center gap-2">
              <span className="fs-5 fw-bold text-dark mb-0">Applied Jobs</span>
              <span className="badge bg-light text-muted border rounded-pill d-inline-flex align-items-center py-1.5 px-2.5 fw-normal small">
                {applications.length} jobs
              </span>
            </div>
            <i className="fas fa-briefcase text-primary fs-4"></i>
          </div>

          <div className="application-list d-flex flex-column gap-3 mt-3">
            {loading ? (
              <div className="text-center py-4 text-muted">Loading data...</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-5 text-muted small">
                <i className="fas fa-box-open fs-3 mb-2 text-muted opacity-50"></i>
                <p className="mb-0">You have not applied to any jobs yet.</p>
                <button 
                  className="btn btn-outline-primary btn-sm mt-3" 
                  onClick={() => navigate('/search-jobs')}
                >
                  Find Jobs Now
                </button>
              </div>
            ) : (
              applications.map(app => (
                <div key={app.id} className="p-3 border rounded bg-light hover-shadow-sm d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                    <img 
                      src={app.logo_url || 'https://via.placeholder.com/50'} 
                      alt="company logo" 
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} 
                    />
                    <div>
                      <h6 
                        className="mb-1 text-primary fw-bold" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/job/${app.job_id}`)}
                      >
                        {app.job_title}
                      </h6>
                      <p className="mb-1 text-muted small">{app.company_name}</p>
                      <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>
                        Applied on: {new Date(app.applied_at).toLocaleDateString('en-US')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className={`badge ${getStatusColor(app.status)} px-3 py-2 rounded-pill`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateApplications;
