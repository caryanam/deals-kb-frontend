import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, isLoading } = useAuth();

  // 1. While loading local session, show a spinner to prevent accidental redirect
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#1F1A1D',
        color: '#ffffff',
        fontFamily: 'sans-serif'
      }}>
        <div style={{
          border: '4px solid rgba(255, 255, 255, 0.1)',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          borderLeftColor: '#6B1B71',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 2. Unauthenticated -> Redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Unauthorized role -> Redirect to their respective landing dashboard
  if (allowedRoles) {
    const normalizedUserRole = user.role?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());

    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      console.warn(`Role "${user.role}" not authorized for this route. Redirecting...`);
      if (normalizedUserRole === 'buyer') {
        return <Navigate to="/buyer/dashboard" replace />;
      } else if (normalizedUserRole === 'seller') {
        return <Navigate to="/seller/dashboard" replace />;
      } else if (normalizedUserRole === 'dealer') {
        return <Navigate to="/dealer/dashboard" replace />;
      } else if (normalizedUserRole === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  // 4. Authorized -> Render the nested component
  return children;
};

export default ProtectedRoute;
