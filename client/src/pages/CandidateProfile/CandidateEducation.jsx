import React, { useState, useEffect, useRef } from 'react';

const CandidateEducation = ({
  educations,
  onOpenModal,
  onDelete,
  showModal,
  onCloseModal,
  currentEducation,
  educationForm,
  setEducationForm,
  onSave,
  modalError
}) => {
  const [degreeSuggestions, setDegreeSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  const [allSchools, setAllSchools] = useState([]);
  const [schoolSuggestions, setSchoolSuggestions] = useState([]);
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);

  useEffect(() => {
    if (!showModal) {
      setDegreeSuggestions([]);
      setShowSuggestions(false);
      setSchoolSuggestions([]);
      setShowSchoolSuggestions(false);
      return;
    }

    const fetchSchools = async () => {
      if (allSchools.length > 0) return;
      setIsLoadingSchools(true);
      try {
        const res = await fetch('http://universities.hipolabs.com/search?country=Vietnam');
        if (res.ok) {
          const data = await res.json();
          const schoolNames = data.map(item => item.name).sort();
          setAllSchools(schoolNames);
        }
      } catch (e) {
        console.warn('Failed to fetch Vietnam universities list', e);
      } finally {
        setIsLoadingSchools(false);
      }
    };

    fetchSchools();
  }, [showModal, allSchools]);

  const handleDegreeChange = (value) => {
    setEducationForm({ ...educationForm, degree: value });

    if (!value.trim()) {
      setDegreeSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`http://localhost:5000/api/candidate/suggest-industries?search=${encodeURIComponent(value.trim())}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDegreeSuggestions(data || []);
          setShowSuggestions(true);
        }
      } catch (e) {
        console.warn('Degree suggestions fetch failed', e);
      }
    }, 300);
  };

  const selectSuggestion = (val) => {
    setEducationForm({ ...educationForm, degree: val });
    setDegreeSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSchoolChange = (value) => {
    setEducationForm({ ...educationForm, school: value });

    if (!value.trim() || allSchools.length === 0) {
      setSchoolSuggestions([]);
      setShowSchoolSuggestions(false);
      return;
    }

    const query = value.toLowerCase();
    const filtered = allSchools
      .filter(name => name.toLowerCase().includes(query))
      .slice(0, 10);
    
    setSchoolSuggestions(filtered);
    setShowSchoolSuggestions(true);
  };

  const selectSchoolSuggestion = (val) => {
    setEducationForm({ ...educationForm, school: val });
    setSchoolSuggestions([]);
    setShowSchoolSuggestions(false);
  };

  return (
    <>
      {/* Column 2: Education Section */}
      <div className="w-100">
        <div className="card border-0 shadow-sm analytics-card w-100 d-flex flex-column h-100">
          <div className="card-body p-4 d-flex flex-column h-100">
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <div className="d-flex align-items-center gap-2">
                <span className="fs-5 fw-bold text-dark mb-0">Education</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  onClick={() => onOpenModal(null)}
                  className="btn btn-sm btn-outline-primary rounded-circle p-0 d-flex align-items-center justify-content-center"
                  style={{ width: '28px', height: '28px' }}
                  title="Add Education"
                >
                  <i className="fas fa-plus" style={{ fontSize: '0.8rem' }}></i>
                </button>
                <i className="fas fa-graduation-cap text-primary fs-4"></i>
              </div>
            </div>

            <div className="d-flex flex-column gap-3">
              {educations.length === 0 ? (
                <div className="text-center py-5 text-muted small">
                  <i className="fas fa-graduation-cap fs-3 mb-2 text-muted opacity-50"></i>
                  <p className="mb-0">No education records added yet.</p>
                </div>
              ) : (
                educations.map((edu, index) => (
                  <div key={edu.id || index} className="experience-item p-3 rounded border bg-light d-flex flex-column position-relative">
                    <div className="position-absolute top-0 end-0 mt-3 me-3 d-flex gap-2">
                      <button onClick={() => onOpenModal(edu)} className="btn btn-link text-primary p-0" title="Edit education" style={{ textDecoration: 'none' }}>
                        <i className="fas fa-pencil-alt text-muted hover-primary" style={{ fontSize: '0.85rem' }}></i>
                      </button>
                      <button onClick={() => onDelete(edu.id)} className="btn btn-link text-danger p-0" title="Delete education" style={{ textDecoration: 'none' }}>
                        <i className="fas fa-trash-alt text-muted hover-danger" style={{ fontSize: '0.85rem' }}></i>
                      </button>
                    </div>
                    <h6 className="fw-bold mb-3 text-dark text-hover-primary" style={{ fontSize: '0.95rem', paddingRight: '45px', lineHeight: '1.4' }}>
                      {edu.degree}
                    </h6>
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                      <span className="text-muted small fw-semibold" style={{ fontSize: '0.75rem' }}>
                        <i className="fas fa-university text-primary me-1.5"></i>
                        {edu.school}
                      </span>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1 fw-normal d-inline-flex align-items-center" style={{ fontSize: '0.7rem' }}>
                        <i className="far fa-calendar-alt me-1"></i>
                        {edu.duration}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Education Add/Edit Modal */}
      {showModal && (
        <div className="profile-modal-overlay" style={{ zIndex: 100000 }} onClick={onCloseModal}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h5 className="profile-modal-title">
                <i className="fas fa-graduation-cap me-2 text-primary"></i>
                {currentEducation ? 'Edit Education' : 'Add Education'}
              </h5>
              <button
                type="button"
                className="profile-modal-close-btn"
                onClick={onCloseModal}
              >
                &times;
              </button>
            </div>
            <form onSubmit={onSave} className="profile-modal-body p-4 d-flex flex-column gap-3">
              {modalError && (
                <div className="alert alert-danger py-2 px-3 mb-2 small border-0 shadow-sm" role="alert">
                  <i className="fas fa-exclamation-triangle me-1.5"></i> {modalError}
                </div>
              )}
              <div style={{ position: 'relative' }}>
                <label className="form-label fw-semibold text-secondary small">Degree / Field of Study <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={educationForm.degree}
                  onChange={(e) => handleDegreeChange(e.target.value)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onFocus={() => { if (degreeSuggestions.length > 0) setShowSuggestions(true); }}
                  placeholder="e.g. Software Engineering"
                  autoComplete="off"
                />
                {showSuggestions && degreeSuggestions.length > 0 && (
                  <div className="position-absolute bg-white border rounded shadow-sm w-100" style={{ zIndex: 1200, top: '100%', maxHeight: '200px', overflowY: 'auto' }}>
                    {degreeSuggestions.map((title, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 cursor-pointer"
                        style={{ fontSize: '0.875rem' }}
                        onMouseDown={() => selectSuggestion(title)}
                      >
                        <i className="fas fa-graduation-cap text-muted me-2" style={{ fontSize: '0.75rem' }}></i>
                        {title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <label className="form-label fw-semibold text-secondary small d-flex justify-content-between align-items-center">
                  <span>School / Institute <span className="text-danger">*</span></span>
                  {isLoadingSchools && (
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                      <i className="fas fa-spinner fa-spin me-1"></i>Loading schools...
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={educationForm.school}
                  onChange={(e) => handleSchoolChange(e.target.value)}
                  onBlur={() => setTimeout(() => setShowSchoolSuggestions(false), 200)}
                  onFocus={() => { if (schoolSuggestions.length > 0) setShowSchoolSuggestions(true); }}
                  placeholder="e.g. FPT Aptech"
                  autoComplete="off"
                />
                {showSchoolSuggestions && schoolSuggestions.length > 0 && (
                  <div className="position-absolute bg-white border rounded shadow-sm w-100" style={{ zIndex: 1200, top: '100%', maxHeight: '200px', overflowY: 'auto' }}>
                    {schoolSuggestions.map((name, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 cursor-pointer"
                        style={{ fontSize: '0.875rem' }}
                        onMouseDown={() => selectSchoolSuggestion(name)}
                      >
                        <i className="fas fa-university text-muted me-2" style={{ fontSize: '0.75rem' }}></i>
                        {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="form-label fw-semibold text-secondary small">Graduation Date <span className="text-danger">*</span></label>
                <input
                  type="month"
                  className="form-control"
                  value={educationForm.gradDate || ''}
                  onChange={(e) => setEducationForm({ ...educationForm, gradDate: e.target.value })}
                  placeholder="Present"
                />
              </div>
              <div>
                <label className="form-label fw-semibold text-secondary small">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={educationForm.description || ''}
                  onChange={(e) => setEducationForm({ ...educationForm, description: e.target.value })}
                  placeholder="Write details about your studies, key achievements, subjects..."
                ></textarea>
              </div>
              <div className="profile-modal-footer mt-3 pt-3 border-top d-flex gap-2 justify-content-end bg-white">
                <button type="button" className="btn btn-light border" onClick={onCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export const CandidateEducationManager = ({ educations, onOpenModal, onDelete }) => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
        <h6 className="fw-bold mb-0 text-dark"><i className="fas fa-graduation-cap me-1.5 text-primary"></i> Education</h6>
        <button type="button" onClick={() => onOpenModal(null)} className="btn btn-xs btn-primary rounded-pill px-2.5 py-1 fw-semibold small">
          <i className="fas fa-plus me-1"></i> Add New
        </button>
      </div>
      <div className="d-flex flex-column gap-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {educations.map((edu) => (
          <div key={edu.id} className="d-flex justify-content-between align-items-center p-2.5 rounded border bg-light">
            <div>
              <p className="fw-bold mb-0 text-dark small">{edu.degree}</p>
              <p className="mb-0 text-muted small">{edu.school} • {edu.duration}</p>
            </div>
            <div className="d-flex gap-1">
              <button type="button" onClick={() => onOpenModal(edu)} className="btn btn-sm btn-outline-primary px-2 py-1 rounded">
                <i className="fas fa-pencil-alt" style={{ fontSize: '0.75rem' }}></i>
              </button>
              <button type="button" onClick={() => onDelete(edu.id)} className="btn btn-sm btn-outline-danger px-2 py-1 rounded">
                <i className="fas fa-trash-alt" style={{ fontSize: '0.75rem' }}></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateEducation;
