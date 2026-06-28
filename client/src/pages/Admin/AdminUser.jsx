import React, { useState, useMemo } from 'react';
import { ShieldAlert, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';

const PAGE_SIZE = 10; // số dòng mỗi trang

export default function AdminUser({ users, onBan, onUnban }) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // State cho modal nhập lý do ban
    const [banTarget, setBanTarget] = useState(null); // user đang định ban
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Lọc theo tên / email / role
    const filteredUsers = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return users;
        return users.filter((u) => {
            const name = (u.full_name || '').toLowerCase();
            const email = (u.email || '').toLowerCase();
            const role = (u.role || '').toLowerCase();
            return name.includes(keyword) || email.includes(keyword) || role.includes(keyword);
        });
    }, [users, search]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);

    const pagedUsers = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredUsers.slice(start, start + PAGE_SIZE);
    }, [filteredUsers, currentPage]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    // Bấm nút Ban/Unban
    const handleActionClick = (user) => {
        if (user.status === 'Banned') {
            // Đang bị ban → gỡ ban, không cần lý do
            onUnban(user.id);
        } else {
            // Mở modal nhập lý do
            setBanTarget(user);
            setReason('');
        }
    };

    // Xác nhận ban trong modal
    const confirmBan = async () => {
        if (!reason.trim()) return;
        setSubmitting(true);
        try {
            await onBan(banTarget.id, reason.trim());
            setBanTarget(null);
            setReason('');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <h1 className="admin-title">User Management</h1>

            {/* Thanh tìm kiếm */}
            <div style={{ position: 'relative', maxWidth: 360, marginBottom: 16 }}>
                <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                    type="text"
                    className="admin-input"
                    placeholder="Search by name, email, or role..."
                    value={search}
                    onChange={handleSearchChange}
                    style={{ paddingLeft: 38, width: '100%' }}
                />
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Display Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagedUsers.length > 0 ? (
                            pagedUsers.map((u) => (
                                <tr key={u.id}>
                                    <td>{u.full_name || 'Not updated'}</td>
                                    <td>{u.email}</td>
                                    <td style={{ fontWeight: '600' }}>{u.role}</td>
                                    <td>
                                        <span className={`status-badge ${u.status === 'Banned' ? 'banned' : u.status === 'Active' ? 'active' : 'pending'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleActionClick(u)}
                                            className={`action-btn ${u.status === 'Banned' ? 'unban' : 'ban'}`}
                                        >
                                            <ShieldAlert size={16} /> {u.status === 'Banned' ? 'Unban' : 'Ban'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8' }}>No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                    <button className="action-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ opacity: currentPage === 1 ? 0.5 : 1 }}>
                        <ChevronLeft size={16} /> Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                        <button
                            key={num}
                            onClick={() => setPage(num)}
                            className="action-btn"
                            style={{
                                minWidth: 36, justifyContent: 'center',
                                background: num === currentPage ? '#01796F' : undefined,
                                color: num === currentPage ? '#fff' : undefined,
                                fontWeight: num === currentPage ? 700 : 400,
                            }}
                        >
                            {num}
                        </button>
                    ))}
                    <button className="action-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}>
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            )}

            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginTop: 10 }}>
                Showing {pagedUsers.length} of {filteredUsers.length} users
                {search && ` (filtered from ${users.length})`}
            </p>

            {/* Modal nhập lý do ban */}
            {banTarget && (
                <div
                    onClick={() => !submitting && setBanTarget(null)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: '#fff', borderRadius: 12, width: 440, maxWidth: '90%', padding: 24, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ margin: 0, color: '#b91c1c', fontSize: 18 }}>Ban account</h3>
                            <button onClick={() => !submitting && setBanTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ margin: '0 0 12px', color: '#475569', fontSize: 14 }}>
                            You are about to ban <strong>{banTarget.full_name || banTarget.email}</strong>.
                            The reason below will be emailed to the user.
                        </p>

                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter the reason for banning this account..."
                            rows={4}
                            autoFocus
                            style={{
                                width: '100%', padding: 12, borderRadius: 8, border: '1px solid #cbd5e1',
                                fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
                            }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                            <button
                                onClick={() => setBanTarget(null)}
                                disabled={submitting}
                                className="action-btn"
                                style={{ background: '#e2e8f0', color: '#475569' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmBan}
                                disabled={submitting || !reason.trim()}
                                className="action-btn"
                                style={{
                                    background: '#b91c1c', color: '#fff',
                                    opacity: submitting || !reason.trim() ? 0.6 : 1,
                                }}
                            >
                                <ShieldAlert size={16} /> {submitting ? 'Banning...' : 'Confirm Ban'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}