import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from './NavBar';

export default function MainLayout() {
  const location = useLocation();
  return (
    <div>
      <NavBar />
      <main>
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}