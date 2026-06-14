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

const EMPLOYER_INDUSTRIES = ['Tất cả', 'IT - Phần mềm', 'Ngân hàng', 'Bất động sản', 'Tài chính', 'Bán lẻ - FMCG', 'Sản xuất'];

const EMPLOYERS_BY_INDUSTRY = {
  'IT - Phần mềm': [
    { name: 'FPT Software', industry: 'IT - Phần mềm', color: '#FF6B35', initial: 'FPT', jobs: 120 },
    { name: 'VNG Corporation', industry: 'IT - Phần mềm', color: '#6B46C1', initial: 'VNG', jobs: 85 },
    { name: 'Shopee Việt Nam', industry: 'IT - Phần mềm', color: '#EE4D2D', initial: 'SPE', jobs: 200 },
    { name: 'Tiki', industry: 'IT - Phần mềm', color: '#0064E0', initial: 'TKI', jobs: 65 },
    { name: 'MoMo', industry: 'IT - Phần mềm', color: '#A50064', initial: 'MM', jobs: 95 },
    { name: 'VinAI Research', industry: 'IT - Phần mềm', color: '#005BB5', initial: 'VIN', jobs: 45 },
    { name: 'Grab Việt Nam', industry: 'IT - Phần mềm', color: '#00B14F', initial: 'GRB', jobs: 78 },
    { name: 'VNPT Technology', industry: 'IT - Phần mềm', color: '#003087', initial: 'VNP', jobs: 110 },
  ],
  'Ngân hàng': [
    { name: 'Vietcombank', industry: 'Ngân hàng', color: '#006633', initial: 'VCB', jobs: 88 },
    { name: 'Techcombank', industry: 'Ngân hàng', color: '#D0021B', initial: 'TCB', jobs: 72 },
    { name: 'VPBank', industry: 'Ngân hàng', color: '#00A651', initial: 'VPB', jobs: 95 },
    { name: 'MB Bank', industry: 'Ngân hàng', color: '#003882', initial: 'MB', jobs: 60 },
    { name: 'BIDV', industry: 'Ngân hàng', color: '#004B8D', initial: 'BIDV', jobs: 105 },
    { name: 'Agribank', industry: 'Ngân hàng', color: '#007B40', initial: 'AGR', jobs: 130 },
    { name: 'ACB', industry: 'Ngân hàng', color: '#E8992C', initial: 'ACB', jobs: 55 },
    { name: 'VietinBank', industry: 'Ngân hàng', color: '#CC0000', initial: 'VTB', jobs: 80 },
  ],
  'Bất động sản': [
    { name: 'Vinhomes', industry: 'Bất động sản', color: '#003399', initial: 'VHM', jobs: 42 },
    { name: 'Novaland', industry: 'Bất động sản', color: '#C8922A', initial: 'NVL', jobs: 38 },
    { name: 'Phú Mỹ Hưng', industry: 'Bất động sản', color: '#2E6DA4', initial: 'PMH', jobs: 25 },
    { name: 'Đất Xanh Group', industry: 'Bất động sản', color: '#00A651', initial: 'ĐXG', jobs: 30 },
    { name: 'Nam Long Group', industry: 'Bất động sản', color: '#E31E24', initial: 'NLG', jobs: 18 },
    { name: 'Hưng Thịnh Corp', industry: 'Bất động sản', color: '#F7941D', initial: 'HTC', jobs: 22 },
    { name: 'Sunshine Group', industry: 'Bất động sản', color: '#F5A623', initial: 'SGR', jobs: 15 },
    { name: 'Him Lam Land', industry: 'Bất động sản', color: '#8B4513', initial: 'HLL', jobs: 12 },
  ],
  'Tài chính': [
    { name: 'Manulife Việt Nam', industry: 'Tài chính', color: '#00A651', initial: 'MNL', jobs: 68 },
    { name: 'Prudential VN', industry: 'Tài chính', color: '#CC0000', initial: 'PRU', jobs: 55 },
    { name: 'AIA Việt Nam', industry: 'Tài chính', color: '#CC0000', initial: 'AIA', jobs: 48 },
    { name: 'Bảo Việt Group', industry: 'Tài chính', color: '#003082', initial: 'BVH', jobs: 72 },
    { name: 'SSI Securities', industry: 'Tài chính', color: '#003082', initial: 'SSI', jobs: 35 },
    { name: 'VNDirect', industry: 'Tài chính', color: '#1A5276', initial: 'VND', jobs: 28 },
    { name: 'Dragon Capital', industry: 'Tài chính', color: '#8E44AD', initial: 'DRC', jobs: 20 },
    { name: 'MB Capital', industry: 'Tài chính', color: '#003882', initial: 'MBC', jobs: 32 },
  ],
  'Bán lẻ - FMCG': [
    { name: 'Unilever Việt Nam', industry: 'Bán lẻ - FMCG', color: '#1F5EA8', initial: 'UNI', jobs: 88 },
    { name: 'Nestlé Việt Nam', industry: 'Bán lẻ - FMCG', color: '#D9534F', initial: 'NES', jobs: 62 },
    { name: 'Masan Group', industry: 'Bán lẻ - FMCG', color: '#C0392B', initial: 'MSN', jobs: 110 },
    { name: 'The Gioi Di Dong', industry: 'Bán lẻ - FMCG', color: '#E8992C', initial: 'MWG', jobs: 145 },
    { name: 'Bachhoaxanh', industry: 'Bán lẻ - FMCG', color: '#00A651', initial: 'BHX', jobs: 98 },
    { name: 'Circle K VN', industry: 'Bán lẻ - FMCG', color: '#CC0000', initial: 'CK', jobs: 55 },
    { name: 'P&G Việt Nam', industry: 'Bán lẻ - FMCG', color: '#003087', initial: 'P&G', jobs: 45 },
    { name: 'Heineken VN', industry: 'Bán lẻ - FMCG', color: '#008000', initial: 'HNK', jobs: 38 },
  ],
  'Sản xuất': [
    { name: 'Vinamilk', industry: 'Sản xuất', color: '#003087', initial: 'VNM', jobs: 92 },
    { name: 'TH True Milk', industry: 'Sản xuất', color: '#00A651', initial: 'TH', jobs: 68 },
    { name: 'Sabeco', industry: 'Sản xuất', color: '#C0392B', initial: 'SAB', jobs: 45 },
    { name: 'Hoa Phat Group', industry: 'Sản xuất', color: '#CC4700', initial: 'HPG', jobs: 130 },
    { name: 'Viettel Group', industry: 'Sản xuất', color: '#CC0000', initial: 'VTL', jobs: 175 },
    { name: 'Samsung HCMC', industry: 'Sản xuất', color: '#1428A0', initial: 'SAM', jobs: 220 },
    { name: 'Toyota VN', industry: 'Sản xuất', color: '#CC0000', initial: 'TYT', jobs: 40 },
    { name: 'Panasonic VN', industry: 'Sản xuất', color: '#003087', initial: 'PAN', jobs: 35 },
  ],
};

const CATEGORIES = [
  { iconFile: 'sales.png', name: 'Kinh doanh - Bán hàng', count: '10.312' },
  { iconFile: 'marketing.png', name: 'Marketing - PR - Quảng cáo', count: '7.538' },
  { iconFile: 'customer_service.png', name: 'Chăm sóc khách hàng', count: '1.629' },
  { iconFile: 'hr.png', name: 'Nhân sự - Hành chính - Pháp chế', count: '3.591' },
  { iconFile: 'it.png', name: 'Công nghệ Thông tin', count: '1.920' },
  { iconFile: 'finance.png', name: 'Tài chính - Ngân hàng - Bảo hiểm', count: '1.230' },
  { iconFile: 'realestate.png', name: 'Bất động sản', count: '425' },
  { iconFile: 'accounting.png', name: 'Kế toán - Kiểm toán - Thuế', count: '5.055' },
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
  const [activeIndustry, setActiveIndustry] = useState('Tất cả');
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
            <h2 className={styles.sectionTitle}>THƯƠNG HIỆU LỚN TIÊU BIỂU</h2>
          </div>

          {/* Industry Filter Tabs */}
          <div className={styles.industryTabs}>
            {EMPLOYER_INDUSTRIES.map((ind) => (
              <button
                key={ind}
                className={`${styles.industryTab} ${activeIndustry === ind ? styles.industryTabActive : ''}`}
                onClick={() => setActiveIndustry(ind)}
              >
                {ind}
              </button>
            ))}
          </div>

          {/* Companies Grid - 2 columns */}
          <div className={styles.employersGrid}>
            {(activeIndustry === 'Tất cả'
              ? Object.values(EMPLOYERS_BY_INDUSTRY).flat().slice(0, 8)
              : (EMPLOYERS_BY_INDUSTRY[activeIndustry] || [])
            ).map((emp, i) => (
              <div key={i} className={styles.employerCard} onClick={() => navigate('/auth')}>
                <div
                  className={styles.employerLogo}
                  style={{ background: emp.color }}
                >
                  {emp.initial}
                </div>
                <div className={styles.employerInfo}>
                  <div className={styles.employerName}>{emp.name}</div>
                  <div className={styles.employerIndustry}>{emp.industry}</div>
                  <div className={styles.employerJobs}>
                    <span className={styles.jobsIcon}>🏢</span> {emp.jobs} việc làm
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.viewMore}>
            <button onClick={() => navigate('/auth')}>Xem thêm <span>→</span></button>
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
          <div className={styles.sectionHeaderCol}>
            <h2 className={styles.sectionTitleGreen}>Top ngành nghề nổi bật</h2>
            <p className={styles.sectionSub}>Bạn muốn tìm việc mới? Xem danh sách việc làm <span className={styles.linkText} onClick={() => navigate('/auth')}>tại đây</span></p>
          </div>
          <div className={styles.categoriesGrid}>
            {CATEGORIES.map((cat, i) => (
              <div key={i} className={styles.categoryCard} onClick={() => navigate('/auth')}>
                <div className={styles.categoryIcon}>
                  <img src={`/icons/${cat.iconFile}`} alt={cat.name} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                  <span style={{ display: 'none', fontSize: '32px' }}>📁</span>
                </div>
                <div className={styles.categoryName}>{cat.name}</div>
                <div className={styles.categoryCount}>{cat.count} việc làm</div>
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