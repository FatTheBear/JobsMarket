import React, { useState } from 'react';
import LandingPage from './pages/LandingPage/LandingPage';
import { createBrowserRouter, RouterProvider, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import CompanyProfile from './pages/CompanyProfile/CompanyProfile';
import CandidateProfile from './pages/CandidateProfile/Candidate_profile';
import CandidatePublicProfile from './pages/CandidateProfile/CandidatePublicProfile';
import Login from './pages/Authentication/Login';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProtectedRoute from './pages/ProtectedRoute';
import JobPosting from './pages/JobPosting/JobPosting';
import JobSkillsManager from './pages/JobSkillsManager/JobSkillsManager';
import VerifyOTP from './pages/Authentication/VerifyOTP';
import AuthPage from './pages/Authentication/AuthPage';
import Register from './pages/Authentication/Register';
import UserDashboard from './pages/DashBoard/UserDashboard/UserDashboard';
import SetupProfilePage from './pages/SetupProfilePage/SetupProfilePage';

import './App.css';

// Component Home tạm thời điều hướng Tab giữa Candidate và Company Profile
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

// Cấu hình danh sách các đường dẫn (Routes) toàn hệ thống
const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },

  // Authentication
  { path: "/auth", element: <AuthPage /> },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
  { path: "/company-profile", element: <CompanyProfile /> },
  { path: "/verify-otp", element: <VerifyOTP /> },
  { path: "/dashboard", element: <UserDashboard /> },
  { path: "/profile", element: <Home /> },
  { path: "/setup-profile", element: <SetupProfilePage /> },
  { path: "/candidate-profile", element: <CandidateProfile /> },
  { path: "/candidate/:id", element: <CandidatePublicProfile /> },
  { path: "/company-profile/job-posting", element: <JobPosting /> },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRole="Admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/job-posting",
    element: <JobPosting />
  },
  {
    path: "/job-skills",
    element: (
      <div style={{ maxWidth: 820, margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ fontFamily: 'Inter,sans-serif', marginBottom: 24 }}>🎯 Job Skills Manager</h1>
        <JobSkillsManager jobId={null} />
      </div>
    )
  },

  { path: "*", element: <div>404</div> }
]);

// Component App chính chạy RouterProvider
export default function App() {
  return (
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
  );
}
