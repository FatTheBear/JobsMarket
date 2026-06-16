import React, { useState, useMemo } from 'react';
import './JobPosting.css';
import JobSkillsManager from '../JobSkillsManager/JobSkillsManager';
import axios from 'axios';
const API_URL = 'http://localhost:5000';
import { useNavigate } from "react-router-dom";

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

const todayStr = () => new Date().toISOString().split('T')[0];

export default function JobPosting() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    title: '',
    template: '',
    description: '',
    requirements: '',
    benefits: '',
    email: '',
    salary_type: 'specific',
    salary_min: '',
    salary_max: '',
    job_type: 'Full-time',
    deadline: '',
    loc: ''
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [postedJobId, setPostedJobId] = useState(null);

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

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!form.title.trim()) {
      showToast('Please enter the job title', 'error');
      return;
    }
    if (!form.description.trim()) {
      showToast('Please enter the job description', 'error');
      return;
    }
    if (!form.requirements.trim()) {
      showToast('Please enter the job requirements', 'error');
      return;
    }
    if (form.salary_type === 'specific') {
      if (!form.salary_min || !form.salary_max) {
        showToast('Please enter both Minimum Salary and Maximum Salary', 'error');
        return;
      }
      if (parseInt(form.salary_min) > parseInt(form.salary_max)) {
        showToast('Minimum salary cannot be greater than Maximum salary', 'error');
        return;
      }
    }
    if (form.deadline && form.deadline < todayStr()) {
      showToast('Application deadline must be from today onwards', 'error');
      return;
    }

    setLoading(true);
    try {
      const currentUserId = localStorage.getItem('userId');
      const payload = {
        title: form.title,
        description: form.description,
        requirements: form.requirements,
        salary_min: form.salary_type === 'specific' ? parseInt(form.salary_min) : (form.salary_type === 'unpaid' ? 0 : null),
        salary_max: form.salary_type === 'specific' ? parseInt(form.salary_max) : (form.salary_type === 'unpaid' ? 0 : null),
        job_type: form.job_type,
        deadline: form.deadline || null,
        hr_id: currentUserId,
      };
      
      const token = localStorage.getItem('token');
     
      const res = await axios.post('http://localhost:5000/api/jobs', payload, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.status === 201 || res.status === 200) {
        showToast('Job successfully posted', 'success');
        setTimeout(() => {
          navigate('/company/profile');
        }, 1500);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to post job';
      showToast(errorMsg, 'error');
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
      salary_type: 'specific',
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
 
        <main className="main-form">
          <div className="jp-header-row">
            <div>
              <div className="jp-breadcrumb">
                Dashboard / Post a New Job
              </div>
              <h2 className="jp-page-heading">
                Post a New Job
              </h2>
            </div>
          </div>
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

                      {/* STEP 1 */}
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

                      {/* STEP 2 */}
                      {currentStep === 2 && (
                        <>
                          <div className="jp-field">
                            <label>Salary Type <span>*</span></label>
                            <div className="jp-salary-type-options" style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <input type="radio" name="salary_type" value="specific" checked={form.salary_type === 'specific'} onChange={handleChange} /> Specific
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <input type="radio" name="salary_type" value="negotiable" checked={form.salary_type === 'negotiable'} onChange={handleChange} /> Negotiable
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <input type="radio" name="salary_type" value="unpaid" checked={form.salary_type === 'unpaid'} onChange={handleChange} /> Unpaid (Internship)
                              </label>
                            </div>
                          </div>

                          {form.salary_type === 'specific' && (
                            <div className="jp-row jp-row-two">
                              <div className="jp-field">
                                <label>Minimum Salary (VND) <span>*</span></label>
                                <input type="number" name="salary_min" value={form.salary_min} onChange={handleChange} placeholder="e.g., 10000000" />
                              </div>
                              <div className="jp-field">
                                <label>Maximum Salary (VND) <span>*</span></label>
                                <input type="number" name="salary_max" value={form.salary_max} onChange={handleChange} placeholder="e.g., 20000000" />
                              </div>
                            </div>
                          )}
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

                      {/* STEP 3 */}
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
                    </div>
                  </div>

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
                      <button type="button" className="jp-btn jp-btn-primary" onClick={(e)=>{handleSubmit(e)}} disabled={loading}>
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
      {toast.show && (
        <div className={`toast-message ${toast.type}`}>
          {toast.message}
        </div>
      )}

        </main>
      
    
  );
}