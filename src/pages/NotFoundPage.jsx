import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0b0f19',
      color: '#ffffff',
      padding: '2rem',
      textAlign: 'center',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div style={{
        maxWidth: '500px',
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '1.25rem',
        padding: '3rem 2rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AlertCircle size={36} />
        </div>

        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Outfit', sans-serif" }}>404 - Not Found</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
            The page you are looking for does not exist or has been moved to a different url.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-secondary"
            style={{ flex: 1, backgroundColor: 'transparent', color: '#ffffff', borderColor: '#475569' }}
          >
            Go Back
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-primary"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
          >
            <Home size={16} /> Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
