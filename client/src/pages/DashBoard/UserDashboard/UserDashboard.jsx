import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UserDashboard.module.css';
import axios from 'axios';
import ApplyJobModal from './ApplyJobModal';
import JobCard from '../../../components/Jobs/JobCard';

const LOCATIONS = [
  'Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Binh Duong', 'Dong Nai', 'Can Tho'
];

const FALLBACK_TOP_COMPANIES = [
  { id: 'fpt', name: 'FPT Software', logo_url: '/icons/emp_fpt.png', openJobs: 1 },
  { id: 'vng', name: 'VNG Corporation', logo_url: '/icons/emp_vng.png', openJobs: 1 },
  { id: 'momo', name: 'MoMo', logo_url: '/icons/emp_momo.png', openJobs: 1 },
  { id: 'shopee', name: 'Shopee Vietnam', logo_url: '/icons/emp_shopee.png', openJobs: 1 },
  { id: 'grab', name: 'Grab Vietnam', logo_url: '/icons/emp_grab.png', openJobs: 1 },
];

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [bannerIdx, setBannerIdx] = useState(0);
  const bannerTimerRef = useRef(null);
  const [jobs, setJobs] = useState([]);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Industry banner slider
  const INDUSTRY_BANNERS = [
    { bg: 'linear-gradient(135deg, #1e3a6e 0%, #2563ab 60%, #1e5c8b 100%)', title: 'Information Technology', sub: 'Explore top tech roles: Software Engineering, Data Science, AI, and more.' },
    { bg: 'linear-gradient(135deg, #0f2d5e 0%, #c0392b 100%)', title: 'Finance & Banking', sub: 'Accelerate your career in Investment, Accounting, and Financial Analysis.' },
    { bg: 'linear-gradient(135deg, #1a4731 0%, #27ae60 100%)', title: 'Marketing & PR', sub: 'Unleash your creativity in Digital Marketing, Public Relations, and Brand Management.' },
  ];

  useEffect(() => {
    bannerTimerRef.current = setInterval(() => {
      setBannerIdx(prev => (prev + 1) % INDUSTRY_BANNERS.length);
    }, 4000);
    return () => clearInterval(bannerTimerRef.current);
  }, []);

  const handleSearch = () => {
    console.log("Searching for:", searchQuery, "in", selectedLocation);
  };

  const handleLogout = () => {
    navigate('/');
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/jobs');
        setJobs(response.data);
      } catch (error) {
        console.error("Error loading job list:", error);
      }
    };
    fetchJobs();
  }, [])

  const topCompanies = useMemo(() => {
    const companyMap = new Map();

    jobs.forEach((job) => {
      if (!job.company_name) return;
      const key = job.company_id || job.company_name;
      const current = companyMap.get(key) || {
        id: key,
        name: job.company_name,
        logo_url: job.logo_url,
        openJobs: 0,
      };
      current.openJobs += 1;
      if (!current.logo_url && job.logo_url) current.logo_url = job.logo_url;
      companyMap.set(key, current);
    });

    const companies = Array.from(companyMap.values()).slice(0, 5);
    return companies.length > 0 ? companies : FALLBACK_TOP_COMPANIES;
  }, [jobs]);

  return (
    <div className={styles.page}>

      {/* ───── INDUSTRY BANNER SLIDER ───── */}
      <section className={styles.banner} style={{ background: INDUSTRY_BANNERS[bannerIdx].bg }}>
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <div className={styles.bannerText}>
            <h1 className={styles.bannerTitle}>{INDUSTRY_BANNERS[bannerIdx].title}</h1>
            <p className={styles.bannerSub}>{INDUSTRY_BANNERS[bannerIdx].sub}</p>
          </div>

          {/* Search Box */}
          <div className={styles.searchBox}>
            <div className={styles.searchBoxTitle}>
              <h2>Find jobs that match your skills & passion</h2>
            </div>
            <div className={styles.searchRow}>
              <div className={styles.searchField}>
                <span className={styles.searchFieldIcon}>🔍</span>
                <input
                  className={styles.searchInput}
                  placeholder="Job title, keyword, company..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className={styles.searchDivider} />
              <div className={styles.searchField}>
                <span className={styles.searchFieldIcon}>📍</span>
                <select
                  className={styles.searchSelect}
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                >
                  <option value="">All locations</option>
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <button className={styles.searchBtn} onClick={handleSearch}>
                SEARCH
              </button>
            </div>
          </div>
        </div>

        {/* Banner dots */}
        <div className={styles.bannerDots}>
          {INDUSTRY_BANNERS.map((_, i) => (
            <button
              key={i}
              className={`${styles.bannerDot} ${i === bannerIdx ? styles.bannerDotActive : ''}`}
              onClick={() => setBannerIdx(i)}
            />
          ))}
        </div>
      </section>

      {/* ───── TOP COMPANIES ───── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Top Employers</h2>
          </div>

          <div className={styles.topCompaniesGrid}>
            {topCompanies.map((company) => (
              <button
                key={company.id}
                type="button"
                className={styles.topCompanyCard}
                onClick={() => {
                  setSearchQuery(company.name);
                  navigate('/search-jobs');
                }}
              >
                <span className={styles.topBadge}>💎 TOP</span>
                <img
                  className={styles.topCompanyLogo}
                  src={company.logo_url || '/default-company-logo.png'}
                  alt={`${company.name} logo`}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ───── AVAILABLE JOB POSTINGS ───── */}
      <section className={`${styles.section} ${styles.sectionGray}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>RECOMMENDED FOR YOU</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onApply={() => {
                  setSelectedJob(job);
                  setShowApplyModal(true);
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <ApplyJobModal
        show={showApplyModal}
        onClose={() => { setShowApplyModal(false); setSelectedJob(null); }}
        job={selectedJob}
        onApplySuccess={() => alert('Apply successful! The employer will contact you soon.')}
      />

      {/* ───── FOOTER ───── */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerBottom} style={{ textAlign: 'center', paddingTop: '20px' }}>
            <span>© 2026 JobsMarket Platform. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
