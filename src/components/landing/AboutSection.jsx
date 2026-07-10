import React from 'react';
import { ShieldCheck, Zap, Heart, Sparkles, RefreshCcw, Landmark } from 'lucide-react';

const PURPLE = '#6B1B71';
const CREAM = '#FAF6EA';
const GOLD = '#B2772D';
const BORDER = '#D8CFC1';

const features = [
  {
    icon: ShieldCheck,
    color: '#d1fae5',
    iconColor: '#059669',
    title: '100% Verified Listings',
    desc: 'Admins verify vehicle RC, gadget barcodes, and invoice copies manually before approval. Zero spam, zero fake ads.'
  },
  {
    icon: Zap,
    color: '#F5ECDD',
    iconColor: '#6B1B71',
    title: 'Instant Sockets Sync',
    desc: 'WebSocket integration pushes every single price, timestamp, and winner to active users within milliseconds.'
  },
  {
    icon: Sparkles,
    color: '#faf5ff',
    iconColor: '#7c3aed',
    title: 'Modern Bidding Passes',
    desc: 'Unlock unlimited bids for 24 hours at minimal costs. Prices on cars, mobile phones, laptops, and bikes.'
  },
  {
    icon: Heart,
    color: '#fff1f2',
    iconColor: '#db2777',
    title: 'Seamless Direct Chat',
    desc: 'No middleman fees. Chat directly with the winning buyer or listing owner to coordinate transaction closing.'
  },
  {
    icon: RefreshCcw,
    color: '#fffbeb',
    iconColor: '#d97706',
    title: 'Fair Clock Extensions',
    desc: 'Last-minute bids automatically extend the countdown to block snipe bots and ensure fair competition.'
  },
  {
    icon: Landmark,
    color: '#f0fdfa',
    iconColor: '#0d9488',
    title: 'Secure Payments',
    desc: 'Protected Cashfree payment infrastructure keeps user information and order transactions secure and transparent.'
  }
];

const AboutSection = () => {
  return (
    <section
      id="about-us"
      className="landing-section"
      style={{
        backgroundColor: CREAM,
        padding: '80px 24px',
      }}
    >
      <div className="landing-container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <span
            style={{
              display: 'inline-block',
              backgroundColor: PURPLE,
              color: '#fff',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              padding: '6px 18px',
              borderRadius: '20px',
              marginBottom: '18px',
            }}
          >
            About Us &amp; Why Choose Us
          </span>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: '800',
              color: '#1a1a1a',
              margin: '0 0 12px',
              lineHeight: '1.2',
            }}
          >
            About <span style={{ color: PURPLE }}>DealsKB</span>
          </h2>
          <p
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: GOLD,
              margin: '0 0 16px',
            }}
          >
            India's Trusted Online Bidding Platform
          </p>
          <p
            style={{
              fontSize: '16px',
              color: '#555',
              maxWidth: '720px',
              margin: '0 auto',
              lineHeight: '1.75',
            }}
          >
            DealsKB is an online marketplace for Cars, Bikes, Mobiles, and Laptops built to make buy-sell simple, transparent, and secure. We connect buyers and verified sellers in real-time, rapid-fire selling rooms where every offer counts.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="landing-why-grid">
          {features.map((card, idx) => {
            const IconComp = card.icon;
            return (
              <div key={idx} className="landing-why-card">
                <div 
                  className="landing-why-icon-container"
                  style={{ backgroundColor: card.color, color: card.iconColor }}
                >
                  <IconComp size={24} />
                </div>
                <h3 className="landing-why-title">{card.title}</h3>
                <p className="landing-why-desc">{card.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default AboutSection;
