import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FeaturedCompanies from '../FeaturedCompanies/FeaturedCompanies';
import JoinUsModal from '../JoinUsModal/JoinUsModal';
import styles from './LandingPage.module.css';

const HOT_JOBS = [
  { id: 1, title: 'Frontend Developer (ReactJS)', company: 'FPT Software', salary: '$800 - $1,500', location: 'Ho Chi Minh City', logo: '🏢', tag: 'Hot', isNew: true },
  { id: 2, title: 'Product Manager', company: 'VNG Corporation', salary: '$1,500 - $2,500', location: 'Ho Chi Minh City', logo: '🏢', tag: 'Top', isNew: false },
  { id: 3, title: 'Data Analyst', company: 'Tiki', salary: '$700 - $1,200', location: 'Hanoi', logo: '🏢', tag: 'Top', isNew: true },
  { id: 4, title: 'UX/UI Designer', company: 'Momo', salary: '$900 - $1,800', location: 'Ho Chi Minh City', logo: '🏢', tag: 'Hot', isNew: false },
  { id: 5, title: 'Backend Engineer (NodeJS)', company: 'Shopee', salary: '$1,200 - $2,000', location: 'Ho Chi Minh City', logo: '🏢', tag: 'VIP', isNew: true },
  { id: 6, title: 'DevOps Engineer', company: 'VinAI', salary: '$1,300 - $2,200', location: 'Hanoi', logo: '🏢', tag: 'Top', isNew: false },
];



const CATEGORIES = [
  { iconFile: 'it.png', name: 'Information Technology', count: '3,200+' },
  { iconFile: 'finance.png', name: 'Finance & Banking', count: '1,800+' },
  { iconFile: 'marketing.png', name: 'Marketing & PR', count: '950+' },
  { iconFile: 'engineering.png', name: 'Manufacturing & Engineering', count: '2,100+' },
  { iconFile: 'healthcare.png', name: 'Healthcare & Pharmacy', count: '780+' },
  { iconFile: 'education.png', name: 'Education & Training', count: '640+' },
  { iconFile: 'logistics.png', name: 'Logistics & Transportation', count: '1,100+' },
  { iconFile: 'sales.png', name: 'Sales & Business', count: '2,800+' },
  { iconFile: 'realestate.png', name: 'Real Estate', count: '920+' },
  { iconFile: 'legal.png', name: 'Legal & Law', count: '430+' },
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const bannerTimerRef = useRef(null);

  const BANNERS = [
    { bg: 'linear-gradient(135deg, #1e3a6e 0%, #2563ab 60%, #1e5c8b 100%)', title: 'Find Your Dream Job in 2026', sub: 'Over 26,000 career opportunities are waiting for you' },
    { bg: 'linear-gradient(135deg, #0f2d5e 0%, #c0392b 100%)', title: 'Connecting Talent & Enterprise', sub: '#1 Recruitment Platform in Vietnam' },
    { bg: 'linear-gradient(135deg, #1a4731 0%, #27ae60 100%)', title: 'Apply Fast — Get Hired Quickly', sub: 'Upload your CV for free and receive offers from top employers' },
  ];

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    if (currentToken === "undefined" || currentToken === "null") {
      localStorage.clear();
      setIsLoggedIn(false);
    } else if (currentToken) {
      setIsLoggedIn(true);
    }

    bannerTimerRef.current = setInterval(() => {
      setBannerIdx(prev => (prev + 1) % BANNERS.length);
    }, 4000);
    
    return () => clearInterval(bannerTimerRef.current);
  }, []);

  const handleRequireLogin = (e) => {
    e?.stopPropagation?.();
    if (!isLoggedIn) {
      setJoinModalOpen(true);
    }
  };

  const handleSearch = () => {
    if (!isLoggedIn) {
      setJoinModalOpen(true);
    } else {
      navigate('/search-jobs');
    }
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
              <h2>Seize your success with <span className={styles.jobCount}>26,047</span> career opportunities</h2>
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
              <span>📄 Upload your resume to apply faster and get noticed by employers</span>
              <button className={styles.uploadResumeBtn} onClick={handleRequireLogin}>UPLOAD NOW</button>
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

      {/* ───── FEATURED COMPANIES ───── */}
      <FeaturedCompanies />


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
              <div key={job.id} className={styles.jobCard} onClick={handleRequireLogin}>
                <div className={styles.jobCardLeft}>
                  <div className={styles.jobLogo}>{job.logo}</div>
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
                  {job.isNew && <span className={styles.jobTagNew}>New</span>}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.viewMore}>
            <button onClick={handleRequireLogin}>View all jobs <span>→</span></button>
          </div>
        </div>
      </section>

      {/* ───── CATEGORIES ───── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderCol}>
            <h2 className={styles.sectionTitleGreen}>POPULAR INDUSTRIES</h2>
            <p className={styles.sectionSub}>Looking for a new job? View the job list <span className={styles.linkText} onClick={handleRequireLogin}>here</span></p>
          </div>
          <div className={styles.categoriesGrid}>
            {CATEGORIES.map((cat, i) => (
              <div key={i} className={styles.categoryCard} onClick={handleRequireLogin}>
                <div className={styles.categoryIcon}>
                  <img src={`/icons/${cat.iconFile}`} alt={cat.name} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                </div>
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
                <p className={styles.ctaDesc}>Post jobs for free, find quality candidates, and reach 5M+ potential applicants across Vietnam.</p>
              </div>
            </div>
            <div className={styles.ctaButtons}>
              <button className={styles.ctaBtnPrimary} onClick={handleRequireLogin}>Post a Job</button>
              <button className={styles.ctaBtnSecondary} onClick={handleRequireLogin}>Find Candidates</button>
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
              <a onClick={handleRequireLogin}>Find Jobs</a>
              <a onClick={handleRequireLogin}>Create Profile</a>
              <a onClick={handleRequireLogin}>Job Alerts</a>
            </div>
            <div className={styles.footerLinks}>
              <h4>Employers</h4>
              <a onClick={handleRequireLogin}>Post a Job</a>
              <a onClick={handleRequireLogin}>Find Candidates</a>
              <a onClick={handleRequireLogin}>Products & Services</a>
            </div>
            <div className={styles.footerLinks}>
              <h4>About Us</h4>
              <a onClick={handleRequireLogin}>About</a>
              <a onClick={handleRequireLogin}>Contact</a>
              <a onClick={handleRequireLogin}>Terms of Service</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>© 2026 JobsMarket Platform. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Join Us Modal */}
      <JoinUsModal isOpen={joinModalOpen} onClose={() => setJoinModalOpen(false)} />
    </div>
  );
}