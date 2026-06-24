import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Patch localStorage to fall back to sessionStorage for session-only logins
(function () {
  const originalGetItem = localStorage.getItem.bind(localStorage);
  const originalSetItem = localStorage.setItem.bind(localStorage);
  const originalRemoveItem = localStorage.removeItem.bind(localStorage);
  const originalClear = localStorage.clear.bind(localStorage);

  localStorage.getItem = (key) => {
    const val = originalGetItem(key);
    if (val !== null) return val;
    return sessionStorage.getItem(key);
  };

  localStorage.setItem = (key, value) => {
    const isSessionMode = !!sessionStorage.getItem('token');
    if (isSessionMode) {
      sessionStorage.setItem(key, value);
    } else {
      originalSetItem(key, value);
    }
  };

  localStorage.removeItem = (key) => {
    originalRemoveItem(key);
    sessionStorage.removeItem(key);
  };

  localStorage.clear = () => {
    originalClear();
    sessionStorage.clear();
  };
})();

import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';

import 'mdb-react-ui-kit/dist/css/mdb.min.css';

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { WalletProvider } from "./context/WalletContext";

const initialOptions = {
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
    currency: "USD",
    intent: "capture",
};

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <PayPalScriptProvider options={initialOptions}>
      <WalletProvider>
        <App />
      </WalletProvider>
    </PayPalScriptProvider>
  // </StrictMode>,
)
