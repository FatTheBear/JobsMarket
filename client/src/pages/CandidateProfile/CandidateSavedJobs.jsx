import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import JobCard from '../../components/Jobs/JobCard';

const STORAGE_KEY = 'candidate_favorite_jobs';

const CandidateSavedJobs = () => {
  const navigate = useNavigate();
  const { favoriteJobs, setFavoriteJobs } = useOutletContext();
  const [savedJobs, setSavedJobs] = useState(favoriteJobs || []);

  const loadSavedJobs = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const jobs = stored ? JSON.parse(stored) : [];
    setSavedJobs(Array.isArray(jobs) ? jobs : []);
    if (setFavoriteJobs) setFavoriteJobs(Array.isArray(jobs) ? jobs : []);
  };

  useEffect(() => {
    loadSavedJobs();
    const handleFavoritesUpdated = () => loadSavedJobs();
    window.addEventListener('favoriteJobsUpdated', handleFavoritesUpdated);
    return () => window.removeEventListener('favoriteJobsUpdated', handleFavoritesUpdated);
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '12px', background: '#fff' }}>
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-3">
          <div>
            <h4 className="fw-bold mb-1">Saved Jobs</h4>
            <p className="text-muted mb-0">Keep your favorite jobs here so you can apply later.</p>
          </div>
          <div className="text-muted" style={{ minWidth: '140px' }}>
            {savedJobs.length === 0 ? 'No saved jobs yet.' : `${savedJobs.length} saved job${savedJobs.length > 1 ? 's' : ''}`}
          </div>
        </div>

        {savedJobs.length === 0 ? (
          <div className="border rounded-3 p-4 text-center text-muted" style={{ background: '#f8fafc' }}>
            <p className="mb-2" style={{ fontSize: '0.95rem' }}>You haven’t saved any jobs yet.</p>
            <button className="btn btn-outline-primary" type="button" onClick={() => navigate('/jobs')}>
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="row g-3">
            {savedJobs.map((job) => (
              <div key={job.id} className="col-12">
                <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '14px' }}>
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <div style={{ width: '64px', height: '64px', flexShrink: 0 }}>
                      <img
                        src={job.logo_url || '/img/default-avatar.png'}
                        alt="Company logo"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', background: '#eef2ff' }}
                      />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <h5 className="mb-1 text-dark" style={{ fontSize: '1rem' }}>{job.title || 'Untitled Job'}</h5>
                      <p className="mb-2 text-secondary" style={{ fontSize: '0.9rem' }}>{job.company_name || 'Unknown company'}</p>
                      <div className="d-flex flex-wrap gap-2">
                        <span className="badge bg-light text-dark">{job.job_type || 'Full-time'}</span>
                        <span className="badge bg-light text-dark">{job.salary_min && job.salary_max ? `$${job.salary_min} - $${job.salary_max}` : 'Negotiable'}</span>
                        <span className="badge bg-light text-dark">{job.province || job.district || job.exact_address || 'Location pending'}</span>
                      </div>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        View details
                      </button>
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        Apply now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateSavedJobs;
