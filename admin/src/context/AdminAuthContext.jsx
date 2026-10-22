import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  // Synchronous read prevents flash of unauthenticated state on page refresh
  const [admin, setAdmin] = useState(() => {
    try {
      const token = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminData');
      if (token && adminData) {
        return JSON.parse(adminData);
      }
    } catch (e) {
      return null;
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Validate session with live database on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/auth/me');
        const user = response.data;

        // Verify active status and admin role
        if (user.role !== 'ADMIN' || user.isActive === false) {
          throw new Error('Access denied. Admin privileges required.');
        }

        setAdmin(user);
        localStorage.setItem('adminData', JSON.stringify(user));
        if (user.id) {
          localStorage.setItem('userId', String(user.id));
        }
      } catch (error) {
        console.warn('Session verification failed, logging out:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for unauthorized/forbidden events from api interceptor
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      // Ensure the user actually has the ADMIN role
      const role = response.data.user?.role; 
      
      if (role !== 'ADMIN') {
        throw new Error('Access denied. Admin privileges required.');
      }

      const { token, user } = response.data;
      
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminData', JSON.stringify(user));
      if (user?.id) {
        localStorage.setItem('userId', String(user.id));
      }
      
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
    localStorage.removeItem('userId');
    setAdmin(null);
    navigate('/login');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
