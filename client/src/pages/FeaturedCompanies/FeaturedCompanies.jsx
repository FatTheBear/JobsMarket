import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FeaturedCompanies.css';

const API_URL = 'http://localhost:5000';

export default function FeaturedCompanies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeaturedCompanies();
  }, []);

  const fetchFeaturedCompanies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/company-public/featured`);
      setCompanies(response.data || []);
    } catch (err) {
      console.error('Error fetching featured companies:', err);
      setError('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyClick = (companyId) => {
    navigate(`/company/${companyId}`);
  };

  if (loading) {
    return (
      <div className="fc-section">
        <h2 className="fc-title">Featured Companies</h2>
        <div className="fc-loading">Loading companies...</div>
      </div>
    );
  }

  if (error || companies.length === 0) {
    return (
      <div className="fc-section">
        <h2 className="fc-title">Featured Companies</h2>
        <div className="fc-empty">
          <p>{error || 'No featured companies available'}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="fc-section">
      <div className="fc-header">
        <h2 className="fc-title">Featured Companies</h2>
        <p className="fc-subtitle">Explore top employers on JobsMarket</p>
      </div>

      <div className="fc-companies-grid">
        {companies.map((company) => (
          <div
            key={company.id}
            className="fc-company-card"
            onClick={() => handleCompanyClick(company.id)}
          >
            {/* Logo Section */}
            <div className="fc-logo-container">
              <img
                src={company.logo_url || '/img/default-avatar.png'}
                alt={company.name}
                className="fc-company-logo"
              />
            </div>

            {/* Company Info */}
            <div className="fc-company-details">
              <h3 className="fc-company-name">{company.name}</h3>

              {company.industry_name && (
                <p className="fc-industry-tag">{company.industry_name}</p>
              )}

              {company.company_bio && (
                <p className="fc-company-bio">
                  {company.company_bio.substring(0, 80)}...
                </p>
              )}

              {/* Job Count Badge */}
              <div className="fc-job-count">
                <span className="fc-badge">{company.job_count} open jobs</span>
              </div>

              {/* Website Link */}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="fc-website-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  🌐 Visit Website
                </a>
              )}
            </div>

            {/* View Profile Button */}
            <button className="fc-view-profile-btn">
              View Profile →
            </button>
          </div>
        ))}
      </div>

      <div className="fc-footer">
        <button
          className="fc-view-all-btn"
          onClick={() => navigate('/search-jobs')}
        >
          Browse More Companies
        </button>
      </div>
    </section>
  );
}
