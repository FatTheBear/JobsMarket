export default function AdminOverview({ stats }) {
  if (!stats) return <p className="loading-text">Loading data...</p>;

  return (
    <div>
      <h1 className="admin-title">System Overview</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <p>Total Users</p>
          <div className="stat-number">{stats.totalUsers || 0}</div>
        </div>
        <div className="stat-card">
          <p>Pending Jobs</p>
          <div className="stat-number">{stats.pendingJobs || 0}</div>
        </div>
        {/* CỘT THỨ 3 BẠN MUỐN THÊM */}
        <div className="stat-card">
          <p>Total Applications</p>
          <div className="stat-number">{stats.totalApplications || 0}</div>
        </div>
      </div>
    </div>
  );
}