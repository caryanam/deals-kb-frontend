import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Gavel, AlertCircle, RefreshCw } from 'lucide-react';
import { getProducts } from '../../api/productApi';
import { formatCurrency, safeParseJSON } from '../../utils/helpers';

// Helper component for live ticking countdown on cards
const LiveAuctionCard = ({ product }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');

  const parsedPhotos = safeParseJSON(product.photos, []);
  const displayImage = parsedPhotos.length > 0 ? parsedPhotos[0] : 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=400';

  useEffect(() => {
    if (!product.auction_ends_at) {
      setTimeLeft('--:--');
      return;
    }

    const calculateTime = () => {
      const diff = new Date(product.auction_ends_at) - new Date();
      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }
      const totalSeconds = Math.floor(diff / 1000);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      const pad = (num) => String(num).padStart(2, '0');
      setTimeLeft(`${pad(m)}m ${pad(s)}s`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [product.auction_ends_at]);

  return (
    <div 
      className="landing-category-card"
      style={{ border: '1px solid #fed7d7', backgroundColor: '#fff5f5' }}
    >
      <div className="landing-category-img-container" style={{ position: 'relative' }}>
        <img src={displayImage} alt={product.title} />
        
        {/* LIVE flashing badge */}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          backgroundColor: '#ef4444',
          color: '#ffffff',
          padding: '0.25rem 0.65rem',
          borderRadius: '0.35rem',
          fontSize: '0.7rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.4)',
          animation: 'pulse-live 1.5s infinite'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
          LIVE
        </div>

        {/* Live Timer Countdown */}
        <div style={{
          position: 'absolute',
          bottom: '0.75rem',
          right: '0.75rem',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(4px)',
          color: '#ffffff',
          padding: '0.35rem 0.75rem',
          borderRadius: '0.5rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Clock size={12} style={{ color: '#f87171' }} />
          <span>{timeLeft}</span>
        </div>
      </div>

      <div className="landing-category-info">
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          color: '#ef4444',
          letterSpacing: '0.05em',
          marginBottom: '0.25rem',
          display: 'block'
        }}>
          {product.product_type}
        </span>
        
        <h3 className="landing-category-title" style={{ fontSize: '1.05rem', lineHeight: 1.3, marginBottom: '0.75rem' }}>
          {product.title}
        </h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.03)', padding: '0.65rem', borderRadius: '0.5rem', marginBottom: '1.25rem', border: '1px solid rgba(239, 68, 68, 0.05)' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#718096', display: 'block', fontWeight: 600 }}>CURRENT BID</span>
            <strong style={{ fontSize: '1.1rem', color: '#e53e3e', fontWeight: 800 }}>
              {formatCurrency(product.current_price || product.current_bid || 0)}
            </strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: '#718096', display: 'block', fontWeight: 600 }}>BIDS PLACED</span>
            <strong style={{ fontSize: '0.95rem', color: '#2d3748', fontWeight: 800 }}>
              {product.bid_count || 0} bids
            </strong>
          </div>
        </div>

        <button 
          onClick={() => navigate(`/buyer/auction/${product.product_id}`)}
          style={{
            width: '100%',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)',
            transition: 'background 0.15s ease'
          }}
        >
          <Gavel size={14} /> Place Bid
        </button>
      </div>
    </div>
  );
};

const LiveAuctionSection = () => {
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchLive = async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await getProducts({ status_filter: 'live' });
      setLiveAuctions(data || []);
    } catch (err) {
      console.error('Failed to load live auctions for landing page:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLive();
  }, []);

  return (
    <section className="landing-section" style={{ backgroundColor: '#fff5f5', borderTop: '1px solid #fee2e2', borderBottom: '1px solid #fee2e2' }}>
      <div className="landing-container">
        
        {/* Title Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ textAlign: 'left' }}>
            <h2 className="landing-section-title" style={{ textAlign: 'left', margin: 0 }}>Live Auctions</h2>
            <p className="landing-section-subtitle" style={{ textAlign: 'left', margin: '0.5rem 0 0 0', maxWidth: '500px' }}>
              Engage in focused 2-minute bidding windows. Place bids live and secure verified assets instantly.
            </p>
          </div>
          <button 
            onClick={fetchLive}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#475569',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
            disabled={loading}
          >
            <RefreshCw size={12} className={loading ? 'spin-anim' : ''} /> Refresh
          </button>
        </div>

        {/* Live List Display */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <RefreshCw size={36} className="spin-anim" style={{ color: '#ef4444' }} />
          </div>
        ) : error ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            backgroundColor: '#fff5f5',
            color: '#c53030',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #feb2b2',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            <AlertCircle size={20} />
            <span>Unable to load live auctions. Please try again.</span>
          </div>
        ) : liveAuctions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            backgroundColor: '#ffffff',
            borderRadius: '1rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
          }}>
            <Gavel size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4a5568', margin: '0 0 0.5rem 0' }}>No Live Auctions</h3>
            <p style={{ color: '#718096', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>
              No live auctions are running right now. Check back shortly or explore the marketplace catalog.
            </p>
            <button 
              onClick={() => window.location.href = '/buyer/marketplace'}
              style={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1.25rem',
                borderRadius: '0.5rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Explore Catalog
            </button>
          </div>
        ) : (
          <div className="landing-auctions-grid">
            {liveAuctions.slice(0, 4).map((product) => (
              <LiveAuctionCard key={product.product_id} product={product} />
            ))}
          </div>
        )}

      </div>
      
      <style>{`
        .spin-anim {
          animation: spin 1.2s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

export default LiveAuctionSection;
