import React, { useState, useEffect } from 'react';
import './JobSkillsManager.css';

const API_URL = 'http://localhost:5000';

const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

/**
 * JobSkillsManager
 * Props:
 *   jobId      — ID của job posting cần quản lý skills (required)
 *   readOnly   — nếu true thì chỉ hiển thị, không cho edit (optional)
 */
export default function JobSkillsManager({ jobId, readOnly = false }) {
  const [allSkills, setAllSkills]       = useState([]);  // toàn bộ skill trong DB
  const [jobSkills, setJobSkills]       = useState([]);  // skill đã gắn cho job này
  const [search, setSearch]             = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [minLevel, setMinLevel]         = useState('Beginner');
  const [minYears, setMinYears]         = useState('0');
  const [toast, setToast]               = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading]           = useState(false);

  useEffect(() => {
    fetchAllSkills();
    if (jobId) fetchJobSkills();
  }, [jobId]);

  const fetchAllSkills = async () => {
    try {
      const res = await fetch(`${API_URL}/api/skills`);
      const data = await res.json();
      setAllSkills(Array.isArray(data) ? data : []);
    } catch {
      setAllSkills([]);
    }
  };

  const fetchJobSkills = async () => {
    try {
      const res = await fetch(`${API_URL}/api/skills/job/${jobId}`);
      const data = await res.json();
      setJobSkills(Array.isArray(data) ? data : []);
    } catch {
      setJobSkills([]);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Tạo skill mới nếu chưa có
  const handleCreateSkill = async () => {
    if (!newSkillName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSkillName.trim() }),
      });
      const data = await res.json();
      showToast(`Skill "${data.skill.name}" ready!`, 'success');
      setNewSkillName('');
      await fetchAllSkills();
      setSelectedSkill(data.skill);
    } catch {
      showToast('Cannot connect to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Thêm skill vào job
  const handleAddSkill = async () => {
    if (!selectedSkill) {
      showToast('Please select a skill first', 'error');
      return;
    }
    if (!jobId) {
      showToast('No job selected. Please post the job first.', 'error');
      return;
    }

    // Kiểm tra đã thêm chưa
    if (jobSkills.some(js => js.skill_id === selectedSkill.id)) {
      showToast(`"${selectedSkill.name}" is already added`, 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/skills/job/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill_id: selectedSkill.id,
          min_level: minLevel,
          min_years: parseFloat(minYears) || 0,
        }),
      });
      if (res.ok) {
        showToast(`"${selectedSkill.name}" added!`, 'success');
        setSelectedSkill(null);
        setMinLevel('Beginner');
        setMinYears('0');
        setSearch('');
        await fetchJobSkills();
      } else {
        const data = await res.json();
        showToast(data.message || 'Error adding skill', 'error');
      }
    } catch {
      showToast('Cannot connect to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Xóa skill khỏi job
  const handleRemoveSkill = async (skill_id, skillName) => {
    if (!jobId) return;
    setLoading(true);
    try {
      await fetch(`${API_URL}/api/skills/job/${jobId}/${skill_id}`, {
        method: 'DELETE',
      });
      showToast(`"${skillName}" removed`, 'success');
      await fetchJobSkills();
    } catch {
      showToast('Cannot connect to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Lọc skill theo search
  const filteredSkills = allSkills.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const levelColor = {
    Beginner: '#38a169',
    Intermediate: '#3182ce',
    Advanced: '#d69e2e',
    Expert: '#e53e3e',
  };

  return (
    <div className="jsm-container">
      {/* Toast */}
      <div className={`jsm-toast ${toast.show ? 'show' : ''} ${toast.type}`}>
        {toast.message}
      </div>

      <div className="jsm-header">
        <span className="jsm-icon">🎯</span>
        <div>
          <h2 className="jsm-title">Required Skills</h2>
          <p className="jsm-subtitle">Manage skills required for this job posting</p>
        </div>
      </div>

      {/* Skills đã gắn cho job */}
      <div className="jsm-section">
        <div className="jsm-section-label">
          Skills added ({jobSkills.length})
        </div>
        {jobSkills.length === 0 ? (
          <div className="jsm-empty">No skills added yet. Use the panel below to add skills.</div>
        ) : (
          <div className="jsm-tags">
            {jobSkills.map(js => (
              <div key={js.skill_id} className="jsm-tag">
                <span className="jsm-tag-name">{js.name}</span>
                <span
                  className="jsm-tag-level"
                  style={{ backgroundColor: levelColor[js.min_level] }}
                >
                  {js.min_level}
                </span>
                {js.min_years > 0 && (
                  <span className="jsm-tag-years">{js.min_years}y</span>
                )}
                {!readOnly && (
                  <button
                    className="jsm-tag-remove"
                    onClick={() => handleRemoveSkill(js.skill_id, js.name)}
                    title="Remove skill"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panel thêm skill — ẩn nếu readOnly */}
      {!readOnly && (
        <div className="jsm-panel">
          <div className="jsm-panel-title">➕ Add Skill Requirement</div>

          {/* Tìm skill */}
          <div className="jsm-row">
            <div className="jsm-field" style={{ flex: 2 }}>
              <label className="jsm-label">Search Skill</label>
              <div className="jsm-search-wrap">
                <input
                  className="jsm-input"
                  placeholder="Type to search..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setSelectedSkill(null); }}
                />
                {search && filteredSkills.length > 0 && !selectedSkill && (
                  <div className="jsm-dropdown">
                    {filteredSkills.slice(0, 8).map(s => (
                      <div
                        key={s.id}
                        className="jsm-dropdown-item"
                        onClick={() => { setSelectedSkill(s); setSearch(s.name); }}
                      >
                        {s.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedSkill && (
                <div className="jsm-selected-badge">
                  ✓ Selected: <strong>{selectedSkill.name}</strong>
                  <button className="jsm-clear-btn" onClick={() => { setSelectedSkill(null); setSearch(''); }}>×</button>
                </div>
              )}
            </div>

            {/* Min Level */}
            <div className="jsm-field" style={{ flex: 1 }}>
              <label className="jsm-label">Min Level</label>
              <select className="jsm-input" value={minLevel} onChange={e => setMinLevel(e.target.value)}>
                {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Min Years */}
            <div className="jsm-field" style={{ flex: 1 }}>
              <label className="jsm-label">Min Years</label>
              <input
                className="jsm-input"
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={minYears}
                onChange={e => setMinYears(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <button
            className="jsm-btn jsm-btn-add"
            onClick={handleAddSkill}
            disabled={loading || !selectedSkill}
          >
            {loading ? 'Adding...' : '+ Add to Job'}
          </button>

          {/* Tạo skill mới */}
          <div className="jsm-divider">or create a new skill</div>
          <div className="jsm-create-row">
            <input
              className="jsm-input"
              placeholder="New skill name (e.g. React, Python, SQL...)"
              value={newSkillName}
              onChange={e => setNewSkillName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateSkill()}
            />
            <button
              className="jsm-btn jsm-btn-create"
              onClick={handleCreateSkill}
              disabled={loading || !newSkillName.trim()}
            >
              Create Skill
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
