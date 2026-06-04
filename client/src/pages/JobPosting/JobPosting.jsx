import React, { useState, useMemo } from 'react';
import './JobPosting.css';
import JobSkillsManager from '../JobSkillsManager/JobSkillsManager';

const API_URL = 'http://localhost:5000';
const TEMP_HR_ID = 1;

const TEMPLATES = [
  { id: '', label: 'Select template...' },
  { id: 'frontend', label: 'Frontend Developer' },
  { id: 'backend', label: 'Backend Developer' },
  { id: 'designer', label: 'UI/UX Designer' },
];

const TEMPLATE_CONTENT = {
  frontend: {
    description: 'Design and build web interfaces, optimize user experience, and collaborate with product/dev teams.',
    requirements: '- Proficient in React/Next.js\n- Good understanding of HTML/CSS/JavaScript\n- Experience with REST APIs\n- TypeScript knowledge is a plus',
    benefits: '- Competitive salary\n- Project bonuses\n- Social insurance\n- Regular internal training',
  },
  backend: {
    description: 'Build APIs, optimize backend systems, manage databases, and integrate various services.',
    requirements: '- Proficient in Node.js/Express or Python/Django\n- Strong MySQL or MongoDB knowledge\n- REST API design experience\n- Docker & CI/CD experience is a plus',
    benefits: '- Professional environment\n- Performance bonuses\n- Annual health check\n- Monthly team building',
  },
  designer: {
    description: 'Design web/mobile interfaces, build brand identity systems, and collaborate with developers.',
    requirements: '- Experience with Figma/Adobe XD\n- Basic UX/UI knowledge\n- Design portfolio required\n- Basic HTML/CSS is a plus',
    benefits: '- Salary based on performance\n- Full holiday benefits\n- Creative environment\n- Promotion opportunities',
  },
};

const JOB_OPTIONS = ['Select Job', 'Frontend Developer', 'Backend Developer', 'UI/UX Designer'];
const LANGUAGE_OPTIONS = ['Select Language', 'Vietnamese', 'English', 'Japanese'];
const DEGREE_OPTIONS = ['Select Degree', 'College', 'Bachelor', 'Master'];
const STATUS_TABS = [
  { id: 'all', label: 'All', count: 0 },
  { id: 'unread', label: 'Unread', count: 0 },
  { id: 'shortlist', label: 'Shortlisted', count: 0 },
  { id: 'contacted', label: 'Contacted', count: 0 },
  { id: 'interview', label: 'Interview', count: 0 },
  { id: 'offer', label: 'Offered', count: 0 },
  { id: 'hired', label: 'Hired', count: 0 },
  { id: 'rejected', label: 'Rejected', count: 0 },
];

const APPLICANTS_DATA = [
  {
    id: 1,
    name: 'Nguyen Van An',
    email: 'an.nguyen@example.com',
    phone: '0909123456',
    school: 'Bach Khoa University',
    major: 'Information Technology',
    jobTitle: 'Frontend Developer',
    status: 'unread',
    language: 'English',
    degree: 'Bachelor',
    label: 'React, UI',
    appliedAt: '2026-05-28',
    location: 'Ho Chi Minh',
    experience: '3 years',
  },
  {
    id: 2,
    name: 'Tran Thi Binh',
    email: 'binh.tran@example.com',
    phone: '0912345678',
    school: 'National Economics University',
    major: 'Business Administration',
    jobTitle: 'Backend Developer',
    status: 'shortlist',
    language: 'Vietnamese',
    degree: 'Bachelor',
    label: 'Node.js, REST API',
    appliedAt: '2026-05-27',
    location: 'Hanoi',
    experience: '4 years',
  },
];

const parseDate = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const STATUS_LABELS = {
  unread: 'Unread',
  shortlist: 'Shortlisted',
  contacted: 'Contacted',
  interview: 'Interview',
  offer: 'Offered',
  hired: 'Hired',
  rejected: 'Rejected',
};

const normalizeText = (text) =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const isInDateRange = (appliedAt, range) => {
  if (!range) return true;
  const parts = range.split('-').map((part) => part.trim());
  if (parts.length !== 2) return true;
  const [fromPart, toPart] = parts;
  const parseDMY = (value) => {
    const [day, month, year] = value.split('/').map(Number);
    return new Date(year, month - 1, day);
  };
  try {
    const fromDate = parseDMY(fromPart);
    const toDate = parseDMY(toPart);
    const target = parseDate(appliedAt);
    return target >= fromDate && target <= toDate;
  } catch {
    return true;
  }
};

const todayStr = () => new Date().toISOString().split('T')[0];

export default function JobPosting() {
  const [activeSection, setActiveSection] = useState('applicants');
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    title: '',
    template: '',
    description: '',
    requirements: '',
    benefits: '',
    email: '',
    salary_min: '',
    salary_max: '',
    job_type: 'Full-time',
    deadline: '',
    loc: ''
  });
  const [filters, setFilters] = useState({
    search: '',
    job: '',
    date: '',
    language: '',
    degree: '',
    label: '',
  });
  const [activeStatus, setActiveStatus] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [postedJobId, setPostedJobId] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const openApplicantProfile = (applicant) => setSelectedApplicant(applicant);
  const closeApplicantProfile = () => setSelectedApplicant(null);

  const filteredApplicants = useMemo(() => {
    return APPLICANTS_DATA.filter((applicant) => {
      if (activeStatus !== 'all' && applicant.status !== activeStatus) return false;
      if (filters.job && applicant.jobTitle !== filters.job) return false;
      if (filters.language && applicant.language !== filters.language) return false;
      if (filters.degree && applicant.degree !== filters.degree) return false;
      if (filters.label && !applicant.label.toLowerCase().includes(filters.label.toLowerCase())) return false;
      if (filters.search) {
        const query = normalizeText(filters.search);
        const haystack = normalizeText([
          applicant.name,
          applicant.email,
          applicant.phone,
          applicant.school,
          applicant.major,
          applicant.jobTitle,
          applicant.label,
        ].join(' '));
        if (!haystack.includes(query)) return false;
      }
      if (!isInDateRange(applicant.appliedAt, filters.date)) return false;
      return true;
    });
  }, [filters, activeStatus]);

  const statusTabsWithCounts = useMemo(() => {
    return STATUS_TABS.map((tab) => {
      if (tab.id === 'all') {
        return { ...tab, count: APPLICANTS_DATA.length };
      }
      return { ...tab, count: APPLICANTS_DATA.filter((a) => a.status === tab.id).length };
    });
  }, []);

  const setTemplate = (templateId) => {
    const preset = TEMPLATE_CONTENT[templateId];
    setForm((prev) => ({
      ...prev,
      template: templateId,
      description: preset ? preset.description : prev.description,
      requirements: preset ? preset.requirements : prev.requirements,
      benefits: preset ? preset.benefits : prev.benefits,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ search: '', job: '', date: '', language: '', degree: '', label: '' });
    setActiveStatus('all');
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      showToast('Job title is required', 'error');
      return;
    }
    if (!form.description.trim()) {
      showToast('Job description is required', 'error');
      return;
    }
    if (!form.requirements.trim()) {
      showToast('Job requirements are required', 'error');
      return;
    }
    if (form.salary_min && form.salary_max && parseInt(form.salary_min) > parseInt(form.salary_max)) {
      showToast('Minimum salary cannot exceed maximum salary', 'error');
      return;
    }
    if (form.deadline && form.deadline < todayStr()) {
      showToast('Deadline must be today or later', 'error');
      return;
    }


    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        requirements: form.requirements,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
        job_type: form.job_type,
        deadline: form.deadline || null,
        hr_id: TEMP_HR_ID,
      };

      const res = await axios.post('http://localhost:5000/api/jobs', payload);
      const data = await res.json();

      if (res.ok) {
        showToast('Job successfully posted', 'success');

        navigate('/company-profile'); // hoặc dashboard
      } else {
        showToast(data.message || 'Failed to post job', 'error');
      }
    } catch {
      showToast('Failed to connect to the server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      title: '',
      template: '',
      description: '',
      requirements: '',
      benefits: '',
      email: '',
      salary_min: '',
      salary_max: '',
      job_type: 'Full-time',
      deadline: '',
      loc: ''
    });
    setPostedJobId(null);
  };

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div className="job-posting-page">
      <div className="job-posting-shell">

        {/* ========================================== */}
        {/* CỘT TRÁI: SIDEBAR CỦA COMPANY              */}
        {/* ========================================== */}
        <aside className="jp-sidebar">
          <div className="jp-sidebar-brand">JobsMarket</div>
          <div className="jp-sidebar-section-title">
            <span className="jp-sidebar-icon">☰</span>
            Dashboard
          </div>
          <div className="jp-menu-group">
            <div className="jp-menu-title">JOB MANAGEMENT</div>
            <button className="jp-menu-item">Job List <span>0</span></button>
            <button
              className={`jp-menu-item ${activeSection === 'post' ? 'active' : ''}`}
              onClick={() => setActiveSection('post')}
            >
              Post a New Job
            </button>
          </div>
          <div className="jp-menu-group">
            <div className="jp-menu-title">CANDIDATE MANAGEMENT</div>
            <button
              className={`jp-menu-item ${activeSection === 'applicants' ? 'active' : ''}`}
              onClick={() => setActiveSection('applicants')}
            >
              Applied Candidates <span>{APPLICANTS_DATA.length}</span>
            </button>
            <button className="jp-menu-item">Saved Candidates <span>0</span></button>
            <button className="jp-menu-item">Unlocked Contacts</button>
            <button className="jp-menu-item">Supported Candidates <span>0</span></button>
            <button className="jp-menu-item">Connection Requests</button>
            <button className="jp-menu-item">Search Candidates</button>
          </div>
          <div className="jp-promo-card">
            <div className="jp-promo-title">NEW FEATURE</div>
            <div className="jp-promo-action">Connect via Zalo</div>
          </div>
        </aside>

        {/* ========================================== */}
        {/* CỘT PHẢI: NỘI DUNG CHÍNH                   */}
        {/* ========================================== */}
        <main className="jp-content">
          <div className="jp-header-row">
            <div>
              <div className="jp-breadcrumb">
                Dashboard / {activeSection === 'applicants' ? 'Applied Candidates' : 'Post a New Job'}
              </div>
              <h2 className="jp-page-heading">
                {activeSection === 'applicants' ? 'Applied Candidates' : 'Post a New Job'}
              </h2>
            </div>
            <button className="jp-post-button" onClick={() => setActiveSection('post')}>Post New Job</button>
          </div>

          {activeSection === 'applicants' ? (
            <>
              {/* FILTER SECTION */}
              <div className="jp-card jp-filter-card">
                <div className="jp-card-body jp-filter-grid">
                  <div className="jp-filter-item jp-filter-full">
                    <label>Search by keyword</label>
                    <input
                      type="text"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Candidate name, email, phone, school, major..."
                    />
                  </div>
                  <div className="jp-filter-item">
                    <label>Active Jobs</label>
                    <select name="job" value={filters.job} onChange={handleFilterChange}>
                      {JOB_OPTIONS.map((option) => (
                        <option key={option} value={option === 'Select Job' ? '' : option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="jp-filter-item">
                    <label>Application Date</label>
                    <input
                      type="text"
                      name="date"
                      value={filters.date}
                      onChange={handleFilterChange}
                      placeholder="DD/MM/YYYY - DD/MM/YYYY"
                    />
                  </div>
                  <div className="jp-filter-item">
                    <label>Language</label>
                    <select name="language" value={filters.language} onChange={handleFilterChange}>
                      {LANGUAGE_OPTIONS.map((option) => (
                        <option key={option} value={option === 'Select Language' ? '' : option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="jp-filter-item">
                    <label>Degree</label>
                    <select name="degree" value={filters.degree} onChange={handleFilterChange}>
                      {DEGREE_OPTIONS.map((option) => (
                        <option key={option} value={option === 'Select Degree' ? '' : option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="jp-filter-item jp-filter-full">
                    <label>Candidate Labels</label>
                    <input
                      type="text"
                      name="label"
                      value={filters.label}
                      onChange={handleFilterChange}
                      placeholder="Search by candidate labels"
                    />
                  </div>
                  <div className="jp-filter-footer">
                    <button type="button" className="jp-btn jp-btn-outline" onClick={resetFilters}>
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* STATUS TABS */}
              <div className="jp-card jp-status-card">
                <div className="jp-status-tabs">
                  {statusTabsWithCounts.map((tab) => (
                    <button
                      key={tab.id}
                      className={`jp-status-tab ${activeStatus === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveStatus(tab.id)}
                    >
                      {tab.label} <span>{tab.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="jp-table-bar">
                <div />
                <div className="jp-export-actions">
                  <button className="jp-btn jp-btn-outline">Export Excel</button>
                  <button className="jp-btn jp-btn-primary">Download All</button>
                </div>
              </div>

              {/* TABLE DATA */}
              <div className="jp-card jp-table-card">
                <div className="jp-table-wrapper">
                  <table className="jp-data-table">
                    <thead>
                      <tr>
                        <th>CANDIDATE</th>
                        <th>APPLIED JOB</th>
                        <th>STATUS</th>
                        <th>APPLICATION DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplicants.length > 0 ? (
                        filteredApplicants.map((applicant) => (
                          <tr
                            key={applicant.id}
                            className="jp-data-row"
                            role="button"
                            tabIndex={0}
                            onClick={() => openApplicantProfile(applicant)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') openApplicantProfile(applicant);
                            }}
                          >
                            <td>
                              <div className="jp-applicant-name">{applicant.name}</div>
                              <div className="jp-applicant-meta">
                                {applicant.major} · {applicant.location} · {applicant.experience}
                              </div>
                            </td>
                            <td>
                              <div>{applicant.jobTitle}</div>
                              <div className="jp-applicant-meta">{applicant.label}</div>
                            </td>
                            <td>
                              <span className={`jp-status-badge jp-status-${applicant.status}`}>
                                {STATUS_LABELS[applicant.status] || 'Unknown'}
                              </span>
                            </td>
                            <td>{new Date(applicant.appliedAt).toLocaleDateString('en-US')}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="jp-table-empty-cell">
                            No results found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* MODAL PROFILE */}
                {selectedApplicant && (
                  <div className="jp-modal-overlay" onClick={closeApplicantProfile}>
                    <div className="jp-modal" onClick={(e) => e.stopPropagation()}>
                      <div className="jp-modal-header">
                        <div>
                          <div className="jp-modal-title">{selectedApplicant.name}</div>
                          <div className="jp-modal-subtitle">
                            {selectedApplicant.jobTitle} · {selectedApplicant.location}
                          </div>
                        </div>
                        <button className="jp-close-btn" onClick={closeApplicantProfile} aria-label="Close profile modal">×</button>
                      </div>
                      <div className="jp-modal-body">
                        <div className="jp-modal-grid">
                          <div className="jp-modal-section">
                            <h3>Contact Information</h3>
                            <p><strong>Email:</strong> {selectedApplicant.email}</p>
                            <p><strong>Phone:</strong> {selectedApplicant.phone}</p>
                            <p><strong>School:</strong> {selectedApplicant.school}</p>
                            <p><strong>Major:</strong> {selectedApplicant.major}</p>
                            <p><strong>Degree:</strong> {selectedApplicant.degree}</p>
                          </div>
                          <div className="jp-modal-section">
                            <h3>Application Details</h3>
                            <p><strong>Applied Position:</strong> {selectedApplicant.jobTitle}</p>
                            <p><strong>Identified Skills:</strong> {selectedApplicant.label}</p>
                            <p><strong>Language:</strong> {selectedApplicant.language}</p>
                            <p><strong>Experience:</strong> {selectedApplicant.experience}</p>
                            <p><strong>Status:</strong> {STATUS_LABELS[selectedApplicant.status] || selectedApplicant.status}</p>
                            <p><strong>Date Applied:</strong> {new Date(selectedApplicant.appliedAt).toLocaleDateString('en-US')}</p>
                          </div>
                        </div>
                        <div className="jp-modal-section jp-modal-notes">
                          <h3>Notes</h3>
                          <p>
                            Expand the actual profile by integrating Candidate Profile data from the system. Currently, this is mock data to simulate the applicant tracking flow.
                          </p>
                        </div>
                        <div className="jp-modal-actions">
                          <button className="jp-btn jp-btn-primary" onClick={closeApplicantProfile}>Close</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="jp-pagination">{filteredApplicants.length} applicants</div>
              </div>
            </>
          ) : (
            <>
              {/* JOB POSTING STEPPER */}
              <div className="jp-stepper">
                <div className={`jp-step ${currentStep === 1 ? 'active' : ''}`}>
                  <div className="jp-step-number">1</div>
                  <div className="jp-step-text">Basic Info</div>
                </div>
                <div className={`jp-step ${currentStep === 2 ? 'active' : ''}`}>
                  <div className="jp-step-number">2</div>
                  <div className="jp-step-text">Details</div>
                </div>
                <div className={`jp-step ${currentStep === 3 ? 'active' : ''}`}>
                  <div className="jp-step-number">3</div>
                  <div className="jp-step-text">Plan & Post</div>
                </div>
              </div>

              {/* FORM SECTIONS */}
              <div className="jp-grid">
                
                <section className="jp-form-panel">
                  <div className="jp-card">
                    <div className="jp-card-title">Job Information</div>
                    <div className="jp-card-body">

                      {/* BƯỚC 1 */}
                      {currentStep === 1 && (
                        <>
                          <div className="jp-field">
                            <label>Job Title <span>*</span></label>
                            <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Enter job title" />
                          </div>

                          <div className="jp-field">
                            <label>Select from templates</label>
                            <select name="template" value={form.template} onChange={(e) => setTemplate(e.target.value)}>
                              {TEMPLATES.map((item) => (
                                <option key={item.id} value={item.id}>{item.label}</option>
                              ))}
                            </select>
                          </div>

                          <div className="jp-field">
                            <label>Job Description <span>*</span></label>
                            <textarea name="description" rows="6" value={form.description} onChange={handleChange} placeholder="Describe the main tasks and scope of work" />
                          </div>

                          <div className="jp-field">
                            <label>Job Requirements <span>*</span></label>
                            <textarea name="requirements" rows="6" value={form.requirements} onChange={handleChange} placeholder="List necessary skills and experience" />
                          </div>

                          <div className="jp-field">
                            <label>Benefits</label>
                            <textarea name="benefits" rows="4" value={form.benefits} onChange={handleChange} placeholder="Describe perks, allowances, and benefits" />
                          </div>

                          <div className="jp-field">
                            <label>Email to receive CVs</label>
                            <input type="text" name="email" value={form.email} onChange={handleChange} placeholder="e.g., hr@company.com" />
                          </div>
                        </>
                      )}

                      {/* BƯỚC 2 */}
                      {currentStep === 2 && (
                        <>
                          <div className="jp-row jp-row-two">
                            <div className="jp-field">
                              <label>Minimum Salary</label>
                              <input type="number" name="salary_min" value={form.salary_min} onChange={handleChange} placeholder="0" />
                            </div>
                            <div className="jp-field">
                              <label>Maximum Salary</label>
                              <input type="number" name="salary_max" value={form.salary_max} onChange={handleChange} placeholder="0" />
                            </div>
                          </div>
                          <div className="jp-row jp-row-two">
                            <div className="jp-field">
                              <label>Job Type</label>
                              <select name="job_type" value={form.job_type} onChange={handleChange}>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Freelance">Freelance</option>
                              </select>
                            </div>
                            <div className="jp-field">
                              <label>Application Deadline</label>
                              <input type="date" name="deadline" value={form.deadline} onChange={handleChange} min={todayStr()} />
                            </div>
                          </div>
                          <div className="jp-field">
                            <label>Location</label>
                            <input type="text" name="loc" value={form.loc || ''} onChange={handleChange} placeholder="e.g., Ho Chi Minh City" />
                          </div>
                        </>
                      )}

                      {/* BƯỚC 3 */}
                      {currentStep === 3 && (
                        <div className="jp-pricing-plans">
                          <h3>Select your posting plan</h3>
                          <div className="plan-card">
                            <h4>FREE Plan</h4>
                            <p>Post up to 2 jobs for new members</p>
                            <input type="radio" name="plan" value="free" defaultChecked />
                          </div>
                          <div className="plan-card premium">
                            <h4>GOLD Plan</h4>
                            <p>Post 10 featured jobs per day</p>
                            <input type="radio" name="plan" value="gold" />
                          </div>
                        </div>
                      )}
                    </div> {/* Đóng jp-card-body */}
                  </div> {/* Đóng jp-card */}

                  {/* BUTTON ACTIONS */}
                  <div className="jp-actions">
                    {currentStep > 1 && (
                      <button type="button" className="jp-btn jp-btn-cancel" onClick={() => setCurrentStep(prev => prev - 1)}>
                        Back
                      </button>
                    )}

                    {currentStep < 3 ? (
                      <button type="button" className="jp-btn jp-btn-primary" onClick={() => setCurrentStep(prev => prev + 1)}>
                        Next
                      </button>
                    ) : (
                      <button type="button" className="jp-btn jp-btn-primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Creating..." : "Confirm & Post Job"}
                      </button>
                    )}
                  </div>

                  {postedJobId && (
                    <div className="jp-card jp-card-fit">
                      <div className="jp-card-title">Completed</div>
                      <div className="jp-card-body">
                        Job posting has been created. Continue to add required skills below.
                      </div>
                    </div>
                  )}

                  {postedJobId && <JobSkillsManager jobId={postedJobId} />}
                </section>

                <aside className="jp-guide-panel">
                  <div className="jp-guide-card">
                    <div className="jp-guide-title">Guidelines</div>
                    <ul>
                      <li>Describe the main tasks, required skills, and location clearly.</li>
                      <li>Avoid using excessive emojis or icons; keep text professional.</li>
                      <li>List at least 3 specific requirements.</li>
                      <li>Clearly state benefits such as salary and allowances.</li>
                    </ul>
                  </div>
                  <div className="jp-guide-card jp-hint-card">
                    <div className="jp-guide-title">JD Suggestions</div>
                    <p>Select a template to auto-fill job descriptions based on standard industry roles.</p>
                  </div>
                </aside>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}