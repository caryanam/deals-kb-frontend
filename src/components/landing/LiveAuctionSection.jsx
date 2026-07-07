import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Lock, AlertCircle, RefreshCw, Zap, ArrowRight, ImageOff } from 'lucide-react';
import api from '../../api/axiosClient';
import { formatCurrency, safeParseJSON } from '../../utils/helpers';

const PURPLE = '#6B1B71';
const PURPLE_HOVER = '#7A2181';

const sampleAuctions = [
  {
    product_id: 'sample-1',
    title: '2022 Porsche 911 Carrera S',
    product_type: 'Car',
    current_price: 14500000,
    bid_count: 14,
    auction_ends_at: new Date(Date.now() + 1800000).toISOString(),
    photos: JSON.stringify(['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500'])
  },
  {
    product_id: 'sample-2',
    title: '2023 Ducati Panigale V4',
    product_type: 'Bike',
    current_price: 2650000,
    bid_count: 9,
    auction_ends_at: new Date(Date.now() + 2400000).toISOString(),
    photos: JSON.stringify(['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500'])
  },
  {
    product_id: 'sample-3',
    title: 'Apple iPhone 15 Pro Max 512GB',
    product_type: 'Mobile',
    current_price: 112000,
    bid_count: 22,
    auction_ends_at: new Date(Date.now() + 1200000).toISOString(),
    photos: JSON.stringify(['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'])
  },
  {
    product_id: 'sample-4',
    title: 'MacBook Pro 16" M3 Max 36GB',
    product_type: 'Laptop',
    current_price: 245000,
    bid_count: 18,
    auction_ends_at: new Date(Date.now() + 3100000).toISOString(),
    photos: JSON.stringify(['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'])
  }
];

// Helper component for live ticking countdown on cards with hover exposure
const LiveAuctionCard = ({ product }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const parsedPhotos = safeParseJSON(product.photos, []);
  const displayImage = product.img || (parsedPhotos.length > 0 ? parsedPhotos[0] : null);

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        border: isHovered ? '2px solid #6B1B71' : '1px solid #fee2e2',
        backgroundColor: '#ffffff',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'none',
        boxShadow: isHovered ? '0 20px 35px -10px rgba(107, 27, 113, 0.28)' : '0 4px 12px rgba(0,0,0,0.05)',
        cursor: 'pointer'
      }}
    >
      <div className="landing-category-img-container" style={{ position: 'relative', overflow: 'hidden', height: '200px', backgroundColor: '#f1f5f9' }}>
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={product.title} 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isHovered ? 'scale(1.08)' : 'scale(1)'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            color: '#64748b',
            backgroundColor: '#f8fafc',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isHovered ? 'scale(1.04)' : 'scale(1)'
          }}>
            <ImageOff size={30} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>No image uploaded</span>
          </div>
        )}
        
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
          boxShadow: '0 4px 10px rgba(239, 68, 68, 0.45)'
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            animation: 'pulse-live 1.2s infinite'
          }} />
          LIVE BIDDING
        </div>

        {/* Live Timer Countdown */}
        <div style={{
          position: 'absolute',
          bottom: '0.75rem',
          right: '0.75rem',
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(6px)',
          color: '#ffffff',
          padding: '0.35rem 0.75rem',
          borderRadius: '0.5rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <Clock size={12} style={{ color: '#f87171' }} />
          <span>{timeLeft}</span>
        </div>

        {/* Hover exposure overlay */}
        {isHovered && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(107, 27, 113, 0.75) 0%, transparent 70%)',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '1rem',
            color: '#ffffff',
            transition: 'opacity 0.3s ease'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Zap size={13} style={{ color: '#fbbf24' }} /> Active Live Room • Real-Time Increments
            </span>
          </div>
        )}
      </div>

      <div className="landing-category-info" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#ef4444',
            letterSpacing: '0.05em'
          }}>
            {product.product_type}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            ● {product.bid_count || 0} Live Bids
          </span>
        </div>
        
        <h3 className="landing-category-title" style={{ fontSize: '1.05rem', lineHeight: 1.3, marginBottom: '0.75rem', fontWeight: 800, color: '#1F1A1D' }}>
          {product.title}
        </h3>

        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          backgroundColor: isHovered ? 'rgba(107, 27, 113, 0.06)' : 'rgba(239, 68, 68, 0.03)',
          padding: '0.65rem 0.85rem',
          borderRadius: '0.6rem',
          marginBottom: '1rem',
          border: isHovered ? '1px solid rgba(107, 27, 113, 0.2)' : '1px solid rgba(239, 68, 68, 0.06)',
          transition: 'all 0.3s ease'
        }}>
          <div>
            <span style={{ fontSize: '0.68rem', color: '#8B8278', display: 'block', fontWeight: 700 }}>CURRENT HIGHEST BID</span>
            <strong style={{ fontSize: '1.15rem', color: isHovered ? '#6B1B71' : '#e53e3e', fontWeight: 900 }}>
              {formatCurrency(product.current_price || product.current_bid || product.starting_price || 0)}
            </strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.68rem', color: '#8B8278', display: 'block', fontWeight: 700 }}>STATUS</span>
            <strong style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 800 }}>
              Active
            </strong>
          </div>
        </div>

        {/* Read-Only CTA: Sign In to Place Live Bid */}
        <button 
          onClick={() => navigate('/login')}
          style={{
            width: '100%',
            backgroundColor: isHovered ? PURPLE_HOVER : PURPLE,
            color: '#ffffff',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '0.6rem',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            boxShadow: isHovered ? '0 6px 16px rgba(107, 27, 113, 0.4)' : '0 4px 10px rgba(107, 27, 113, 0.25)',
            transition: 'all 0.2s ease'
          }}
        >
          <Lock size={14} /> Sign In to Bid Now <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

const LiveAuctionSection = () => {
  const navigate = useNavigate();
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchLive = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await api.get('/products', { params: { status_filter: 'live' } });
      const data = res.data?.products || res.data || [];
      if (Array.isArray(data) && data.length > 0) {
        setLiveAuctions(data);
      } else {
        setLiveAuctions([]);
      }
    } catch (err) {
      console.warn('Failed to fetch public live list:', err);
      setLiveAuctions([]);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              REAL-TIME AUCTION ROOMS
            </div>
            <h2 className="landing-section-title" style={{ textAlign: 'left', margin: 0 }}>Live Auctions</h2>
            <p className="landing-section-subtitle" style={{ textAlign: 'left', margin: '0.4rem 0 0 0', maxWidth: '560px' }}>
              Focused 2-minute bidding windows. Hover over any auction card to expose active real-time bids and countdown timers.
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
              color: '#8B8278',
              padding: '0.55rem 1.1rem',
              borderRadius: '0.6rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease'
            }}
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? 'spin-anim' : ''} /> Refresh Bids
          </button>
        </div>

        {/* Live List Display */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <RefreshCw size={36} className="spin-anim" style={{ color: PURPLE }} />
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
            padding: '3rem 1.5rem',
            border: '1.5px dashed #fee2e2',
            borderRadius: '1rem',
            backgroundColor: '#ffffff',
            color: '#8B8278'
          }}>
            <Clock size={40} style={{ color: '#fca5a5', marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#c53030', margin: '0 0 0.25rem 0' }}>No active live auctions</h4>
            <p style={{ fontSize: '0.85rem', color: '#8B8278', margin: 0 }}>There are currently no auctions running in real-time. Check back soon!</p>
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
        @keyframes pulse-live {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }
      `}</style>
    </section>
  );
};

export default LiveAuctionSection;
