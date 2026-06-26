import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CandidateAppliedJobsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/candidate/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data);
    } catch (err) {
      console.error('Error loading application history:', err);
      setError('Cannot load application history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Applied':
        return <span className="badge bg-secondary text-white px-3 py-2 rounded-pill">Applied</span>;
      case 'Reviewing':
        return <span className="badge bg-info text-dark px-3 py-2 rounded-pill">Reviewing</span>;
      case 'Interviewing':
        return <span className="badge bg-primary text-white px-3 py-2 rounded-pill">Interviewing</span>;
      case 'Offered':
        return <span className="badge bg-success text-white px-3 py-2 rounded-pill">Offered</span>;
      case 'Rejected':
        return <span className="badge bg-danger text-white px-3 py-2 rounded-pill">Rejected</span>;
      default:
        return <span className="badge bg-light text-dark px-3 py-2 rounded-pill">{status}</span>;
    }
  };

  return (
    <div className="card border-0 shadow-sm animate-fade-in">
      {/* Header */}
      <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
          <i className="fas fa-history text-primary"></i> Applied Jobs
        </h5>
      </div>

      {/* Body */}
      <div className="card-body p-4 scrollable-applied-jobs" style={{ height: '70vh', overflowY: 'auto' }}>
        {error && (
          <div className="alert alert-danger py-2 px-3 small border-0 shadow-sm" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>{error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p>Loading application history...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3">
              <i className="fas fa-box-open text-muted" style={{ fontSize: '4rem', opacity: 0.5 }}></i>
            </div>
            <h5 className="text-muted fw-semibold">You have not applied to any jobs yet!</h5>
            <p className="text-muted small">Discover exciting job opportunities today.</p>
            <button
              className="btn btn-primary mt-2 rounded-pill px-4"
              onClick={() => navigate('/dashboard')}
            >
              Explore Jobs
            </button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {applications.map(app => (
              <div key={app.id} className="card border rounded shadow-sm hover-shadow transition-all">
                <div className="card-body p-3 p-md-4">
                  <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">

                    {/* Job & Company Info */}
                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                      <div
                        className="bg-white border rounded shadow-sm d-flex align-items-center justify-content-center"
                        style={{ width: '60px', height: '60px', overflow: 'hidden' }}
                      >
                        {app.companyLogo ? (
                          <img src={app.companyLogo} alt={app.companyName} className="img-fluid" style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                        ) : (
                          <i className="fas fa-building text-secondary fs-3"></i>
                        )}
                      </div>
                      <div>
                        <h6 className="mb-1 fw-bold text-dark">{app.jobTitle}</h6>
                        <div className="text-muted small mb-1">
                          <i className="fas fa-briefcase me-1"></i> {app.companyName}
                        </div>
                        <div className="text-muted small">
                          <i className="far fa-clock me-1"></i> Applied on: {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>

                    {/* CV Info & Status */}
                    <div className="d-flex flex-column align-items-md-end gap-2" style={{ minWidth: '150px' }}>
                      <div>{getStatusBadge(app.status)}</div>
                      <div className="d-flex align-items-center gap-1 mt-2 text-primary small" title="CV used for application">
                        <i className="far fa-file-alt"></i>
                        <span className="text-truncate d-inline-block" style={{ maxWidth: '120px' }}>{app.cvName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .hover-shadow:hover {
          box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
          transform: translateY(-2px);
        }
        .transition-all {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default CandidateAppliedJobsPage;
