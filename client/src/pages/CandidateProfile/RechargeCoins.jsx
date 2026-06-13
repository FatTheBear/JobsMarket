import React, { useState, useEffect } from 'react';
import { useWallet } from '../../context/WalletContext';
import { PayPalButtons } from "@paypal/react-paypal-js";

const RechargeCoins = () => {
  const { coinFees, createPayPalOrder, capturePayPalOrder, fetchCoinFees, loading } = useWallet();
  const [selectedFee, setSelectedFee] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCoinFees();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="topup-coins">
      {message && <div className="alert alert-info">{message}</div>}
      
      <h6 className="fw-bold mb-3">Choose a coin package</h6>
      <div className="row g-3 mb-4">
        {coinFees.map((fee) => (
          <div key={fee.id} className="col-12 col-sm-6">
            <div 
              className={`p-3 border rounded text-center bg-light position-relative hover-shadow-sm transition-all ${selectedFee?.id === fee.id ? 'border-primary shadow-sm' : ''}`} 
              style={{ transition: '0.3s', cursor: 'pointer' }}
              onClick={() => setSelectedFee(fee)}
            >
              {fee.label && (
                <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-danger">
                  {fee.label}
                </span>
              )}
              <h4 className="fw-bold text-primary mt-2">{fee.coins} Coins 🪙</h4>
              <p className="text-secondary small mb-3">Price: {Number(fee.price_vnd).toLocaleString()} VND</p>
              {fee.description && <p className="small text-muted">{fee.description}</p>}
            </div>
          </div>
        ))}
      </div>

      {selectedFee && (
        <div className="mt-4 p-3 border rounded bg-white">
          <h6 className="fw-bold">Pay with PayPal</h6>
          <p className="mb-3">You selected: <strong>{selectedFee.coins} Coins</strong> for <strong>{Number(selectedFee.price_vnd).toLocaleString()} VND</strong></p>
          <PayPalButtons
            createOrder={async () => {
              try {
                 const orderId = await createPayPalOrder(selectedFee.id);
                 return orderId;
              } catch (error) {
                 setMessage("Error creating order");
                 return null;
              }
            }}
            onApprove={async (data, actions) => {
              try {
                const result = await capturePayPalOrder(data.orderID);
                if (result.alreadyCompleted) {
                  setMessage("This transaction was already completed.");
                } else {
                  setMessage(`Successfully recharged ${selectedFee.coins} coins!`);
                }
                setSelectedFee(null);
              } catch (error) {
                setMessage("Payment capture failed. Please contact support.");
              }
            }}
            onCancel={() => {
               setMessage("Payment cancelled.");
            }}
            onError={(err) => {
               setMessage("An error occurred with PayPal.");
               console.error(err);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default RechargeCoins;
