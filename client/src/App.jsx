import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider, BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Components
import CompanyProfile from './components/CompanyProfile/CompanyProfile';
import CandidateProfile from './components/CandidateProfile/Candidate_profile';
import Login from './components/Auth/Login';
import AdminDashboard from './components/Admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import HomePage from './pages/HomePage/HomePage';
import CandidateProfilePage from './pages/CandidateProfilePage/CandidateProfilePage';
import AuthPage from './pages/Authentication/AuthPage';
import Register from './pages/Authentication/Register';

// Style
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
  { path: "/", element: <HomePage /> },
  { path: "/auth", element: <AuthPage /> },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
  { path: "/company-profile", element: <CompanyProfile /> },
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
  { path: "*", element: <div style={{ color: 'white', padding: '20px' }}>404 - Page Not Found</div> }
]);

// Component App chính chạy RouterProvider
export default function App() {
  return <RouterProvider router={router} />;
}