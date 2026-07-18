import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ClipboardList, CheckCircle2, Gavel, Award, Sparkles, MessageSquare, ArrowRight, AlertTriangle, RefreshCw, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getProducts } from '../../api/productApi';
import { getMyPlans } from '../../api/paymentApi';
import { toast } from 'react-toastify';
// import { triggerPayment } from '../../utils/paymentHelper';

export const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const basePath = user?.role === 'Dealer' ? '/dealer' : '/seller';

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    live: 0,
    ended: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dealerPlanActive, setDealerPlanActive] = useState(false);
  const [dealerCarPlanActive, setDealerCarPlanActive] = useState(false);
  const [payingPlanId, setPayingPlanId] = useState(null);

  const loadSellerStats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      
      const myListings = await getProducts({ mine: 'true' });
      if (user.role === 'Dealer') {
        const plans = await getMyPlans();
        const activePlans = plans || [];
        setDealerPlanActive(activePlans.some((plan) => plan.plan_id === 'dealer_monthly' && plan.active));
        setDealerCarPlanActive(activePlans.some((plan) => plan.plan_id === 'dealer_car_monthly' && plan.active));
      }
      
      const counts = {
        total: myListings.length,
        pending: myListings.filter(l => l.status === 'pending').length,
        approved: myListings.filter(l => l.status === 'approved').length,
        live: myListings.filter(l => l.status === 'live').length,
        ended: myListings.filter(l => l.status === 'ended').length,
        rejected: myListings.filter(l => l.status === 'rejected').length
      };
      setStats(counts);
    } catch (err) {
      console.error('Failed to load seller dashboard details:', err);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to retrieve listings statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellerStats();
  }, [user]);

  const handleActivatePlan = async (planId) => {
    try {
      setPayingPlanId(planId);
      // Temporary no-payment mode:
      // const freshUser = await triggerPayment(planId);
      // if (freshUser) {
      //   if (planId === 'dealer_monthly') setDealerPlanActive(true);
      //   if (planId === 'dealer_car_monthly') setDealerCarPlanActive(true);
      // }
      toast.info('Payment gateway is temporarily disabled. You can continue listing products without activating a plan.');
    } finally {
      setPayingPlanId(null);
    }
  };

  return (
    <div className="dashboard-page" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Greeting Banner */}
      <div className="responsive-banner" style={{
        background: 'linear-gradient(to right, #1F1A1D, #2d0a32)',
        padding: '2.5rem',
        borderRadius: '1rem',
        color: '#ffffff',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Outfit', sans-serif", marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Seller Workspace
          </h1>
          <p style={{ color: '#8B8278', fontSize: '0.95rem' }}>
            List your products, check verification statuses, and trigger live 2-minute bidding sessions.
          </p>
        </div>
        <div className="responsive-banner-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={loadSellerStats}
            disabled={loading}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
          >
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
          <button 
            onClick={() => navigate(`${basePath}/create-listing`)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#10b981' }}
          >
            <PlusCircle size={18} /> Create New Listing
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          color: '#b91c1c',
          padding: '1rem',
          borderRadius: '0.75rem',
          marginBottom: '2rem',
          fontSize: '0.9rem'
        }}>
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <span>{error}</span>
          <button onClick={loadSellerStats} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#6B1B71', fontWeight: 700, cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {user?.role === 'Dealer' && !dealerPlanActive && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid #D8CFC1', backgroundColor: '#F5ECDD', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <ShieldCheck size={24} style={{ color: '#6B1B71' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#1F1A1D' }}>Dealer Monthly Plan (Mobile/Laptop/Bike)</h2>
              <p style={{ margin: '0.25rem 0 0', color: '#8B8278', fontSize: '0.9rem', fontWeight: 650 }}>{"\u20B9"}1,000/month unlimited listings for Mobile, Laptop & Bike.</p>
            </div>
          </div>
          <button type="button" onClick={() => handleActivatePlan('dealer_monthly')} disabled={payingPlanId !== null} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 900 }}>
            {payingPlanId === 'dealer_monthly' ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ShieldCheck size={16} />}
            Activate Plan ({"\u20B9"}1000)
          </button>
        </div>
      )}

      {user?.role === 'Dealer' && !dealerCarPlanActive && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid #D8CFC1', backgroundColor: '#F5ECDD', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <ShieldCheck size={24} style={{ color: '#6B1B71' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#1F1A1D' }}>Dealer Car Monthly Plan (Car)</h2>
              <p style={{ margin: '0.25rem 0 0', color: '#8B8278', fontSize: '0.9rem', fontWeight: 650 }}>{"\u20B9"}1,999/month unlimited listings for Cars.</p>
            </div>
          </div>
          <button type="button" onClick={() => handleActivatePlan('dealer_car_monthly')} disabled={payingPlanId !== null} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 900 }}>
            {payingPlanId === 'dealer_car_monthly' ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ShieldCheck size={16} />}
            Activate Car Plan ({"\u20B9"}1999)
          </button>
        </div>
      )}

      {/* Stats Counters Grid */}
      <div className="responsive-stats-grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
        
        {/* Total Listings */}
        <div 
          className="card hover-card" 
          onClick={() => navigate(`${basePath}/my-listings`)}
          style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', transition: 'transform 0.15s ease' }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#F5ECDD', color: '#6B1B71', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Total Listings</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{loading ? '...' : stats.total}</h3>
          </div>
        </div>

        {/* Pending Review */}
        <div 
          className="card hover-card" 
          onClick={() => navigate(`${basePath}/my-listings?status=pending`)}
          style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', transition: 'transform 0.15s ease' }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Pending Review</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#d97706' }}>{loading ? '...' : stats.pending}</h3>
          </div>
        </div>

        {/* Approved */}
        <div 
          className="card hover-card" 
          onClick={() => navigate(`${basePath}/my-listings?status=approved`)}
          style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', transition: 'transform 0.15s ease' }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Approved</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#10b981' }}>{loading ? '...' : stats.approved}</h3>
          </div>
        </div>

        {/* Active Live Auctions */}
        <div 
          className="card hover-card" 
          onClick={() => navigate(`${basePath}/my-listings?status=live`)}
          style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', transition: 'transform 0.15s ease' }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Gavel size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Bidding Live</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#ef4444' }}>{loading ? '...' : stats.live}</h3>
          </div>
        </div>

        {/* Ended Auctions */}
        <div 
          className="card hover-card" 
          onClick={() => navigate(`${basePath}/my-listings?status=ended`)}
          style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', transition: 'transform 0.15s ease' }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#f1f5f9', color: '#8B8278', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Ended</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#8B8278' }}>{loading ? '...' : stats.ended}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Layout splits */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '2rem' }} className="grid-cols-2 responsive-main-split">
        
        {/* Helper Instructions panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid #D8CFC1', paddingBottom: '0.75rem' }}>
            Seller Verification Guide
          </h2>
          <p style={{ color: '#8B8278', fontSize: '0.95rem', lineHeight: 1.6 }}>
            To keep our marketplace secure and maintain transparency, all listings uploaded must go through our verification system:
          </p>
          <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#8B8278' }}>
            <li><strong>Listing submission:</strong> Select listing type (Car, Bike, Laptop, Mobile), complete specifications, upload media and legally required documents.</li>
            <li><strong>Admin review:</strong> Site managers check documentation completeness and details.</li>
            <li><strong>Approval/Rejection:</strong> Approved items are added to the upcoming roster. Rejected items will show specific review comments.</li>
            <li><strong>Bidding activation:</strong> Trigger the 2-minute live countdown when you are ready to sell.</li>
          </ol>
          <button 
            onClick={() => navigate(`${basePath}/my-listings`)}
            className="btn btn-secondary"
            style={{ width: 'fit-content', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            Manage Listings <ArrowRight size={14} />
          </button>
        </div>

        {/* Dashboard Side Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #D8CFC1', paddingBottom: '0.75rem' }}>
            <Award size={18} style={{ color: '#6B1B71' }} /> Concluded Sales
          </h2>
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <Award size={48} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
            <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1F1A1D' }}>{stats.ended}</h4>
            <p style={{ fontSize: '0.8rem', color: '#8B8278', margin: 0 }}>Finished live bids transactions</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SellerDashboard;

