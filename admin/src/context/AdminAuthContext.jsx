import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          // You might want to create a /api/auth/me endpoint in the future to verify token
          // For now, if we have a token, we assume they are logged in.
          // Realistically, the first API call will fail if the token is invalid
          // and the interceptor will log them out.
          const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
          setAdmin(adminData);
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for unauthorized events from api interceptor
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      // Ensure the user actually has the ADMIN role
      const role = response.data.user.role; 
      
      if (role !== 'ADMIN') {
        throw new Error('Access denied. Admin privileges required.');
      }

      const { token, user } = response.data;
      
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminData', JSON.stringify(user));
      
      setAdmin(user);
      navigate('/');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setAdmin(null);
    navigate('/login');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
