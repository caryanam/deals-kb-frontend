import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Gavel, Landmark, Bell, Trophy, ArrowRight, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { getProducts } from '../../api/productApi';
import { getMyBids, getMyWins } from '../../api/userApi';
import { getNotifications } from '../../api/notificationApi';

export const BuyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: loadingProducts, error: errorProducts } = useQuery({
    queryKey: ['products', { status_filter: 'live_or_upcoming' }],
    queryFn: () => getProducts({ status_filter: 'live_or_upcoming' })
  });

  const { data: bids = [], isLoading: loadingBids, error: errorBids } = useQuery({
    queryKey: ['myBids'],
    queryFn: getMyBids,
    enabled: !!user
  });

  const { data: wins = [], isLoading: loadingWins, error: errorWins } = useQuery({
    queryKey: ['myWins'],
    queryFn: getMyWins,
    enabled: !!user
  });

  const { data: notificationsData = [], isLoading: loadingNotifications, error: errorNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: !!user
  });

  const loading = loadingProducts || loadingBids || loadingWins || loadingNotifications;
  const errorObj = errorProducts || errorBids || errorWins || errorNotifications;
  const error = errorObj ? (errorObj.response?.data?.detail || errorObj.response?.data?.message || 'Failed to retrieve dashboard parameters.') : null;

  const availableCount = products.length;
  const liveCount = products.filter(p => p.status === 'live').length;
  const myBidsCount = bids.length;
  const myWinsCount = wins.length;
  
  const notifications = Array.isArray(notificationsData) ? notificationsData : [];
  const recentNotifications = notifications.slice(0, 3);

  const loadDashboardData = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['myBids'] });
    queryClient.invalidateQueries({ queryKey: ['myWins'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return (
    <div className="dashboard-page" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Welcome Banner */}
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
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Outfit', sans-serif", marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.name || 'Buyer'}!
          </h1>
          <p style={{ color: '#8B8278', fontSize: '0.95rem', margin: 0 }}>
            Browse the marketplace, place live bids on verified products, and track your wins.
          </p>
        </div>
        <div className="responsive-banner-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
          <button onClick={loadDashboardData} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#6B1B71', fontWeight: 700, cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="responsive-stats-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
        
        {/* Total listings */}
        <div 
          className="card hover-card" 
          onClick={() => navigate('/buyer/marketplace')}
          style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', transition: 'transform 0.15s ease' }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#F5ECDD', color: '#6B1B71', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Available Listings</span>
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
            <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Live Bidding</span>
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
            <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>My Bids</span>
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
            <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Auctions Won</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#10b981' }}>{loading ? '...' : myWinsCount}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Layout splits */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }} className="grid-cols-2 responsive-main-split">
        {/* Marketplace Shortcut info */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', borderBottom: '1px solid #D8CFC1', paddingBottom: '0.75rem' }}>
            Live Bidding Guide
          </h2>
          <p style={{ color: '#8B8278', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Welcome to DealsKB live auction bidding. Our auctions run with a <strong>2-minute countdown timer</strong>. If a bid is placed within the live timer, the clock extends to allow competing bids to occur. 
          </p>
          <div style={{ padding: '1rem', backgroundColor: '#F5ECDD', borderRadius: '0.75rem', borderLeft: '4px solid #6B1B71', fontSize: '0.9rem', color: '#1e3a8a' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #D8CFC1', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} style={{ color: '#6B1B71' }} /> Recent Alerts
            </h2>
            <button onClick={() => navigate('/buyer/notifications')} style={{ background: 'none', border: 'none', color: '#6B1B71', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentNotifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#8B8278', fontSize: '0.9rem' }}>
                No recent notifications.
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div key={notif.id || notif.notification_id} style={{
                  padding: '0.85rem',
                  backgroundColor: notif.read ? 'transparent' : '#f0f9ff',
                  border: '1px solid #D8CFC1',
                  borderRadius: '0.75rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <p style={{ color: '#4a1a50', fontWeight: notif.read ? 400 : 600 }}>{notif.message}</p>
                  <span style={{ fontSize: '0.75rem', color: '#8B8278', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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

