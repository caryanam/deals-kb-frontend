import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gavel, Clock, Trophy, RefreshCw, BarChart2, Share2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuctionSocket } from '../../hooks/useAuctionSocket';
import { useAuth } from '../../hooks/useAuth';
import { getProductById } from '../../api/productApi';
import { formatCurrency, PRODUCT_TYPE_LABELS, safeParseJSON } from '../../utils/helpers';

const formatTimer = (seconds = 0) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const SellerAuctionPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const basePath = user?.role === 'Dealer' ? '/dealer' : '/seller';

  const {
    isConnected,
    auctionStatus,
    currentHighestBid,
    highestBidder,
    bidHistory,
    timer,
    winner,
    reconnect
  } = useAuctionSocket(productId);

  const [product, setProduct] = useState(null);

  const handleShareAuctionLink = async () => {
    const liveUrl = `${window.location.origin}${basePath}/auction/${productId}`;
    try {
      await navigator.clipboard.writeText(liveUrl);
      toast.success('Live auction link copied.');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = liveUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Live auction link copied.');
    }
  };

  // Load associated product details
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const details = await getProductById(productId);
        setProduct(details);
      } catch (err) {
        console.error('Failed to load product details for monitoring:', err);
      }
    };
    loadProduct();
  }, [productId]);

  // Compute total unique bidders
  const uniqueBiddersCount = new Set(bidHistory.map(b => b.bidderName || b.bidder_name)).size;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => navigate(`${basePath}/my-listings`)} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
        >
          <ArrowLeft size={16} /> Back to My Listings
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleShareAuctionLink}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
          >
            <Share2 size={15} />
            Share Live Link
          </button>

          {/* WebSocket Connection Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#10b981' : '#ef4444',
            display: 'inline-block'
          }} />
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
            {isConnected ? 'Monitoring Feed Active' : 'Connecting Socket...'}
          </span>
          {!isConnected && (
            <button onClick={reconnect} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0 }}>
              <RefreshCw size={12} />
            </button>
          )}
          </div>
        </div>
      </div>

      {/* Grid wrapper */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="grid-cols-2">
        
        {/* Left column: product summary info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {product && (
            <div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '60px', borderRadius: '0.35rem', overflow: 'hidden', flexShrink: 0 }}>
                {(() => {
                  const photosArray = safeParseJSON(product.photos, []);
                  const cover = photosArray.length > 0 ? photosArray[0] : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=60';
                  return (
                    <img 
                      src={cover} 
                      alt="" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  );
                })()}
              </div>
              <div>
                <span className="badge badge-approved" style={{ fontSize: '0.65rem' }}>
                  {PRODUCT_TYPE_LABELS[product.product_type] || product.product_type}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.15rem 0' }}>{product.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>
                  Auction status: <strong style={{ textTransform: 'capitalize' }}>{product.status}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Quick Metrics stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Bids Received</span>
              <h4 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.25rem 0', color: '#2563eb' }}>{bidHistory.length}</h4>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Active Bidders</span>
              <h4 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.25rem 0', color: '#10b981' }}>{uniqueBiddersCount}</h4>
            </div>
          </div>

          {/* Read Only warning card */}
          <div className="card" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Clock size={20} style={{ color: '#d97706', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#b45309', display: 'block', marginBottom: '0.25rem' }}>
                  Read-Only Dashboard
                </strong>
                <p style={{ color: '#b45309', fontSize: '0.8rem', lineHeight: 1.45, margin: 0 }}>
                  As the seller of this listing, you are not permitted to submit bids. This console displays live websocket feeds from active buyers. Keep this window open to track progress.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Monitor Console panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{
            background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
            color: '#ffffff',
            padding: '2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            
            {/* Clock Timer */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Timer Clock</span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '0.5rem 1.25rem',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <Clock size={18} style={{ color: timer <= 10 ? '#ef4444' : '#3b82f6' }} />
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: timer <= 10 ? '#ef4444' : '#ffffff' }}>
                  {formatTimer(timer)}
                </span>
              </div>
            </div>

            {/* Current Price */}
            <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Highest Offer</span>
              <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#10b981', margin: '0.25rem 0' }}>
                {formatCurrency(currentHighestBid)}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Lead Bidder: <strong style={{ color: '#ffffff' }}>{highestBidder || 'No bids placed'}</strong>
              </p>
            </div>

            {/* Auction ended / Winner summary */}
            {auctionStatus === 'ended' && (
              <div style={{
                padding: '1.25rem',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                borderRadius: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                marginTop: '0.5rem'
              }}>
                <Trophy size={28} style={{ color: '#10b981' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>Auction Concluded</h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                  Sold to: <strong style={{ color: '#ffffff' }}>{winner || highestBidder}</strong>
                </p>
              </div>
            )}

            {auctionStatus === 'live' && (
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontStyle: 'italic' }}>
                Waiting for buyers to place competing bids...
              </div>
            )}
          </div>

          {/* Bid history log */}
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={16} style={{ color: '#2563eb' }} /> Live Bids Ticker
            </h3>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              overflowY: 'auto',
              maxHeight: '200px',
              paddingRight: '0.25rem'
            }}>
              {bidHistory.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No bids placed yet. Bids will record here automatically.
                </div>
              ) : (
                bidHistory.map((bid, index) => (
                  <div 
                    key={bid.id || index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: index === 0 ? '#eff6ff' : '#f8fafc',
                      border: index === 0 ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                      borderRadius: '0.5rem'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                        {bid.bidderName || bid.bidder_name}
                      </span>
                      <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: 0 }}>{bid.time || 'Just now'}</p>
                    </div>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      color: index === 0 ? '#10b981' : '#475569'
                    }}>
                      {formatCurrency(bid.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SellerAuctionPage;
