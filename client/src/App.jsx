import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import CompanyProfile from './components/CompanyProfile/CompanyProfile';
import Login from './components/Auth/Login';
import AdminDashboard from './components/Admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
  { path: "/", element: <CompanyProfile /> },

  { path: "/login", element: <Login /> },

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