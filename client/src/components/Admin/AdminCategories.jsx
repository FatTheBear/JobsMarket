import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
// Import file CSS để đồng bộ giao diện tối (Dark Mode)
import './Admin.css'; 

const AdminCategories = ({ 
  categories, 
  onRefresh, 
  onAddSkill, 
  onAddIndustry, 
  onDeleteSkill, // Thêm prop xóa skill
  onDeleteIndustry // Thêm prop xóa industry
}) => {
  const [newSkill, setNewSkill] = useState('');
  const [newIndustry, setNewIndustry] = useState('');

  const submitSkill = async () => {
    if (!newSkill.trim()) return alert("Please enter a skill name!");
    await onAddSkill(newSkill.trim());
    setNewSkill(''); // Xóa chữ trong ô input sau khi thêm thành công
  };

  const submitIndustry = async () => {
    if (!newIndustry.trim()) return alert("Please enter an industry name!");
    await onAddIndustry(newIndustry.trim());
    setNewIndustry(''); // Xóa chữ trong ô input sau khi thêm thành công
  };

  return (
    <div>
      {/* HEADER: Tiêu đề và nút làm mới dữ liệu */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="admin-title">System Categories</h1>
        <button className="admin-btn-primary" onClick={onRefresh}>Refresh Data</button>
      </div>

      {/* BỐ CỤC CHIA ĐÔI: Skills bên trái, Industries bên phải */}
      <div className="categories-grid">
        
        {/* KHỐI QUẢN LÝ SKILLS */}
        <div>
          <h3 style={{ marginBottom: '12px', color: '#38bdf8' }}>Skills List (Bảng Skill)</h3>
          
          {/* Ô nhập và nút thêm Skill */}
          <div className="admin-input-group">
            <input 
              type="text" 
              className="admin-input" 
              placeholder="Add new skill (e.g. React, Node.js)..." 
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitSkill()}
            />
            <button className="admin-btn-primary" onClick={submitSkill} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Plus size={16} /> Add
            </button>
          </div>

          {/* Bảng hiển thị danh sách Skills */}
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>ID</th>
                  <th>Skill Name</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories?.skills?.length > 0 ? (
                  categories.skills.map((skill) => (
                    <tr key={skill.id}>
                      <td>#{skill.id}</td>
                      <td><strong>{skill.name}</strong></td>
                      <td>
                        <button 
                          className="action-btn delete" 
                          style={{ margin: '0 auto' }}
                          onClick={() => onDeleteSkill && onDeleteSkill(skill.id)}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: '#94a3b8' }}>No skills found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* KHỐI QUẢN LÝ INDUSTRIES */}
        <div>
          <h3 style={{ marginBottom: '12px', color: '#38bdf8' }}>Mock Industries List (Bảng Industry)</h3>
          
          {/* Ô nhập và nút thêm Industry */}
          <div className="admin-input-group">
            <input 
              type="text" 
              className="admin-input" 
              placeholder="Add new industry (e.g. Information Technology)..." 
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitIndustry()}
            />
            <button className="admin-btn-primary" onClick={submitIndustry} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Plus size={16} /> Add
            </button>
          </div>

          {/* Bảng hiển thị danh sách Industries */}
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>ID</th>
                  <th>Industry Name</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories?.industries?.length > 0 ? (
                  categories.industries.map((ind) => (
                    <tr key={ind.id}>
                      <td>#{ind.id}</td>
                      <td><strong>{ind.name}</strong></td>
                      <td>
                        <button 
                          className="action-btn delete" 
                          style={{ margin: '0 auto' }}
                          onClick={() => onDeleteIndustry && onDeleteIndustry(ind.id)}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: '#94a3b8' }}>No industries found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminCategories;