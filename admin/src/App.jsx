import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import Users from './pages/Users/Users';
import Properties from './pages/Properties/Properties';
import Settings from './pages/Settings/Settings';
import Login from './pages/Login/Login';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="properties" element={<Properties />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
