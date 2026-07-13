import React from 'react';
import { Link } from 'react-router-dom';
import BiddingPlansSection from '../../components/landing/BiddingPlansSection';
import Footer from '../../components/common/Footer';
import logoImg from '../../assets/logo.png';
import '../../styles/landing.css';

const ResourceNavbar = () => (
  <nav style={{
    background: '#090d16',
    padding: '0 2rem',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  }}>
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
      <img src={logoImg} alt="DealsKB Logo" style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
      <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#fff' }}>
        Deals<span style={{ color: '#c084fc' }}>KB</span>
      </span>
    </Link>
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <Link to="/" style={{ color: '#8B8278', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
        onMouseEnter={e => e.target.style.color = '#fff'}
        onMouseLeave={e => e.target.style.color = '#8B8278'}>
        ← Back to Home
      </Link>
      <Link to="/faqs" style={{ color: '#8B8278', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
        onMouseEnter={e => e.target.style.color = '#fff'}
        onMouseLeave={e => e.target.style.color = '#8B8278'}>
        FAQs
      </Link>
      <Link to="/buyer-guide" style={{ color: '#8B8278', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
        onMouseEnter={e => e.target.style.color = '#fff'}
        onMouseLeave={e => e.target.style.color = '#8B8278'}>
        Buyer Guide
      </Link>
      <Link to="/seller-guide" style={{ color: '#8B8278', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
        onMouseEnter={e => e.target.style.color = '#fff'}
        onMouseLeave={e => e.target.style.color = '#8B8278'}>
        Seller Guide
      </Link>
    </div>
  </nav>
);

const BiddingPlansPage = () => (
  <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
    <ResourceNavbar />
    <BiddingPlansSection />
    <Footer />
  </div>
);

export default BiddingPlansPage;
