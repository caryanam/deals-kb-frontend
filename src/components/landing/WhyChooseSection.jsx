import React from 'react';
import { ShieldCheck, Zap, Heart, Sparkles, RefreshCcw, Landmark } from 'lucide-react';

const WhyChooseSection = () => {
  const cards = [
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
      desc: 'Protected CCAvenue payment infrastructure keeps user information and order transactions secure and transparent.'
    }
  ];

  return (
    <section id="about-us" className="landing-section" style={{ backgroundColor: '#FAF6EA' }}>
      <div className="landing-container">
        
        {/* Title */}
        <h2 className="landing-section-title">Why Choose DealsKB</h2>
        <p className="landing-section-subtitle">
          Enjoy the most secure, rapid-fire, and transparent customer-to-customer bidding rooms.
        </p>

        {/* Why Grid */}
        <div className="landing-why-grid">
          {cards.map((card, idx) => {
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

export default WhyChooseSection;
