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

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchWalletInfo = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/info`, getAuthHeader());
      setCoins(res.data.coins);
    } catch (error) {
      console.error("Failed to load wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
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



  useEffect(() => {
    const token = localStorage.getItem('token');
    
    const userStr = localStorage.getItem('user');
    let userRole = '';
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        userRole = userObj.role; 
      } catch (e) {
        console.error("parse user data error");
      }
    }

    if (token && userRole === 'Company') {
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
      loading,
      fetchWalletInfo,
      fetchTransactions,
      fetchCoinFees,
      createPayPalOrder,
      capturePayPalOrder
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
