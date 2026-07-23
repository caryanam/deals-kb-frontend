import React from 'react';

const PURPLE = '#6B1B71';
const HOVER_PURPLE = '#7A2181';
const CREAM = '#FAF6EA';
const GOLD = '#B2772D';
const BORDER = '#D8CFC1';

const buyerPasses = [
  { category: 'Mobile', icon: '📱', price: '₹21', duration: '24 hours', desc: 'Place unlimited buy on mobile auctions (+ 18% GST)' },
  { category: 'Laptop', icon: '💻', price: '₹41', duration: '24 hours', desc: 'Place unlimited buy on laptop auctions (+ 18% GST)' },
  { category: 'Bike', icon: '🏍️', price: '₹101', duration: '24 hours', desc: 'Place unlimited buy on bike auctions (+ 18% GST)' },
  { category: 'Car', icon: '🚗', price: '₹211', duration: '24 hours', desc: 'Place unlimited buy on car auctions (+ 18% GST)' },
];

const sellerFees = [
  { category: 'Mobile Listing', icon: '📱', price: '₹10', type: 'one-time (+ 18% GST)' },
  { category: 'Laptop Listing', icon: '💻', price: '₹50', type: 'one-time (+ 18% GST)' },
  { category: 'Bike Listing', icon: '🏍️', price: '₹100', type: 'one-time (+ 18% GST)' },
  { category: 'Car Listing', icon: '🚗', price: '₹500', type: 'one-time (+ 18% GST)' },
];

const GroupTitle = ({ children, sub }) => (
  <div style={{ marginBottom: '28px' }}>
    <h3
      style={{
        fontSize: '22px',
        fontWeight: '800',
        color: '#1a1a1a',
        margin: '0 0 6px',
      }}
    >
      {children}
    </h3>
    {sub && <p style={{ fontSize: '14px', color: '#777', margin: 0 }}>{sub}</p>}
  </div>
);

const PlanCard = ({ icon, category, price, duration, desc, highlight }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: highlight ? PURPLE : '#fff',
        border: `1.5px solid ${highlight ? PURPLE : BORDER}`,
        borderRadius: '16px',
        padding: '28px 22px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '10px',
        boxShadow: hovered
          ? '0 12px 32px rgba(107,27,113,0.16)'
          : '0 4px 16px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
        cursor: 'default',
      }}
    >
      <span style={{ fontSize: '36px', lineHeight: 1 }}>{icon}</span>
      <h4
        style={{
          fontSize: '15px',
          fontWeight: '700',
          color: highlight ? '#fff' : '#1a1a1a',
          margin: 0,
        }}
      >
        {category}
      </h4>
      <div
        style={{
          fontSize: '30px',
          fontWeight: '800',
          color: highlight ? '#FFD700' : PURPLE,
          lineHeight: 1,
        }}
      >
        {price}
      </div>
      {duration && (
        <span
          style={{
            fontSize: '12px',
            color: highlight ? 'rgba(255,255,255,0.75)' : GOLD,
            fontWeight: '600',
            letterSpacing: '0.5px',
          }}
        >
          / {duration}
        </span>
      )}
      {desc && (
        <p
          style={{
            fontSize: '13px',
            color: highlight ? 'rgba(255,255,255,0.85)' : '#666',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {desc}
        </p>
      )}
    </div>
  );
};

const BiddingPlansSection = () => {
  return (
    <section
      id="plans"
      style={{
        backgroundColor: '#fff',
        padding: '80px 24px',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
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
            Pricing
          </span>
          <h2
            style={{
              fontSize: 'clamp(26px, 4vw, 42px)',
              fontWeight: '800',
              color: '#1a1a1a',
              margin: '0 0 12px',
            }}
          >
            Simple, Transparent <span style={{ color: PURPLE }}>Plans</span>
          </h2>
          <p style={{ fontSize: '16px', color: '#666', maxWidth: '560px', margin: '0 auto' }}>
            No subscriptions for buyers — pay only for the pass you need. Sellers pay a small
            one-time listing fee. Dealers get an all-in monthly plan.
          </p>
        </div>

        {/* Buyer Passes */}
        <GroupTitle sub="Activate a pass and bid unlimited for 24 hours in that category.">
          🛒 Buyer Passes
        </GroupTitle>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '56px',
          }}
        >
          {buyerPasses.map((p, i) => (
            <PlanCard key={i} {...p} />
          ))}
        </div>

        {/* Seller Fees */}
        <GroupTitle sub="One-time fee per listing. Admin verifies and publishes your item.">
          🏷️ Seller Listing Fees
        </GroupTitle>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '56px',
          }}
        >
          {sellerFees.map((p, i) => (
            <PlanCard key={i} {...p} />
          ))}
        </div>

        {/* Dealer Plan */}
        <GroupTitle sub="Best for high-volume sellers and professional dealers.">
          🏢 Dealer Monthly Plan
        </GroupTitle>
        <div
          style={{
            maxWidth: '480px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${PURPLE} 0%, #9B2FA3 100%)`,
              borderRadius: '20px',
              padding: '44px 36px',
              textAlign: 'center',
              boxShadow: '0 16px 48px rgba(107,27,113,0.25)',
              color: '#fff',
            }}
          >
            <span style={{ fontSize: '48px', lineHeight: 1 }}>🏢</span>
            <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '16px 0 8px' }}>
              Dealer Monthly Plan
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', margin: '16px 0 20px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', display: 'block', fontWeight: 800 }}>Mobile Plan</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#FFD700', lineHeight: 1.1 }}>₹999</div>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>/ month (+ 18% GST)</span>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', height: '48px', alignSelf: 'center' }} />
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', display: 'block', fontWeight: 800 }}>Laptop & Bike</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#FFD700', lineHeight: 1.1 }}>₹1999</div>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>/ month (+ 18% GST)</span>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', height: '48px', alignSelf: 'center' }} />
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', display: 'block', fontWeight: 800 }}>Car Plan</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#FFD700', lineHeight: 1.1 }}>₹2999</div>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>/ month (+ 18% GST)</span>
              </div>
            </div>
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.88)',
                lineHeight: 1.6,
                margin: '0 0 28px',
              }}
            >
              Unlimited listings for Mobile at ₹999/month, Laptop & Bike at ₹1999/month, and Cars at ₹2999/month (+ 18% GST).
              No per-listing charges. Perfect for high-volume dealers.
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 8px',
                textAlign: 'left',
                display: 'inline-block',
              }}
            >
              {[
                'Unlimited product listings',
                'All categories included',
                'Priority admin review',
                'Dealer badge on listings',
              ].map((feat, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.9)',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ color: '#FFD700', fontSize: '16px' }}>✓</span>
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BiddingPlansSection;
