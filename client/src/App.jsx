import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import MainLayout from './components/layout/MainLayout';
import LandingPage from './pages/LandingPage/LandingPage';
import CompanyProfile from './pages/CompanyProfile/CompanyProfile';
import CompanyPublicProfile from './pages/CompanyProfile/CompanyPublicProfile';
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
import PostTemplates from './pages/DashBoard/CompanyDashboard/PostTemplates';
import JobDetail from './pages/JobDetail/JobDetail';
import CompanyDashboard from './pages/DashBoard/CompanyDashboard/CompanyDashboard';
import AppliedCandidates from './pages/AppliedCandidates/AppliedCandidates';
import SavedCandidates from './pages/SavedCandidates/SavedCandidates';
import TermsOfService from './pages/Authentication/TermsOfService';
import NewsDetail from './pages/Dashboard/CompanyDashboard/NewsDetail';
import MyApplications from './pages/MyApplications/MyApplications';
import CommunityFeed from './pages/Community/CommunityFeed';
import CreatePost from './pages/DashBoard/CompanyDashboard/CreatePost';
import CompanyWallet from './pages/DashBoard/CompanyDashboard/CompanyWallet';

// Child components for Candidate Profile
import CandidateMyProfile from './pages/CandidateProfile/CandidateMyProfile';
import CandidateAccountSettings from './pages/CandidateProfile/CandidateAccountSettings';
import CandidateNotifications from './pages/CandidateProfile/CandidateNotifications';
import CandidateActivityHistory from './pages/CandidateProfile/CandidateActivityHistory';
import CandidateAppliedJobsPage from './pages/CandidateProfile/CandidateAppliedJobsPage';
import CandidateManageCVs from './pages/CandidateProfile/CandidateManageCVs';
import CompanyRegister from './pages/Authentication/CompanyRegister';
import RegistrationPending from './pages/Authentication/RegistrationPending';
import ActivateCompany from './pages/Authentication/ActivateCompany';

import './App.css';

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

const router = createBrowserRouter([
  { path: "/auth", element: <AuthPage /> },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
  { path: "/verify-otp", element: <VerifyOTP /> },
  { path: "/setup-profile", element: <SetupProfilePage /> },
  { path: "/terms-of-service", element: <TermsOfService /> },
  { path: "/registration-pending", element: <RegistrationPending /> },
  { path: "/activate-company", element: <ActivateCompany /> },
  

  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/dashboard", element: <UserDashboard /> },
      { path: "/profile", element: <Home /> },

      {
        path: "/candidate-profile",
        element: <Navigate to="/candidate/my-profile" replace />
      },

      {
        path: "/candidate/my-profile",
        element: (
          <ProtectedRoute requiredRole="Candidate">
            <CandidateProfile />
          </ProtectedRoute>
        ),
        children: [
          { path: "", element: <CandidateMyProfile /> },
          { path: "account-settings", element: <CandidateAccountSettings /> },
          { path: "notifications", element: <CandidateNotifications /> },
          { path: "activity-history", element: <CandidateActivityHistory /> },
          { path: "applied-jobs", element: <CandidateAppliedJobsPage /> },
          { path: "manage-cvs", element: <CandidateManageCVs /> }
        ]
      },

      { path: "/candidate/:id", element: <CandidatePublicProfile /> },
      { path: "/company/:id", element: <CompanyPublicProfile /> },

      {
        path: "/job-skills",
        element: (
          <div style={{ maxWidth: 820, margin: '40px auto', padding: '0 20px' }}>
            <h1 style={{ fontFamily: 'Inter,sans-serif', marginBottom: 24 }}>
              🎯 Job Skills Manager
            </h1>
            <JobSkillsManager jobId={null} />
          </div>
        )
      },

      {
        path: "/company",
        element: <CompanyDashboard />,
        // ĐÃ SỬA: Gom tất cả children của company vào chung 1 khối duy nhất
        children: [
          { path: "dashboard", element: <></> },
          { path: "profile", element: <CompanyProfile /> },
          { path: "post-job", element: <JobPosting /> },
          { path: "templates", element: <PostTemplates /> },
          { path: "applicants", element: <AppliedCandidates /> },
          { path: "saved-candidates", element: <SavedCandidates /> },
          { path: "create-post", element: <CreatePost /> },
          { path: "wallet", element: <CompanyWallet /> }
        ]
      },

      {
        path: "/admin",
        element: (
          <ProtectedRoute requiredRole="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        )
      },

      { path: "/search-jobs", element: <SearchJobs /> },

      { path: "/jobs", element: <SearchJobs /> },
      { path: "/applications", element: <MyApplications /> },
      { path: "/community", element: <CommunityFeed /> },
      
      { path: "/jobs/:id", element: <JobDetail /> },
      { path: "/news-detail/:id", element: <NewsDetail /> },

      {
        path: '/register-company', 
        element: <CompanyRegister /> 
      },
    ]
  },

  // Fallback for unknown routes
  {
    path: "*",
    element: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <h1 style={{ fontSize: '72px', margin: '0', color: '#1e293b' }}>404</h1>
        <p style={{ fontSize: '24px', color: '#64748b', marginTop: '16px' }}>Oops! Page not found.</p>
        <a href="/" style={{ marginTop: '24px', padding: '12px 24px', background: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' }}>Go back Home</a>
      </div>
    )
  }
]);

export default function App() {
  return (
    //<SocketProvider>
    <RouterProvider router={router} />
    //</SocketProvider>
  );
}