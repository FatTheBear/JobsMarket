import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi'; // Gọi API lấy Skill có sẵn của nhóm
import { jobApi } from '../../services/jobApi'; // Gọi hàm POST vừa tạo ở trên

const HRPostJob = () => {
    const [formData, setFormData] = useState({
        title: '',
        salary_min: '',
        salary_max: '',
        job_type: 'Full-time',
        description: '',
        requirements: '',
        skill_ids: [] // Mảng chứa ID các skill được chọn
    });

    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(false);

    // Tự động load danh sách Kỹ năng lên form khi vừa vào trang
    useEffect(() => {
        const loadSkills = async () => {
            try {
                const skillRes = await adminApi.getSkills();
                // Phóng khoáng kiểm tra cấu trúc mảng data trả về của nhóm bạn
                setSkills(skillRes.data || skillRes);
            } catch (err) {
                console.error("Lỗi tải danh mục kỹ năng:", err);
            }
        };
        loadSkills();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Xử lý Checkbox chọn nhiều Kỹ năng cùng lúc
    const handleSkillChange = (skillId) => {
        const updatedSkills = formData.skill_ids.includes(skillId)
            ? formData.skill_ids.filter(id => id !== skillId)
            : [...formData.skill_ids, skillId];
        setFormData({ ...formData, skill_ids: updatedSkills });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
         console.log("SUBMIT JOB");
    console.log(formData);
        setLoading(true);
        try {
            // Bắn dữ liệu sang file service jobApi
            const res = await jobApi.createJob(formData);
            alert(res.data?.message || "Đăng tin thành công!");
            
            // Đăng thành công thì reset sạch form cho trống trải
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
            alert(err.response?.data?.message || "Đăng tin thất bại! Hãy check lại Token hoặc Quyền HR.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '700px', margin: '40px auto', padding: '30px', background: '#1e293b', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)' }}>
            <h2 style={{ color: '#38bdf8', marginBottom: '25px', fontSize: '24px', fontWeight: 'bold' }}>💼 Đăng Tin Tuyển Dụng Mới</h2>
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: '500' }}>Tiêu đề công việc:</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Ví dụ: Senior React Developer" style={{ width: '100%', padding: '10px', marginTop: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569', borderRadius: '6px', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: '500' }}>Lương tối thiểu (VND):</label>
                        <input type="number" name="salary_min" value={formData.salary_min} onChange={handleChange} placeholder="Ví dụ: 15000000" style={{ width: '100%', padding: '10px', marginTop: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569', borderRadius: '6px', outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: '500' }}>Lương tối đa (VND):</label>
                        <input type="number" name="salary_max" value={formData.salary_max} onChange={handleChange} placeholder="Ví dụ: 30000000" style={{ width: '100%', padding: '10px', marginTop: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569', borderRadius: '6px', outline: 'none' }} />
                    </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: '500' }}>Hình thức làm việc:</label>
                    <select name="job_type" value={formData.job_type} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569', borderRadius: '6px', outline: 'none', cursor: 'pointer' }}>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Freelance">Freelance</option>
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: '500' }}>Yêu cầu kỹ năng (Chọn nhiều):</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px', maxHeight: '120px', overflowY: 'auto', padding: '12px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px' }}>
                        {skills.map(skill => (
                            <label key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1e293b', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                                <input type="checkbox" checked={formData.skill_ids.includes(skill.id)} onChange={() => handleSkillChange(skill.id)} style={{ cursor: 'pointer' }} />
                                {skill.name}
                            </label>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: '500' }}>Mô tả công việc:</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Nhập các đầu việc hàng ngày cần làm..." style={{ width: '100%', padding: '10px', marginTop: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569', borderRadius: '6px', outline: 'none', resize: 'vertical' }}></textarea>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <label style={{ fontWeight: '500' }}>Yêu cầu ứng viên:</label>
                    <textarea name="requirements" value={formData.requirements} onChange={handleChange} rows="4" placeholder="Nhập yêu cầu kinh nghiệm, bằng cấp, tính cách..." style={{ width: '100%', padding: '10px', marginTop: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569', borderRadius: '6px', outline: 'none', resize: 'vertical' }}></textarea>
                </div>

                <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'background 0.2s' }}>
                    {loading ? "Đang đẩy bài lên hệ thống..." : "XÁC NHẬN ĐĂNG TIN"}
                </button>
            </form>
        </div>
    );
};

export default HRPostJob;