import React, { useState, useEffect } from 'react';
import RechargeCoins from './RechargeCoins';
import { useWallet } from '../../context/WalletContext';
import axios from 'axios';

export default function CandidateWallet({
  show,
  onClose
}) {
  const { coins, transactions, fetchWalletInfo, fetchTransactions } = useWallet();
  const [activeWalletTab, setActiveWalletTab] = useState('history'); // tabs: 'history', 'topup', or 'bank'
  const [walletMessage, setWalletMessage] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    if (show) {
      fetchWalletInfo();
      fetchTransactions();
    }
  }, [show]);

  const showMessage = (text, type = 'success') => {
    setWalletMessage({ text, type });
    setTimeout(() => {
      setWalletMessage(null);
    }, 4000);
  };

  const handleTabChange = (tab) => {
    setActiveWalletTab(tab);
    setPendingAction(null);
    setWalletMessage(null);
  };

  if (!show) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-card profile-modal-large" onClick={(e) => e.stopPropagation()}>

        {/* Wallet Header */}
        <div className="profile-modal-header bg-primary text-white p-3 d-flex justify-content-between align-items-center">
          <h5 className="profile-modal-title mb-0 d-flex align-items-center gap-2 text-white">
            <i className="fas fa-wallet text-white"></i>
            My wallet (Balance: <strong className="text-warning">{coins} Coins 🪙</strong>)
          </h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'white', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>

        {/* Feature Switch Tabs */}
        <div className="d-flex border-bottom bg-light">
          <button
            type="button"
            className={`btn btn-link flex-fill py-3 text-decoration-none fw-semibold border-0 ${activeWalletTab === 'history' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
            onClick={() => handleTabChange('history')}
          >
            <i className="fas fa-history me-1"></i> Transaction History
          </button>
          <button
            type="button"
            className={`btn btn-link flex-fill py-3 text-decoration-none fw-semibold border-0 ${activeWalletTab === 'topup' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
            onClick={() => handleTabChange('topup')}
          >
            <i className="fas fa-coins me-1"></i> Recharge Coins
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="profile-modal-body p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>

          {walletMessage && (
            <div className={`alert alert-${walletMessage.type} alert-dismissible fade show border-0 shadow-sm py-2.5 px-3 mb-4 small rounded-3 d-flex align-items-center justify-content-between`} role="alert" style={{ background: walletMessage.type === 'success' ? '#e6f4ea' : '#fce8e6', color: walletMessage.type === 'success' ? '#137333' : '#c5221f' }}>
              <span className="d-flex align-items-center gap-2 fw-medium">
                <i className={`fas ${walletMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                {walletMessage.text}
              </span>
              <button type="button" className="btn-close py-2.5 shadow-none border-0" onClick={() => setWalletMessage(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.25rem', opacity: '0.6' }}>&times;</button>
            </div>
          )}

          {/* TAB 1: TRANSACTION HISTORY */}
          {activeWalletTab === 'history' && (
            <div className="transaction-history">
              <h6 className="fw-bold mb-3">Recent transaction history</h6>
              {transactions.filter(tx => tx.status === 'completed').length === 0 ? (
                <p className="text-muted text-center py-4">There are no transactions yet.</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {transactions.filter(tx => tx.status === 'completed').map((tx) => (
                    <div key={tx.id} className="d-flex justify-content-between align-items-center p-3 rounded border bg-light">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle d-flex align-items-center justify-content-center bg-white shadow-sm" style={{ width: '40px', height: '40px' }}>
                          <i className={`fas ${tx.type === 'deposit' ? 'fa-arrow-down text-success' : 'fa-arrow-up text-danger'}`}></i>
                        </div>
                        <div>
                          <p className="fw-bold mb-0 text-dark small">{tx.type === 'deposit' ? 'Deposit coins into wallet' : 'Spend coins for services'}</p>
                          <p className="mb-0 text-muted small">{new Date(tx.created_at).toLocaleString()} • via {tx.payment_method}</p>
                        </div>
                      </div>
                      <div className="text-end">
                        <p className={`fw-bold mb-0 ${tx.type === 'deposit' ? 'text-success' : 'text-danger'}`}>
                          {tx.type === 'deposit' ? '+' : ''}{tx.coins} Coins
                        </p>
                        {tx.amount_fiat > 0 && <p className="text-muted small mb-0">-{Number(tx.amount_fiat).toLocaleString()} VND</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RECHARGE COINS */}
          {activeWalletTab === 'topup' && (
             <RechargeCoins />
          )}


        </div>

        {/* Wallet Footer */}
        <div className="profile-modal-footer p-3 border-top d-flex justify-content-end bg-white">
          <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={onClose}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
