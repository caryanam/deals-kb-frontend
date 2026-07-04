import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Gavel, Landmark, Bell, Trophy, ArrowRight, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getProducts } from '../../api/productApi';
import { getMyBids, getMyWins } from '../../api/userApi';
import { getNotifications } from '../../api/notificationApi';

export const BuyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [availableCount, setAvailableCount] = useState(0);
  const [liveCount, setLiveCount] = useState(0);
  const [myBidsCount, setMyBidsCount] = useState(0);
  const [myWinsCount, setMyWinsCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load products (live or upcoming)
      const products = await getProducts({ status_filter: 'live_or_upcoming' });
      setAvailableCount(products.length);
      setLiveCount(products.filter(p => p.status === 'live').length);

      // Load my bids & wins
      const bids = await getMyBids();
      setMyBidsCount(bids.length);

      const wins = await getMyWins();
      setMyWinsCount(wins.length);

      // Load my notifications
      const notifs = await getNotifications();
      setRecentNotifications(notifs.slice(0, 3));
    } catch (err) {
      console.error('Failed to load buyer dashboard metrics:', err);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to retrieve dashboard parameters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(to right, #0f172a, #1e293b)',
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
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Outfit', sans-serif", marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.name || 'Buyer'}!
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
            Browse the marketplace, place live bids on verified products, and track your wins.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={loadDashboardData}
            disabled={loading}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
          >
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
          <button 
            onClick={() => navigate('/buyer/marketplace')}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
          >
            Explore Marketplace <ArrowRight size={16} />
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
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={loadDashboardData} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
        
        {/* Total listings */}
        <div 
          className="card hover-card" 
          onClick={() => navigate('/buyer/marketplace')}
          style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', transition: 'transform 0.15s ease' }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Available Listings</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{loading ? '...' : availableCount}</h3>
          </div>
        </div>

        {/* Live auctions */}
        <div 
          className="card hover-card" 
          onClick={() => navigate('/buyer/marketplace?status=live')}
          style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', transition: 'transform 0.15s ease' }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Gavel size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Live Bidding</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#ef4444' }}>{loading ? '...' : liveCount}</h3>
          </div>
        </div>

        {/* My active bids */}
        <div 
          className="card hover-card" 
          onClick={() => navigate('/buyer/my-bids')}
          style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', transition: 'transform 0.15s ease' }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Landmark size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>My Bids</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{loading ? '...' : myBidsCount}</h3>
          </div>
        </div>

        {/* My wins */}
        <div 
          className="card hover-card" 
          onClick={() => navigate('/buyer/my-bids?tab=won')}
          style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', transition: 'transform 0.15s ease' }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Auctions Won</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#10b981' }}>{loading ? '...' : myWinsCount}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Layout splits */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }} className="grid-cols-2">
        {/* Marketplace Shortcut info */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            Live Bidding Guide
          </h2>
          <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Welcome to DealsKB live auction bidding. Our auctions run with a <strong>2-minute countdown timer</strong>. If a bid is placed within the live timer, the clock extends to allow competing bids to occur. 
          </p>
          <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '0.75rem', borderLeft: '4px solid #2563eb', fontSize: '0.9rem', color: '#1e3a8a' }}>
            <strong>Quick tip:</strong> Ensure you are logged in and have stable connectivity during the 2-minute live auction windows to ensure bids submit correctly.
          </div>
          <button 
            onClick={() => navigate('/buyer/marketplace')}
            className="btn btn-secondary"
            style={{ width: 'fit-content', marginTop: 'auto' }}
          >
            Go to Marketplace
          </button>
        </div>

        {/* Notifications list */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} style={{ color: '#2563eb' }} /> Recent Alerts
            </h2>
            <button onClick={() => navigate('/buyer/notifications')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentNotifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                No recent notifications.
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div key={notif.id || notif.notification_id} style={{
                  padding: '0.85rem',
                  backgroundColor: notif.read ? 'transparent' : '#f0f9ff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <p style={{ color: '#334155', fontWeight: notif.read ? 400 : 600 }}>{notif.message}</p>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} /> {notif.created_at || 'Just now'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
