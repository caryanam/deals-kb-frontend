import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Gavel, ShoppingBag, ShieldCheck } from 'lucide-react';
import LandingNavbar from './LandingNavbar';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleScrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="landing-hero-wrapper">
      
      {/* Integrated transparent Navbar */}
      <LandingNavbar />

      {/* Main Hero content container */}
      <div className="hero-container">
        
        {/* Left side: Text, CTAs, Stats */}
        <div className="hero-left">
          <div className="hero-eyebrow">WELCOME TO DEALSKB</div>
          
          <h1 className="hero-title">
            Bid More.<br />
            <span className="highlight">Win More.</span><br />
            Own More.
          </h1>
          
          <p className="hero-subtitle">
            India’s trusted online auction marketplace for Cars, Bikes, Mobiles & Laptops. Join now and get the best deals at unbeatable prices.
          </p>

          <div className="hero-actions">
            <button className="hero-primary-btn" onClick={() => navigate('/buyer/marketplace')}>
              Explore Auctions
            </button>
            <button className="hero-secondary-btn" onClick={handleScrollToHowItWorks}>
              How It Works
            </button>
          </div>

          {/* Stats Row */}
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="stat-icon">
                <Users size={16} />
              </div>
              <div className="stat-content">
                <div className="stat-value">10K+</div>
                <div className="stat-label">Happy Users</div>
              </div>
            </div>

            <div className="hero-stat">
              <div className="stat-icon">
                <Gavel size={16} />
              </div>
              <div className="stat-content">
                <div className="stat-value">25K+</div>
                <div className="stat-label">Live Auctions</div>
              </div>
            </div>

            <div className="hero-stat">
              <div className="stat-icon">
                <ShoppingBag size={16} />
              </div>
              <div className="stat-content">
                <div className="stat-value">5K+</div>
                <div className="stat-label">Products Sold</div>
              </div>
            </div>

            <div className="hero-stat">
              <div className="stat-icon">
                <ShieldCheck size={16} />
              </div>
              <div className="stat-content">
                <div className="stat-value">100%</div>
                <div className="stat-label">Secure & Safe</div>
              </div>
            </div>
          </div>
        </div>



      </div>

    </section>
  );
};

export default HeroSection;
