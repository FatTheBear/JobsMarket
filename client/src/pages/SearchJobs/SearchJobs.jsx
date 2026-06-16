import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchJobs.css';

const API_URL = 'http://localhost:5000';

export default function SearchJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State quản lý các giá trị nhập vào bộ lọc tìm kiếm
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');

  // Tự động tải danh sách công việc khi vừa vào trang lần đầu hoặc khi đổi filter
  useEffect(() => {
    handleSearch();
  }, [location, salary]);

  // Hàm xử lý gọi API tìm kiếm đến Backend
  const handleSearch = async (e) => {
    if (e) e.preventDefault(); // Chặn hành vi load lại trang của form
    
    try {
      setLoading(true);
      
      // Gửi các tham số tìm kiếm qua query string (URL Parameters)
      const response = await axios.get(`${API_URL}/api/jobs/search`, {
        params: {
          q: keyword.trim(),
          location: location,
          salary: salary
        }
      });
      
      setJobs(response.data || []);
    } catch (error) {
      console.error('Lỗi khi thực hiện tìm kiếm công việc:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-jobs-container">
      {/* KHU VỰC THANH TÌM KIẾM & BỘ LỌC */}
      <div className="search-header-box">
        <form onSubmit={handleSearch} className="search-form-grid">
          
          <div className="search-input-group">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Nhập tên công việc, vị trí hoặc kỹ năng..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">Tất cả địa điểm</option>
            <option value="Hồ Chí Minh">Hồ Chí Minh</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
          </select>

          <select value={salary} onChange={(e) => setSalary(e.target.value)}>
            <option value="">Tất cả mức lương</option>
            <option value="Thỏa thuận">Thỏa thuận</option>
            <option value="Dưới 10 triệu">Dưới 10 triệu</option>
            <option value="10 - 20 triệu">10 - 20 triệu</option>
            <option value="Trên 20 triệu">Trên 20 triệu</option>
          </select>

          <button type="submit" className="search-submit-btn">
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* KHU VỰC HIỂN THỊ KẾT QUẢ */}
      <div className="search-results-section">
        <div className="results-count">
          {loading ? 'Đang tìm kiếm...' : `Tìm thấy ${jobs.length} việc làm phù hợp`}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu...</div>
        ) : jobs.length > 0 ? (
          <div className="jobs-grid-layout">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className="job-card-item"
                onClick={() => navigate(`/job/${job.id}`)} // Điều hướng đến trang chi tiết
              >
                <div className="job-card-left">
                  <div className="job-card-logo">
                    {job.logo_url ? (
                      <img src={job.logo_url} alt="Company Logo" />
                    ) : (
                      <div className="job-card-logo-placeholder">🏢</div>
                    )}
                  </div>
                  <div className="job-card-content">
                    <h3 className="job-card-title">{job.title}</h3>
                    <div className="job-card-company">{job.company_name || 'Công ty thành viên JobsMarket'}</div>
                    
                    <div className="job-card-info-tags">
                      <span>📍 {job.company_address || 'Chưa cập nhật địa điểm'}</span>
                      <span className="salary-tag">💰 {
                        (job.salary_min && job.salary_max) 
                          ? `${(job.salary_min / 1000000).toLocaleString('vi-VN')} - ${(job.salary_max / 1000000).toLocaleString('vi-VN')} triệu`
                          : (job.salary_min ? `Từ ${(job.salary_min / 1000000).toLocaleString('vi-VN')} triệu` : 
                            (job.salary_max ? `Đến ${(job.salary_max / 1000000).toLocaleString('vi-VN')} triệu` : 'Thỏa thuận'))
                      }</span>
                    </div>

                    <div className="job-card-skills-list">
                      {job.skills && job.skills.length > 0 ? job.skills.map((skill) => (
                        <span key={skill.id} className="job-card-skill-tag">
                          {skill.name}
                        </span>
                      )) : (
                        <span className="job-card-skill-tag">{job.job_type}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="job-card-right">
                  <button className="view-detail-btn" type="button">
                    Ứng tuyển ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results-box">
            <h3>Không tìm thấy kết quả phù hợp</h3>
            <p>Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh lại bộ lọc vị trí/mức lương.</p>
          </div>
        )}
      </div>
    </div>
  );
}