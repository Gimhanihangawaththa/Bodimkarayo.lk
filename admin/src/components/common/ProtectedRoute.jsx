import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const ProtectedRoute = () => {
  const { admin } = useAdminAuth();

  // If not logged in, redirect to login page
  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the child routes (AdminLayout and its children)
  return <Outlet />;
};

export default ProtectedRoute;
