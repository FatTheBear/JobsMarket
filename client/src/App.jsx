import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import MainLayout from './components/layout/MainLayout'; // <-- Nhớ trỏ đúng đường dẫn thư mục nhé!

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
import JobDetail from './pages/JobDetail/JobDetail';

import './App.css';

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
  // ==========================================
  // NHÓM 1: CÁC TRANG TỰ DO (KHÔNG CÓ NAVBAR CHUNG)
  // ==========================================
  { path: "/auth", element: <AuthPage /> },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
  { path: "/verify-otp", element: <VerifyOTP /> },
  { path: "/setup-profile", element: <SetupProfilePage /> },

  // ==========================================
  // NHÓM 2: CÁC TRANG BỌC BỞI MAIN LAYOUT (CÓ NAVBAR)
  // ==========================================
  {
    element: <MainLayout />, // <-- Đặt cái khuôn ở đây
    children: [     
      { path: "/", element: <LandingPage /> },         // <-- Tất cả đường link bên trong sẽ tự động đổ vào vị trí <Outlet />
      { path: "/dashboard", element: <UserDashboard /> },
      { path: "/company-profile", element: <CompanyProfile /> },
      { path: "/job-posting", element: <JobPosting /> },
      { path: "/company/jobs/create", element: <JobPosting /> },
      { path: "/company-profile/job-posting", element: <JobPosting /> },
      { path: "/profile", element: <Home /> },
      { path: "/candidate-profile", element: <CandidateProfile /> },
      { path: "/candidate/:id", element: <CandidatePublicProfile /> },
      {
        path: "/admin",
        element: (
          <ProtectedRoute requiredRole="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      { 
        path: "/search-jobs", 
        element: <SearchJobs /> 
      },
      {
        path: "/job/:id",
        element: <JobDetail />
      }
    ]
  },


  // Trang 404 cho các đường dẫn sai
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