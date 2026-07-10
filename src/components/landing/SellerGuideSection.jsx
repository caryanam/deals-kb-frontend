import React from 'react';

const PURPLE = '#6B1B71';
const CREAM = '#FAF6EA';
const BORDER = '#D8CFC1';
const GOLD = '#B2772D';

const steps = [
  { num: 1, title: 'Register as a Seller or Dealer on DealsKB', icon: '📝' },
  { num: 2, title: 'Create a new listing — enter details for your Car, Bike, Mobile, or Laptop', icon: '📋' },
  { num: 3, title: 'Upload product photos and verification documents', icon: '📸' },
  { num: 4, title: 'Pay the listing fee (₹11.80–₹118 depending on category)', icon: '💳' },
  { num: 5, title: 'Wait for Admin approval and verification', icon: '⏳' },
  { num: 6, title: 'Your sell goes live — buyers enter the sell room', icon: '🔴' },
  { num: 7, title: 'Sell ends with the highest bidder as the Buyer', icon: '🏆' },
  { num: 8, title: 'Connect with the buyer and complete the handover', icon: '🤝' },
];

const SellerGuideSection = () => {
  return (
    <section
      id="seller-guide"
      style={{
        backgroundColor: CREAM,
        padding: '80px 24px',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span
            style={{
              display: 'inline-block',
              backgroundColor: GOLD,
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
            For Sellers
          </span>
          <h2
            style={{
              fontSize: 'clamp(26px, 4vw, 42px)',
              fontWeight: '800',
              color: '#1a1a1a',
              margin: '0 0 12px',
            }}
          >
            Seller's <span style={{ color: PURPLE }}>Guide</span>
          </h2>
          <p style={{ fontSize: '16px', color: '#666', maxWidth: '520px', margin: '0 auto' }}>
            List your vehicle or gadget in minutes and let our auction platform do the rest.
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
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(178,119,45,0.14)';
                e.currentTarget.style.borderColor = GOLD;
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
                  background: `linear-gradient(135deg, ${PURPLE} 0%, ${GOLD} 100%)`,
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

              {/* Arrow / finish */}
              {i < steps.length - 1 ? (
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
              ) : (
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

export default SellerGuideSection;
