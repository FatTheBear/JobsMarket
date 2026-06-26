import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useModal } from './useModal'; // Cần trỏ đúng đường dẫn đến file useModal

const AdminTransaction = () => {
    const { showAlert, showConfirm } = useModal();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/transactions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
        
        const interval = setInterval(() => {
            fetchTransactions();
        }, 5000);
        
        return () => clearInterval(interval);
    }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        const actionText = newStatus === 'completed' ? 'Approve' : 'Reject';
        
        // Sử dụng modal thay vì window.confirm
        const confirmed = await showConfirm(`Are you sure you want to ${actionText.toLowerCase()} this transaction?`);
        if (!confirmed) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/transactions/${id}/status`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Sử dụng modal thông báo thành công
            await showAlert("Transaction processed successfully!", "success");
            fetchTransactions(); 
        } catch (error) {
            // Sử dụng modal thông báo lỗi
            await showAlert(error.response?.data?.message || "An error occurred!", "error");
        }
    };

    if (loading) {
        return <div className="admin-title">Loading transaction data...</div>;
    }

    return (
        <div>
            <h2 className="admin-title" style={{ color: '#01796F' }}>Manage Coin Transactions</h2>
            
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User Email</th>
                            <th>Amount (VND)</th>
                            <th>Coins</th>
                            <th>Reference Code</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx) => (
                            <tr key={tx.id}>
                                <td>{tx.id}</td>
                                <td>
                                    <strong>{tx.email}</strong>
                                </td>
                                <td style={{ color: '#34d399', fontWeight: 'bold' }}>
                                    {Number(tx.amount_fiat).toLocaleString()}đ
                                </td>
                                <td style={{ color: '#fbbf24', fontWeight: 'bold' }}>
                                    🪙 {tx.coins}
                                </td>
                                <td style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                                    {tx.reference_code || 'N/A'}
                                </td>
                                <td>
                                    <span className={`status-badge ${
                                        tx.status === 'completed' ? 'approved' : 
                                        tx.status === 'failed' ? 'rejected' : 'pending'
                                    }`}>
                                        {tx.status === 'completed' ? 'Completed' : 
                                         tx.status === 'failed' ? 'Cancelled' : 'Pending'}
                                    </span>
                                </td>
                                <td>
                                    {tx.status === 'pending' ? (
                                        <div className="btn-group">
                                            <button 
                                                onClick={() => handleUpdateStatus(tx.id, 'completed')} 
                                                className="btn-approve"
                                                style={{ padding: '6px 12px', fontSize: '13px' }}
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleUpdateStatus(tx.id, 'failed')} 
                                                className="btn-reject"
                                                style={{ padding: '6px 12px', fontSize: '13px' }}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <span style={{ color: '#64748b', fontSize: '14px' }}>Processed</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminTransaction;