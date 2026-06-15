import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import MainLayout from './components/layout/MainLayout';
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
import CompanyDashboard from './pages/DashBoard/CompanyDashboard/CompanyDashboard';
import AppliedCandidates from './pages/AppliedCandidates/AppliedCandidates';
import SavedCandidates from './pages/SavedCandidates/SavedCandidates';

import './App.css';

function Home() {
  const [activeTab, setActiveTab] = useState('candidate');

  return (
    <div className="app-wrapper">
<<<<<<< HEAD
=======

>>>>>>> main
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
<<<<<<< HEAD
=======


>>>>>>> main
      {
        path: "/company",
        element: <CompanyDashboard />,
        children: [
          { path: "profile", element: <CompanyProfile /> },
          { path: "post-job", element: <JobPosting /> },
<<<<<<< HEAD
          { path: "applicants", element: <AppliedCandidates /> },
          { path: "saved-candidates", element: <SavedCandidates /> },
=======
>>>>>>> main
        ]
      },
      {
        path: "/admin",
        element: (
          <ProtectedRoute requiredRole="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      { path: "/search-jobs", element: <SearchJobs /> },
      { path: "/job/:id", element: <JobDetail /> },
    ]
  },

<<<<<<< HEAD
=======
  { path: "/search-jobs", element: <SearchJobs /> },
>>>>>>> main
  { path: "*", element: <div>404 - Trang không tồn tại</div> }
]);

export default function App() {
  return (
<<<<<<< HEAD
    <RouterProvider router={router} />
=======
    //<SocketProvider>
    <RouterProvider router={router} />
    //</SocketProvider>
>>>>>>> main
  );
}
