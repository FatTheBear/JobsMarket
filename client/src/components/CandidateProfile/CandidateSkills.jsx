import React from 'react';

const CandidateSkills = ({
  skills,
  onOpenModal,
  onDelete,
  showModal,
  onCloseModal,
  currentSkill,
  skillForm,
  setSkillForm,
  onSave
}) => {
  return (
    <>
      {/* Column 2: Skill Section */}
      <div className="col-12 col-lg-4 mb-4 d-flex">
        <div className="card border-0 shadow-sm analytics-card w-100 d-flex flex-column h-100">
          <div className="card-body p-4 d-flex flex-column h-100">
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <div className="d-flex align-items-center gap-2">
                <span className="fs-5 fw-bold text-dark mb-0">Skill</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button 
                  onClick={() => onOpenModal(null)} 
                  className="btn btn-sm btn-outline-primary rounded-circle p-0 d-flex align-items-center justify-content-center" 
                  style={{ width: '28px', height: '28px' }} 
                  title="Add Skill"
                >
                  <i className="fas fa-plus" style={{ fontSize: '0.8rem' }}></i>
                </button>
                <i className="fas fa-laptop-code text-primary fs-4"></i>
              </div>
            </div>

            <div className="d-flex flex-column justify-content-between flex-grow-1">
              {skills.map((skill, index) => (
                <div key={skill.id || index} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <p className="mb-0 text-small fw-semibold text-dark">{skill.name}</p>
                    <div className="d-flex gap-2">
                      <button onClick={() => onOpenModal(skill)} className="btn btn-link text-primary p-0" title="Edit skill">
                        <i className="fas fa-pencil-alt text-muted hover-primary" style={{ fontSize: '0.8rem' }}></i>
                      </button>
                      <button onClick={() => onDelete(skill.id)} className="btn btn-link text-danger p-0" title="Delete skill">
                        <i className="fas fa-trash-alt text-muted hover-danger" style={{ fontSize: '0.8rem' }}></i>
                      </button>
                    </div>
                  </div>
                  <div className="progress rounded progress-custom">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${skill.level}%` }}
                      aria-valuenow={skill.level}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skill Add/Edit Modal */}
      {showModal && (
        <div className="profile-modal-overlay" style={{ zIndex: 1100 }} onClick={onCloseModal}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h5 className="profile-modal-title">
                <i className="fas fa-laptop-code me-2 text-primary"></i>
                {currentSkill ? 'Edit Skill' : 'Add Skill'}
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
                <label className="form-label fw-semibold text-secondary small">Skill Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  placeholder="e.g. React.js, Tailwind CSS"
                  required
                />
              </div>
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-semibold text-secondary small mb-0">Progress Level / Competence</label>
                  <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 fw-bold">{skillForm.level}%</span>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <span className="text-muted small">0%</span>
                  <input
                    type="range"
                    className="form-range flex-grow-1"
                    min="0"
                    max="100"
                    value={skillForm.level}
                    onChange={(e) => setSkillForm({ ...skillForm, level: parseInt(e.target.value) })}
                  />
                  <span className="text-muted small">100%</span>
                </div>
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

export default CandidateSkills;
