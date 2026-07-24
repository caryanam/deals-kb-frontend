import React from 'react';
import mobileImg from '../../assets/mobile.png';
import laptopImg from '../../assets/laptop.png';
import bikeImg from '../../assets/bike.png';
import carImg from '../../assets/car.png';

const PURPLE = '#6B1B71';
const GOLD = '#B2772D';

const categoryPlans = [
  {
    category: 'Mobile',
    image: mobileImg,
    seller: '₹11.80',
    buyer: '₹24.78',
    dealer: '₹1,178.82',
    regularLimit: '401',
    offerLimit: '1,000',
  },
  {
    category: 'Laptop',
    image: laptopImg,
    seller: '₹59.00',
    buyer: '₹60.18',
    dealer: '₹2,358.82',
    regularLimit: '300',
    offerLimit: '500',
  },
  {
    category: 'Bike',
    image: bikeImg,
    seller: '₹118.00',
    buyer: '₹119.18',
    dealer: '₹2,358.82',
    regularLimit: '150',
    offerLimit: '500',
  },
  {
    category: 'Car',
    image: carImg,
    seller: '₹590.00',
    buyer: '₹591.18',
    dealer: '₹3,538.82',
    regularLimit: '30',
    offerLimit: '100',
  },
];

const PlansSection = () => {
  return (
    <section
      id="pricing-plans"
      style={{
        backgroundColor: '#FAF6EA',
        padding: '80px 24px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.75rem;
          margin-top: 1rem;
        }
        .plan-card {
          background-color: #ffffff;
          border: 3px solid #1F1A1D;
          border-radius: 30px 15px 40px 20px / 20px 40px 15px 30px;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          box-shadow: 6px 6px 0px #1F1A1D;
        }
        .plan-card:hover {
          transform: translate(-6px, -6px);
          border-color: #6B1B71;
          box-shadow: 12px 12px 0px #6B1B71 !important;
        }
        .wobbly-img-container {
          width: 58px;
          height: 58px;
          border: 2.5px solid #1F1A1D;
          border-radius: 50% 45% 52% 48% / 48% 52% 45% 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #ffffff;
          box-shadow: 2px 2px 0px #1F1A1D;
          transition: all 0.25s ease;
          overflow: hidden;
          padding: 4px;
        }
        .plan-card:hover .wobbly-img-container {
          border-color: #6B1B71;
          box-shadow: 3px 3px 0px #6B1B71;
        }
        .plan-badge-dealer {
          background-color: #FFFDF5;
          border: 2.5px solid #B2772D;
          border-radius: 18px 10px 20px 8px / 8px 18px 10px 18px;
          padding: 0.85rem;
          min-height: 104px;
          display: flex;
          flex-direction: column;
          justifyContent: center;
          margin-top: auto;
          box-shadow: 3px 3px 0px #B2772D;
          transition: all 0.25s ease;
        }
        .plan-card:hover .plan-badge-dealer {
          border-color: #6B1B71;
          box-shadow: 4px 4px 0px #6B1B71;
        }
        .offer-banner {
          background: linear-gradient(135deg, #FEF3C7 0%, #FFFDF5 100%);
          border: 3px solid #1F1A1D;
          border-radius: 20px 10px 25px 12px / 12px 22px 10px 20px;
          padding: 1.25rem 1.75rem;
          margin: 0 auto 3rem;
          max-width: 800px;
          display: flex;
          align-items: center;
          justifyContent: center;
          gap: 16px;
          box-shadow: 6px 6px 0px #F59E0B;
          transition: all 0.25s ease;
        }
        .offer-banner:hover {
          transform: translateY(-2px);
          box-shadow: 8px 8px 0px #F59E0B;
        }
        @media (max-width: 1024px) {
          .plans-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
        }
        @media (max-width: 600px) {
          .plans-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span
            style={{
              display: 'inline-block',
              backgroundColor: '#FAF6EA',
              border: `2.5px solid #1F1A1D`,
              boxShadow: '2px 2px 0px #1F1A1D',
              color: '#1F1A1D',
              fontSize: '11px',
              fontWeight: '900',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              padding: '6px 18px',
              borderRadius: '12px 6px 12px 6px / 6px 12px 6px 12px',
              marginBottom: '14px',
            }}
          >
            Pricing Structure
          </span>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 38px)',
              fontWeight: '900',
              color: '#1F1A1D',
              margin: '0 0 10px',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Simple, Transparent <span style={{ color: PURPLE }}>Pricing</span>
          </h2>
          <p style={{ fontSize: '15px', color: '#8B8278', maxWidth: '600px', margin: '0 auto 1.5rem', fontWeight: 600, lineHeight: 1.5 }}>
            Unlock categories to buy, sell, or manage listings as a seller, buyer, or dealer.
          </p>
        </div>

        {/* Launch Offer Banner */}
        <div className="offer-banner">
          <span style={{ fontSize: '2rem', lineHeight: 1 }}>🚀</span>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#D97706', fontFamily: "'Outfit', sans-serif" }}>
              Special Dealer Launch Offer — Valid Till 31st August!
            </h4>
            <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#78350F', fontWeight: 700 }}>
              Join before the month end and get upgraded listings limits on all monthly dealer plans permanently.
            </p>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="plans-grid">
          {categoryPlans.map((item, idx) => (
            <div key={idx} className="plan-card">
              {/* Category Icon and Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div className="wobbly-img-container">
                  <img
                    src={item.image}
                    alt={item.category}
                    style={{ width: '90%', height: '90%', objectFit: 'contain' }}
                  />
                </div>
                <h4 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#1F1A1D', fontFamily: "'Outfit', sans-serif" }}>
                  {item.category}
                </h4>
              </div>

              {/* Plans breakdown list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', borderTop: '2.5px solid #1F1A1D', paddingTop: '1.25rem' }}>
                {/* Seller Fee */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#8B8278', fontWeight: 700, display: 'block' }}>Seller Fee</span>
                    <span style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 700 }}>Per Listing</span>
                  </div>
                  <span style={{ fontSize: '1.1rem', color: '#1F1A1D', fontWeight: 900 }}>{item.seller}</span>
                </div>

                {/* Buyer Pass */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#8B8278', fontWeight: 700 }}>Buyer Pass <span style={{ fontSize: '0.65rem', color: '#8B8278', fontWeight: 600 }}>(24h)</span></span>
                  <span style={{ fontSize: '1.1rem', color: '#1F1A1D', fontWeight: 900 }}>{item.buyer}</span>
                </div>

                <div style={{ height: '2px', backgroundColor: '#1F1A1D', margin: '0.15rem 0' }} />

                {/* Dealer Plan */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: PURPLE, fontWeight: 900, display: 'block' }}>Dealer Plan</span>
                    <span style={{ fontSize: '0.65rem', color: '#8B8278', fontWeight: 700 }}>Monthly Plan</span>
                  </div>
                  <span style={{ fontSize: '1.25rem', color: PURPLE, fontWeight: 950 }}>{item.dealer}</span>
                </div>
              </div>

              {/* Dealer Benefit Box */}
              <div className="plan-badge-dealer">
                {/* Box Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1.5px dashed #B2772D', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: GOLD, fontWeight: 900 }}>Dealer Limit</span>
                  <span style={{ fontSize: '0.62rem', backgroundColor: '#FEF3C7', color: '#D97706', padding: '2px 6px', borderRadius: '4px', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚡ Upgrade</span>
                </div>

                {/* Regular Limit Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', marginBottom: '5px' }}>
                  <span style={{ color: '#8B8278', fontWeight: 700 }}>Regular Limit:</span>
                  <span style={{ color: '#8B8278', fontWeight: 700, textDecoration: 'line-through' }}>{item.regularLimit} / mo</span>
                </div>

                {/* Offer Limit Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                  <span style={{ color: '#1F1A1D', fontWeight: 900 }}>Launch Offer:</span>
                  <span style={{ color: '#D97706', fontWeight: 950 }}>{item.offerLimit} / mo</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlansSection;
