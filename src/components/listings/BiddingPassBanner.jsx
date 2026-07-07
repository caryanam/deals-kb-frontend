import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import PricingPlanPopup from './PricingPlanPopup';

const BiddingPassBanner = ({ productType = 'mobile', onActivated }) => {
  const [showPlans, setShowPlans] = useState(false);

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        backgroundColor: '#F5ECDD',
        border: '1px solid #D8CFC1',
        color: '#7A2181',
        padding: '1.1rem 1.25rem',
        borderRadius: '0.75rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <ShieldCheck size={22} />
          <div>
            <span style={{ fontWeight: 900, fontSize: '0.95rem', display: 'block' }}>
              Start your unlimited bidding experience with us.
            </span>
            <span style={{ fontSize: '0.85rem', color: '#8B8278', fontWeight: 650 }}>
              Choose a 24-hour bidding pass and place unlimited bids on live auctions for this category.
            </span>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowPlans(true)}
          style={{ width: 'fit-content', padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 900 }}
        >
          Explore Plans
        </button>
      </div>

      <PricingPlanPopup
        isOpen={showPlans}
        productType={productType}
        onClose={() => setShowPlans(false)}
        onActivated={onActivated}
      />
    </>
  );
};

export default BiddingPassBanner;
