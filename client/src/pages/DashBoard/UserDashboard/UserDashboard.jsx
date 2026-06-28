import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UserDashboard.module.css';
import axios from 'axios';
import ApplyJobModal from './ApplyJobModal';
import JobCard from '../../../components/Jobs/JobCard';

const LOCATIONS = [
  'Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Binh Duong', 'Dong Nai', 'Can Tho'
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
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState([]);
  const [selectedSalary, setSelectedSalary] = useState(''); 
  const [selectedLevel, setSelectedLevel] = useState([]);
  const [filterLocation, setFilterLocation] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [skillKeyword, setSkillKeyword] = useState('');
  const [provinces, setProvinces] = useState([]);

  // Đổi Banner thành Danh mục các ngành nghề
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

  const handleLogout = () => {
    // Thêm logic xóa token/localStorage ở đây
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
  }, []);

  const handleSearch = () => {
    navigate(`/search-jobs?q=${searchQuery}&location=${selectedLocation}`);
  };

  const toggleCheckbox = (value, list, setList) => {
    setList(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };


  const clearAllFilters = () => {
    setSelectedJobTypes([]);
    setSelectedExperience([]);
    setSelectedSalary('');
    setFilterLocation('');
    setSelectedIndustries([]);
    setSkillKeyword('');
  };

  const filteredJobs = jobs.filter(job => {
    if (selectedJobTypes.length > 0 && !selectedJobTypes.includes(job.job_type)) return false;
    if (selectedExperience.length > 0 && !selectedExperience.includes(job.experience_req)) return false;
    if (filterLocation && !(job.province || '').toLowerCase().includes(filterLocation.toLowerCase())) return false;
    if (selectedSalary) {
      if (selectedSalary === 'Negotiable' && (job.salary_min || job.salary_max)) return false;
      if (selectedSalary === 'Under 10M' && job.salary_max > 10) return false;
      if (selectedSalary === '10M - 20M' && (job.salary_min > 20 || job.salary_max < 10)) return false;
      if (selectedSalary === 'Over 20M' && job.salary_min < 20) return false;
    }
    if (selectedIndustries.length > 0 && !selectedIndustries.some(id => (job.industry_ids || []).includes(id))) return false;
    if (skillKeyword && !(job.requirements || '').toLowerCase().includes(skillKeyword.toLowerCase())) return false;
    return true;
  });

  const activeFilterCount = selectedJobTypes.length + selectedExperience.length +
    (selectedSalary ? 1 : 0) + (filterLocation ? 1 : 0) +
    selectedIndustries.length + (skillKeyword ? 1 : 0);

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
                  {provinces.map(loc => (
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

          <section className={`${styles.section} ${styles.sectionGray}`} style={{ padding: '60px 0' }}>
            <div className={styles.container}>
              <div className={styles.sectionHeader} style={{ marginBottom: '40px' }}>
                <h2 className={styles.sectionTitle}>RECOMMENDED FOR YOU</h2>
              </div>

              {/* Job Postings Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '25px',
            alignItems: 'stretch'
          }}>
                {jobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onClick={() => navigate(`/jobs/${job.id}`)}
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