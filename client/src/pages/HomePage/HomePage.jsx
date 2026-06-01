import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';

const HOT_JOBS = [
  { id: 1, title: 'Frontend Developer (ReactJS)', company: 'FPT Software', salary: '20 - 40 triệu', location: 'Hồ Chí Minh', logo: '🏢', tag: 'Hot', isNew: true },
  { id: 2, title: 'Product Manager', company: 'VNG Corporation', salary: '40 - 70 triệu', location: 'Hồ Chí Minh', logo: '🏢', tag: 'Top', isNew: false },
  { id: 3, title: 'Data Analyst', company: 'Tiki', salary: '18 - 35 triệu', location: 'Hà Nội', logo: '🏢', tag: 'Top', isNew: true },
  { id: 4, title: 'UX/UI Designer', company: 'Momo', salary: '25 - 45 triệu', location: 'Hồ Chí Minh', logo: '🏢', tag: 'Hot', isNew: false },
  { id: 5, title: 'Backend Engineer (NodeJS)', company: 'Shopee', salary: '30 - 55 triệu', location: 'Hồ Chí Minh', logo: '🏢', tag: 'VIP', isNew: true },
  { id: 6, title: 'DevOps Engineer', company: 'VinAI', salary: '35 - 60 triệu', location: 'Hà Nội', logo: '🏢', tag: 'Top', isNew: false },
];

const TOP_EMPLOYERS = [
  { name: 'FPT Software', logo: '🔵', jobs: 120 },
  { name: 'VNG', logo: '🟣', jobs: 85 },
  { name: 'Shopee', logo: '🟠', jobs: 200 },
  { name: 'Tiki', logo: '🔴', jobs: 65 },
  { name: 'MoMo', logo: '🟣', jobs: 95 },
  { name: 'VinAI', logo: '🔵', jobs: 45 },
  { name: 'Grab', logo: '🟢', jobs: 78 },
  { name: 'VNPT', logo: '🔵', jobs: 110 },
];

const CATEGORIES = [
  { icon: '💻', name: 'Công nghệ thông tin', count: '3,200+' },
  { icon: '💰', name: 'Tài chính - Ngân hàng', count: '1,800+' },
  { icon: '🎨', name: 'Marketing - PR', count: '950+' },
  { icon: '🏭', name: 'Sản xuất - Kỹ thuật', count: '2,100+' },
  { icon: '🏥', name: 'Y tế - Dược phẩm', count: '780+' },
  { icon: '📚', name: 'Giáo dục - Đào tạo', count: '640+' },
  { icon: '🚚', name: 'Logistics - Vận tải', count: '1,100+' },
  { icon: '🛒', name: 'Bán hàng - Kinh doanh', count: '2,800+' },
  { icon: '🏢', name: 'Bất động sản', count: '920+' },
  { icon: '⚖️', name: 'Pháp lý - Luật', count: '430+' },
];

const LOCATIONS = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Bình Dương', 'Đồng Nai', 'Cần Thơ'];

const JOB_TABS = ['Việc Làm Nổi Bật', 'Việc Làm VIP ($1000+)', 'Việc Làm Mới Nhất'];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [bannerIdx, setBannerIdx] = useState(0);
  const bannerTimerRef = useRef(null);

  const BANNERS = [
    { bg: 'linear-gradient(135deg, #1e3a6e 0%, #2563ab 60%, #1e5c8b 100%)', title: 'Tìm Việc Làm Tốt Nhất 2026', sub: 'Hơn 26,000 cơ hội nghề nghiệp đang chờ bạn' },
    { bg: 'linear-gradient(135deg, #0f2d5e 0%, #c0392b 100%)', title: 'Kết Nối Tài Năng & Doanh Nghiệp', sub: 'Nền tảng tuyển dụng #1 tại Việt Nam' },
    { bg: 'linear-gradient(135deg, #1a4731 0%, #27ae60 100%)', title: 'Ứng Tuyển Nhanh - Được Việc Liền', sub: 'Đăng hồ sơ miễn phí, nhận lời mời từ nhà tuyển dụng' },
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
      {/* ───── NAVBAR ───── */}
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <div className={styles.navLeft}>
            <div className={styles.navBrand} onClick={() => navigate('/')}>
              <span className={styles.navLogo}>💼</span>
              <span className={styles.navName}>JobsMarket</span>
            </div>
            <div className={styles.navMenu}>
              <button className={styles.navMenuItem} onClick={() => navigate('/auth')}>Tìm Việc Làm</button>
              <button className={styles.navMenuItem} onClick={() => navigate('/auth')}>Công Ty</button>
              <button className={styles.navMenuItem} onClick={() => navigate('/auth')}>Cẩm Nang</button>
            </div>
          </div>
          <div className={styles.navRight}>
            <button className={styles.navAlert} onClick={() => navigate('/auth')}>🔔 Thông Báo Việc Làm</button>
            <button className={styles.navBtnOutline} onClick={() => navigate('/login')}>Đăng Nhập</button>
            <button className={styles.navBtnEmployer} onClick={() => navigate('/auth')}>
              🏢 Dành Cho NTD
            </button>
          </div>
        </div>
      </nav>

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
              <h2>Đón lấy thành công với <span className={styles.jobCount}>26,047</span> cơ hội nghề nghiệp</h2>
            </div>
            <div className={styles.searchRow}>
              <div className={styles.searchField}>
                <span className={styles.searchFieldIcon}>🔍</span>
                <input
                  className={styles.searchInput}
                  placeholder="Chức danh, từ khóa, công ty..."
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
                  <option value="">Tất cả tỉnh/thành</option>
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <button className={styles.searchBtn} onClick={handleSearch}>
                TÌM VIỆC NGAY
              </button>
            </div>
            <div className={styles.searchFooter}>
              <span>📄 Đăng hồ sơ nghề nghiệp để dễ dàng ứng tuyển nhanh</span>
              <button className={styles.uploadResumeBtn} onClick={() => navigate('/auth')}>ĐĂNG NGAY</button>
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
            <h2 className={styles.sectionTitle}>NHÀ TUYỂN DỤNG HÀNG ĐẦU</h2>
          </div>
          <div className={styles.employersGrid}>
            {TOP_EMPLOYERS.map((emp, i) => (
              <div key={i} className={styles.employerCard} onClick={() => navigate('/auth')}>
                <div className={styles.employerLogo}>{emp.logo}</div>
                <div className={styles.employerName}>{emp.name}</div>
                <div className={styles.employerJobs}>{emp.jobs} việc làm</div>
              </div>
            ))}
          </div>
          <div className={styles.viewMore}>
            <button onClick={() => navigate('/auth')}>Xem thêm <span>→</span></button>
          </div>
        </div>
      </section>

      {/* ───── HOT JOBS ───── */}
      <section className={styles.section + ' ' + styles.sectionGray}>
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
                  {job.isNew && <span className={styles.jobTagNew}>Mới</span>}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.viewMore}>
            <button onClick={() => navigate('/auth')}>Xem tất cả việc làm <span>→</span></button>
          </div>
        </div>
      </section>

      {/* ───── CATEGORIES ───── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>NGÀNH NGHỀ PHỔ BIẾN</h2>
          </div>
          <div className={styles.categoriesGrid}>
            {CATEGORIES.map((cat, i) => (
              <div key={i} className={styles.categoryCard} onClick={() => navigate('/auth')}>
                <div className={styles.categoryIcon}>{cat.icon}</div>
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
              <div className={styles.statLabel}>Việc làm đang tuyển</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNum}>20,000+</div>
              <div className={styles.statLabel}>Nhà tuyển dụng uy tín</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNum}>5 triệu+</div>
              <div className={styles.statLabel}>Ứng viên đăng ký</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNum}>15 năm</div>
              <div className={styles.statLabel}>Kinh nghiệm tuyển dụng</div>
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
                <h3 className={styles.ctaTitle}>Dành Cho Nhà Tuyển Dụng</h3>
                <p className={styles.ctaDesc}>Đăng tin tuyển dụng miễn phí, tìm kiếm ứng viên chất lượng, tiếp cận 5 triệu+ ứng viên tiềm năng.</p>
              </div>
            </div>
            <div className={styles.ctaButtons}>
              <button className={styles.ctaBtnPrimary} onClick={() => navigate('/auth')}>Đăng Tuyển Dụng</button>
              <button className={styles.ctaBtnSecondary} onClick={() => navigate('/auth')}>Tìm Ứng Viên</button>
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
              <p className={styles.footerDesc}>Nền tảng tuyển dụng và tìm việc làm hàng đầu Việt Nam</p>
            </div>
            <div className={styles.footerLinks}>
              <h4>Ứng Viên</h4>
              <a onClick={() => navigate('/auth')}>Tìm việc làm</a>
              <a onClick={() => navigate('/auth')}>Tạo hồ sơ</a>
              <a onClick={() => navigate('/auth')}>Thông báo việc làm</a>
            </div>
            <div className={styles.footerLinks}>
              <h4>Nhà Tuyển Dụng</h4>
              <a onClick={() => navigate('/auth')}>Đăng tin tuyển dụng</a>
              <a onClick={() => navigate('/auth')}>Tìm ứng viên</a>
              <a onClick={() => navigate('/auth')}>Sản phẩm & Dịch vụ</a>
            </div>
            <div className={styles.footerLinks}>
              <h4>Về Chúng Tôi</h4>
              <a onClick={() => navigate('/auth')}>Giới thiệu</a>
              <a onClick={() => navigate('/auth')}>Liên hệ</a>
              <a onClick={() => navigate('/auth')}>Điều khoản sử dụng</a>
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