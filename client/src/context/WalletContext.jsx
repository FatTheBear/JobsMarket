import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const WalletContext = createContext();
const API_URL = 'http://localhost:5000/api/wallet'; // Hãy điều chỉnh theo cổng Backend của bạn

export function WalletProvider({ children }) {
  const [coins, setCoins] = useState(0);
  const [showWallet, setShowWallet] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bankAccount, setBankAccount] = useState({
    linked: false,
    bankName: '',
    accountNumber: '',
    accountName: ''
  });

  // Cấu hình Header chứa Token gửi lên server để xác thực
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // 1. Tải thông tin ví (Số dư xu & Ngân hàng liên kết) từ Database
  const fetchWalletInfo = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/info`, getAuthHeader());
      setCoins(res.data.coins);
      if (res.data.bank_account_number) {
        setBankAccount({
          linked: true,
          bankName: res.data.bank_name,
          accountNumber: res.data.bank_account_number,
          accountName: res.data.bank_account_name
        });
      } else {
        setBankAccount({ linked: false, bankName: '', accountNumber: '', accountName: '' });
      }
    } catch (error) {
      console.error("Failed to load wallet data:", error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Tải lịch sử giao dịch từ Database
  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_URL}/transactions`, getAuthHeader());
      setTransactions(res.data);
    } catch (error) {
      console.error("Failed to load transaction history:", error.response?.data?.message || error.message);
    }
  };

  // 3. API Nạp tiền & lưu trực tiếp vào cơ sở dữ liệu
  const rechargeCoins = async (amountCoins, price, method) => {
    try {
      const payload = { coins: amountCoins, amountFiat: price, method };
      const res = await axios.post(`${API_URL}/topup`, payload, getAuthHeader());

      // Cập nhật lại giao diện ngay sau khi nạp thành công
      await fetchWalletInfo();
      await fetchTransactions();

      alert(res.data.message);
    } catch (error) {
      alert("Top-up failed: " + (error.response?.data?.message || error.message));
    }
  };

  // 4. API Liên kết ngân hàng
  const linkBankAccount = async (bankDetails) => {
    try {
      const res = await axios.post(`${API_URL}/link-bank`, bankDetails, getAuthHeader());

      // Reload lại thông tin ví từ DB
      await fetchWalletInfo();

      alert(res.data.message);
    } catch (error) {
      alert("Bank account linking failed: " + (error.response?.data?.message || error.message));
    }
  };

  // Tự động tải dữ liệu khi Token thay đổi (Người dùng đăng nhập hoặc đổi tài khoản)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchWalletInfo();
      fetchTransactions();
    }
  }, []);

  return (
    <WalletContext.Provider value={{
      coins,
      showWallet,
      setShowWallet,
      transactions,
      bankAccount,
      loading,
      fetchWalletInfo,
      fetchTransactions,
      rechargeCoins,
      linkBankAccount
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
