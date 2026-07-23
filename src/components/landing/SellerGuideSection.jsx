import React from 'react';

const PURPLE = '#6B1B71';
const GOLD = '#B2772D';

const guidelines = [
  { title: 'Register as a Seller or Dealer on DealsKB', icon: '📝', desc: 'Create your merchant profile to start showcasing your vehicles or devices.' },
  { title: 'Create a new listing — enter details for your Car, Bike, Mobile, or Laptop', icon: '📋', desc: 'Provide accurate specifications, description details, and condition tags.' },
  { title: 'Upload product photos and verification documents', icon: '📸', desc: 'Upload clear, high-quality images and legal verification documents.' },
  { title: 'Pay the listing fee for your category', icon: '💳', desc: 'Pay the category fee (₹10 - ₹500) to submit the listing to admin review.' },
  { title: 'Wait for Admin approval and verification', icon: '⏳', desc: 'Our team verifies document compliance before publishing your live auction.' },
  { title: 'Your sell goes live — buyers enter the sell room', icon: '🔴', desc: 'Once published, your auction starts and buyers can enter bids.' },
  { title: 'Sell ends with the highest bidder as the Buyer', icon: '🏆', desc: 'When the timer hits zero, the highest leading bid wins.' },
  { title: 'Connect with the buyer and complete the handover', icon: '🤝', desc: 'Connect directly with the buyer to coordinate delivery and receive payment.' },
];

const SellerGuideSection = () => {
  return (
    <section
      id="seller-guide"
      style={{
        backgroundColor: '#FAF6EA',
        padding: '80px 24px',
      }}
    >
      <style>{`
        .guide-grid-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        @media (max-width: 900px) {
          .guide-grid-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .guide-grid-container {
            grid-template-columns: 1fr;
          }
        }
        .guide-cool-card {
          background: #ffffff;
          border: 1.5px solid #D8CFC1;
          border-radius: 1.25rem;
          padding: 2.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.25rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          cursor: default;
        }
        .guide-cool-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #6B1B71, #B2772D);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .guide-cool-card:hover {
          transform: translateY(-8px);
          border-color: #6B1B71;
          box-shadow: 0 16px 36px rgba(107, 27, 113, 0.12) !important;
        }
        .guide-cool-card:hover::before {
          opacity: 1;
        }
        .guide-card-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background-color: #F5ECDD;
          display: flex;
          align-items: center;
          justifyContent: center;
          font-size: 2rem;
          box-shadow: 0 4px 10px rgba(178,119,45,0.08);
          transition: all 0.3s ease;
        }
        .guide-cool-card:hover .guide-card-icon-wrapper {
          background-color: #6B1B71;
          transform: scale(1.08) rotate(5deg);
          box-shadow: 0 6px 15px rgba(107,27,113,0.25);
        }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span
            style={{
              display: 'inline-block',
              backgroundColor: GOLD,
              color: '#fff',
              fontSize: '11px',
              fontWeight: '800',
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
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: '900',
              color: '#1F1A1D',
              margin: '0 0 12px',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Seller's <span style={{ color: PURPLE }}>Guide</span>
          </h2>
          <p style={{ fontSize: '16px', color: '#8B8278', maxWidth: '520px', margin: '0 auto', fontWeight: 600 }}>
            List your vehicle or gadget in minutes and let our auction platform do the rest.
          </p>
        </div>

        {/* Guidelines Grid */}
        <div className="guide-grid-container">
          {guidelines.map((guide, i) => (
            <div key={i} className="guide-cool-card">
              <div className="guide-card-icon-wrapper">
                {guide.icon}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1F1A1D', lineHeight: 1.4, minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {guide.title}
                </h3>
                <p style={{ margin: '0.5rem 0 0', color: '#8B8278', fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.5 }}>
                  {guide.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SellerGuideSection;
