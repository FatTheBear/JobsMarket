import React, { useState, useEffect } from 'react';
import JobCard from './JobCard';
import JobDetail from './JobDetail';
import './JobList.css';

const API_URL = 'http://localhost:5000';

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch jobs from backend database on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/jobs`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch jobs from server');
        }
        
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        console.error('Error fetching jobs:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="job-list-container">
      <div className="job-list-header">
        <h2 className="job-list-heading">Explore Available Opportunities</h2>
        <p className="job-list-subheading">Find your next career move with JobsMarket</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="job-list-message loading">
          <div className="spinner"></div>
          <p>Loading jobs, please wait...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="job-list-message error">
          <p>Something went wrong: {error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && jobs.length === 0 && (
        <div className="job-list-message empty">
          <p>No jobs found. Check back later!</p>
        </div>
      )}

      {/* Data Render State */}
      {!loading && !error && jobs.length > 0 && (
        <div className="job-cards-grid">
          {jobs.map((jobItem) => (
            <JobCard 
              key={jobItem.id} 
              job={jobItem} 
              onSelect={(clickedJob) => setSelectedJob(clickedJob)} 
            />
          ))}
        </div>
      )}

      {/* Job Detail Modal Popup */}
      {selectedJob && (
        <JobDetail 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
        />
      )}
    </div>
  );
}