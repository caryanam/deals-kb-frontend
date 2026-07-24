import React, { useEffect, useMemo, useState } from 'react';
import { X, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { triggerBuyerPassPayment } from '../../utils/paymentHelper';
import { formatCurrency, PRODUCT_TYPE_LABELS } from '../../utils/helpers';
import { getMyPlans } from '../../api/paymentApi';

const CATEGORY_PLAN_IDS = {
  mobile: 'buyer_mobile_day',
  laptop: 'buyer_laptop_day',
  car: 'buyer_car_day',
  bike: 'buyer_bike_day'
};

const FALLBACK_PLANS = {
  mobile: {
    plan_id: 'buyer_mobile_day',
    name: 'Mobile Bidding Pass',
    amount: 21,
    description: 'Unlimited mobile bidding for 24 hours (+ 18% GST).'
  },
  laptop: {
    plan_id: 'buyer_laptop_day',
    name: 'Laptop Bidding Pass',
    amount: 41,
    description: 'Unlimited laptop bidding for 24 hours (+ 18% GST).'
  },
  car: {
    plan_id: 'buyer_car_day',
    name: 'Car Bidding Pass',
    amount: 211,
    description: 'Unlimited car bidding for 24 hours (+ 18% GST).'
  },
  bike: {
    plan_id: 'buyer_bike_day',
    name: 'Bike Bidding Pass',
    amount: 101,
    description: 'Unlimited bike bidding for 24 hours (+ 18% GST).'
  }
};

const PricingPlanPopup = ({ isOpen, productType = 'mobile', requiredPlan, onClose, onActivated }) => {
  const [activatingPlanId, setActivatingPlanId] = useState('');
  const [planStatuses, setPlanStatuses] = useState([]);
  const normalizedType = (productType || requiredPlan?.product_type || 'mobile').toLowerCase();
  const plans = useMemo(() => {
    const byId = {};
    Object.entries(FALLBACK_PLANS).forEach(([type, plan]) => {
      byId[plan.plan_id] = { ...plan, product_type: type };
    });
    planStatuses
      .filter((plan) => plan.role === 'Buyer' && plan.product_type)
      .forEach((plan) => {
        byId[plan.plan_id] = { ...byId[plan.plan_id], ...plan };
      });
    if (requiredPlan?.plan_id) {
      byId[requiredPlan.plan_id] = { ...byId[requiredPlan.plan_id], ...requiredPlan };
    }
    return ['mobile', 'laptop', 'car', 'bike'].map((type) => byId[CATEGORY_PLAN_IDS[type]] || { ...FALLBACK_PLANS[type], product_type: type });
  }, [planStatuses, requiredPlan]);

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    getMyPlans()
      .then((data) => {
        if (mounted) setPlanStatuses(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (mounted) setPlanStatuses([]);
      });
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleActivate = async (plan) => {
    if (plan.active) {
      onActivated?.(null, plan);
      onClose?.();
      return;
    }
    try {
      setActivatingPlanId(plan.plan_id);
      const result = await triggerBuyerPassPayment(plan.plan_id || CATEGORY_PLAN_IDS[plan.product_type]);
      if (result) {
        toast.info('Complete payment in the CCAvenue window to activate your bidding pass.');
        onActivated?.(null, plan);
        onClose?.();
      }
    } finally {
      setActivatingPlanId('');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <style>{`
        .pricing-grid-row-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.85rem;
        }
        .pricing-card-item {
          border: 1.5px solid #D8CFC1;
          background-color: #ffffff;
          border-radius: 1rem;
          padding: 1.25rem 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          transition: all 0.2s ease;
          position: relative;
          cursor: default;
          box-shadow: 0 4px 10px rgba(0,0,0,0.02);
        }
        .pricing-card-item:hover {
          border-color: #6B1B71 !important;
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(107, 27, 113, 0.12) !important;
        }
        .pricing-card-item.active-plan {
          background-color: #f0fdf4 !important;
        }
        @media (max-width: 900px) {
          .pricing-grid-row-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
        }
        @media (max-width: 550px) {
          .pricing-grid-row-container {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
        }
      `}</style>
      <div style={{
        width: '100%',
        maxWidth: '1080px',
        backgroundColor: '#FAF6EA',
        borderRadius: '1.25rem',
        boxShadow: '0 24px 64px rgba(107, 27, 113, 0.15)',
        overflow: 'hidden',
        border: '1px solid #D8CFC1'
      }}>
        <div style={{ padding: '1.5rem 1.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#1F1A1D', fontFamily: "'Outfit', sans-serif" }}>Start your unlimited bidding experience with us.</h2>
            <p style={{ margin: '0.4rem 0 0', color: '#8B8278', fontSize: '0.9rem', fontWeight: 600 }}>
              Choose a 24-hour bidding pass and place unlimited bids on live auctions for this category.
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ border: 'none', background: '#EFEAE0', borderRadius: '50%', width: 34, height: 34, display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#1F1A1D', transition: 'all 0.15s ease' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '0 1.75rem 1.75rem' }}>
          <div className="pricing-grid-row-container">
            {plans.map((plan) => {
              const type = plan.product_type || Object.keys(CATEGORY_PLAN_IDS).find((key) => CATEGORY_PLAN_IDS[key] === plan.plan_id) || normalizedType;
              const activating = activatingPlanId === plan.plan_id;
              return (
                <div 
                  key={plan.plan_id} 
                  className={`pricing-card-item ${plan.active ? 'active-plan' : ''}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ color: '#8B8278', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {PRODUCT_TYPE_LABELS[type] || type} Pass
                    </span>
                    {plan.active && <CheckCircle2 size={17} style={{ color: '#16a34a' }} />}
                  </div>
                  <h3 style={{ margin: 0, color: '#1F1A1D', fontSize: '1.05rem', fontWeight: 800 }}>{plan.name || plan.plan_name}</h3>
                  <div style={{ marginTop: '0.25rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#6B1B71', fontSize: '1.85rem', fontWeight: 950 }}>
                      {formatCurrency(Number(plan.amount))}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#8B8278', fontWeight: 800, display: 'block', marginTop: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                      / 24 Hours
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#8B8278', fontSize: '0.84rem', fontWeight: 600, minHeight: 38, lineHeight: 1.4 }}>{plan.description}</p>
                  
                  {plan.active && (plan.active_until || plan.expires_at) && (
                    <span style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 800, marginTop: '0.25rem' }}>
                      Active until {new Date(plan.active_until || plan.expires_at).toLocaleString()}
                    </span>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => handleActivate(plan)}
                    disabled={activating}
                    className={plan.active ? 'btn btn-secondary' : 'btn btn-primary'}
                    style={{
                      width: '100%',
                      marginTop: 'auto',
                      height: '38px',
                      borderRadius: '999px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      fontWeight: 900,
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {activating ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <ShieldCheck size={14} />}
                    {plan.active ? 'Active' : 'Buy Pass'}
                  </button>
                </div>
              );
            })}
          </div>
          <p style={{ margin: '1rem 0 0', color: '#8B8278', fontSize: '0.78rem', textAlign: 'center', fontWeight: 700, letterSpacing: '0.02em' }}>
            🔒 Secure 256-bit SSL Payment Powered by CCAvenue
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPlanPopup;
