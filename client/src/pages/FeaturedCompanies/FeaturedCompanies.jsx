import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FeaturedCompanies.css';

const API_URL = 'http://localhost:5000';

export default function FeaturedCompanies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

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

  const getValidLogo = (url) => {
    if (!url) return '/img/default-avatar.png';
    if (url.startsWith('data:image')) return url;
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  return (
    <section className="fc-section">
      <div className="fc-header">
        <h2 className="fc-title">Featured Companies</h2>
        <p className="fc-subtitle">Explore top employers on JobsMarket</p>
      </div>

      <div className="fc-carousel-wrapper">
        <button className="fc-nav-btn prev" onClick={() => {
          if (scrollRef.current) scrollRef.current.scrollBy({ left: -350, behavior: 'smooth' });
        }}>
          <i className="fa-solid fa-chevron-left"></i>
        </button>

        <div className="fc-companies-carousel" ref={scrollRef}>
        {companies.map((company) => (
          <div
            key={company.id}
            className="fc-company-card"
            onClick={() => handleCompanyClick(company.id)}
          >
            {/* Logo Section */}
            <div className="fc-logo-container">
              <img
                src={getValidLogo(company.logo_url)}
                onError={(e) => { e.target.onerror = null; e.target.src = '/img/default-avatar.png'; }}
                alt={company.name}
                className="fc-company-logo"
              />
            </div>

            {/* Company Info */}
            <div className="fc-company-details">
              <div className="fc-company-header">
                <h3 className="fc-company-name">{company.name}</h3>
                {company.industry_name && (
                  <p className="fc-industry-text">{company.industry_name}</p>
                )}
              </div>

              {/* Job Count Badge */}
              <div className="fc-job-count">
                <i className="fa-solid fa-briefcase"></i> {company.job_count || 0} open job{company.job_count !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        ))}
        </div>

        <button className="fc-nav-btn next" onClick={() => {
          if (scrollRef.current) scrollRef.current.scrollBy({ left: 350, behavior: 'smooth' });
        }}>
          <i className="fa-solid fa-chevron-right"></i>
        </button>
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
