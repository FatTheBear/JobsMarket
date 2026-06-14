import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';

const HOT_JOBS = [
  { id: 1, title: 'Frontend Developer (ReactJS)', company: 'FPT Software', salary: '18 - 30 triệu', location: 'TP. Hồ Chí Minh', color: '#FF6B35', initial: 'FPT', tag: 'Hot', isNew: true },
  { id: 2, title: 'Product Manager', company: 'VNG Corporation', salary: '35 - 55 triệu', location: 'TP. Hồ Chí Minh', color: '#6B46C1', initial: 'VNG', tag: 'Top', isNew: false },
  { id: 3, title: 'Data Analyst', company: 'Tiki', salary: '15 - 25 triệu', location: 'Hà Nội', color: '#0064E0', initial: 'TKI', tag: 'Top', isNew: true },
  { id: 4, title: 'UX/UI Designer', company: 'MoMo', salary: '20 - 40 triệu', location: 'TP. Hồ Chí Minh', color: '#A50064', initial: 'MM', tag: 'Hot', isNew: false },
  { id: 5, title: 'Backend Engineer (NodeJS)', company: 'Shopee', salary: '25 - 45 triệu', location: 'TP. Hồ Chí Minh', color: '#EE4D2D', initial: 'SPE', tag: 'VIP', isNew: true },
  { id: 6, title: 'DevOps Engineer', company: 'VinAI Research', salary: '30 - 50 triệu', location: 'Hà Nội', color: '#005BB5', initial: 'VIN', tag: 'Top', isNew: false },
];

const TOP_EMPLOYERS = [
  { name: 'FPT Software', color: '#FF6B35', initial: 'FPT', jobs: 120 },
  { name: 'VNG', color: '#6B46C1', initial: 'VNG', jobs: 85 },
  { name: 'Shopee', color: '#EE4D2D', initial: 'SPE', jobs: 200 },
  { name: 'Tiki', color: '#0064E0', initial: 'TKI', jobs: 65 },
  { name: 'MoMo', color: '#A50064', initial: 'MM', jobs: 95 },
  { name: 'VinAI', color: '#005BB5', initial: 'VIN', jobs: 45 },
  { name: 'Grab', color: '#00B14F', initial: 'GRB', jobs: 78 },
  { name: 'VNPT', color: '#003087', initial: 'VNP', jobs: 110 },
];

const CATEGORIES = [
  { icon: '💻', name: 'Information Technology', count: '3,200+' },
  { icon: '💰', name: 'Finance & Banking', count: '1,800+' },
  { icon: '🎨', name: 'Marketing & PR', count: '950+' },
  { icon: '🏭', name: 'Manufacturing & Engineering', count: '2,100+' },
  { icon: '🏥', name: 'Healthcare & Pharmacy', count: '780+' },
  { icon: '📚', name: 'Education & Training', count: '640+' },
  { icon: '🚚', name: 'Logistics & Transportation', count: '1,100+' },
  { icon: '🛒', name: 'Sales & Business', count: '2,800+' },
  { icon: '🏢', name: 'Real Estate', count: '920+' },
  { icon: '⚖️', name: 'Legal & Law', count: '430+' },
];

const LOCATIONS = [
  'Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Binh Duong', 'Dong Nai', 'Can Tho'
];

const JOB_TABS = ['Featured Jobs', 'VIP Jobs ($1000+)', 'Latest Jobs'];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [bannerIdx, setBannerIdx] = useState(0);
  const bannerTimerRef = useRef(null);

  const BANNERS = [
    { bg: 'linear-gradient(135deg, #1e3a6e 0%, #2563ab 60%, #1e5c8b 100%)', title: 'Tìm Việc Làm Phù Hợp Với Bạn', sub: 'Hơn 26,000 cơ hội nghề nghiệp từ các doanh nghiệp hàng đầu Việt Nam' },
    { bg: 'linear-gradient(135deg, #0f2d5e 0%, #c0392b 100%)', title: 'Kết Nối Nhân Tài & Doanh Nghiệp', sub: 'Nền tảng tuyển dụng #1 — nhanh chóng, minh bạch, hiệu quả' },
    { bg: 'linear-gradient(135deg, #1a4731 0%, #27ae60 100%)', title: 'Nộp CV Ngay — Nhận Offer Sớm', sub: 'Upload CV miễn phí và nhận lời mời từ nhà tuyển dụng trong 24h' },
  ];

  useEffect(() => {
    bannerTimerRef.current = setInterval(() => {
      setBannerIdx(prev => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(bannerTimerRef.current);
  }, []);

  const handleSearch = () => {
    navigate('/auth');
  };

  return (
    <div className={styles.page}>
      
      {/* LƯU Ý: Phần <nav> cứng ở đây đã được xóa bỏ để nhường chỗ cho Navbar động từ MainLayout */}

      {/* ───── BANNER SLIDER ───── */}
      <section className={styles.banner} style={{ background: BANNERS[bannerIdx].bg }}>
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <div className={styles.bannerText}>
            <h1 className={styles.bannerTitle}>{BANNERS[bannerIdx].title}</h1>
            <p className={styles.bannerSub}>{BANNERS[bannerIdx].sub}</p>
          </div>

          {/* Search Box */}
          <div className={styles.searchBox}>
            <div className={styles.searchBoxTitle}>
              <h2>Cơ hội nghề nghiệp dành cho bạn — <span className={styles.jobCount}>26,047</span> việc làm đang chờ</h2>
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
                  <option value="">All cities / provinces</option>
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <button className={styles.searchBtn} onClick={handleSearch}>
                SEARCH NOW
              </button>
            </div>
            <div className={styles.searchFooter}>
              <span>📄 Upload CV để ứng tuyển nhanh hơn và được nhà tuyển dụng chú ý</span>
              <button className={styles.uploadResumeBtn} onClick={() => navigate('/auth')}>UPLOAD NGAY</button>
            </div>
          </div>
        </div>

        {/* Banner dots */}
        <div className={styles.bannerDots}>
          {BANNERS.map((_, i) => (
            <button
              key={i}
              className={`${styles.bannerDot} ${i === bannerIdx ? styles.bannerDotActive : ''}`}
              onClick={() => setBannerIdx(i)}
            />
          ))}
        </div>
      </section>

      {/* ───── TOP EMPLOYERS ───── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>TOP EMPLOYERS</h2>
          </div>
          <div className={styles.employersGrid}>
            {TOP_EMPLOYERS.map((emp, i) => (
              <div key={i} className={styles.employerCard} onClick={() => navigate('/auth')}>
                <div
                  className={styles.employerLogo}
                  style={{ background: emp.color }}
                >
                  {emp.initial}
                </div>
                <div className={styles.employerName}>{emp.name}</div>
                <div className={styles.employerJobs}>{emp.jobs} việc làm</div>
              </div>
            ))}
          </div>
          <div className={styles.viewMore}>
            <button onClick={() => navigate('/auth')}>View more <span>→</span></button>
          </div>
        </div>
      </section>

      {/* ───── HOT JOBS ───── */}
      <section className={`${styles.section} ${styles.sectionGray}`}>
        <div className={styles.container}>
          <div className={styles.tabsBar}>
            {JOB_TABS.map((tab, i) => (
              <button
                key={i}
                className={`${styles.tabBtn} ${activeTab === i ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab(i)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className={styles.jobsGrid}>
            {HOT_JOBS.map(job => (
              <div key={job.id} className={styles.jobCard} onClick={() => navigate('/auth')}>
                <div className={styles.jobCardLeft}>
                  <div
                    className={styles.jobLogo}
                    style={{ background: job.color, color: '#fff', fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px' }}
                  >
                    {job.initial}
                  </div>
                  <div className={styles.jobInfo}>
                    <div className={styles.jobTitle}>{job.title}</div>
                    <div className={styles.jobCompany}>{job.company}</div>
                    <div className={styles.jobMeta}>
                      <span className={styles.jobSalary}>💰 {job.salary}</span>
                      <span className={styles.jobLocation}>📍 {job.location}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.jobTags}>
                  <span className={`${styles.jobTag} ${styles['jobTag' + job.tag]}`}>{job.tag}</span>
                  {job.isNew && <span className={styles.jobTagNew}>Mới</span>}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.viewMore}>
            <button onClick={() => navigate('/auth')}>View all jobs <span>→</span></button>
          </div>
        </div>
      </section>

      {/* ───── CATEGORIES ───── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>POPULAR INDUSTRIES</h2>
          </div>
          <div className={styles.categoriesGrid}>
            {CATEGORIES.map((cat, i) => (
              <div key={i} className={styles.categoryCard} onClick={() => navigate('/auth')}>
                <div className={styles.categoryIcon}>{cat.icon}</div>
                <div className={styles.categoryName}>{cat.name}</div>
                <div className={styles.categoryCount}>{cat.count} jobs</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── STATS BANNER ───── */}
      <section className={styles.statsBanner}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNum}>26,000+</div>
              <div className={styles.statLabel}>Active Job Listings</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNum}>20,000+</div>
              <div className={styles.statLabel}>Verified Employers</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNum}>5M+</div>
              <div className={styles.statLabel}>Registered Candidates</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNum}>15 Years</div>
              <div className={styles.statLabel}>Recruitment Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── CTA FOR EMPLOYER ───── */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaBox}>
            <div className={styles.ctaLeft}>
              <div className={styles.ctaIcon}>🏢</div>
              <div>
                <h3 className={styles.ctaTitle}>For Employers</h3>
                <p className={styles.ctaDesc}>Đăng tin tuyển dụng miễn phí, tìm ứng viên chất lượng và tiếp cận hơn 5 triệu hồ sơ ứng viên trên toàn quốc.</p>
              </div>
            </div>
            <div className={styles.ctaButtons}>
              <button className={styles.ctaBtnPrimary} onClick={() => navigate('/auth')}>Post a Job</button>
              <button className={styles.ctaBtnSecondary} onClick={() => navigate('/auth')}>Find Candidates</button>
            </div>
          </div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>💼 <span>JobsMarket</span></div>
              <p className={styles.footerDesc}>Vietnam's leading job search and recruitment platform</p>
            </div>
            <div className={styles.footerLinks}>
              <h4>Job Seekers</h4>
              <a onClick={() => navigate('/auth')}>Find Jobs</a>
              <a onClick={() => navigate('/auth')}>Create Profile</a>
              <a onClick={() => navigate('/auth')}>Job Alerts</a>
            </div>
            <div className={styles.footerLinks}>
              <h4>Employers</h4>
              <a onClick={() => navigate('/auth')}>Post a Job</a>
              <a onClick={() => navigate('/auth')}>Find Candidates</a>
              <a onClick={() => navigate('/auth')}>Products & Services</a>
            </div>
            <div className={styles.footerLinks}>
              <h4>About Us</h4>
              <a onClick={() => navigate('/auth')}>About</a>
              <a onClick={() => navigate('/auth')}>Contact</a>
              <a onClick={() => navigate('/auth')}>Terms of Service</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>© 2026 JobsMarket Platform. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}