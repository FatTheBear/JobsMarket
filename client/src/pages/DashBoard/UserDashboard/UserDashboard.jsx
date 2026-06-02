import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css'; 

const LOCATIONS = [
  'Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Binh Duong', 'Dong Nai', 'Can Tho'
];

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [bannerIdx, setBannerIdx] = useState(0);
  const bannerTimerRef = useRef(null);

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

  const handleSearch = () => {
    console.log("Searching for:", searchQuery, "in", selectedLocation);
    // Logic search API sau này
  };

  const handleLogout = () => {
    // Thêm logic xóa token/localStorage ở đây
    navigate('/login');
  };

  return (
    <div className={styles.page}>
      
      {/* ───── NAVBAR (Logged In View) ───── */}
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <div className={styles.navLeft}>
            <div className={styles.navBrand} style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
              <span className={styles.navLogo}>💼</span>
              <span className={styles.navName}>JobsMarket</span>
            </div>
            <div className={styles.navMenu}>
              <button className={styles.navMenuItem} onClick={() => navigate('/jobs')}>Find Jobs</button>
              <button className={styles.navMenuItem} onClick={() => navigate('/companies')}>Companies</button>
            </div>
          </div>
          <div className={styles.navRight}>
            <button className={styles.navAlert}>🔔 Alerts</button>
            {/* Đổi thành nút điều hướng vào Profile và nút Đăng xuất */}
            <button className={styles.navBtnOutline} onClick={() => navigate('/candidate-profile')}>My Profile</button>
            <button className={styles.navBtnEmployer} style={{ backgroundColor: '#dc3545', color: 'white' }} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

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

      {/* ───── AVAILABLE JOB POSTINGS ───── */}
      <section className={`${styles.section} ${styles.sectionGray}`} style={{ padding: '60px 0' }}>
        <div className={styles.container}>
          <div className={styles.sectionHeader} style={{ marginBottom: '40px' }}>
            <h2 className={styles.sectionTitle}>RECOMMENDED FOR YOU</h2>
          </div>
          
          {/* Job Postings Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {JOB_POSTINGS.map(job => (
              <div key={job.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                
                {/* Header: Title, Company, Job Type */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f0f0f0', paddingBottom: '15px', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a6e', margin: '0 0 5px 0' }}>{job.title}</h3>
                    <div style={{ fontSize: '16px', color: '#555', fontWeight: '500' }}>🏢 {job.company}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#27ae60', marginBottom: '5px' }}>{job.salary}</div>
                    <span style={{ backgroundColor: job.jobType === 'Full-time' ? '#e1f5fe' : '#fff0f6', color: job.jobType === 'Full-time' ? '#0288d1' : '#c2185b', padding: '5px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                      {job.jobType}
                    </span>
                  </div>
                </div>

                {/* Job Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', fontSize: '15px', color: '#444' }}>
                  
                  {/* Left Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div><strong style={{ color: '#333' }}>📝 Job Description:</strong> <br/>{job.description}</div>
                    <div><strong style={{ color: '#333' }}>🎯 Requirements:</strong> <br/>{job.requirements}</div>
                    <div><strong style={{ color: '#333' }}>✨ Benefits:</strong> <br/>{job.benefits}</div>
                  </div>

                  {/* Right Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                    <div><strong>📍 Location:</strong> {job.location}</div>
                    <div><strong>⏰ Working Hours:</strong> {job.workingHours}</div>
                    <div><strong>🎓 Degree:</strong> {job.degreeRequirement}</div>
                    <div><strong>💼 Experience:</strong> {job.experience}</div>
                    <div><strong>🎂 Age Requirement:</strong> {job.ageRequirement}</div>
                    <div><strong>🗣️ Language:</strong> {job.languageRequirement}</div>
                    <hr style={{ borderTop: '1px solid #ddd', margin: '10px 0' }} />
                    <div style={{ fontSize: '14px' }}><strong>📞 Contact:</strong> {job.employerPhone}</div>
                    <div style={{ fontSize: '14px' }}><strong>✉️ Email:</strong> {job.employerEmail}</div>
                  </div>
                </div>

                {/* Apply Button */}
                <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    style={{ backgroundColor: '#2563ab', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => console.log('Applying for', job.id)}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

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