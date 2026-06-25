import React, { useState, useRef } from 'react';
import axios from 'axios';

const CandidateExperience = ({
  workExperiences,
  onOpenModal,
  onDelete,
  showModal,
  onCloseModal,
  currentExperience,
  experienceForm,
  setExperienceForm,
  onSave,
  modalError
}) => {
  const [jobSuggestions, setJobSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimerRef = useRef(null);

  const handleJobTitleChange = (e) => {
    const val = e.target.value;
    setExperienceForm({ ...experienceForm, role: val });

    if (!val.trim()) {
      setJobSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `http://localhost:5000/api/candidate/suggest-industries?search=${encodeURIComponent(val.trim())}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setJobSuggestions(res.data || []);
        setShowSuggestions(true);
      } catch (err) {
        console.warn('Failed to fetch job suggestions:', err);
      }
    }, 300);
  };

  const selectSuggestion = (role) => {
    setExperienceForm({ ...experienceForm, role });
    setJobSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <>
      {/* Column 1: Experience Section */}
      <div className="w-100">
        <div className="card border-0 shadow-sm analytics-card w-100 d-flex flex-column h-100">
          <div className="card-body p-4 d-flex flex-column h-100">
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <div className="d-flex align-items-center gap-2">
                <span className="fs-5 fw-bold text-dark mb-0">Experience</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  onClick={() => onOpenModal(null)}
                  className="btn btn-sm btn-outline-primary rounded-circle p-0 d-flex align-items-center justify-content-center"
                  style={{ width: '28px', height: '28px' }}
                  title="Add Experience"
                >
                  <i className="fas fa-plus" style={{ fontSize: '0.8rem' }}></i>
                </button>
                <i className="fas fa-briefcase text-primary fs-4"></i>
              </div>
            </div>

            <div className="d-flex flex-column gap-3">
              {workExperiences.length === 0 ? (
                <div className="text-center py-5 text-muted small">
                  <i className="fas fa-briefcase fs-3 mb-2 text-muted opacity-50"></i>
                  <p className="mb-0">No experiences added yet.</p>
                </div>
              ) : (
                workExperiences.map((exp, index) => (
                  <div key={exp.id || index} className="experience-item p-3 rounded border bg-light d-flex flex-column position-relative">
                    <div className="position-absolute top-0 end-0 mt-3 me-3 d-flex gap-2">
                      <button onClick={() => onOpenModal(exp)} className="btn btn-link text-primary p-0" title="Edit experience" style={{ textDecoration: 'none' }}>
                        <i className="fas fa-pencil-alt text-muted hover-primary" style={{ fontSize: '0.85rem' }}></i>
                      </button>
                      <button onClick={() => onDelete(exp.id)} className="btn btn-link text-danger p-0" title="Delete experience" style={{ textDecoration: 'none' }}>
                        <i className="fas fa-trash-alt text-muted hover-danger" style={{ fontSize: '0.85rem' }}></i>
                      </button>
                    </div>
                    <h6 className="fw-bold mb-3 text-dark text-hover-primary" style={{ fontSize: '0.95rem', paddingRight: '45px', lineHeight: '1.4' }}>
                      {exp.role}
                    </h6>
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                      <span className="text-muted small fw-semibold" style={{ fontSize: '0.75rem' }}>
                        <i className="fas fa-building text-primary me-1.5"></i>
                        {exp.company}
                      </span>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1 fw-normal d-inline-flex align-items-center" style={{ fontSize: '0.7rem' }}>
                        <i className="far fa-calendar-alt me-1"></i>
                        {exp.duration}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Experience Add/Edit Modal */}
      {showModal && (
        <div className="profile-modal-overlay" style={{ zIndex: 100000 }} onClick={onCloseModal}>
          <form className="profile-modal-card" onSubmit={onSave} onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h5 className="profile-modal-title">
                <i className="fas fa-briefcase me-2 text-primary"></i>
                {currentExperience ? 'Edit Experience' : 'Add Experience'}
              </h5>
              <button
                type="button"
                className="profile-modal-close-btn"
                onClick={onCloseModal}
              >
                &times;
              </button>
            </div>
            <div className="profile-modal-body p-4 d-flex flex-column gap-3" style={{ overflowY: 'auto' }}>
              {modalError && (
                <div className="alert alert-danger py-2 px-3 mb-2 small border-0 shadow-sm" role="alert">
                  <i className="fas fa-exclamation-triangle me-1.5"></i> {modalError}
                </div>
              )}
              <div style={{ position: 'relative' }}>
                <label className="form-label fw-semibold text-secondary small">Job Title / Role <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={experienceForm.role}
                  onChange={handleJobTitleChange}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onFocus={() => { if (jobSuggestions.length > 0) setShowSuggestions(true); }}
                  placeholder="e.g. Senior Frontend Developer"
                  autoComplete="off"
                />
                {showSuggestions && jobSuggestions.length > 0 && (
                  <div className="address-suggestions-dropdown" style={{ zIndex: 1200 }}>
                    {jobSuggestions.map((job, idx) => (
                      <div
                        key={idx}
                        className="address-suggestion-item"
                        onClick={() => selectSuggestion(job)}
                      >
                        {job}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="form-label fw-semibold text-secondary small">Company Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={experienceForm.company}
                  onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                  placeholder="e.g. Google Corporation"
                />
              </div>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label fw-semibold text-secondary small">Start Date <span className="text-danger">*</span></label>
                  <input
                    type="month"
                    className="form-control"
                    value={experienceForm.startDate || ''}
                    onChange={(e) => setExperienceForm({ ...experienceForm, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold text-secondary small">End Date</label>
                  <input
                    type="month"
                    className="form-control"
                    value={experienceForm.endDate || ''}
                    onChange={(e) => setExperienceForm({ ...experienceForm, endDate: e.target.value })}
                    placeholder="Present"
                  />
                </div>
              </div>
              <div>
                <label className="form-label fw-semibold text-secondary small">Job Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={experienceForm.description || ''}
                  onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                  placeholder="e.g. Responsible for developing and maintaining web applications, collaborating with design teams..."
                ></textarea>
              </div>
            </div>
            <div className="profile-modal-footer p-3 border-top d-flex gap-2 justify-content-end bg-white mt-auto">
              <button type="button" className="btn btn-light border" onClick={onCloseModal}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export const CandidateExperienceManager = ({ workExperiences, onOpenModal, onDelete }) => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
        <h6 className="fw-bold mb-0 text-dark"><i className="fas fa-briefcase me-1.5 text-primary"></i> Experience</h6>
        <button type="button" onClick={() => onOpenModal(null)} className="btn btn-xs btn-primary rounded-pill px-2.5 py-1 fw-semibold small">
          <i className="fas fa-plus me-1"></i> Add New
        </button>
      </div>
      <div className="d-flex flex-column gap-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {workExperiences.map((exp) => (
          <div key={exp.id} className="d-flex justify-content-between align-items-center p-2.5 rounded border bg-light">
            <div>
              <p className="fw-bold mb-0 text-dark small">{exp.role}</p>
              <p className="mb-0 text-muted small">{exp.company} • {exp.duration}</p>
            </div>
            <div className="d-flex gap-1">
              <button type="button" onClick={() => onOpenModal(exp)} className="btn btn-sm btn-outline-primary px-2 py-1 rounded">
                <i className="fas fa-pencil-alt" style={{ fontSize: '0.75rem' }}></i>
              </button>
              <button type="button" onClick={() => onDelete(exp.id)} className="btn btn-sm btn-outline-danger px-2 py-1 rounded">
                <i className="fas fa-trash-alt" style={{ fontSize: '0.75rem' }}></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateExperience;
