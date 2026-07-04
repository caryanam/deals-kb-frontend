import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Car } from 'lucide-react';
import '../../styles/footer.css';

const Footer = () => {
  const navigate = useNavigate();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryNav = (type) => {
    navigate(`/buyer/marketplace?product_type=${type}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="landing-footer">
      <div className="landing-footer-container">
        
        {/* Main 5-Column Grid */}
        <div className="landing-footer-grid">
          
          {/* Column 1: Brand Info */}
          <div className="landing-footer-col">
            <Link to="/" onClick={handleScrollToTop} className="landing-footer-logo-container">
              <Car size={26} style={{ color: '#2563eb' }} />
              <span className="landing-footer-logo">
                Deals<span>KB</span>
              </span>
            </Link>
            <p className="landing-footer-tagline">Bid It. Win It. Own It.</p>
            <p className="landing-footer-desc">
              DealsKB is India’s trusted online auction marketplace for Cars, Bikes, Mobiles and Laptops. Join our secure bidding rooms and unlock premium assets today.
            </p>
            <div className="landing-footer-socials">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="landing-footer-social-btn" title="Facebook">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="landing-footer-social-btn" title="Twitter">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="landing-footer-social-btn" title="Instagram">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="landing-footer-social-btn" title="LinkedIn">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="landing-footer-col">
            <h4 className="landing-footer-title">Quick Links</h4>
            <ul className="landing-footer-links">
              <li>
                <Link to="/" onClick={handleScrollToTop}>Home</Link>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/')}>About Us</button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/')}>How It Works</button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/')}>Contact Us</button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/')}>FAQs</button>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className="landing-footer-col">
            <h4 className="landing-footer-title">Categories</h4>
            <ul className="landing-footer-links">
              <li>
                <button type="button" onClick={() => handleCategoryNav('car')}>Cars</button>
              </li>
              <li>
                <button type="button" onClick={() => handleCategoryNav('bike')}>Bikes</button>
              </li>
              <li>
                <button type="button" onClick={() => handleCategoryNav('mobile')}>Mobiles</button>
              </li>
              <li>
                <button type="button" onClick={() => handleCategoryNav('laptop')}>Laptops</button>
              </li>
              <li>
                <Link to="/buyer/marketplace" onClick={handleScrollToTop}>All Auctions</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="landing-footer-col">
            <h4 className="landing-footer-title">Support</h4>
            <ul className="landing-footer-links">
              <li>
                <button type="button" onClick={() => navigate('/')}>Help Center</button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/')}>Terms & Conditions</button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/')}>Privacy Policy</button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/')}>Refund Policy</button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/')}>Shipping Policy</button>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact Info */}
          <div className="landing-footer-col">
            <h4 className="landing-footer-title">Contact Us</h4>
            <div className="landing-footer-contact-info">
              <div className="landing-footer-contact-item">
                <Phone size={16} />
                <span>+91 98765 43210</span>
              </div>
              <div className="landing-footer-contact-item">
                <Mail size={16} />
                <span>support@dealskb.com</span>
              </div>
              <div className="landing-footer-contact-item">
                <MapPin size={16} />
                <span>Pune, Maharashtra, India</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Payments */}
        <div className="landing-footer-bottom">
          <p className="landing-footer-copyright">
            &copy; 2026 DealsKB. All Rights Reserved.
          </p>
          <div className="landing-footer-payment">
            <span className="landing-footer-payment-badge">VISA</span>
            <span className="landing-footer-payment-badge">Mastercard</span>
            <span className="landing-footer-payment-badge">UPI</span>
            <span className="landing-footer-payment-badge">RuPay</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
