import React from 'react';

const CandidateExperience = ({
  workExperiences,
  onOpenModal,
  onDelete,
  showModal,
  onCloseModal,
  currentExperience,
  experienceForm,
  setExperienceForm,
  onSave
}) => {
  return (
    <>
      {/* Column 1: Experience Section */}
      <div className="col-12 col-lg-4 mb-4 d-flex">
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

            <div className="d-flex flex-column gap-3 flex-grow-1">
              {workExperiences.map((exp, index) => (
                <div key={exp.id || index} className="experience-item p-3 rounded border bg-light flex-grow-1 d-flex flex-column justify-content-between position-relative">
                  <div className="position-absolute top-0 end-0 mt-2 me-2 d-flex gap-2">
                    <button onClick={() => onOpenModal(exp)} className="btn btn-link text-primary p-0" title="Edit experience">
                      <i className="fas fa-pencil-alt text-muted hover-primary" style={{ fontSize: '0.8rem' }}></i>
                    </button>
                    <button onClick={() => onDelete(exp.id)} className="btn btn-link text-danger p-0" title="Delete experience">
                      <i className="fas fa-trash-alt text-muted hover-danger" style={{ fontSize: '0.8rem' }}></i>
                    </button>
                  </div>
                  <h6 className="fw-bold mb-2 text-dark text-hover-primary" style={{ fontSize: '0.9rem', paddingRight: '40px' }}>
                    {exp.role}
                  </h6>
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-auto">
                    <span className="text-muted small fw-semibold" style={{ fontSize: '0.75rem' }}>
                      <i className="fas fa-building text-primary me-1.5"></i>
                      {exp.company}
                    </span>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-1 fw-normal d-inline-flex align-items-center" style={{ fontSize: '0.7rem' }}>
                      <i className="far fa-calendar-alt me-1"></i>
                      {exp.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Experience Add/Edit Modal */}
      {showModal && (
        <div className="profile-modal-overlay" style={{ zIndex: 1100 }} onClick={onCloseModal}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
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
            <form onSubmit={onSave} className="profile-modal-body p-4 d-flex flex-column gap-3">
              <div>
                <label className="form-label fw-semibold text-secondary small">Job Title / Role</label>
                <input
                  type="text"
                  className="form-control"
                  value={experienceForm.role}
                  onChange={(e) => setExperienceForm({ ...experienceForm, role: e.target.value })}
                  placeholder="e.g. Senior Frontend Developer"
                  required
                />
              </div>
              <div>
                <label className="form-label fw-semibold text-secondary small">Company Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={experienceForm.company}
                  onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                  placeholder="e.g. Google Corporation"
                  required
                />
              </div>
              <div>
                <label className="form-label fw-semibold text-secondary small">Working Time / Duration</label>
                <input
                  type="text"
                  className="form-control"
                  value={experienceForm.duration}
                  onChange={(e) => setExperienceForm({ ...experienceForm, duration: e.target.value })}
                  placeholder="e.g. Tháng 09/2024 - Hiện tại"
                  required
                />
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

export default CandidateExperience;
