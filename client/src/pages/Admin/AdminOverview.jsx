import React, { useState, useEffect } from 'react';
import { Users, Briefcase, FileText, CheckCircle, AlertTriangle, TrendingUp, DollarSign, Award, Building2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
  LineChart, Line, Legend
} from 'recharts';
import { adminApi } from '../../services/adminApi';

// ─── PERIOD CONFIG ───────────────────────────────────────────────────────────
const PERIODS = [
  { value: '7d',  label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '12m', label: 'Last 12 Months' },
];

// ─── HELPER ──────────────────────────────────────────────────────────────────
function getPeriodLabel(period) {
  return PERIODS.find(p => p.value === period)?.label ?? '';
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, iconColor = '#01796F', sub, alert }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>{title}</p>
        {Icon && <Icon size={20} color={iconColor} />}
      </div>
      <div className="stat-number" style={{ color: alert ? '#d97706' : '#01796F' }}>
        {value}
      </div>
      {sub && (
        <div className="stat-detail" style={{ marginTop: 6 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 style={{ color: '#01796F', marginBottom: 16, fontSize: 15, fontWeight: 600 }}>
      {children}
    </h3>
  );
}

const selectStyle = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: 8,
  color: '#94a3b8',
  padding: '4px 8px',
  fontSize: 13,
  cursor: 'pointer',
  outline: 'none',
};

function PeriodSelector({ value, onChange, selectedYear, setSelectedYear, selectedMonth, setSelectedMonth, yearOptions, monthOptions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {PERIODS.map(p => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          style={{
            padding: '5px 14px',
            borderRadius: 20,
            border: '1px solid',
            borderColor: value === p.value ? '#01796F' : '#334155',
            background: value === p.value ? '#01796F' : 'transparent',
            color: value === p.value ? '#fff' : '#64748b',
            fontSize: 13,
            cursor: 'pointer',
            fontWeight: value === p.value ? 600 : 400,
            transition: 'all 0.15s',
          }}
        >
          {p.label}
        </button>
      ))}

      {/* Year picker — hiện với 12m và 30d */}
      {(value === '12m' || value === '30d') && (
        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={selectStyle}>
          {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      )}

      {/* Month picker — chỉ hiện với 30d */}
      {value === '30d' && (
        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} style={selectStyle}>
          {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      )}

      {/* Week picker — 7d dùng tuần hiện tại, không cần picker */}
    </div>
  );
}

function ChartCard({ title, subtitle, children, style }) {
  return (
    <div className="table-container" style={{ padding: 20, ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <SectionTitle>{title}</SectionTitle>
          {subtitle && <p style={{ margin: '-12px 0 0', color: '#94a3b8', fontSize: 12 }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

const TOOLTIP_STYLE = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  color: '#1e293b',
  fontSize: 13,
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function AdminOverview({ stats, onNavigate }) {
  const [period, setPeriod] = useState('30d');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [trends, setTrends] = useState(null);
  const [topSkills, setTopSkills] = useState([]);
  const [topIndustries, setTopIndustries] = useState([]);
  const [loadingTrends, setLoadingTrends] = useState(false);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const monthOptions = [
    { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
    { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' },
  ];

  // Fetch trends mỗi khi period/year/month thay đổi
  useEffect(() => {
    let cancelled = false;
    setLoadingTrends(true);
    adminApi.getTrends(period, selectedYear, selectedMonth)
      .then(data => { if (!cancelled) setTrends(data); })
      .catch(err => console.error('Trends error:', err))
      .finally(() => { if (!cancelled) setLoadingTrends(false); });
    return () => { cancelled = true; };
  }, [period, selectedYear, selectedMonth]);

 
  useEffect(() => {
    adminApi.getTopSkills()
      .then(setTopSkills)
      .catch(err => console.error('Top skills error:', err));

    adminApi.getTopIndustries()
      .then(setTopIndustries)
      .catch(err => console.error('Top industry error:', err));
  }, []);

  if (!stats) return <p style={{ color: '#64748b', padding: 20 }}>Loading data...</p>;

  // ── Merge job + app trends — chỉ giữ ngày có data ──
  const mergedTrends = (() => {
    if (!trends) return [];
    const map = {};

    (trends.jobTrends || []).forEach(r => {
      if (!map[r.period]) map[r.period] = { label: r.label, jobs: 0, applications: 0 };
      map[r.period].jobs = Number(r.count);
    });
    (trends.appTrends || []).forEach(r => {
      if (!map[r.period]) map[r.period] = { label: r.label, jobs: 0, applications: 0 };
      map[r.period].applications = Number(r.count);
    });

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({ ...v, xLabel: v.label }));
  })();

  const revenueTrends = (trends?.revenueTrends || []).map(r => ({
    label: r.label,
    xLabel: r.label,
    revenue: Number(r.total),
  }));

  // ── Application breakdown từ stats ──
  const appBreakdown = [
    { name: 'Applied',      value: stats.appliedCount || 0,      fill: '#01796F' },
    { name: 'Reviewing',    value: stats.reviewingCount || 0,    fill: '#0ea5e9' },
    { name: 'Interviewing', value: stats.interviewingCount || 0, fill: '#8b5cf6' },
    { name: 'Offered',      value: stats.offeredCount || 0,      fill: '#10b981' },
    { name: 'Rejected',     value: stats.rejectedApplicationCount || 0, fill: '#ef4444' },
  ];

  const periodLabel = getPeriodLabel(period);

  return (
    <div>
      <h1 className="admin-title">System Overview</h1>

      {/* ── STATS GRID ── */}
      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={stats.totalUsers || 0}
          icon={Users}
          sub={
            <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Candidates</span>
                <strong style={{ color: '#01796F' }}>{stats.candidatesCount || 0}</strong>
              </span>
              <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Recruiters (HR)</span>
                <strong style={{ color: '#01796F' }}>{stats.hrCount || 0}</strong>
              </span>
            </span>
          }
        />

        <StatCard
          title="Pending Jobs"
          value={stats.pendingJobs || 0}
          icon={Briefcase}
          iconColor="#d97706"
          alert={stats.pendingJobs > 0}
          sub={
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: stats.pendingJobs > 0 ? '#dc2626' : '#059669' }}>
              {stats.pendingJobs > 0 ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
              {stats.pendingJobs > 0 ? 'Requires immediate review' : 'All jobs processed'}
            </span>
          }
        />

        <StatCard
          title="Total Applications"
          value={stats.totalApplications || 0}
          icon={FileText}
          sub={<span style={{ color: '#64748b' }}>Successful connections via system</span>}
        />

        <StatCard title="Approved Jobs" value={stats.approvedJobs || 0} icon={CheckCircle} iconColor="#059669" />
        <StatCard title="Companies"   value={stats.totalCompanies || 0} icon={Building2} />
        <StatCard title="Revenue"     value={`$${(stats.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} />
        <StatCard title="News"        value={stats.totalNews || 0} />
        <StatCard title="CV Uploads"  value={stats.totalCVs || 0} />
        <StatCard title="Skills"      value={stats.totalSkills || 0} icon={Award} />
      </div>

      {/* ── TIME FILTER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '28px 0 16px', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Trend Analysis</h2>
        <PeriodSelector
          value={period} onChange={setPeriod}
          selectedYear={selectedYear} setSelectedYear={setSelectedYear}
          selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
          yearOptions={yearOptions} monthOptions={monthOptions}
        />
      </div>

      {loadingTrends && (
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>Loading trend data...</p>
      )}

      {/* ── ROW 1: Job Trend + Revenue Trend ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Job Posts + Applications trend */}
        <ChartCard
          title="Job Posts & Applications"
          subtitle={`Showing data for ${periodLabel}`}
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={mergedTrends} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="xLabel" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ ...TOOLTIP_STYLE, padding: '8px 12px' }}
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const jobs = payload.find(p => p.dataKey === 'jobs')?.value ?? 0;
                  const apps = payload.find(p => p.dataKey === 'applications')?.value ?? 0;
                  return (
                    <div style={{ ...TOOLTIP_STYLE, padding: '8px 12px' }}>
                      <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: 12, color: '#94a3b8' }}>{label}</p>
                      <p style={{ margin: '2px 0', color: '#0ea5e9', fontSize: 12 }}>Applications: <strong>{apps}</strong></p>
                      <p style={{ margin: '2px 0', color: '#01796F', fontSize: 12 }}>Job Posts: <strong>{jobs}</strong></p>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="linear" dataKey="jobs" name="Job Posts" stroke="#01796F" strokeWidth={2} dot={(props) => { const { cx, cy, value } = props; return value > 0 ? <circle cx={cx} cy={cy} r={3} fill="#01796F" /> : null; }} />
              <Line type="linear" dataKey="applications" name="Applications" stroke="#0ea5e9" strokeWidth={2} dot={(props) => { const { cx, cy, value } = props; return value > 0 ? <circle cx={cx} cy={cy} r={3} fill="#0ea5e9" /> : null; }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue trend */}
        <ChartCard
          title="Revenue Trend"
          subtitle={`Showing data for ${periodLabel}`}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueTrends} margin={{ top: 24, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="xLabel" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#01796F" radius={[6, 6, 0, 0]} maxBarSize={80}>
                <LabelList dataKey="revenue" position="top" fill="#94a3b8" fontSize={11}
                  formatter={(v) => v > 0 ? `$${v.toLocaleString()}` : ''} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── ROW 2: Application Breakdown + Pending Reviews ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Application Status Breakdown */}
        <ChartCard title="Application Pipeline" subtitle="All-time breakdown by status">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={appBreakdown} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                <LabelList dataKey="value" position="top" fill="#64748b" fontSize={11} />
                {appBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Pending Reviews */}
        <div className="table-container" style={{ padding: 20 }}>
          <SectionTitle>Pending Reviews</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Pending Jobs',         value: stats.pendingJobs || 0,        tab: 'jobs',         color: '#d97706' },
              { label: 'Pending Companies',     value: stats.pendingCompanies || 0,   tab: 'companies',    color: '#8b5cf6' },
              { label: 'Pending Transactions',  value: stats.pendingTransactions || 0, tab: 'transactions', color: '#ef4444' },
              { label: 'Rejected Jobs',         value: stats.rejectedJobs || 0,       tab: 'jobs',         color: '#94a3b8' },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', borderRadius: 8, background: '#f8fafc',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: item.color, display: 'inline-block', flexShrink: 0
                  }} />
                  <span style={{ fontSize: 14, color: '#475569' }}>{item.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <strong style={{ color: item.value > 0 ? item.color : '#94a3b8', fontSize: 15 }}>
                    {item.value}
                  </strong>
                  {onNavigate && item.value > 0 && (
                    <button
                      onClick={() => onNavigate(item.tab)}
                      style={{
                        padding: '3px 12px', borderRadius: 12, fontSize: 12,
                        border: `1px solid ${item.color}`, color: item.color,
                        background: 'transparent', cursor: 'pointer', fontWeight: 600,
                      }}
                    >
                      Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
              <span>Active Postings</span>
              <span style={{ color: '#01796F', fontWeight: 600 }}>{stats.approvedJobs || 0} jobs</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b' }}>
              <span>Total Industry</span>
              <span style={{ color: '#01796F', fontWeight: 600 }}>{stats.industriesCount || 0} categories</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Top Skills */}
        <div className="table-container" style={{ padding: 20 }}>
          <SectionTitle>Top Skills in Job Posts</SectionTitle>
          {topSkills.length === 0
            ? <p style={{ color: '#94a3b8', fontSize: 13 }}>No data available</p>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {topSkills.map((s, i) => {
                  const max = topSkills[0]?.count || 1;
                  const pct = Math.round((s.count / max) * 100);
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
                        <span style={{ color: '#334155', fontWeight: 500 }}>{s.name}</span>
                        <span style={{ color: '#64748b' }}>{s.count}</span>
                      </div>
                      <div style={{ background: '#e2e8f0', borderRadius: 4, height: 6 }}>
                        <div style={{
                          width: `${pct}%`, height: '100%', borderRadius: 4,
                          background: '#01796F', transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        </div>

       
        <div className="table-container" style={{ padding: 20 }}>
          <SectionTitle>Top Industry</SectionTitle>
          {topIndustries.length === 0
            ? <p style={{ color: '#94a3b8', fontSize: 13 }}>No data available</p>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {topIndustries.map((ind, i) => {
                  const max = topIndustries[0]?.count || 1;
                  const pct = Math.round((ind.count / max) * 100);
                  const colors = ['#01796F', '#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#64748b', '#ec4899'];
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
                        <span style={{ color: '#334155', fontWeight: 500 }}>{ind.name}</span>
                        <span style={{ color: '#64748b' }}>{ind.count} jobs</span>
                      </div>
                      <div style={{ background: '#e2e8f0', borderRadius: 4, height: 6 }}>
                        <div style={{
                          width: `${pct}%`, height: '100%', borderRadius: 4,
                          background: colors[i % colors.length], transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}