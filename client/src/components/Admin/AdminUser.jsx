import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function AdminUser({ users, onToggleStatus }) {
    return (
        <div>
            <h1 className="admin-title">Quản Lý Người Dùng</h1>
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Tên hiển thị</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>{u.full_name || 'Chưa cập nhật'}</td>
                                <td>{u.email}</td>
                                <td style={{ fontWeight: '600' }}>{u.role}</td>
                                <td>
                                    <span className={`status-badge ${u.status === 'Banned' ? 'banned' : u.status === 'Active' ? 'active' : 'pending'}`}>
                                        {u.status}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        onClick={() => onToggleStatus(u.id, u.status)}
                                        className={`action-btn ${u.status === 'Banned' ? 'unban' : 'ban'}`}
                                    >
                                        <ShieldAlert size={16} /> {u.status === 'Banned' ? 'Mở Khóa' : 'Khóa'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}