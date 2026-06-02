import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi'; 
import { jobApi } from '../../services/jobApi'; 

const HRPostJob = () => {
    const [formData, setFormData] = useState({
        title: '',
        salary_min: '',
        salary_max: '',
        job_type: 'Full-time',
        description: '',
        requirements: '',
        skill_ids: [] 
    });

    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadSkills = async () => {
            try {
                const skillRes = await adminApi.getSkills();
                setSkills(skillRes.data || skillRes);
            } catch (err) {
                console.error("Error loading skills:", err);
            }
        };
        loadSkills();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSkillChange = (skillId) => {
        const updatedSkills = formData.skill_ids.includes(skillId)
            ? formData.skill_ids.filter(id => id !== skillId)
            : [...formData.skill_ids, skillId];
        setFormData({ ...formData, skill_ids: updatedSkills });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await jobApi.createJob(formData);
            alert(res.data?.message || "Job posted successfully!");
            
            setFormData({
                title: '',
                salary_min: '',
                salary_max: '',
                job_type: 'Full-time',
                description: '',
                requirements: '',
                skill_ids: []
            });
        } catch (err) {
            alert(err.response?.data?.message || "Failed to post job! Please check your Token or HR permissions.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '700px', margin: '40px auto', padding: '30px', background: '#ffffff', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#2563eb', marginBottom: '25px', fontSize: '24px', fontWeight: 'bold' }}>💼 Post a New Job</h2>
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: '600' }}>Job Title:</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g., Senior React Developer" style={{ width: '100%', padding: '10px', marginTop: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: '600' }}>Min Salary (USD):</label>
                        <input type="number" name="salary_min" value={formData.salary_min} onChange={handleChange} placeholder="e.g., 1500" style={{ width: '100%', padding: '10px', marginTop: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: '600' }}>Max Salary (USD):</label>
                        <input type="number" name="salary_max" value={formData.salary_max} onChange={handleChange} placeholder="e.g., 3000" style={{ width: '100%', padding: '10px', marginTop: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
                    </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: '600' }}>Job Type:</label>
                    <select name="job_type" value={formData.job_type} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', cursor: 'pointer' }}>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Freelance">Freelance</option>
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: '600' }}>Skills (Select multiple):</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px', maxHeight: '120px', overflowY: 'auto', padding: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                        {skills.map(skill => (
                            <label key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', border: '1px solid #bfdbfe' }}>
                                <input type="checkbox" checked={formData.skill_ids.includes(skill.id)} onChange={() => handleSkillChange(skill.id)} style={{ cursor: 'pointer' }} />
                                {skill.name}
                            </label>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: '600' }}>Job Description:</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Describe the daily responsibilities..." style={{ width: '100%', padding: '10px', marginTop: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', resize: 'vertical' }}></textarea>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <label style={{ fontWeight: '600' }}>Requirements:</label>
                    <textarea name="requirements" value={formData.requirements} onChange={handleChange} rows="4" placeholder="Enter experience, degrees, or soft skills needed..." style={{ width: '100%', padding: '10px', marginTop: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', resize: 'vertical' }}></textarea>
                </div>

                <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'background 0.2s' }}>
                    {loading ? "Posting..." : "POST JOB"}
                </button>
            </form>
        </div>
    );
};

export default HRPostJob;