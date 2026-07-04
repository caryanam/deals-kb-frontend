import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Gavel } from 'lucide-react';

const LandingNavbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScrollToSection = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <header className="landing-navbar">
      
      {/* Left side: Logo */}
      <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="landing-logo">
        <div className="logo-icon">
          <Gavel size={18} />
        </div>
        <div className="logo-text-block">
          <h1 className="logo-text-main">
            Deals<span>KB</span>
          </h1>
          <span className="logo-tagline">Bid It. Win It. Own It.</span>
        </div>
      </Link>

      {/* Center: Navigation links */}
      <nav className="nav-links landing-nav-links-desktop">
        <Link to="/" className="nav-link active">Home</Link>
        <button onClick={() => handleScrollToSection('category-section')} className="nav-link">Our Products</button>
        <button onClick={() => handleScrollToSection('how-it-works')} className="nav-link">How It Works</button>
        <button onClick={() => handleScrollToSection('testimonials')} className="nav-link">About Us</button>
        <button onClick={() => handleScrollToSection('testimonials')} className="nav-link">Contact</button>
      </nav>

      {/* Right side: Login / Register CTA */}
      <div className="nav-actions landing-nav-auth-desktop">
        <Link to="/login" className="login-btn">
          Login
        </Link>
        <Link to="/register" className="register-btn">
          Register
        </Link>
      </div>

      {/* Mobile Menu Toggler */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="landing-hamburger-btn"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#ffffff',
          padding: '0.25rem',
          display: 'none'
        }}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '72px',
          left: 0,
          right: 0,
          backgroundColor: '#020817',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          zIndex: 999,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
        }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>Home</Link>
          <button onClick={() => handleScrollToSection('category-section')} style={{ background: 'none', border: 'none', textAlign: 'left', color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', padding: 0 }}>Our Products</button>
          <button onClick={() => handleScrollToSection('how-it-works')} style={{ background: 'none', border: 'none', textAlign: 'left', color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', padding: 0 }}>How It Works</button>
          <button onClick={() => handleScrollToSection('testimonials')} style={{ background: 'none', border: 'none', textAlign: 'left', color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', padding: 0 }}>About Us</button>
          <button onClick={() => handleScrollToSection('testimonials')} style={{ background: 'none', border: 'none', textAlign: 'left', color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', padding: 0 }}>Contact</button>
          
          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0.25rem 0' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              textAlign: 'center',
              padding: '0.65rem',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '0.5rem'
            }}>
              Login
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)} style={{
              backgroundColor: '#ffc400',
              color: '#111827',
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              textAlign: 'center',
              padding: '0.65rem',
              borderRadius: '0.5rem'
            }}>
              Register
            </Link>
          </div>
        </div>
      )}

      {/* Inline media query style for display override */}
      <style>{`
        @media (max-width: 1024px) {
          .landing-nav-links-desktop,
          .landing-nav-auth-desktop {
            display: none !important;
          }
          .landing-hamburger-btn {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};

export default LandingNavbar;
