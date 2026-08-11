import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Clock } from 'lucide-react';

// Offer period: From 15 August midnight for 30 days (Ends September 14, 2026, 23:59:59 IST)
const OFFER_END_TIMESTAMP = new Date('2026-09-14T23:59:59+05:30').getTime();

const LaunchOfferFloatingWidget = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 30,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

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

  const handleClick = () => {
    const el = document.getElementById('pricing-plans');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <style>{`
        @keyframes firecrackerPulseRight {
          0% {
            transform: scale(1);
            box-shadow: 0 0 15px rgba(245, 158, 11, 0.8), 0 0 30px rgba(239, 68, 68, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.4);
          }
          25% {
            transform: scale(1.04);
            box-shadow: 0 0 25px rgba(245, 158, 11, 0.95), 0 0 45px rgba(236, 72, 153, 0.85), inset 0 0 15px rgba(255, 255, 255, 0.6);
          }
          50% {
            transform: scale(0.98);
            box-shadow: 0 0 20px rgba(124, 58, 237, 0.85), 0 0 40px rgba(245, 158, 11, 0.75), inset 0 0 12px rgba(255, 255, 255, 0.5);
          }
          75% {
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.95), 0 0 50px rgba(245, 158, 11, 0.9), inset 0 0 18px rgba(255, 255, 255, 0.7);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 15px rgba(245, 158, 11, 0.8), 0 0 30px rgba(239, 68, 68, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.4);
          }
        }

        @keyframes sparkParticleRight1 {
          0%, 100% { transform: translate(0, 0) scale(0.4); opacity: 0; }
          50% { transform: translate(-15px, -18px) scale(1.3); opacity: 1; }
        }
        @keyframes sparkParticleRight2 {
          0%, 100% { transform: translate(0, 0) scale(0.4); opacity: 0; }
          50% { transform: translate(16px, -15px) scale(1.4); opacity: 1; }
        }
        @keyframes sparkParticleRight3 {
          0%, 100% { transform: translate(0, 0) scale(0.4); opacity: 0; }
          50% { transform: translate(-14px, 16px) scale(1.2); opacity: 1; }
        }
        @keyframes sparkParticleRight4 {
          0%, 100% { transform: translate(0, 0) scale(0.4); opacity: 0; }
          50% { transform: translate(18px, 14px) scale(1.3); opacity: 1; }
        }

        .floating-widget-wrapper {
          position: fixed;
          right: 20px;
          top: 45%;
          transform: translateY(-50%);
          z-index: 10000;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.45rem;
          user-select: none;
        }

        .sticky-right-offer-widget {
          background: linear-gradient(135deg, #ea580c 0%, #ca8a04 45%, #15803d 100%);
          border: 2.5px solid #ffffff;
          border-radius: 1rem;
          padding: 0.65rem 1.1rem;
          color: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          animation: firecrackerPulseRight 1.8s infinite ease-in-out;
          transition: all 0.25s ease;
          box-shadow: 0 10px 30px rgba(202, 138, 4, 0.45);
        }

        .sticky-right-offer-widget:hover {
          transform: scale(1.06) !important;
        }

        .sticky-right-timer-pill {
          background: #ffffff;
          border: 1.5px solid #EAB308;
          border-radius: 0.75rem;
          padding: 0.4rem 0.85rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
          transition: all 0.2s ease;
          width: 100%;
        }

        .sticky-right-timer-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(234, 179, 8, 0.25);
          border-color: #CA8A04;
        }

        .spark-dot {
          position: absolute;
          font-size: 0.9rem;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .floating-widget-wrapper {
            right: 12px;
            top: auto;
            bottom: 25px;
            transform: none;
          }
          .sticky-right-offer-widget {
            padding: 0.5rem 0.85rem;
            animation: none;
            box-shadow: 0 6px 20px rgba(202, 138, 4, 0.5);
          }
        }
      `}</style>

      <div className="floating-widget-wrapper">
        {/* Main Offer Badge */}
        <div
          className="sticky-right-offer-widget"
          onClick={handleClick}
          title="Click to view 100% Free ₹0 Independence Day Offer!"
        >
          {/* Firecracker burst animation particles */}
          <span className="spark-dot" style={{ left: '-8px', top: '-10px', animation: 'sparkParticleRight1 1.4s infinite ease-in-out' }}>🇮🇳</span>
          <span className="spark-dot" style={{ right: '-8px', top: '-12px', animation: 'sparkParticleRight2 1.4s infinite 0.35s ease-in-out' }}>✨</span>
          <span className="spark-dot" style={{ left: '-10px', bottom: '-10px', animation: 'sparkParticleRight3 1.4s infinite 0.7s ease-in-out' }}>🎆</span>
          <span className="spark-dot" style={{ right: '-8px', bottom: '-8px', animation: 'sparkParticleRight4 1.4s infinite 1.05s ease-in-out' }}>🔥</span>

          <Flame size={20} color="#fef08a" style={{ animation: 'bounce 0.8s infinite alternate', flexShrink: 0 }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fef08a', lineHeight: 1 }}>
              🇮🇳 SPECIAL OFFER (30 DAYS)
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 950, color: '#ffffff', marginTop: '0.2rem', lineHeight: 1.1 }}>
              All Plans <span style={{ color: '#fde047', textDecoration: 'underline' }}>100% Free (₹0)</span>
            </span>
          </div>

          <Sparkles size={18} color="#fde047" style={{ flexShrink: 0 }} />
        </div>

        {/* Offer Ending Soon Countdown Card Just Below */}
        <div 
          className="sticky-right-timer-pill"
          onClick={handleClick}
          title="Click to view all ₹0 Free Plans"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#dc2626', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Clock size={11} color="#dc2626" />
            <span>Offer Ending In:</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'monospace', fontWeight: 950, fontSize: '0.8rem', color: '#1F1A1D' }}>
            <span style={{ color: '#713F12' }}>{timeLeft.days}d</span>
            <span style={{ color: '#CA8A04' }}>:</span>
            <span style={{ color: '#713F12' }}>{String(timeLeft.hours).padStart(2, '0')}h</span>
            <span style={{ color: '#CA8A04' }}>:</span>
            <span style={{ color: '#713F12' }}>{String(timeLeft.minutes).padStart(2, '0')}m</span>
            <span style={{ color: '#CA8A04' }}>:</span>
            <span style={{ color: '#dc2626' }}>{String(timeLeft.seconds).padStart(2, '0')}s</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default LaunchOfferFloatingWidget;
