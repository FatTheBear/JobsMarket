import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchJobs.css';

const API_URL = 'http://localhost:5000';

export default function SearchJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search filter state
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');

  // Load jobs on first visit and whenever filters change
  useEffect(() => {
    fetchJobs();
  }, [location, salary]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/jobs/search`, {
        params: {
          q: keyword.trim(),
          location: location,
          salary: salary,
        },
      });
      setJobs(response.data || []);
    } catch (error) {
      console.error('Error searching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="search-jobs-container">
      {/* SEARCH BAR & FILTERS */}
      <div className="search-header-box">
        <form onSubmit={handleSearch} className="search-form-grid">
          <div className="search-input-group">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Enter job title, position, or skill..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">All locations</option>
            <option value="Ho Chi Minh">Ho Chi Minh City</option>
            <option value="Hanoi">Hanoi</option>
            <option value="Da Nang">Da Nang</option>
          </select>

          <select value={salary} onChange={(e) => setSalary(e.target.value)}>
            <option value="">All salary ranges</option>
            <option value="Negotiable">Negotiable</option>
            <option value="Under 10 million">Under 10 million VND</option>
            <option value="10 - 20 million">10 - 20 million VND</option>
            <option value="Over 20 million">Over 20 million VND</option>
          </select>

          <button type="submit" className="search-submit-btn">
            Search
          </button>
        </form>
      </div>

      {/* SEARCH RESULTS */}
      <div className="search-results-section">
        <div className="results-count">
          {loading ? 'Searching...' : `Found ${jobs.length} matching jobs`}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : jobs.length > 0 ? (
          <div className="jobs-grid-layout">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="job-card-item"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <div className="job-card-left">
                  <div className="job-card-logo">
                    {job.logo_url ? (
                      <img src={job.logo_url} alt="Company Logo" />
                    ) : (
                      <div className="job-card-logo-placeholder">🏢</div>
                    )}
                  </div>
                  <div className="job-card-content">
                    <h3 className="job-card-title">{job.title}</h3>
                    <div className="job-card-company">
                      {job.company_name || 'JobsMarket Member Company'}
                    </div>

                    <div className="job-card-info-tags">
                      <span>📍 {job.company_address || 'Location not updated yet'}</span>
                      <span className="salary-tag">
                        💰{' '}
                        {job.salary_min && job.salary_max
                          ? `$${Number(job.salary_min).toLocaleString()} - $${Number(job.salary_max).toLocaleString()}`
                          : job.salary_min
                          ? `From $${Number(job.salary_min).toLocaleString()}`
                          : job.salary_max
                          ? `Up to $${Number(job.salary_max).toLocaleString()}`
                          : 'Negotiable'}
                      </span>
                    </div>

                    <div className="job-card-skills-list">
                      {job.skills && job.skills.length > 0 ? (
                        job.skills.map((skill) => (
                          <span key={skill.id} className="job-card-skill-tag">
                            {skill.name}
                          </span>
                        ))
                      ) : (
                        <span className="job-card-skill-tag">{job.job_type}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="job-card-right">
                  <button
                    className="view-detail-btn"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/jobs/${job.id}`);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results-box">
            <h3>No matching results found</h3>
            <p>Try another keyword or adjust the location / salary filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
