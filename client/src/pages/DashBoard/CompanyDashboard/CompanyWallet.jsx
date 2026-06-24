import React, { useState } from 'react';
import { useWallet } from '../../../context/WalletContext';
import RechargeCoins from '../../CandidateProfile/RechargeCoins';

const CompanyWallet = () => {
  const { coins, transactions } = useWallet();
  const [activeWalletTab, setActiveWalletTab] = useState(() => {
    const saved = localStorage.getItem('walletActiveTab');
    if (saved) {
      localStorage.removeItem('walletActiveTab');
      return saved;
    }
    return 'history';
  });

  return (
    <div className="animate-fade-in d-flex flex-column gap-4 p-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 border-bottom d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2">
          <h5 className="mb-0 fw-bold text-dark">
            <i className="fas fa-wallet me-2 text-primary"></i>My Wallet
          </h5>
          <span className="fw-bold bg-light px-3 py-1.5 rounded-pill border text-primary">
            Current Balance: <strong className="text-warning">{coins || 0} Coins 🪙</strong>
          </span>
        </div>

        <div className="d-flex border-bottom bg-light">
          <button
            type="button"
            className={`btn btn-link flex-fill py-3 text-decoration-none fw-semibold border-0 ${
              activeWalletTab === 'history'
                ? 'text-primary border-bottom border-primary border-3'
                : 'text-muted'
            }`}
            onClick={() => setActiveWalletTab('history')}
          >
            <i className="fas fa-history me-1"></i> Transaction History
          </button>
          <button
            type="button"
            className={`btn btn-link flex-fill py-3 text-decoration-none fw-semibold border-0 ${
              activeWalletTab === 'topup'
                ? 'text-primary border-bottom border-primary border-3'
                : 'text-muted'
            }`}
            onClick={() => setActiveWalletTab('topup')}
          >
            <i className="fas fa-coins me-1"></i> Recharge Coins
          </button>
        </div>

        <div className="card-body p-4">
          {activeWalletTab === 'history' && (
            <div className="transaction-history">
              <h6 className="fw-bold mb-3 text-dark">Recent transaction history</h6>
              {transactions.filter((tx) => tx.status === 'completed').length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-exchange-alt fs-2 mb-2 text-muted opacity-40"></i>
                  <p className="mb-0">There are no transactions yet.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {transactions
                    .filter((tx) => tx.status === 'completed')
                    .map((tx) => (
                      <div
                        key={tx.id}
                        className="d-flex justify-content-between align-items-center p-3 rounded border bg-light"
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center bg-white shadow-sm"
                            style={{ width: '40px', height: '40px' }}
                          >
                            <i
                              className={`fas ${
                                tx.type === 'deposit'
                                  ? 'fa-arrow-down text-success'
                                  : 'fa-arrow-up text-danger'
                              }`}
                            ></i>
                          </div>
                          <div>
                            <p className="fw-bold mb-0 text-dark small">
                              {tx.type === 'deposit'
                                ? 'Deposit coins into wallet'
                                : 'Spend coins for services'}
                            </p>
                            <p className="mb-0 text-muted small">
                              {new Date(tx.created_at).toLocaleString()} • via {tx.payment_method}
                            </p>
                          </div>
                        </div>
                        <div className="text-end">
                          <p
                            className={`fw-bold mb-0 ${
                              tx.type === 'deposit' ? 'text-success' : 'text-danger'
                            }`}
                          >
                            {tx.type === 'deposit' ? '+' : ''}
                            {tx.coins} Coins
                          </p>
                          {tx.amount_fiat > 0 && (
                            <p className="text-muted small mb-0">
                              -{Number(tx.amount_fiat).toLocaleString()} VND
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {activeWalletTab === 'topup' && <RechargeCoins />}
        </div>
      </div>
    </div>
  );
};

export default CompanyWallet;
