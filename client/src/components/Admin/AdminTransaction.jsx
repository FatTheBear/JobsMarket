import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminTransaction = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('token');
            // Cấu hình endpoint của nhóm
            const res = await axios.get('http://localhost:5000/api/admin/transactions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi lấy danh sách giao dịch:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        const actionText = newStatus === 'completed' ? 'DUYỆT' : 'TỪ CHỐI';
        if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} giao dịch này không?`)) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/transactions/${id}/status`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Xử lý giao dịch thành công!");
            fetchTransactions(); // Tải lại danh sách sau khi update thành công
        } catch (error) {
            alert(error.response?.data?.message || "Có lỗi xảy ra!");
        }
    };

    if (loading) {
        return <div className="admin-title">Đang tải dữ liệu giao dịch...</div>;
    }

    return (
        <div>
           
            <h2 className="admin-title" style={{ color: '#38bdf8' }}>Quản Lý Giao Dịch Ví Xu</h2>
            
          
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email Người Dùng</th>
                            <th>Số Tiền (VND)</th>
                            <th>Xu Quy Đổi</th>
                            <th>Mã Tham Chiếu</th>
                            <th>Trạng Thái</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx) => (
                            <tr key={tx.id}>
                                <td>{tx.id}</td>
                                <td>
                                    <strong>{tx.email}</strong>
                                    {tx.bank_name && (
                                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                                            {tx.bank_name} - {tx.bank_account_number} ({tx.bank_account_name})
                                        </div>
                                    )}
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
                                        {tx.status === 'completed' ? 'Thành công' : 
                                         tx.status === 'failed' ? 'Đã hủy' : 'Chờ duyệt'}
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
                                                Duyệt nạp
                                            </button>
                                            <button 
                                                onClick={() => handleUpdateStatus(tx.id, 'failed')} 
                                                className="btn-reject"
                                                style={{ padding: '6px 12px', fontSize: '13px' }}
                                            >
                                                Từ chối
                                            </button>
                                        </div>
                                    ) : (
                                        <span style={{ color: '#64748b', fontSize: '14px' }}>Hoàn thành</span>
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