import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './JobSkillsManager.css';

const API_URL = 'http://localhost:5000';

export default function JobSkillsManager({ jobId }) {
  const [allSkills, setAllSkills] = useState([]);
  const [jobSkills, setJobSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAllSkills();
  }, []);

  useEffect(() => {
    if (jobId) fetchJobSkills(jobId);
  }, [jobId]);

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
      await axios.post(`${API_URL}/api/skills`, payload);
      setNewSkill('');
      fetchAllSkills();
      setMessage('Thêm kỹ năng mới thành công');
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
      setTimeout(() => setMessage(''), 2500);
    } catch (error) {
      console.error('Thêm kỹ năng thất bại:', error);
      setMessage('Thêm kỹ năng thất bại');
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
      setMessage('Xóa kỹ năng thất bại');
    }
  };

  return (
    <div className="skill-manager-card">
      <div className="skill-manager-header">
        <div>
          <h3>Quản lý kỹ năng yêu cầu</h3>
          <p>Chọn kỹ năng cần có cho tin tuyển dụng này.</p>
        </div>
        {jobId && <div className="skill-manager-job-id">Job ID: {jobId}</div>}
      </div>

      <div className="skill-manager-body">
        <div className="skill-manager-form">
          <input
            type="text"
            placeholder="Nhập kỹ năng mới"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
          />
          <button onClick={handleCreateSkill} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Thêm kỹ năng'}
          </button>
        </div>

        <div className="skill-lists">
          <div className="skill-list">
            <h4>Danh sách kỹ năng sẵn có</h4>
            {allSkills.length === 0 ? (
              <div className="skill-empty">Không có kỹ năng nào.</div>
            ) : (
              allSkills.map((skill) => (
                <div key={skill.id} className="skill-item">
                  <span>{skill.name}</span>
                  <button type="button" onClick={() => handleAddSkill(skill.id)}>
                    Thêm
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="skill-list">
            <h4>Kỹ năng của công việc</h4>
            {jobSkills.length === 0 ? (
              <div className="skill-empty">Chưa có kỹ năng nào được chọn.</div>
            ) : (
              jobSkills.map((skill) => (
                <div key={skill.id} className="skill-item">
                  <span>{skill.name}</span>
                  <button type="button" onClick={() => handleRemoveSkill(skill.id)}>
                    Xóa
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {message && <div className="skill-manager-message">{message}</div>}
      </div>
    </div>
  );
}
