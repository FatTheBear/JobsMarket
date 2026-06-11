import React from 'react';
import { Outlet } from 'react-router-dom';
import CompanySidebar from "../../../components/Layout/CompanySidebar";


export default function CompanyDashboard() {
  return (
    <div className="company-dashboard-wrapper">
     
      
      <div style={{ display: 'flex', minHeight: '100vh' }}>
      
        <div style={{ width: '250px' }}>
          <CompanySidebar />
        </div>

       
        <div style={{ flex: 1, padding: '20px', backgroundColor: '#f5f7fa' }}>
          <Outlet /> 
        </div>
      </div>
    </div>
  );
}