export default function AdminOverview({ stats }) {
  if (!stats) return <p className="loading-text">Đang tải dữ liệu...</p>;

  return (
    <div>
      <h1 className="admin-title">Tổng Quan Hệ Thống</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <p>Tổng người dùng</p>
          <div className="stat-number">{stats.totalUsers || 0}</div>
        </div>
        <div className="stat-card">
          <p>Việc làm chờ duyệt</p>
          <div className="stat-number">{stats.pendingJobs || 0}</div>
        </div>
        {/* CỘT THỨ 3 BẠN MUỐN THÊM */}
        <div className="stat-card">
          <p>Tổng hồ sơ ứng tuyển</p>
          <div className="stat-number">{stats.totalApplications || 0}</div>
        </div>
      </div>
    </div>
  );
}