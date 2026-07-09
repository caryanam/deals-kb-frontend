import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Gavel, ShoppingBag, ShieldCheck } from 'lucide-react';
import LandingNavbar from './LandingNavbar';
import landingVideo from '../../assets/landing_video.mp4';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleScrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="landing-hero-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
        }}
      >
        <source src={landingVideo} type="video/mp4" />
      </video>



      {/* Integrated transparent Navbar */}
      <div style={{ position: 'relative', zIndex: 50 }}>
        <LandingNavbar />
      </div>

      {/* Main Hero content container */}
      <div className="hero-container" style={{ position: 'relative', zIndex: 10 }}>
        
        {/* Left side: Text, CTAs, Stats */}
        <div className="hero-left">
          <div className="hero-kicker">WELCOME TO THE FUTURE OF AUCTIONS</div>
          
          <h1 className="hero-title">
            Bid More.<br />
            <span className="highlight">Win More.</span><br />
            Own More.
          </h1>
          
          <p className="hero-description">
            India’s trusted online auction marketplace for Cars, Bikes, Mobiles & Laptops. Join now and get the best deals at unbeatable prices.
          </p>

          <div className="hero-actions">
            <button className="hero-primary-btn hero-btn" onClick={() => navigate('/buyer/marketplace')}>
              Explore Auctions
            </button>
            <button className="hero-secondary-btn hero-btn" onClick={handleScrollToHowItWorks}>
              How It Works
            </button>
          </div>

          {/* Stats Row */}
          
        </div>



      </div>

    </section>
  );
};

export default HeroSection;
