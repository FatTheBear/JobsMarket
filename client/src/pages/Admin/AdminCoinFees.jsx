import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../services/adminApi';

const AdminCoinFees = () => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        price_vnd: '',
        coins: '',
        label: '',
        description: '',
        is_active: true,
        sort_order: 0
    });
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        fetchFees();
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const fetchFees = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getCoinFees();
            if (mountedRef.current) {
                setFees(data);
            }
        } catch (error) {
            console.error("Error fetching coin fees:", error);
            if (mountedRef.current) {
                alert("Failed to load coin packages.");
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    };

    const handleOpenModal = (fee = null) => {
        if (fee) {
            setFormData({
                id: fee.id,
                price_vnd: fee.price_vnd,
                coins: fee.coins,
                label: fee.label || '',
                description: fee.description || '',
                is_active: fee.is_active,
                sort_order: fee.sort_order
            });
        } else {
            setFormData({
                id: null,
                price_vnd: '',
                coins: '',
                label: '',
                description: '',
                is_active: true,
                sort_order: 0
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await adminApi.updateCoinFee(formData.id, formData);
                alert("Coin package updated successfully!");
            } else {
                await adminApi.createCoinFee(formData);
                alert("Coin package created successfully!");
            }
            setShowModal(false);
            fetchFees();
        } catch (error) {
            console.error("Error saving coin fee:", error);
            alert("Error saving package: " + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this coin package?")) return;
        try {
            await adminApi.deleteCoinFee(id);
            alert("Coin package deleted successfully!");
            fetchFees();
        } catch (error) {
            console.error("Error deleting coin fee:", error);
            alert("Error deleting package: " + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return <div>Loading data...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="admin-title" style={{ color: '#01796f', margin: 0 }}>Coin Packages Management</h2>
                <button 
                    onClick={() => handleOpenModal()} 
                    style={{ padding: '8px 16px', background: '#34d399', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    + Add New Package
                </button>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Price (VND)</th>
                            <th>Coins Received</th>
                            <th>Label</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fees.map(fee => (
                            <tr key={fee.id}>
                                <td>{fee.id}</td>
                                <td style={{ fontWeight: 'bold', color: '#34d399' }}>{Number(fee.price_vnd).toLocaleString()} VND</td>
                                <td style={{ fontWeight: 'bold', color: '#fbbf24' }}>🪙 {fee.coins}</td>
                                <td>
                                    {fee.label}
                                    {fee.is_default ? <span style={{ marginLeft: '8px', padding: '2px 6px', background: '#e2e8f0', color: '#475569', borderRadius: '4px', fontSize: '12px' }}>Default</span> : null}
                                </td>
                                <td>
                                    <span style={{ color: fee.is_active ? '#34d399' : '#94a3b8' }}>
                                        {fee.is_active ? 'Active' : 'Hidden'}
                                    </span>
                                </td>
                                <td>
                                    {!fee.is_default && (
                                        <>
                                            <button 
                                                onClick={() => handleOpenModal(fee)}
                                                style={{ marginRight: '8px', padding: '4px 8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(fee.id)}
                                                style={{ padding: '4px 8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '8px', width: '400px', color: 'white' }}>
                        <h3 style={{ marginTop: 0, color: '#38bdf8' }}>{formData.id ? 'Edit Package' : 'Add New Package'}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px' }}>Price (VND):</label>
                                <input 
                                    type="number" 
                                    value={formData.price_vnd} 
                                    onChange={e => setFormData({...formData, price_vnd: e.target.value})} 
                                    required 
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #475569', background: '#0f172a', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px' }}>Coins:</label>
                                <input 
                                    type="number" 
                                    value={formData.coins} 
                                    onChange={e => setFormData({...formData, coins: e.target.value})} 
                                    required 
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #475569', background: '#0f172a', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px' }}>Display Label (e.g. Save 10%):</label>
                                <input 
                                    type="text" 
                                    value={formData.label} 
                                    onChange={e => setFormData({...formData, label: e.target.value})} 
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #475569', background: '#0f172a', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px' }}>Description:</label>
                                <textarea 
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #475569', background: '#0f172a', color: 'white', minHeight: '60px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px' }}>Sort Order (Smaller first):</label>
                                <input 
                                    type="number" 
                                    value={formData.sort_order} 
                                    onChange={e => setFormData({...formData, sort_order: e.target.value})} 
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #475569', background: '#0f172a', color: 'white' }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input 
                                    type="checkbox" 
                                    checked={formData.is_active} 
                                    onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                                />
                                <label>Active (Visible to users)</label>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: '#475569', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '8px 16px', background: '#38bdf8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCoinFees;
