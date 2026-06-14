import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import MainLayout from './components/layout/MainLayout'; // <-- Nhớ trỏ đúng đường dẫn thư mục nhé!
import CompanySidebar from './components/layout/CompanySidebar';
import LandingPage from './pages/LandingPage/LandingPage';
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
import SearchJobs from './pages/SearchJobs/SearchJobs';

import './App.css';
import CompanyDashboard from './pages/DashBoard/CompanyDashboard/CompanyDashboard';

// Component Home tạm thời điều hướng Tab giữa Candidate và Company Profile
function Home() {
  const [activeTab, setActiveTab] = useState('candidate');

  return (
    <div className="app-wrapper">

      <main className="dashboard-main">
        {activeTab === 'candidate' ? <CandidateProfile /> : <CompanyProfile />}
      </main>
      <footer className="dashboard-footer">
        <p>© 2026 JobsMarket Platform • The Breakthrough Recruitment Experience</p>
      </footer>
    </div>
  );
}

// CẤU HÌNH ĐỊNH TUYẾN
const router = createBrowserRouter([
  { path: "/auth", element: <AuthPage /> },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
  { path: "/verify-otp", element: <VerifyOTP /> },
  { path: "/setup-profile", element: <SetupProfilePage /> },

  // NHÓM 2: CÁC TRANG BỌC BỞI MAIN LAYOUT
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/dashboard", element: <UserDashboard /> },
      { path: "/profile", element: <Home /> },
      {
        path: "/candidate-profile",
        element: (
          <ProtectedRoute requiredRole="Candidate">
            <CandidateProfile />
          </ProtectedRoute>
        )
      },

      { path: "/candidate/:id", element: <CandidatePublicProfile /> },
      {
        path: "/job-skills",
        element: (
          <div style={{ maxWidth: 820, margin: '40px auto', padding: '0 20px' }}>
            <h1 style={{ fontFamily: 'Inter,sans-serif', marginBottom: 24 }}>🎯 Job Skills Manager</h1>
            <JobSkillsManager jobId={null} />
          </div>
        )
      },


      {
        path: "/company",
        element: <CompanyDashboard />,
        children: [
          { path: "profile", element: <CompanyProfile /> },
          { path: "post-job", element: <JobPosting /> },
        ]
      },

      {
        path: "/admin",
        element: (
          <ProtectedRoute requiredRole="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        ),
      }
    ]
  },

  { path: "/search-jobs", element: <SearchJobs /> },
  { path: "*", element: <div>404 - Trang không tồn tại</div> }
]);

// Component App chính chạy RouterProvider
export default function App() {
  return (
    //<SocketProvider>
    <RouterProvider router={router} />
    //</SocketProvider>
  );
}