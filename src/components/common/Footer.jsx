import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import '../../styles/footer.css';
import logoImg from '../../assets/logo.png';

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

const FooterPolicyLink = ({ to, children }) => {
  return (
    <Link to={to}>
      {children}
    </Link>
  );
};

const Footer = ({ logoutOnNavigate = false }) => {
  return (
    <footer className="deals-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo-row" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <img src={logoImg} alt="DealsKB Logo" style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
              <span className="footer-logo-text" style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.25rem', fontFamily: "'Outfit', sans-serif" }}>
                Deals<span style={{ color: '#c084fc' }}>KB</span>
              </span>
            </Link>
            <p className="footer-tagline">Discover More.
Choose More.
Own More.</p>
            <p className="footer-description">
              DealsKB is a subscription-based product listing and product discovery marketplace for genuine Cars, Bikes, Mobiles, and Laptops transactions.
            </p>
          </div>

          <div className="footer-column">
            <h4>Quick Links</h4>
            <HashLink to="/#home">Home</HashLink>
            <HashLink to="/#marketplace">Marketplace</HashLink>
            <HashLink to="/#how-it-works">How It Works</HashLink>
            <HashLink to="/#about-us">About Us</HashLink>
          </div>

          <div className="footer-column">
            <h4>Resources</h4>
            <FooterPolicyLink to="/faqs" logoutOnNavigate={logoutOnNavigate}>FAQs</FooterPolicyLink>
            <FooterPolicyLink to="/bidding-plans" logoutOnNavigate={logoutOnNavigate}>Subscription Plans</FooterPolicyLink>
            <FooterPolicyLink to="/buyer-guide" logoutOnNavigate={logoutOnNavigate}>Buyer Guide</FooterPolicyLink>
            <FooterPolicyLink to="/seller-guide" logoutOnNavigate={logoutOnNavigate}>Seller Guide</FooterPolicyLink>
            <FooterPolicyLink to="/delete-account" logoutOnNavigate={logoutOnNavigate}>Delete My Account</FooterPolicyLink>
          </div>

          <div className="footer-column">
            <h4>Policies</h4>
            <FooterPolicyLink to="/privacy-policy" logoutOnNavigate={logoutOnNavigate}>Privacy Policy</FooterPolicyLink>
            <FooterPolicyLink to="/terms-and-conditions" logoutOnNavigate={logoutOnNavigate}>Terms &amp; Conditions</FooterPolicyLink>
            <FooterPolicyLink to="/refund-policy" logoutOnNavigate={logoutOnNavigate}>Refund / Cancellation Policy</FooterPolicyLink>
            <FooterPolicyLink to="/emd-policy" logoutOnNavigate={logoutOnNavigate}>EMD Policy</FooterPolicyLink>
            <FooterPolicyLink to="/delivery-service-policy" logoutOnNavigate={logoutOnNavigate}>Delivery Service Policy</FooterPolicyLink>
          </div>

          <div className="footer-contact">
            <h4>Contact Us</h4>
            <p>
              <Phone size={15} />
              <span>+91 99232 24600</span>
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

        <div className="footer-divider" />

        <div className="footer-bottom">
          <div className="footer-developed">
            Developed by <span>Caryanamindia Pvt Ltd</span>
          </div>

          <div className="footer-copy">
            &copy; 2026 DealsKB. All rights reserved by Caryanamindia Pvt Ltd
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
