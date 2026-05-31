import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function AdminUser({ users, onToggleStatus }) {
    return (
        <div>
            <h1 className="admin-title">User Management</h1>
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
                        {users.map(u => (
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
                                        onClick={() => onToggleStatus(u.id, u.status)}
                                        className={`action-btn ${u.status === 'Banned' ? 'unban' : 'ban'}`}
                                    >
                                        <ShieldAlert size={16} /> {u.status === 'Banned' ? 'Unban' : 'Ban'}
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