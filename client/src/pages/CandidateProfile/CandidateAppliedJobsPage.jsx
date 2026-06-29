import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SocketContext } from '../../context/SocketContext';

const CandidateAppliedJobsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (socket) {
      const userId = localStorage.getItem('userId');
      if (userId) {
        socket.emit('join', userId);
        console.log(`CandidateAppliedJobsPage - User ${userId} joined socket room`);
      }

      const handleStatusUpdate = (data) => {
        console.log("Socket received application status update:", data);
        // data contains { applicationId, status }
        setApplications(prev => prev.map(app => 
          app.id === Number(data.applicationId) ? { ...app, status: data.status } : app
        ));
      };

      socket.on('application_status_updated', handleStatusUpdate);

      return () => {
        socket.off('application_status_updated', handleStatusUpdate);
      };
    }
  }, [socket]);

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
        return <span className="badge bg-secondary text-white fw-semibold">Applied</span>;
      case 'Reviewing':
        return <span className="badge bg-info text-dark fw-semibold">In Review</span>;
      case 'Interviewing':
        return <span className="badge bg-warning text-dark fw-semibold">Interview</span>;
      case 'Offered':
        return <span className="badge bg-success text-white fw-semibold">Hired</span>;
      case 'Rejected':
        return <span className="badge bg-danger text-white fw-semibold">Rejected</span>;
      default:
        return <span className="badge bg-light text-dark fw-semibold">{status}</span>;
    }
  };

  const getJobLevelBadge = (level) => {
    const lvl = level || 'Junior';
    switch (lvl) {
      case 'Intern':
      case 'Fresher':
        return <span className="badge bg-light text-info border border-info-subtle fw-semibold">{lvl}</span>;
      case 'Junior':
        return <span className="badge bg-light text-primary border border-primary-subtle fw-semibold">{lvl}</span>;
      case 'Middle':
      case 'Senior':
        return <span className="badge bg-light text-success border border-success-subtle fw-semibold">{lvl}</span>;
      case 'Manager':
      case 'Director':
        return <span className="badge bg-light text-warning border border-warning-subtle fw-semibold">{lvl}</span>;
      default:
        return <span className="badge bg-light text-secondary border fw-semibold">{lvl}</span>;
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
      <div className="card-body p-3 scrollable-applied-jobs" style={{ height: '70vh', overflowY: 'auto' }}>
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
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 custom-applied-table">
              <thead className="table-light text-secondary fw-semibold">
                <tr>
                  <th className="py-2 px-3">Applied Role</th>
                  <th className="py-2">Employment Type</th>
                  <th className="py-2">Job Level</th>
                  <th className="py-2">Applied Date</th>
                  <th className="py-2">Attachment</th>
                  <th className="py-2 text-end px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} onClick={() => navigate(`/jobs/${app.jobId}`)} style={{ cursor: 'pointer' }}>
                    {/* Applied Role */}
                    <td className="px-3">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="bg-white border rounded shadow-sm d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: '36px', height: '36px', overflow: 'hidden' }}
                        >
                          {app.companyLogo ? (
                            <img src={app.companyLogo} alt={app.companyName} className="img-fluid" style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                          ) : (
                            <i className="fas fa-building text-secondary fs-5"></i>
                          )}
                        </div>
                        <div className="job-title-cell">
                          <div className="fw-bold text-dark lh-sm" style={{ fontSize: '13px' }}>{app.jobTitle}</div>
                          <div className="text-muted small lh-sm" style={{ fontSize: '11px' }}>
                            <i className="fas fa-briefcase me-1"></i> {app.companyName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Employment Type */}
                    <td>
                      <span className="badge bg-light text-dark border border-secondary-subtle fw-semibold">
                        {app.employmentType}
                      </span>
                    </td>

                    {/* Job Level */}
                    <td>{getJobLevelBadge(app.jobLevel)}</td>

                    {/* Applied Date */}
                    <td className="text-muted fw-semibold small">
                      {new Date(app.appliedAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </td>

                    {/* Attachment */}
                    <td>
                      {app.cvUrl ? (
                        <a
                          href={app.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-decoration-none text-primary fw-bold d-inline-flex align-items-center gap-1 hover-underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="far fa-file-pdf text-danger fs-6"></i>
                          <span className="text-truncate d-inline-block" style={{ maxWidth: '80px' }} title={app.cvName}>
                            {app.cvName}
                          </span>
                        </a>
                      ) : (
                        <span className="text-muted small" onClick={(e) => e.stopPropagation()}>No CV</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="text-end px-3">{getStatusBadge(app.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .hover-underline:hover {
          text-decoration: underline !important;
        }
        .table-responsive {
          overflow-x: hidden !important;
        }
        .custom-applied-table th, 
        .custom-applied-table td {
          padding: 8px 6px !important;
          font-size: 13px !important;
          white-space: nowrap;
        }
        .custom-applied-table td:first-child, 
        .custom-applied-table th:first-child {
          padding-left: 12px !important;
        }
        .custom-applied-table td:last-child, 
        .custom-applied-table th:last-child {
          padding-right: 12px !important;
        }
        .custom-applied-table .job-title-cell {
          white-space: normal !important;
          max-width: 160px;
        }
        .custom-applied-table .badge {
          font-size: 11px !important;
          padding: 4px 8px !important;
          border-radius: 50rem !important;
        }
      `}</style>
    </div>
  );
};

export default CandidateAppliedJobsPage;
