import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import GlobalPostModal from '../Notifications/GlobalPostModal';

export default function MainLayout() {
  return (
    <div className="main-layout-wrapper">
      <NavBar />
      <main className="layout-content">
        <Outlet />
      </main>
      <GlobalPostModal />
    </div>
  );
}