import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UserDashboard.module.css';
import axios from 'axios';
import JobCard from '../../../components/Jobs/JobCard';

const LOCATION_API = 'https://provinces.open-api.vn/api';

const removeAccents = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

const translateLocation = (name) => {
  if (!name) return '';
  const prefixes = [
    'Thành phố ', 'Tỉnh ', 'Quận ', 'Huyện ',
    'Thị xã ', 'Phường ', 'Xã ', 'Thị trấn '
  ];
  let result = name;
  for (const prefix of prefixes) {
    if (result.startsWith(prefix)) {
      result = result.slice(prefix.length);
      break;
    }
  }
  return removeAccents(result);
};

const JOB_TYPES = ['Full-time', 'Part-time', 'Freelance'];
const EXPERIENCE_LEVELS = ['Not Required', 'Under 1 year', '1 - 3 years', '3 - 5 years', 'Over 5 years'];
const SALARY_RANGES = ['Negotiable', 'Under 10M', '10M - 20M', 'Over 20M'];

const INDUSTRY_BANNERS = [
  { bg: 'linear-gradient(135deg, #1e3a6e 0%, #2563ab 60%, #1e5c8b 100%)', title: 'Information Technology', sub: 'Explore top tech roles: Software Engineering, Data Science, AI, and more.' },
  { bg: 'linear-gradient(135deg, #0f2d5e 0%, #c0392b 100%)', title: 'Finance & Banking', sub: 'Accelerate your career in Investment, Accounting, and Financial Analysis.' },
  { bg: 'linear-gradient(135deg, #1a4731 0%, #27ae60 100%)', title: 'Marketing & PR', sub: 'Unleash your creativity in Digital Marketing, Public Relations, and Brand Management.' },
];

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [bannerIdx, setBannerIdx] = useState(0);
  const bannerTimerRef = useRef(null);
  const [jobs, setJobs] = useState([]);

  // Advanced filter states
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState([]);
  const [selectedSalary, setSelectedSalary] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [provinces, setProvinces] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [skillKeyword, setSkillKeyword] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState([]);

  useEffect(() => {
    bannerTimerRef.current = setInterval(() => {
      setBannerIdx(prev => (prev + 1) % INDUSTRY_BANNERS.length);
    }, 4000);
    return () => clearInterval(bannerTimerRef.current);
  }, []);

  useEffect(() => {
    axios.get(`${LOCATION_API}/?depth=1`).then(res => {
      const names = res.data.map(p => translateLocation(p.name)).sort();
      setProvinces(names);
    }).catch(err => console.error('Failed to load provinces:', err));
  }, []);
  useEffect(() => {
    axios.get('http://localhost:5000/api/industries').then(res => setIndustries(res.data));
    axios.get('http://localhost:5000/api/skills').then(res => setSkills(res.data));
  }, []);

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

      {/* ── BANNER ── */}
      <section className={styles.banner} style={{ background: INDUSTRY_BANNERS[bannerIdx].bg }}>
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <div className={styles.bannerText}>
            <h1 className={styles.bannerTitle}>{INDUSTRY_BANNERS[bannerIdx].title}</h1>
            <p className={styles.bannerSub}>{INDUSTRY_BANNERS[bannerIdx].sub}</p>
          </div>

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

        {/* <div className={styles.bannerDots}>
          {INDUSTRY_BANNERS.map((_, i) => (
            <button
              key={i}
              className={`${styles.bannerDot} ${i === bannerIdx ? styles.bannerDotActive : ''}`}
              onClick={() => setBannerIdx(i)}
            />
          ))}
        </div> */}
      </section>

      {/* ── JOB SECTION: Filter Left + List Right ── */}
      <section className={styles.jobSection}>
        <div className={styles.jobSectionInner}>

          {/* LEFT: Filter Panel */}
          <aside className={styles.filterPanel}>
            <div className={styles.filterHeader}>
              <span className={styles.filterTitle}>
                🎚 Advanced Filters
                {activeFilterCount > 0 && (
                  <span className={styles.filterBadge}>{activeFilterCount}</span>
                )}
              </span>
              {activeFilterCount > 0 && (
                <button className={styles.filterClearBtn} onClick={clearAllFilters}>Clear all</button>
              )}
            </div>

            {/* Location filter */}
            <div className={styles.filterGroup}>
              <p className={styles.filterGroupLabel}>📍 Location</p>
              <select
                className={styles.filterSelect}
                value={filterLocation}
                onChange={e => setFilterLocation(e.target.value)}
              >
                <option value="">All locations</option>
                {provinces.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Job Type */}
            <div className={styles.filterGroup}>
              <p className={styles.filterGroupLabel}>💼 Job Type</p>
              {JOB_TYPES.map(type => (
                <label key={type} className={styles.filterCheckLabel}>
                  <input
                    type="checkbox"
                    checked={selectedJobTypes.includes(type)}
                    onChange={() => toggleCheckbox(type, selectedJobTypes, setSelectedJobTypes)}
                  />
                  {type}
                </label>
              ))}
            </div>

            {/* Experience */}
            <div className={styles.filterGroup}>
              <p className={styles.filterGroupLabel}>🎓 Experience</p>
              {EXPERIENCE_LEVELS.map(exp => (
                <label key={exp} className={styles.filterCheckLabel}>
                  <input
                    type="checkbox"
                    checked={selectedExperience.includes(exp)}
                    onChange={() => toggleCheckbox(exp, selectedExperience, setSelectedExperience)}
                  />
                  {exp}
                </label>
              ))}
            </div>

            {/* Salary */}
            <div className={styles.filterGroup}>
              <p className={styles.filterGroupLabel}>💰 Salary Range</p>
              {SALARY_RANGES.map(range => (
                <label key={range} className={styles.filterCheckLabel}>
                  <input
                    type="radio"
                    name="salary"
                    checked={selectedSalary === range}
                    onChange={() => setSelectedSalary(range)}
                  />
                  {range}
                </label>
              ))}
            </div>
            {/* Industry */}
            <div className={styles.filterGroup}>
              <p className={styles.filterGroupLabel}>🏢 Industry</p>
              {industries.map(ind => (
                <label key={ind.id} className={styles.filterCheckLabel}>
                  <input
                    type="checkbox"
                    checked={selectedIndustries.includes(ind.id)}
                    onChange={() => toggleCheckbox(ind.id, selectedIndustries, setSelectedIndustries)}
                  />
                  {ind.name}
                </label>
              ))}
            </div>

            {/* Skills */}
            <div className={styles.filterGroup}>
              <p className={styles.filterGroupLabel}>⚡ Skills / Requirements</p>
              <input
                className={styles.filterSelect}
                type="text"
                placeholder="e.g. ReactJS, MySQL..."
                value={skillKeyword}
                onChange={e => setSkillKeyword(e.target.value)}
              />
            </div>
          </aside>


          {/* RIGHT: Job List */}
          <div className={styles.jobListPanel}>
            <div className={styles.jobListHeader}>
              <h2 className={styles.jobListTitle}>
                Recommended for you
                <span className={styles.jobListCount}>{filteredJobs.length} jobs</span>
              </h2>
            </div>

            {filteredJobs.length === 0 ? (
              <div className={styles.jobEmpty}>
                <p>No jobs match your current filters.</p>
                <button className={styles.filterClearBtn} onClick={clearAllFilters}>Reset filters</button>
              </div>
            ) : (
              <div className={styles.jobListStack}>
                {filteredJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
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