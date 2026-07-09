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
    <section id="home" className="landing-hero-wrapper">
      <LandingNavbar />

      <div className="hero-section">
        <video autoPlay loop muted playsInline className="hero-bg-video">
          <source src={landingVideo} type="video/mp4" />
        </video>

        <div className="hero-container">
          <div className="hero-left">
            <div className="hero-kicker">एक नवीन पहाट | एक नई शुरुआत</div>
            
            <div className="hero-main-content">
              <h1 className="hero-title hero-title-desktop">
                Bid More.<br />
                <span className="highlight">Win More.</span><br />
                Own More.
              </h1>
              
              <h1 className="hero-title hero-title-mobile">
                Bid More . <span className="highlight">Win More</span> . Own More
              </h1>
              
              <p className="hero-description">
                DealsKB is built on {" "}
                <span className="highlight-kb">Khareedo Becho</span>{" "}
                a trusted auction platform where sellers list with confidence and buyers win the best deals on Cars, Bikes, Mobiles & Laptops.
              </p>
              
              <div className="hero-actions hero-actions-desktop">
                <button className="hero-primary-btn hero-btn" onClick={() => navigate('/buyer/marketplace')}>
                  Explore
                </button>
                <button className="hero-secondary-btn hero-btn" onClick={handleScrollToHowItWorks}>
                  How It Works
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-actions-mobile">
        <button className="hero-primary-btn hero-btn" onClick={() => navigate('/buyer/marketplace')}>
          Explore
        </button>
        <button className="hero-secondary-btn hero-btn" onClick={handleScrollToHowItWorks}>
          How It Works
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
