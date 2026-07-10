import React, { useEffect, useMemo, useState } from 'react';
import { X, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { triggerPayment } from '../../utils/paymentHelper';
import { formatCurrency, PRODUCT_TYPE_LABELS } from '../../utils/helpers';
import { getMyPlans } from '../../api/paymentApi';

const CATEGORY_PLAN_IDS = {
  mobile: 'buyer_mobile_24h',
  laptop: 'buyer_laptop_24h',
  car: 'buyer_car_24h',
  bike: 'buyer_bike_24h'
};

const FALLBACK_PLANS = {
  mobile: {
    plan_id: 'buyer_mobile_24h',
    name: 'Mobile Bidding Pass',
    amount: 100,
    description: 'Unlimited mobile bidding for 24 hours.'
  },
  laptop: {
    plan_id: 'buyer_laptop_24h',
    name: 'Laptop Bidding Pass',
    amount: 100,
    description: 'Unlimited laptop bidding for 24 hours.'
  },
  car: {
    plan_id: 'buyer_car_24h',
    name: 'Car Bidding Pass',
    amount: 100,
    description: 'Unlimited car bidding for 24 hours.'
  },
  bike: {
    plan_id: 'buyer_bike_24h',
    name: 'Bike Bidding Pass',
    amount: 100,
    description: 'Unlimited bike bidding for 24 hours.'
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
      const freshUser = await triggerPayment(plan.plan_id || CATEGORY_PLAN_IDS[plan.product_type]);
      if (freshUser) {
        toast.success('Bidding pass activated successfully.');
        onActivated?.(freshUser, plan);
        const data = await getMyPlans().catch(() => []);
        setPlanStatuses(Array.isArray(data) ? data : []);
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
      backgroundColor: 'rgba(15, 23, 42, 0.66)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '760px',
        backgroundColor: '#FAF6EA',
        borderRadius: '1rem',
        boxShadow: '0 24px 60px rgba(15, 23, 42, 0.28)',
        overflow: 'hidden',
        border: '1px solid #D8CFC1'
      }}>
        <div style={{ padding: '1.25rem 1.35rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#1F1A1D' }}>Start your unlimited bidding experience with us.</h2>
            <p style={{ margin: '0.5rem 0 0', color: '#8B8278', fontSize: '0.9rem', lineHeight: 1.45 }}>
              Choose a 24-hour bidding pass and place unlimited bids on live auctions for this category.
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ border: 'none', background: '#FAF6EA', borderRadius: '50%', width: 34, height: 34, display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#8B8278' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '0 1.35rem 1.35rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.9rem' }}>
            {plans.map((plan) => {
              const type = plan.product_type || Object.keys(CATEGORY_PLAN_IDS).find((key) => CATEGORY_PLAN_IDS[key] === plan.plan_id) || normalizedType;
              const isRequired = type === normalizedType || plan.plan_id === requiredPlan?.plan_id;
              const activating = activatingPlanId === plan.plan_id;
              return (
                <div key={plan.plan_id} style={{
                  border: isRequired ? '1.5px solid #6B1B71' : '1px solid #D8CFC1',
                  backgroundColor: plan.active ? '#f0fdf4' : isRequired ? '#F5ECDD' : '#ffffff',
                  borderRadius: '0.9rem',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ color: isRequired ? '#7A2181' : '#8B8278', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase' }}>
                      {PRODUCT_TYPE_LABELS[type] || type} Plan
                    </span>
                    {plan.active && <CheckCircle2 size={17} style={{ color: '#16a34a' }} />}
                  </div>
                  <h3 style={{ margin: 0, color: '#1F1A1D', fontSize: '1.03rem', fontWeight: 900 }}>{plan.name}</h3>
                  <strong style={{ color: '#1F1A1D', fontSize: '1.75rem', fontWeight: 950 }}>
                    {formatCurrency(plan.amount / 100)} <span style={{ fontSize: '0.86rem', color: '#8B8278', fontWeight: 800 }}>/ 24 hours</span>
                  </strong>
                  <p style={{ margin: 0, color: '#8B8278', fontSize: '0.84rem', fontWeight: 650, minHeight: 38 }}>{plan.description}</p>
                  {plan.active && plan.expires_at && (
                    <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 800 }}>
                      Active until {new Date(plan.expires_at).toLocaleString()}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleActivate(plan)}
                    disabled={activating}
                    className={plan.active ? 'btn btn-secondary' : 'btn btn-primary'}
                    style={{ width: '100%', marginTop: 'auto', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', fontWeight: 900 }}
                  >
                    {activating ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ShieldCheck size={16} />}
                    {plan.active ? 'Active' : 'Activate Bidding Pass'}
                  </button>
                </div>
              );
            })}
          </div>
          <p style={{ margin: '0.65rem 0 0', color: '#8B8278', fontSize: '0.78rem', textAlign: 'center', fontWeight: 700 }}>
            Secure payment powered by Cashfree
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPlanPopup;
