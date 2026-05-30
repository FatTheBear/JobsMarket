import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import CompanyProfile from './components/CompanyProfile/CompanyProfile';
import CandidateProfile from './components/CandidateProfile/Candidate_profile';
import Login from './components/Auth/Login';
import AdminDashboard from './components/Admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage/HomePage';

import CandidateProfilePage from './pages/CandidateProfilePage/CandidateProfilePage';
import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


import AuthPage from './pages/Authentication/AuthPage';
import Register from './pages/Authentication/Register';


// Home Dashboard component featuring the Premium Dashboard Header and profile switching tabs
function Home() {
  const [activeTab, setActiveTab] = useState('candidate');


  return (
    <><div className="app-wrapper">
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
    </div><Router>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/auth" element={<AuthPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route path="/company-profile" element={<CompanyProfile />} />
        </Routes>
      </Router></>
  );
}

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/auth", element: <AuthPage /> },
  { path: "/login", element: <Login /> },
  { path: "/profile", element: <Home /> },
  {
    path: "/candidate-profile",
    element: (
      <ProtectedRoute>
        <CandidateProfilePage />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  { path: "*", element: <div>404</div> }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
