import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '12px' }}>
        <Loader2 className="pulsing-glow" size={40} color="var(--primary)" />
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Verifying credentials...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save current location to return to it later
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    // Redirect to home if user is not admin
    return <Navigate to="/" replace />;
  }

  return children;
}
