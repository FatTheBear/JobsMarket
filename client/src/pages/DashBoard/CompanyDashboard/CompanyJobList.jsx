import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});

const STATUS_STYLE = {
    Pending: { background: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591' },
    Approved: { background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' },
    Rejected: { background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e' },
    Closed: { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9' },
};

const STATUS_LABEL = {
    Pending: 'Pending',
    Approved: 'Approved',
    Rejected: 'Rejected',
    Closed: 'Closed',
};

export default function CompanyJobList() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        API.get('/jobs/my-jobs')
            .then(res => setJobs(res.data))
            .catch(() => setError('Unable to load job list.'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'All' ? jobs : jobs.filter(j => j.status === filter);

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
    if (error) return <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>{error}</div>;

    const handleClose = async (jobId) => {
        if (!window.confirm('Are you sure you want to close this job?')) return;
        try {
            await API.patch(`/jobs/${jobId}/close`);
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'Closed' } : j));
        } catch {
            alert('Unable to close the job. Please try again.');
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '16px' }}>Posted Job Listings</h2>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {['All', 'Pending', 'Approved', 'Rejected', 'Closed'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        style={{
                            padding: '6px 16px',
                            borderRadius: '20px',
                            border: '1px solid #d9d9d9',
                            cursor: 'pointer',
                            background: filter === s ? '#01796F' : '#fff',
                            color: filter === s ? '#fff' : '#333',
                            fontWeight: filter === s ? 600 : 400,
                        }}
                    >
                        {s === 'All' ? 'All' : STATUS_LABEL[s]}
                        {' '}
                        ({s === 'All' ? jobs.length : jobs.filter(j => j.status === s).length})
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                    No job postings found.
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#fafafa', borderBottom: '2px solid #f0f0f0' }}>
                                {['Title', 'Job Type', 'Salary', 'Deadline', 'Applicants', 'Views', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#555', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#555' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(job => (
                                <tr key={job.id} style={{ borderBottom: '1px solid #f0f0f0' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                    onMouseLeave={e => e.currentTarget.style.background = ''}
                                >
                                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{job.title}</td>
                                    <td style={{ padding: '12px 16px', color: '#666' }}>{job.job_type || '—'}</td>
                                    <td style={{ padding: '12px 16px', color: '#666', whiteSpace: 'nowrap' }}>
                                        {job.salary_min && job.salary_max
                                            ? `${Number(job.salary_min).toLocaleString('vi-VN')} – ${Number(job.salary_max).toLocaleString('vi-VN')} đ`
                                            : 'Negotiable'}
                                    </td>
                                    <td style={{ padding: '12px 16px', color: '#666', whiteSpace: 'nowrap' }}>
                                        {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : '—'}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{job.applicant_count}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{job.view_count}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            ...STATUS_STYLE[job.status],
                                            padding: '2px 10px',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: 500,
                                        }}>
                                            {STATUS_LABEL[job.status]}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        {job.status === 'Approved' && (
                                            <button
                                                onClick={() => handleClose(job.id)}
                                                style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #ff4d4f',
                                                    background: '#fff',
                                                    color: '#ff4d4f',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: 500,
                                                }}
                                                onMouseEnter={e => { e.target.style.background = '#ff4d4f'; e.target.style.color = '#fff'; }}
                                                onMouseLeave={e => { e.target.style.background = '#fff'; e.target.style.color = '#ff4d4f'; }}
                                            >
                                                Close Job
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}