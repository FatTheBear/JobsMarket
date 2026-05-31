import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const AdminCategories = ({ categories, onRefresh, onAddSkill, onAddIndustry }) => {
  const [newSkill, setNewSkill] = useState('');
  const [newIndustry, setNewIndustry] = useState('');

  const submitSkill = async () => {
    if (!newSkill.trim()) return alert("Please enter a skill name!");
    await onAddSkill(newSkill.trim());
    setNewSkill(''); // Clear text box sau khi thêm thành công
  };

  const submitIndustry = async () => {
    if (!newIndustry.trim()) return alert("Please enter an industry name!");
    await onAddIndustry(newIndustry.trim());
    setNewIndustry(''); // Clear text box sau khi thêm thành công
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="admin-title">System Categories</h1>
        <button className="admin-btn-primary" onClick={onRefresh}>Refresh Data</button>
      </div>

      <div className="categories-grid">
        {/* KHỐI QUẢN LÝ SKILLS */}
        <div>
          <h3 style={{ marginBottom: '12px', color: '#38bdf8' }}>Skills List (Bảng Skill)</h3>
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
                        <button className="action-btn delete" style={{ margin: '0 auto' }}>
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
          <h3 style={{ marginBottom: '12px', color: '#38bdf8' }}>Industries List (Bảng Industry)</h3>
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
                        <button className="action-btn delete" style={{ margin: '0 auto' }}>
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