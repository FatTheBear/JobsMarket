import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';

const STATS = [
  { icon: '💼', value: '10,000+', label: 'Job Listings' },
  { icon: '🏢', value: '2,500+', label: 'Companies' },
  { icon: '👥', value: '50,000+', label: 'Candidates' },
  { icon: '✅', value: '8,000+', label: 'Hired' },
];

const FEATURES = [
  {
    icon: '🎯',
    title: 'Smart Matching',
    desc: 'AI-powered skill matching connects the right candidates with the right positions instantly.',
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    desc: 'Track applications, views, and hiring metrics in real-time with powerful insights.',
  },
  {
    icon: '🔒',
    title: 'Verified Profiles',
    desc: 'All candidates and companies go through verification for a trusted hiring experience.',
  },
  {
    icon: '⚡',
    title: 'Fast Apply',
    desc: 'One-click applications with pre-built CV profiles. Apply to jobs in seconds.',
  },
];

const CATEGORIES = [
  { icon: '💻', name: 'Technology', count: '3,200+' },
  { icon: '💰', name: 'Finance', count: '1,800+' },
  { icon: '🎨', name: 'Design', count: '950+' },
  { icon: '📈', name: 'Marketing', count: '1,400+' },
  { icon: '🏥', name: 'Healthcare', count: '2,100+' },
  { icon: '📚', name: 'Education', count: '780+' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={styles.page}>
      {/* ───── NAVBAR ───── */}
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <div className={styles.navBrand} onClick={() => navigate('/')}>
            <span className={styles.navLogo}>💼</span>
            <span className={styles.navName}>JobsMarket</span>
          </div>
          <div className={styles.navLinks}>
            <button className={styles.navLink} onClick={() => navigate('/auth')}>Find Jobs</button>
            <button className={styles.navLink} onClick={() => navigate('/auth')}>For Employers</button>
            <button className={styles.navBtnOutline} onClick={() => navigate('/login')}>Sign In</button>
            <button className={styles.navBtnFill} onClick={() => navigate('/auth')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* ───── HERO ───── */}
      <section className={`${styles.hero} ${isVisible ? styles.heroVisible : ''}`}>
        <div className={styles.heroGlow}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>🚀 #1 Recruitment Platform in Vietnam</div>
          <h1 className={styles.heroTitle}>
            Find Your <span className={styles.heroGradient}>Dream Job</span> Today
          </h1>
          <p className={styles.heroSubtitle}>
            Connecting top talent with leading enterprises.
            An intelligent recruitment platform for both candidates and employers.
          </p>

          {/* Search Bar */}
          <div className={styles.searchBar}>
            <div className={styles.searchIcon}>🔍</div>
            <input
              className={styles.searchInput}
              placeholder="Search jobs, companies, or skills..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button className={styles.searchBtn} onClick={() => navigate('/auth')}>
              Search
            </button>
          </div>

          <div className={styles.heroTags}>
            <span className={styles.tag}>React Developer</span>
            <span className={styles.tag}>Product Manager</span>
            <span className={styles.tag}>UX Designer</span>
            <span className={styles.tag}>Data Analyst</span>
          </div>
        </div>
      </section>

      {/* ───── STATS ───── */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {STATS.map((s, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statIcon}>{s.icon}</div>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── CATEGORIES ───── */}
      <section className={styles.categoriesSection}>
        <h2 className={styles.sectionTitle}>Browse by Category</h2>
        <p className={styles.sectionSubtitle}>Explore opportunities across top industries</p>
        <div className={styles.categoriesGrid}>
          {CATEGORIES.map((c, i) => (
            <div key={i} className={styles.categoryCard} onClick={() => navigate('/auth')}>
              <div className={styles.categoryIcon}>{c.icon}</div>
              <div className={styles.categoryName}>{c.name}</div>
              <div className={styles.categoryCount}>{c.count} jobs</div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>Why Choose JobsMarket?</h2>
        <p className={styles.sectionSubtitle}>Everything you need for a seamless hiring experience</p>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Take the Next Step?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of professionals who found their dream job through JobsMarket.
          </p>
          <div className={styles.ctaButtons}>
            <button className={styles.ctaBtnPrimary} onClick={() => navigate('/auth')}>
              🎯 Find a Job
            </button>
            <button className={styles.ctaBtnSecondary} onClick={() => navigate('/auth')}>
              🏢 Post a Job
            </button>
          </div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.navLogo}>💼</span>
            <span className={styles.navName}>JobsMarket</span>
          </div>
          <div className={styles.footerLinks}>
            <span>About</span>
            <span>Contact</span>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
          <div className={styles.footerCopy}>
            © 2026 JobsMarket Platform • The Breakthrough Recruitment Experience
          </div>
        </div>
      </footer>
    </div>
  );
}