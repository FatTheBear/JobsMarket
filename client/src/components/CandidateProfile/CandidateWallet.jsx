import React, { useState } from 'react';

export default function CandidateWallet({
  show,
  onClose,
  coins,
  setCoins,
  transactions,
  setTransactions,
  bankAccount,
  setBankAccount
}) {
  const [activeWalletTab, setActiveWalletTab] = useState('history'); // các tab: 'history', 'topup', hoặc 'bank'

  if (!show) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-card profile-modal-large" onClick={(e) => e.stopPropagation()}>

        {/* Header của ví */}
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

        {/* Tabs chuyển đổi giữa các tính năng */}
        <div className="d-flex border-bottom bg-light">
          <button
            type="button"
            className={`btn btn-link flex-fill py-3 text-decoration-none fw-semibold border-0 ${activeWalletTab === 'history' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
            onClick={() => setActiveWalletTab('history')}
          >
            <i className="fas fa-history me-1"></i> Transaction History
          </button>
          <button
            type="button"
            className={`btn btn-link flex-fill py-3 text-decoration-none fw-semibold border-0 ${activeWalletTab === 'topup' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
            onClick={() => setActiveWalletTab('topup')}
          >
            <i className="fas fa-coins me-1"></i> Recharge Coins
          </button>
          <button
            type="button"
            className={`btn btn-link flex-fill py-3 text-decoration-none fw-semibold border-0 ${activeWalletTab === 'bank' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
            onClick={() => setActiveWalletTab('bank')}
          >
            <i className="fas fa-university me-1"></i> Link Bank
          </button>
        </div>

        {/* Body chính của Modal */}
        <div className="profile-modal-body p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>

          {/* TAB 1: LỊCH SỬ GIAO DỊCH */}
          {activeWalletTab === 'history' && (
            <div className="transaction-history">
              <h6 className="fw-bold mb-3">Recent transaction history</h6>
              {transactions.length === 0 ? (
                <p className="text-muted text-center py-4">There are no transactions yet.</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="d-flex justify-content-between align-items-center p-3 rounded border bg-light">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle d-flex align-items-center justify-content-center bg-white shadow-sm" style={{ width: '40px', height: '40px' }}>
                          <i className={`fas ${tx.type === 'deposit' ? 'fa-arrow-down text-success' : 'fa-arrow-up text-danger'}`}></i>
                        </div>
                        <div>
                          <p className="fw-bold mb-0 text-dark small">{tx.type === 'deposit' ? 'Nạp Coins vào ví' : 'Tiêu Coins mua dịch vụ'}</p>
                          <p className="mb-0 text-muted small">{tx.date} • via {tx.method}</p>
                        </div>
                      </div>
                      <div className="text-end">
                        <p className={`fw-bold mb-0 ${tx.type === 'deposit' ? 'text-success' : 'text-danger'}`}>
                          {tx.type === 'deposit' ? '+' : ''}{tx.coins} Coins
                        </p>
                        {tx.amount > 0 && <p className="text-muted small mb-0">-{tx.amount.toLocaleString()}đ</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NẠP THÊM COINS */}
          {activeWalletTab === 'topup' && (
            <div className="topup-coins">
              <h6 className="fw-bold mb-3">Choose a coin package</h6>
              <div className="row g-3">
                {[
                  { coins: 50, price: 25000, discount: null },
                  { coins: 100, price: 50000, discount: 'Hot' },
                  { coins: 200, price: 90000, discount: 'Save 10%' },
                  { coins: 500, price: 220000, discount: 'Save 12%' },
                ].map((pack, index) => (
                  <div key={index} className="col-12 col-sm-6">
                    <div className="p-3 border rounded text-center bg-light position-relative hover-shadow-sm transition-all" style={{ transition: '0.3s' }}>
                      {pack.discount && (
                        <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-danger">
                          {pack.discount}
                        </span>
                      )}
                      <h4 className="fw-bold text-primary mt-2">{pack.coins} Coins 🪙</h4>
                      <p className="text-secondary small mb-3">Price: {pack.price.toLocaleString()} VND</p>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary px-4 rounded-pill"
                        onClick={() => {
                          if (window.confirm(`Do you want to recharge ${pack.coins} Coins for ${pack.price.toLocaleString()}đ?`)) {
                            // Cộng xu thực tế
                            setCoins(prev => prev + pack.coins);
                            // Ghi nhận lịch sử giao dịch mới
                            setTransactions(prev => [
                              {
                                id: prev.length + 1,
                                type: 'deposit',
                                coins: pack.coins,
                                amount: pack.price,
                                date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                                status: 'completed',
                                method: bankAccount.linked ? bankAccount.bankName : 'Linked Bank'
                              },
                              ...prev
                            ]);
                            alert('Recharge Coins successfully!');
                          }
                        }}
                      >
                        Recharge Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LIÊN KẾT NGÂN HÀNG */}
          {activeWalletTab === 'bank' && (
            <div className="bank-link">
              <h6 className="fw-bold mb-3">Link Bank Account</h6>
              {bankAccount.linked ? (
                <div className="p-4 bg-success bg-opacity-10 border border-success rounded text-center">
                  <i className="fas fa-university text-success fs-2 mb-3"></i>
                  <h6 className="fw-bold text-success">Bank account linked successfully!</h6>
                  <p className="mb-1 text-dark"><strong>Bank:</strong> {bankAccount.bankName}</p>
                  <p className="mb-1 text-dark"><strong>Account Number:</strong> {bankAccount.accountNumber}</p>
                  <p className="mb-3 text-dark"><strong>Account Name:</strong> {bankAccount.accountName}</p>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger px-3 rounded-pill"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to unlink this account?")) {
                        setBankAccount({ linked: false, bankName: '', accountNumber: '', accountName: '' });
                      }
                    }}
                  >
                    Unlink
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setBankAccount({
                    linked: true,
                    bankName: e.target.bankName.value,
                    accountNumber: e.target.accountNumber.value,
                    accountName: e.target.accountName.value
                  });
                  alert('Bank account linked successfully!');
                }}>
                  <div className="mb-3 text-start">
                    <label className="form-label small fw-bold text-secondary">Select bank</label>
                    <select className="form-select" name="bankName" required>
                      <option value="">-- Select bank --</option>
                      <option value="Vietcombank">Vietcombank</option>
                      <option value="Techcombank">Techcombank</option>
                      <option value="MB Bank">MB Bank</option>
                      <option value="ACB">ACB</option>
                    </select>
                  </div>
                  <div className="mb-3 text-start">
                    <label className="form-label small fw-bold text-secondary">Account Number</label>
                    <input type="text" className="form-control" name="accountNumber" placeholder="Enter account number" required />
                  </div>
                  <div className="mb-3 text-start">
                    <label className="form-label small fw-bold text-secondary">Account Name</label>
                    <input type="text" className="form-control" name="accountName" placeholder="Ví dụ: HO HOANG SANG" required />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 py-2 rounded-pill fw-semibold">
                    Link Account
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Footer của Ví */}
        <div className="profile-modal-footer p-3 border-top d-flex justify-content-end bg-white">
          <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={onClose}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

