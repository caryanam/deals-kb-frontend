import React from 'react';
import { Smartphone, Check, Grid, Apple } from 'lucide-react';

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
              backgroundColor: '#0c0f19',
              borderRadius: '40px',
              border: '10px solid #1a2030',
              boxShadow: '0 25px 50px -12px rgba(107, 27, 113, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              padding: '24px',
            }}
          >
            {/* Top Notch */}
            <div
              style={{
                position: 'absolute',
                top: '18px',
                width: '80px',
                height: '14px',
                backgroundColor: '#1a2030',
                borderRadius: '10px',
              }}
            />

            {/* Screen Inner Display */}
            <div style={{ textAlign: 'center', zIndex: 2 }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '18px',
                  background: `linear-gradient(135deg, ${PURPLE} 0%, ${PURPLE_LIGHT} 100%)`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                  boxShadow: '0 10px 24px rgba(107, 27, 113, 0.4)',
                }}
              >
                <Grid size={32} color="#ffffff" />
              </div>
              <h4
                style={{
                  color: '#ffffff',
                  fontSize: '20px',
                  fontWeight: '700',
                  margin: '0 0 6px',
                  fontFamily: "'Inter', 'Poppins', sans-serif",
                }}
              >
                Mobile App
              </h4>
              <span
                style={{
                  color: '#8B8278',
                  fontSize: '14px',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                }}
              >
                Coming Soon
              </span>
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
              href="https://github.com/caryanam/DealsKb.apk/releases/download/v1.0.0/dealskb.apk"
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
