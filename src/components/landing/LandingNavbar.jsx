import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Gavel } from 'lucide-react';

import logoImg from '../../assets/logo.png';

const LandingNavbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      if (window.location.pathname !== '/') return;

      // Bottom of page check
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
        setActiveSection('about-us');
        return;
      }

      const sections = ['home', 'marketplace', 'how-it-works', 'about-us'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom > 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (window.location.pathname === '/') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      navigate('/#' + id);
    }
  };

  return (
    <header className="landing-navbar">
      
      {/* Left side: Logo */}
      <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="landing-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <img src={logoImg} alt="DealsKB Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
        <div className="logo-text-block">
          <h1 className="logo-text" style={{ color: '#1F1A1D', fontSize: '24px', fontWeight: 800, fontFamily: "'Inter', 'Poppins', sans-serif", margin: 0, display: 'flex', alignItems: 'center', letterSpacing: '-0.5px' }}>
            Deals<span style={{ color: '#6B1B71' }}>KB</span>
          </h1>
          <span className="logo-tagline" style={{ fontSize: '10px', fontWeight: 700, fontFamily: "'Inter', 'Poppins', sans-serif", color: '#8B8278', letterSpacing: '0.2px' }}>Discover More.
Choose More.
Own More.</span>
        </div>
      </Link>

      {/* Center: Navigation links */}
      <nav className="nav-links landing-nav-links-desktop">
        <button onClick={() => handleScrollToSection('home')} className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}>Home</button>
        <button onClick={() => handleScrollToSection('marketplace')} className={`nav-link ${activeSection === 'marketplace' ? 'active' : ''}`}>Our Products</button>
        <button onClick={() => handleScrollToSection('how-it-works')} className={`nav-link ${activeSection === 'how-it-works' ? 'active' : ''}`}>How It Works</button>
        <button onClick={() => handleScrollToSection('about-us')} className={`nav-link ${activeSection === 'about-us' ? 'active' : ''}`}>About Us</button>
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
          color: '#6B1B71',
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
          backgroundColor: '#1F1A1D',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          zIndex: 999,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
        }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>Home</Link>
          <button onClick={() => handleScrollToSection('marketplace')} style={{ background: 'none', border: 'none', textAlign: 'left', color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', padding: 0 }}>Our Products</button>
          <button onClick={() => handleScrollToSection('how-it-works')} style={{ background: 'none', border: 'none', textAlign: 'left', color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', padding: 0 }}>How It Works</button>
          <button onClick={() => handleScrollToSection('about-us')} style={{ background: 'none', border: 'none', textAlign: 'left', color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', padding: 0 }}>About Us</button>
          
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
              backgroundColor: '#6B1B71',
              color: '#ffffff',
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
