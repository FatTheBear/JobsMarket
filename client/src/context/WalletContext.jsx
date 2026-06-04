import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const WalletContext = createContext();
const API_URL = 'http://localhost:5000/api/wallet';

export function WalletProvider({ children }) {
  const [coins, setCoins] = useState(0);
  const [showWallet, setShowWallet] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [coinFees, setCoinFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bankAccount, setBankAccount] = useState({
    linked: false,
    bankName: '',
    accountNumber: '',
    accountName: ''
  });

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

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
      console.error("Failed to load wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    return;
    try {
      const res = await axios.get(`${API_URL}/transactions`, getAuthHeader());
      setTransactions(res.data);
    } catch (error) {
      console.error("Failed to load transaction history:", error);
    }
  };

  const fetchCoinFees = async () => {
    try {
      const res = await axios.get(`${API_URL}/coin-fees`, getAuthHeader());
      setCoinFees(res.data);
    } catch (error) {
      console.error("Failed to load coin fees:", error);
    }
  };

  const createPayPalOrder = async (feeId) => {
    try {
      const res = await axios.post(`${API_URL}/paypal/create-order`, { feeId }, getAuthHeader());
      return res.data.id; // Trả về orderID cho PayPal SDK
    } catch (error) {
      console.error("Failed to create PayPal order:", error);
      throw error;
    }
  };

  const capturePayPalOrder = async (orderID) => {
    try {
      const res = await axios.post(`${API_URL}/paypal/capture-order`, { orderID }, getAuthHeader());
      await fetchWalletInfo();
      await fetchTransactions();
      return res.data;
    } catch (error) {
      console.error("Failed to capture PayPal order:", error);
      throw error;
    }
  };

  const linkBankAccount = async (bankDetails) => {
    try {
      const res = await axios.post(`${API_URL}/link-bank`, bankDetails, getAuthHeader());
      await fetchWalletInfo();
      alert(res.data.message);
    } catch (error) {
      alert("Bank account linking failed: " + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchWalletInfo();
      fetchTransactions();
      fetchCoinFees();
    }
  }, []);

  return (
    <WalletContext.Provider value={{
      coins,
      showWallet,
      setShowWallet,
      transactions,
      coinFees,
      bankAccount,
      loading,
      fetchWalletInfo,
      fetchTransactions,
      fetchCoinFees,
      createPayPalOrder,
      capturePayPalOrder,
      linkBankAccount
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
