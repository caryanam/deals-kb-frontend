import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Zap, X, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// Offer period: From 15 August midnight for 30 days (Ends September 14, 2026, 23:59:59 IST)
const OFFER_END_TIMESTAMP = new Date('2026-09-14T23:59:59+05:30').getTime();

const TricolorOfferBanner = ({ variant = 'dashboard-bar', showCountdown = true, role = null }) => {
  const { user } = useAuth();
  const [visible, setVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 30,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const effectiveRole = role || user?.role;

  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const difference = OFFER_END_TIMESTAMP - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  // Render role-specific message content
  const renderRoleOfferMessage = () => {
    switch (effectiveRole) {
      case 'Seller':
        return (
          <>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#713F12' }}>
              <strong>Seller Offer:</strong> Unlimited Free Product Listings (<strong>₹0 Listing Fee</strong>)
            </span>
            <span style={{ fontSize: '0.74rem', color: '#15803D', fontWeight: 700 }}>
              (15th Aug – Next 30 Days)
            </span>
          </>
        );
      case 'Buyer':
        return (
          <>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#713F12' }}>
              <strong>Buyer Offer:</strong> Unlimited Direct Bidding on All Live Auctions (<strong>₹0 Pass</strong>)
            </span>
            <span style={{ fontSize: '0.74rem', color: '#15803D', fontWeight: 700 }}>
              (15th Aug – Next 30 Days)
            </span>
          </>
        );
      case 'Dealer':
        return (
          <>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#713F12' }}>
              <strong>Dealer Offer:</strong> 30-Day Unlimited Inventory & Listing Plan (<strong>₹0 Monthly Plan</strong>)
            </span>
            <span style={{ fontSize: '0.74rem', color: '#15803D', fontWeight: 700 }}>
              (15th Aug – Next 30 Days)
            </span>
          </>
        );
      default:
        return (
          <>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#713F12' }}>
              <strong>100% Free Access (₹0 Fee)</strong> for Sellers, Buyers & Dealers
            </span>
            <span style={{ fontSize: '0.74rem', color: '#15803D', fontWeight: 700 }}>
              (15th Aug – Next 30 Days)
            </span>
          </>
        );
    }
  };

  // --- DASHBOARD VARIANT: Small, compact rectangle bar ---
  if (variant === 'dashboard-bar') {
    return (
      <div 
        role="region" 
        aria-label="Independence Day Offer"
        style={{
          width: '100%',
          marginBottom: '1rem',
          backgroundColor: '#FEF9C3',
          border: '1.5px solid #FACC15',
          borderRadius: '0.6rem',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(234, 179, 8, 0.15)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          position: 'relative'
        }}
      >
        {/* Sleek Tricolor Ribbon on top */}
        <div style={{
          height: '3px',
          width: '100%',
          background: 'linear-gradient(90deg, #FF9933 0%, #FF9933 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #138808 66.66%, #138808 100%)'
        }} />

        <div style={{
          padding: '0.45rem 0.9rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.6rem'
        }}>
          {/* Left: Role-Specific Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>🇮🇳</span>
            <span style={{
              backgroundColor: '#1E3A8A',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 900,
              padding: '0.15rem 0.45rem',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Independence Day Offer
            </span>
            {renderRoleOfferMessage()}
          </div>

          {/* Right: Inline Countdown Pill */}
          {showCountdown && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#ffffff',
              border: '1px solid #CA8A04',
              borderRadius: '999px',
              padding: '0.2rem 0.65rem',
              fontSize: '0.74rem',
              fontWeight: 800,
              color: '#854D0E',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <Clock size={12} color="#EA580C" />
              <span>Ends in:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#1F1A1D' }}>
                {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- LANDING OVERLAY / TOP ANNOUNCEMENT BAR VARIANT ---
  return (
    <div 
      role="banner"
      aria-label="Independence Day Offer Announcement"
      style={{
        width: '100%',
        backgroundColor: '#FEF9C3',
        borderBottom: '2px solid #EAB308',
        boxShadow: '0 4px 12px rgba(234, 179, 8, 0.2)',
        position: 'relative',
        zIndex: 9999,
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}
    >
      {/* Top Tricolor Strip */}
      <div style={{
        height: '4px',
        width: '100%',
        background: 'linear-gradient(90deg, #FF9933 0%, #FF9933 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #138808 66.66%, #138808 100%)'
      }} />

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.45rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Banner Content */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1.15rem' }}>🇮🇳</span>
          <span style={{
            backgroundColor: '#1E3A8A',
            color: '#ffffff',
            fontSize: '0.68rem',
            fontWeight: 900,
            padding: '0.15rem 0.5rem',
            borderRadius: '999px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            Independence Special
          </span>
          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#713F12' }}>
            All Listings, Passes & Monthly Plans are <strong>100% Free (₹0)</strong> for the next 30 days!
          </span>
        </div>

        {/* Right Countdown & Close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {showCountdown && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#ffffff',
              border: '1px solid #CA8A04',
              borderRadius: '999px',
              padding: '0.2rem 0.65rem',
              fontSize: '0.74rem',
              fontWeight: 800,
              color: '#854D0E'
            }}>
              <Clock size={12} color="#EA580C" />
              <span>Offer Ends In:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#1F1A1D' }}>
                {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="Dismiss banner"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#854D0E',
              padding: '2px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '4px'
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TricolorOfferBanner;
