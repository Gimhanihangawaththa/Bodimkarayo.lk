import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const ProtectedRoute = () => {
  const { admin, loading } = useAdminAuth();

  // Show dark spinner while session verification is in flight
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold">Verifying admin session...</span>
        </div>
      </div>
    );
  }

  // If not logged in or role is not ADMIN, redirect to login page
  if (!admin || admin.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  // If authenticated as admin, render child routes
  return <Outlet />;
};

export default ProtectedRoute;
