import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Home, Car } from 'lucide-react';
import Footer from '../components/common/Footer';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FAF6EA', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Navbar Strip */}
      <div style={{ background: '#090d16', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <Car size={22} style={{ color: '#6B1B71' }} />
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#fff' }}>
            Deals<span style={{ color: '#6B1B71' }}>KB</span>
          </span>
        </Link>
      </div>

      {/* Main 404 Box */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          border: '1px solid #D8CFC1',
          borderRadius: '1.25rem',
          padding: '3rem 2rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
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
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1F1A1D', fontFamily: "'Outfit', sans-serif", margin: 0 }}>404 - Page Not Found</h1>
            <p style={{ color: '#8B8278', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
              The page you are looking for does not exist or has been moved to a different URL.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
            <button 
              onClick={() => navigate(-1)} 
              className="btn btn-secondary"
              style={{ flex: 1, backgroundColor: '#FAF6EA', color: '#1F1A1D', borderColor: '#D8CFC1' }}
            >
              Go Back
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="btn btn-primary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', backgroundColor: '#6B1B71' }}
            >
              <Home size={16} /> Home
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default NotFoundPage;
