import React, { useEffect, useState } from 'react';
import { ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import PricingPlanPopup from './PricingPlanPopup';
import { getMyPlans } from '../../api/paymentApi';
import { PRODUCT_TYPE_LABELS } from '../../utils/helpers';

const CATEGORY_ICONS = {
  car: '🚘',
  bike: '🏍️',
  laptop: '💻',
  mobile: '📱'
};

const formatTimeLeft = (targetDate) => {
  if (!targetDate) return null;
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
};

const BiddingPassBanner = ({ productType = 'all', onActivated }) => {
  const [showPlans, setShowPlans] = useState(false);
  const [activePlans, setActivePlans] = useState([]);
  const [countdowns, setCountdowns] = useState({});

  const loadPlans = async () => {
    try {
      const plans = await getMyPlans();
      if (Array.isArray(plans)) {
        const active = plans.filter(p => p.active && (p.active_until || p.expires_at || p.buyer_access_until));
        setActivePlans(active);
      }
    } catch (err) {
      console.warn('Failed to load active plans for banner:', err);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [showPlans]);

  // Live 1-second countdown ticker for active subscriptions
  useEffect(() => {
    if (activePlans.length === 0) return;

    const updateTimer = () => {
      const newTimers = {};
      activePlans.forEach(plan => {
        const exp = plan.active_until || plan.expires_at || plan.buyer_access_until;
        const remaining = formatTimeLeft(exp);
        if (remaining) {
          const type = (plan.product_type || '').toLowerCase();
          newTimers[type] = remaining;
        }
      });
      setCountdowns(newTimers);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activePlans]);

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        backgroundColor: '#F5ECDD',
        border: '1.5px solid #D8CFC1',
        color: '#7A2181',
        padding: '1.25rem 1.5rem',
        borderRadius: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1, minWidth: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShieldCheck size={24} style={{ color: '#15803D' }} />
            <div>
              <span style={{ fontWeight: 900, fontSize: '1rem', color: '#1F1A1D', display: 'block' }}>
                🇮🇳 Independence Day Special: 100% Free Direct Bidding
              </span>
              <span style={{ fontSize: '0.82rem', color: '#15803D', fontWeight: 700 }}>
                All buyers enjoy free unlimited bidding (₹0 fee) on all live auctions for the next 30 days!
              </span>
            </div>
          </div>

          {/* Active Subscriptions Countdown Badges */}
          {Object.keys(countdowns).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
              {Object.entries(countdowns).map(([type, timeStr]) => (
                <div
                  key={type}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: '#f0fdf4',
                    border: '1.5px solid #16a34a',
                    color: '#166534',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    fontWeight: 800
                  }}
                >
                  <span>{CATEGORY_ICONS[type] || '🛡️'}</span>
                  <span>{PRODUCT_TYPE_LABELS[type] || type.toUpperCase()} subscription ends in</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#15803d', fontWeight: 900 }}>
                    {timeStr}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowPlans(true)}
          style={{ width: 'fit-content', padding: '0.65rem 1.35rem', fontSize: '0.85rem', fontWeight: 900, borderRadius: '999px' }}
        >
          Explore Plans
        </button>
      </div>

      <PricingPlanPopup
        isOpen={showPlans}
        productType={productType}
        onClose={() => {
          setShowPlans(false);
          loadPlans();
        }}
        onActivated={() => {
          setShowPlans(false);
          loadPlans();
          onActivated?.();
        }}
      />
    </>
  );
};

export default BiddingPassBanner;
