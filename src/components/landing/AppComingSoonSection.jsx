import React from 'react';
import { Smartphone, Check, Grid, Apple } from 'lucide-react';
import carImg from '../../assets/car.png';
import logoImg from '../../assets/logo.png';

const PURPLE = '#6B1B71';
const PURPLE_LIGHT = '#965284';
const PURPLE_HOVER = '#7A2181';
const DARK = '#1F1A1D';
const GOLD = '#B2772D';
const BG_COLOR = '#FAF6EA';
const BORDER_COLOR = '#D8CFC1';

const features = [
  'Real-time sell tracking & live buy updates',
  'Explore verified cars, bikes, mobiles & laptops',
  'One-tap buying pass activation',
  'Push notifications  alerts',
];

const AppComingSoonSection = () => {
  return (
    <section
      style={{
        backgroundColor: BG_COLOR,
        padding: '90px 24px',
        borderTop: `1px solid ${BORDER_COLOR}`,
        borderBottom: `1px solid ${BORDER_COLOR}`,
        fontFamily: "'Inter', 'Poppins', sans-serif",
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '56px',
        }}
      >
        {/* Left Side: Phone Mockup (Exact Vahan Finserv style card) */}
        <div
          style={{
            flex: '1 1 340px',
            maxWidth: '440px',
            display: 'flex',
            justifyContent: 'center',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              width: '280px',
              height: '520px',
              backgroundColor: '#FAF6EA',
              borderRadius: '40px',
              border: '10px solid #1F1A1D',
              boxShadow: '0 25px 50px -12px rgba(107, 27, 113, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top Notch */}
            <div
              style={{
                position: 'absolute',
                top: '0',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '88px',
                height: '18px',
                backgroundColor: '#1F1A1D',
                borderRadius: '0 0 12px 12px',
                zIndex: 20,
              }}
            />

            {/* Screen Inner Display */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                height: '54px',
                backgroundColor: '#6B1B71',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 14px 0 14px',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 900,
                zIndex: 15
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <img src={logoImg} alt="Logo" style={{ height: '20px', width: 'auto', objectFit: 'contain' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                    Deals<span style={{ color: '#c084fc' }}>KB</span>
                  </span>
                </div>
                <span style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.55rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase'
                }}>Live Bids</span>
              </div>

              {/* Scrollable Mobile Body */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                paddingTop: '0.5rem',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}>
                {/* Hide scrollbars style */}
                <style>{`
                  .scrollable-body::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>

                {/* Search Bar Dummy */}
                <div style={{ padding: '0 10px' }}>
                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #D8CFC1',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    fontSize: '0.65rem',
                    color: '#8B8278',
                    textAlign: 'left',
                    fontWeight: 600
                  }}>
                    🔍 Search cars, bikes, gadgets...
                  </div>
                </div>

                {/* Category Pills Row */}
                <div style={{
                  display: 'flex',
                  gap: '0.4rem',
                  padding: '0 10px',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap'
                }} className="scrollable-body">
                  {['🚗 Cars', '🏍️ Bikes', '📱 Mobiles', '💻 Laptops'].map((cat, i) => (
                    <span key={i} style={{
                      backgroundColor: i === 0 ? '#6B1B71' : '#ffffff',
                      color: i === 0 ? '#ffffff' : '#1F1A1D',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      border: '1px solid #D8CFC1',
                      display: 'inline-block'
                    }}>
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Active pass widget */}
                <div style={{
                  margin: '0 10px',
                  padding: '8px 10px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1.5px solid #D8CFC1',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}>
                  <span style={{ fontSize: '0.55rem', color: '#B2772D', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    Active Bidding Pass
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: '#1F1A1D', fontWeight: 800 }}>🚗 Car Pass active</span>
                    <span style={{ fontSize: '0.6rem', color: '#166534', fontWeight: 800 }}>18 Hours left</span>
                  </div>
                </div>

                {/* Live Card 1 */}
                <div style={{
                  margin: '0 10px 6px 10px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #D8CFC1',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.02)'
                }}>
                  <div style={{
                    height: '92px',
                    backgroundColor: '#f1f5f9',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={carImg} 
                      alt="Car" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <span style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.5rem',
                      fontWeight: 800
                    }}>
                      LIVE
                    </span>
                    <span style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      ❤️
                    </span>
                  </div>
                  <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <h5 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: '#1F1A1D' }}>Honda Civic ZX 2021</h5>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: '#8B8278', fontWeight: 700 }}>
                      <span>PUNE, MH</span>
                      <span>TODAY</span>
                    </div>
                    <button style={{
                      width: '100%',
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '4px 0',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      marginTop: '4px',
                      cursor: 'pointer'
                    }}>
                      Bid Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Navigation Bar */}
              <div style={{
                height: '46px',
                backgroundColor: '#ffffff',
                borderTop: '1.5px solid #D8CFC1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                color: '#8B8278',
                fontSize: '0.55rem',
                fontWeight: 850,
                zIndex: 10,
                paddingBottom: '4px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#6B1B71', gap: '2px' }}>
                  <span style={{ fontSize: '1rem' }}>🏠</span>
                  <span>Home</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '1rem' }}>⚡</span>
                  <span>My Bids</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '1rem' }}>💬</span>
                  <span>Chat</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '1rem' }}>👤</span>
                  <span>Profile</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Content & Features */}
        <div style={{ flex: '1 1 500px', maxWidth: '620px' }}>
          {/* Main Heading */}
          <h2
            style={{
              fontSize: 'clamp(32px, 4.5vw, 48px)',
              fontWeight: '800',
              color: DARK,
              margin: '0 0 20px',
              fontFamily: "'Inter', 'Poppins', sans-serif",
              lineHeight: '1.15',
            }}
          >
            Manage Your Sell <br />
            <span
              style={{
                background: `linear-gradient(135deg, ${PURPLE} 0%, ${GOLD} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Anytime, Anywhere
            </span>
          </h2>

          {/* Description Paragraph */}
          <p
            style={{
              fontSize: '17px',
              color: '#475569',
              lineHeight: '1.75',
              margin: '0 0 32px',
              maxWidth: '580px',
            }}
          >
            Download our mobile app and stay updated on your live sell status, place instant buy on cars, bikes, mobiles &amp; laptops, and manage all your buying passes directly from your smartphone.
          </p>

          {/* Checkmark Features */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '40px',
            }}
          >
            {features.map((feat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(107, 27, 113, 0.1)',
                    color: PURPLE,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Check size={17} strokeWidth={3} />
                </div>
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1e293b',
                  }}
                >
                  {feat}
                </span>
              </div>
            ))}
          </div>

          {/* Store Download Buttons */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <a
              href="https://expo.dev/accounts/shubham1702/projects/dealskb/builds/6f402f84-8e82-4190-b4cb-25572a728421"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: DARK,
                color: '#ffffff',
                padding: '13px 26px',
                borderRadius: '30px',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(31, 26, 29, 0.25)',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.backgroundColor = '#2d262b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.backgroundColor = DARK;
              }}
            >
              <Smartphone size={19} />
              <span>Play Store</span>
            </a>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: `linear-gradient(135deg, ${PURPLE} 0%, ${PURPLE_HOVER} 100%)`,
                color: '#ffffff',
                padding: '13px 26px',
                borderRadius: '30px',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(107, 27, 113, 0.35)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Apple size={19} />
              <span>App Store</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppComingSoonSection;
