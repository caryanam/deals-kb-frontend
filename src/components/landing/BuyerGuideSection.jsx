import React from 'react';

const PURPLE = '#6B1B71';
const BORDER = '#D8CFC1';
const GOLD = '#B2772D';

const steps = [
  { num: 1, title: 'Register as a Buyer on DealsKB', icon: '📝' },
  { num: 2, title: 'Browse the marketplace — explore Cars, Bikes, Mobiles, Laptops', icon: '🔍' },
  { num: 3, title: 'Select a product listing that interests you', icon: '🎯' },
  { num: 4, title: 'Activate a 24-hour Bidding Pass for that category', icon: '🎫' },
  { num: 5, title: 'Enter the live auction room and place unlimited bids', icon: '⚡' },
  { num: 6, title: 'Win by having the highest bid when the auction ends', icon: '🏆' },
  { num: 7, title: 'Connect with the seller and complete the handover', icon: '🤝' },
];

const BuyerGuideSection = () => {
  return (
    <section
      id="buyer-guide"
      style={{
        backgroundColor: '#ffffff',
        padding: '80px 24px',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
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
            For Buyers
          </span>
          <h2
            style={{
              fontSize: 'clamp(26px, 4vw, 42px)',
              fontWeight: '800',
              color: '#1a1a1a',
              margin: '0 0 12px',
            }}
          >
            Buyer's <span style={{ color: PURPLE }}>Guide</span>
          </h2>
          <p style={{ fontSize: '16px', color: '#666', maxWidth: '520px', margin: '0 auto' }}>
            Follow these simple steps to start bidding and winning amazing deals on DealsKB.
          </p>
        </div>

        {/* Steps */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                backgroundColor: '#fff',
                border: `1.5px solid ${BORDER}`,
                borderRadius: '14px',
                padding: '22px 28px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(6px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(107,27,113,0.12)';
                e.currentTarget.style.borderColor = PURPLE;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = BORDER;
              }}
            >
              {/* Step number */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: PURPLE,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: '800',
                  flexShrink: 0,
                }}
              >
                {step.num}
              </div>

              {/* Icon */}
              <span style={{ fontSize: '28px', flexShrink: 0 }}>{step.icon}</span>

              {/* Text */}
              <p
                style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  margin: 0,
                  lineHeight: '1.5',
                }}
              >
                {step.title}
              </p>

              {/* Arrow */}
              {i < steps.length - 1 && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '18px',
                    color: GOLD,
                    flexShrink: 0,
                  }}
                >
                  →
                </span>
              )}
              {i === steps.length - 1 && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '18px',
                    color: PURPLE,
                    flexShrink: 0,
                  }}
                >
                  🎉
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BuyerGuideSection;
