import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './JobSkillsManager.css';

const API_URL = 'http://localhost:5000';

export default function JobSkillsManager({ jobId }) {
  const [allSkills, setAllSkills] = useState([]);
  const [jobSkills, setJobSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    fetchAllSkills();
  }, []);

  useEffect(() => {
    if (jobId) fetchJobSkills(jobId);
  }, [jobId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const jobSkillIds = jobSkills.map(js => js.id);
    const availableSkills = allSkills.filter(skill => !jobSkillIds.includes(skill.id));

    if (inputValue.trim() === '') {
      setSuggestions(availableSkills.slice(0, 6));
    } else {
      const filtered = availableSkills.filter(skill =>
        skill.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filtered);
    }
  }, [inputValue, allSkills, jobSkills]);

  const fetchAllSkills = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/skills`);
      setAllSkills(response.data || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách kỹ năng:', error);
    }
  };

  const fetchJobSkills = async (jobId) => {
    try {
      const response = await axios.get(`${API_URL}/api/skills/job/${jobId}`);
      setJobSkills(response.data || []);
    } catch (error) {
      console.error('Lỗi khi lấy kỹ năng công việc:', error);
    }
  };

  const handleCreateSkill = async () => {
    if (!newSkill.trim()) return;
    try {
      setLoading(true);
      const payload = { name: newSkill.trim() };
      const response = await axios.post(`${API_URL}/api/skills`, payload);
      setNewSkill('');
      await fetchAllSkills();
      setMessage('Thêm kỹ năng mới thành công');
      if (jobId && response.data && response.data.id) {
        await handleAddSkill(response.data.id);
      }
    } catch (error) {
      console.error('Tạo kỹ năng thất bại:', error);
      setMessage('Tạo kỹ năng thất bại');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  const handleAddSkill = async (skillId) => {
    if (!jobId) return;
    try {
      await axios.post(`${API_URL}/api/skills/job/${jobId}`, { skill_id: skillId });
      fetchJobSkills(jobId);
      setMessage('Đã thêm kỹ năng vào công việc');
      setInputValue('');
      setIsOpen(false);
      setTimeout(() => setMessage(''), 2500);
    } catch (error) {
      console.error('Thêm kỹ năng thất bại:', error);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    if (!jobId) return;
    try {
      await axios.delete(`${API_URL}/api/skills/job/${jobId}/${skillId}`);
      fetchJobSkills(jobId);
      setMessage('Đã xóa kỹ năng khỏi công việc');
      setTimeout(() => setMessage(''), 2500);
    } catch (error) {
      console.error('Xóa kỹ năng thất bại:', error);
    }
  };

  return (
    <div className="skill-manager-card" ref={wrapperRef}>
      <div className="skill-manager-header">
        <div>
          <h3>Quản lý kỹ năng yêu cầu</h3>
          <p>Chọn kỹ năng cần có cho tin tuyển dụng này.</p>
        </div>
        {jobId && <div className="skill-manager-job-id">Job ID: {jobId}</div>}
      </div>

      <div className="skill-manager-body">
        <div className="skills-input-tags-wrapper">
          <div className="tags-flex-container">
            {jobSkills.map((skill) => (
              <span key={skill.id} className="job-selected-tag">
                {skill.name}
                <button 
                  type="button" 
                  className="remove-tag-x"
                  onClick={() => handleRemoveSkill(skill.id)}
                >
                  &times;
                </button>
              </span>
            ))}
            
            <input
              type="text"
              placeholder={jobSkills.length === 0 ? "Tìm kiếm kỹ năng..." : ""}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsOpen(true)}
              className="skills-autocomplete-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputValue.trim() !== '') {
                  e.preventDefault();
                  if (suggestions.length > 0) {
                    handleAddSkill(suggestions[0].id);
                  } else {
                    setNewSkill(inputValue.trim());
                    setIsOpen(false);
                  }
                }
              }}
            />
          </div>

          {isOpen && suggestions.length > 0 && (
            <ul className="skills-autocomplete-dropdown">
              <li className="dropdown-section-title">Kỹ năng gợi ý</li>
              {suggestions.map((skill) => (
                <li 
                  key={skill.id} 
                  className="dropdown-suggestion-item"
                  onClick={() => handleAddSkill(skill.id)}
                >
                  <span className="plus-sign">+</span> {skill.name}
                </li>
              ))}
            </ul>
          )}

          {isOpen && suggestions.length === 0 && inputValue.trim() !== '' && (
            <ul className="skills-autocomplete-dropdown">
              <li className="dropdown-section-title">Không tìm thấy kỹ năng phù hợp</li>
              <li className="dropdown-suggestion-item custom-create-prompt" onClick={() => {
                setNewSkill(inputValue.trim());
                setIsOpen(false);
              }}>
                Tạo nhanh kỹ năng mới: "<strong>{inputValue}</strong>"
              </li>
            </ul>
          )}
        </div>

        {(newSkill.trim() || (isOpen && suggestions.length === 0 && inputValue.trim() !== '')) && (
          <div className="skill-manager-form">
            <input
              type="text"
              placeholder="Nhập tên kỹ năng mới"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
            />
            <button type="button" onClick={handleCreateSkill} disabled={loading}>
              {loading ? 'Đang lưu...' : 'Thêm kỹ năng'}
            </button>
          </div>
        )}

        {message && <div className="skill-manager-message">{message}</div>}
      </div>
    </div>
  );
}