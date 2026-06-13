import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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
