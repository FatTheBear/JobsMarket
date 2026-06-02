import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import CompanyProfile from './pages/CompanyProfile/CompanyProfile';
import CandidateProfile from './pages/CandidateProfile/Candidate_profile';
import Login from './pages/Authentication/Login';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProtectedRoute from './pages/ProtectedRoute';
import HomePage from './pages/HomePage/HomePage';
import VerifyOTP from './pages/Authentication/VerifyOTP';
import './App.css';
import AuthPage from './pages/Authentication/AuthPage';
import Register from './pages/Authentication/Register';
import UserDashboard from './pages/DashBoard/UserDashboard/UserDashboard';
import SetupProfilePage from './pages/SetupProfilePage/SetupProfilePage';


// Home Dashboard component featuring the Premium Dashboard Header and profile switching tabs
function Home() {
  const [activeTab, setActiveTab] = useState('candidate');


  return (
    <div className="app-wrapper">
      {/* Premium Dashboard Header */}
      <header className="dashboard-header">
        <div className="header-brand">
          <span className="brand-logo">💼</span>
          <span className="brand-name">JobsMarket</span>
          <span className="brand-badge">Developer Mode</span>
        </div>
        <nav className="header-nav">
          <button
            className={`nav-tab-btn ${activeTab === 'candidate' ? 'active' : ''}`}
            onClick={() => setActiveTab('candidate')}
          >
            👤 Candidate Profile
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'company' ? 'active' : ''}`}
            onClick={() => setActiveTab('company')}
          >
            🏢 Company Profile
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {activeTab === 'candidate' ? <CandidateProfile /> : <CompanyProfile />}
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>© 2026 JobsMarket Platform • The Breakthrough Recruitment Experience</p>
      </footer>
    </div>
  );
}

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },

  // Authentication
  { path: "/auth", element: <AuthPage /> },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
  { path: "/verify-otp", element: <VerifyOTP /> },
  { path: "/dashboard", element: <UserDashboard /> },
  { path: "/profile", element: <Home /> },
  { path: "/setup-profile", element: <SetupProfilePage /> },
  { path: "/candidate-profile", element: <CandidateProfile /> },

  // Profile
  {
    path: "/company-profile",
    element: <CompanyProfile />
  },

  { path: "*", element: <div>404</div> }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
