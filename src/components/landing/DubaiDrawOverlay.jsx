import React, { useState, useEffect } from 'react';
import { Plane, Trophy, X, ChevronRight, Gift } from 'lucide-react';

export const DubaiDrawOverlay = () => {
  const [isOnHero, setIsOnHero] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const heroEl = document.getElementById('home');
      let onHero = true;

      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        // User is considered on hero section only when top is near 0 and scrollY < 180px
        onHero = rect.top > -180 && scrollY < 180;
      } else {
        onHero = scrollY < 180;
      }

      setIsOnHero(onHero);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });

    const customContainers = [
      document.getElementById('root'),
      document.querySelector('.app-container'),
      document.querySelector('.landing-page'),
    ];

    customContainers.forEach((container) => {
      if (container) {
        container.addEventListener('scroll', handleScroll, { passive: true });
      }
    });

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
      customContainers.forEach((container) => {
        if (container) {
          container.removeEventListener('scroll', handleScroll);
        }
      });
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <style>{`
        @keyframes planeGlide {
          0% { transform: translateX(-6px) translateY(0px) rotate(0deg); }
          50% { transform: translateX(6px) translateY(-3px) rotate(6deg); }
          100% { transform: translateX(-6px) translateY(0px) rotate(0deg); }
        }
        @keyframes pulseGold {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px #F59E0B); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 8px #FACC15); }
        }
        @keyframes floatBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-plane {
          animation: planeGlide 3s ease-in-out infinite;
        }
        .animate-trophy {
          animation: pulseGold 2s infinite;
        }
        .animate-float-bounce {
          animation: floatBounce 2.5s ease-in-out infinite;
        }
        .dubai-bubble-btn {
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.4), 0 0 15px rgba(245, 158, 11, 0.3);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dubai-bubble-btn:hover {
          transform: translateY(-4px) scale(1.03) !important;
          box-shadow: 0 15px 35px rgba(15, 23, 42, 0.5), 0 0 22px rgba(250, 204, 21, 0.5);
        }
      `}</style>

      {/* PERMANENT TOP OVERLAY BANNER (No close button, positioned cleanly below 72px navbar) */}
      <div style={{
        marginTop: '72px', // Pushes banner cleanly below fixed 72px navbar
        marginBottom: 0,   // Zero gap before hero section starts
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #0369a1 80%, #b45309 100%)',
        borderBottom: '3px solid #F59E0B',
        padding: '0.75rem 1.5rem',
        color: '#ffffff',
        position: 'relative',
        zIndex: 990,
        fontFamily: "'Outfit', sans-serif",
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          {/* Left Side: Offer Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
            <span style={{
              backgroundColor: '#F59E0B',
              color: '#0f172a',
              fontSize: '0.7rem',
              fontWeight: 950,
              padding: '0.2rem 0.6rem',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              EXCLUSIVE OFFER
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.2rem' }}>🎉</span>
              <strong style={{
                fontSize: '1rem',
                fontWeight: 900,
                letterSpacing: '0.02em',
                color: '#FACC15',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)'
              }}>
                DUBAI LUCKY DRAW!
              </strong>
              <Plane size={18} className="animate-plane" style={{ color: '#38bdf8', transform: 'rotate(45deg)' }} />
              <span style={{ fontSize: '1.1rem' }}>🇦🇪</span>
            </div>

            <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255,255,255,0.25)', margin: '0 0.2rem' }} />

            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f3f4f6' }}>
              Buy or Sell &amp; Get a Chance to Fly to Dubai on 31st Dec!
            </span>
          </div>

          {/* Right Side: Winner Announcement */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: '0.78rem',
              fontWeight: 800
            }}>
              <Trophy size={14} className="animate-trophy" style={{ color: '#FACC15' }} />
              <span>Winner Announced:</span>
              <span style={{ color: '#FACC15' }}>1st Dec</span>
            </div>

            <span style={{
              fontSize: '0.8rem',
              fontWeight: 950,
              letterSpacing: '0.08em',
              color: '#38bdf8'
            }}>
              BUY • SELL • WIN!
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT-SIDE FLOATING OVERLAY BUBBLE
          - Fades out (opacity: 0) when on top of hero section
          - Fades in (opacity: 1) as soon as user scrolls down past 180px */}
      <div
        className="dubai-bubble-btn"
        onClick={() => setIsModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '1.75rem',
          zIndex: 9999, // High z-index to stay above all section content
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #b45309 100%)',
          border: '2.5px solid #F59E0B',
          borderRadius: '999px',
          padding: '0.65rem 1.15rem',
          color: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontFamily: "'Outfit', sans-serif",
          opacity: isOnHero ? 0 : 1,
          transform: isOnHero ? 'translateY(20px) scale(0.9)' : 'translateY(0) scale(1)',
          pointerEvents: isOnHero ? 'none' : 'auto',
          transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          border: '1px solid #F59E0B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Plane size={16} className="animate-plane" style={{ color: '#FACC15', transform: 'rotate(45deg)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#FACC15' }}>DUBAI DRAW!</span>
            <span style={{ fontSize: '0.85rem' }}>🇦🇪</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#e2e8f0', fontWeight: 700 }}>Fly on 31st Dec</span>
        </div>

        <ChevronRight size={16} style={{ color: '#FACC15', marginLeft: '0.2rem' }} />
      </div>

      {/* POPUP MODAL (Opens when clicking the floating bubble) */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0284c7 100%)',
            border: '3px solid #F59E0B',
            borderRadius: '1.25rem',
            padding: '2rem',
            maxWidth: '480px',
            width: '100%',
            color: '#ffffff',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(245, 158, 11, 0.3)',
            fontFamily: "'Outfit', sans-serif"
          }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                border: '2px solid #F59E0B',
                marginBottom: '1rem'
              }}>
                <Plane size={30} className="animate-plane" style={{ color: '#FACC15', transform: 'rotate(45deg)' }} />
              </div>

              <div style={{
                backgroundColor: '#F59E0B',
                color: '#0f172a',
                fontSize: '0.72rem',
                fontWeight: 950,
                padding: '0.2rem 0.75rem',
                borderRadius: '999px',
                display: 'inline-block',
                marginBottom: '0.5rem',
                letterSpacing: '0.08em'
              }}>
                GRAND SPECIAL OFFER
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FACC15', margin: '0.25rem 0' }}>
                🎉 DUBAI LUCKY DRAW! 🇦🇪
              </h2>
              <p style={{ fontSize: '1rem', color: '#e2e8f0', fontWeight: 700, margin: '0.5rem 0 0' }}>
                Buy or Sell &amp; Get a Chance to Fly to Dubai on 31st Dec!
              </p>
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Trophy size={18} style={{ color: '#FACC15' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Winner Announced: <strong style={{ color: '#FACC15' }}>1st Dec</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Gift size={18} style={{ color: '#38bdf8' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Tagline: <strong style={{ color: '#38bdf8' }}>BUY • SELL • WIN!</strong></span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsModalOpen(false);
                handleScrollToTop();
              }}
              style={{
                width: '100%',
                backgroundColor: '#F59E0B',
                color: '#0f172a',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              Participate Now (Buy or Sell)
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DubaiDrawOverlay;
