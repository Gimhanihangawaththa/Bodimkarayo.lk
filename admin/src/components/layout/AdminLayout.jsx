import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area - margin left to offset fixed sidebar */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <TopNavbar />
        
        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
