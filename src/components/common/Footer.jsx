import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Phone, Mail, MapPin, Car } from 'lucide-react';
import '../../styles/footer.css';

import logoImg from '../../assets/logo.png';

// HashLink helper for smooth section scrolling
const HashLink = ({ to, children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e) => {
    e.preventDefault();
    const hash = to.includes('#') ? to.split('#')[1] : 'home';

    if (location.pathname === '/') {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      navigate('/#' + hash);
    }
  };

  return (
    <a href={to} onClick={handleClick}>
      {children}
    </a>
  );
};

const Footer = () => {
  return (
    <footer className="deals-footer">
      <div className="footer-container">

        {/* ── Top 4 Columns ─────────────────────────────── */}
        <div className="footer-top">

          {/* Column 1: Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo-row" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <img src={logoImg} alt="DealsKB Logo" style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
              <span className="footer-logo-text" style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.25rem', fontFamily: "'Outfit', sans-serif" }}>
                Deals<span style={{ color: '#c084fc' }}>KB</span>
              </span>
            </Link>
            <p className="footer-tagline">BID IT. WIN IT. OWN IT.</p>
            <p className="footer-description">
              DealsKB is built on Khareedo Becho, a trusted auction platform where sellers list with confidence and buyers win the best deals on Cars, Bikes, Mobiles & Laptops.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-column">
            <h4>Quick Links</h4>
            <HashLink to="/#home">Home</HashLink>
            <HashLink to="/#marketplace">Marketplace</HashLink>
            <HashLink to="/#how-it-works">How It Works</HashLink>
            <HashLink to="/#about-us">About Us</HashLink>
          </div>

          {/* Column 3: Resources */}
          <div className="footer-column">
            <h4>Resources</h4>
            <Link to="/faqs">FAQs</Link>
            <Link to="/bidding-plans">Bidding Plans</Link>
            <Link to="/buyer-guide">Buyer Guide</Link>
            <Link to="/seller-guide">Seller Guide</Link>
          </div>

          {/* Column 4: Contact Us */}
          <div className="footer-contact">
            <h4>Contact Us</h4>
            <p>
              <Phone size={15} />
              <span>+91 98765 43210</span>
            </p>
            <p>
              <Mail size={15} />
              <span>support@dealskb.com</span>
            </p>
            <p>
              <MapPin size={15} />
              <span>Pune, Maharashtra, India</span>
            </p>
          </div>

        </div>

        {/* ── Divider Line ────────────────────────────── */}
        <div className="footer-divider" />

        {/* ── Bottom Row (3 Columns) ───────────────────── */}
        <div className="footer-bottom">
          <div className="footer-developed">
            Developed by <span>Caryanamindia Pvt Ltd</span>
          </div>

          <div className="footer-copy">
            &copy; 2026 DealsKB. All rights reserved by Caryanamindia Pvt Ltd
          </div>

          <div className="footer-legal">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
            <Link to="/refund-policy">Refund Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
