import React from 'react';
import { Flame, Sparkles } from 'lucide-react';

const LaunchOfferFloatingWidget = () => {
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
            transform: translateY(-50%) scale(1);
            box-shadow: 0 0 15px rgba(245, 158, 11, 0.8), 0 0 30px rgba(239, 68, 68, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.4);
          }
          25% {
            transform: translateY(-50%) scale(1.06);
            box-shadow: 0 0 25px rgba(245, 158, 11, 0.95), 0 0 45px rgba(236, 72, 153, 0.85), inset 0 0 15px rgba(255, 255, 255, 0.6);
          }
          50% {
            transform: translateY(-50%) scale(0.97);
            box-shadow: 0 0 20px rgba(124, 58, 237, 0.85), 0 0 40px rgba(245, 158, 11, 0.75), inset 0 0 12px rgba(255, 255, 255, 0.5);
          }
          75% {
            transform: translateY(-50%) scale(1.07);
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.95), 0 0 50px rgba(245, 158, 11, 0.9), inset 0 0 18px rgba(255, 255, 255, 0.7);
          }
          100% {
            transform: translateY(-50%) scale(1);
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

        .sticky-right-offer-widget {
          position: fixed;
          right: 20px;
          top: 45%;
          transform: translateY(-50%);
          z-index: 10000;
          background: linear-gradient(135deg, #ef4444 0%, #d97706 45%, #7c3aed 100%);
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
          user-select: none;
          box-shadow: 0 10px 30px rgba(239, 68, 68, 0.45);
        }

        .sticky-right-offer-widget:hover {
          right: 24px;
          transform: translateY(-50%) scale(1.1) !important;
        }

        .spark-dot {
          position: absolute;
          font-size: 0.9rem;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .sticky-right-offer-widget {
            right: 12px;
            top: auto;
            bottom: 25px;
            transform: none;
            padding: 0.5rem 0.85rem;
            animation: none;
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
          }
          .sticky-right-offer-widget:hover {
            transform: scale(1.05) !important;
          }
        }
      `}</style>

      <div
        className="sticky-right-offer-widget"
        onClick={handleClick}
        title="Click to view ₹1 Launching Offer!"
      >
        {/* Firecracker burst animation particles */}
        <span className="spark-dot" style={{ left: '-8px', top: '-10px', animation: 'sparkParticleRight1 1.4s infinite ease-in-out' }}>💥</span>
        <span className="spark-dot" style={{ right: '-8px', top: '-12px', animation: 'sparkParticleRight2 1.4s infinite 0.35s ease-in-out' }}>✨</span>
        <span className="spark-dot" style={{ left: '-10px', bottom: '-10px', animation: 'sparkParticleRight3 1.4s infinite 0.7s ease-in-out' }}>🎆</span>
        <span className="spark-dot" style={{ right: '-8px', bottom: '-8px', animation: 'sparkParticleRight4 1.4s infinite 1.05s ease-in-out' }}>🔥</span>

        <Flame size={20} color="#ffedd5" style={{ animation: 'bounce 0.8s infinite alternate', flexShrink: 0 }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ffedd5', lineHeight: 1 }}>
            🔥 LAUNCHING OFFER !!!
          </span>
          <span style={{ fontSize: '0.82rem', fontWeight: 950, color: '#ffffff', marginTop: '0.2rem', lineHeight: 1.1 }}>
            All Plans <span style={{ color: '#fde047', textDecoration: 'underline' }}>₹1 Only</span>
          </span>
        </div>

        <Sparkles size={18} color="#fde047" style={{ flexShrink: 0 }} />
      </div>
    </>
  );
};

export default LaunchOfferFloatingWidget;
