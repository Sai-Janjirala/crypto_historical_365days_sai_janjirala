import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load profile on startup if token exists
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await authService.getProfile();
          if (res.success && res.data) {
            setUser(res.data);
          } else {
            // Invalid profile response, clear storage
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Failed to load user profile on boot:', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    }

    loadUser();

    // Listen to global unauthorized events from API interceptor
    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem('token');
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (credentials) => {
    setError(null);
    try {
      const res = await authService.login(credentials);
      if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const res = await authService.register(userData);
      if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
      } else {
        throw new Error(res.message || 'Registration failed');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Registration failed';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout request failed on backend, cleaning up client anyway:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await authService.getProfile();
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshProfile,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
