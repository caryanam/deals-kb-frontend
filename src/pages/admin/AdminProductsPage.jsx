import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, PlayCircle, BarChart2, ShieldAlert, X, Gavel, Clock, Trophy, Wifi, AlertTriangle } from 'lucide-react';
import { getProducts } from '../../api/productApi';
import { useAuctionSocket } from '../../hooks/useAuctionSocket';
import { formatCurrency, formatDate, PRODUCT_TYPE_LABELS } from '../../utils/helpers';
import { toast } from 'react-toastify';

// Sub-component for Ongoing Auction Live Monitor
const AuctionMonitorPanel = ({ productId, onClose }) => {
  const {
    isConnected,
    auctionStatus,
    currentHighestBid,
    highestBidder,
    bidHistory,
    timer,
    winner
  } = useAuctionSocket(productId);

  const formatTimer = (seconds = 0) => {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      backgroundColor: '#090d16',
      color: '#ffffff',
      borderRadius: '1.25rem',
      padding: '1.5rem',
      border: '1px solid #4a1a50',
      marginTop: '1.5rem',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: isConnected ? '#10b981' : '#ef4444',
            padding: '0.25rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 800
          }}>
            <Wifi size={12} />
            {isConnected ? 'MONITOR SYNCED' : 'CONNECTING...'}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 700 }}>ID: {productId}</span>
        </div>
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#8B8278', cursor: 'pointer', padding: '0.25rem' }}
        >
          <X size={20} />
        </button>
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
        <Gavel size={20} style={{ color: '#10b981' }} /> Live Auction Feed Monitor
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Countdown Card */}
        <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', color: '#8B8278', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            <Clock size={14} /> Time Remaining
          </div>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: timer <= 15 ? '#ef4444' : '#ffffff' }}>
            {formatTimer(timer)}
          </span>
        </div>

        {/* High Bid Card */}
        <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Highest Offer</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>
            {formatCurrency(currentHighestBid)}
          </span>
        </div>
      </div>

      <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.03)', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: '#8B8278', display: 'block', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Lead Bidder</span>
        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>{highestBidder || 'No active bids'}</span>
      </div>

      {/* Bid Ticker Log */}
      <div>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#8B8278', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Bid Ticker Log
        </h4>
        <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.25rem' }}>
          {bidHistory.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: '#8B8278', fontStyle: 'italic', textAlign: 'center', padding: '1.5rem 0' }}>
              No bids have been logged yet.
            </div>
          ) : (
            bidHistory.map((bid, index) => (
              <div 
                key={bid.id || index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.6rem 0.85rem',
                  backgroundColor: index === 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: index === 0 ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: index === 0 ? '#10b981' : '#fff' }}>
                    {bid.bidderName || bid.bidder_name}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#8B8278' }}>{bid.time}</span>
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: index === 0 ? '#10b981' : '#ffffff' }}>
                  {formatCurrency(bid.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export const AdminProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLiveId, setSelectedLiveId] = useState(null);

  const filter = searchParams.get('filter') || 'all';

  const setFilter = (val) => {
    setSearchParams({ filter: val });
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      // Filter only approved, live, and ended products
      const approvedProducts = (data || []).filter(p => 
        p.status === 'approved' || p.status === 'live' || p.status === 'ended'
      );
      setProductsList(approvedProducts);
    } catch (err) {
      console.error('Failed to fetch admin products:', err);
      toast.error('Failed to load products index.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = productsList.filter((prod) => {
    if (filter === 'live') return prod.status === 'live';
    if (filter === 'ended') return prod.status === 'ended';
    return true;
  });

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1F1A1D', fontFamily: "'Outfit', sans-serif" }}>Approved Products</h1>
          <p style={{ color: '#8B8278', fontSize: '0.9rem' }}>Monitor active listings, bidding timers, and concluded auctions on DealsKB</p>
        </div>
        <button 
          onClick={fetchProducts} 
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          disabled={loading}
        >
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #D8CFC1', paddingBottom: '0.75rem' }}>
        {['all', 'live', 'ended'].map((type) => (
          <button
            key={type}
            onClick={() => {
              setFilter(type);
              setSelectedLiveId(null);
            }}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: filter === type ? '#6B1B71' : 'transparent',
              color: filter === type ? '#ffffff' : '#8B8278',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
          >
            {type === 'all' ? 'All Approved' : type === 'live' ? 'Live Auctions' : 'Auction Ended'}
          </button>
        ))}
      </div>

      {/* Main Grid: Products Table + Live Monitor Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedLiveId ? '1.4fr 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Products Table Card */}
        <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#8B8278' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '0.5rem' }} />
              <p>Loading approved listings inventory...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#8B8278' }}>
              <ShieldAlert size={48} style={{ color: '#B2772D', marginBottom: '1rem', opacity: 0.7 }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1F1A1D', marginBottom: '0.25rem' }}>No Products Found</h3>
              <p style={{ fontSize: '0.85rem' }}>No listings matched the selected filter criteria.</p>
            </div>
          ) : (
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #D8CFC1', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#8B8278', textTransform: 'uppercase', fontWeight: 800 }}>Product Title</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#8B8278', textTransform: 'uppercase', fontWeight: 800 }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#8B8278', textTransform: 'uppercase', fontWeight: 800 }}>Base Price</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#8B8278', textTransform: 'uppercase', fontWeight: 800 }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#8B8278', textTransform: 'uppercase', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => {
                  const isLive = prod.status === 'live';
                  const isEnded = prod.status === 'ended';
                  
                  return (
                    <tr 
                      key={prod.product_id} 
                      style={{ 
                        borderBottom: '1px solid #E2DCD0',
                        backgroundColor: selectedLiveId === prod.product_id ? 'rgba(107, 27, 113, 0.04)' : 'transparent',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 800, color: '#1F1A1D', fontSize: '0.92rem' }}>{prod.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#8B8278', marginTop: '0.15rem' }}>Seller: {prod.seller_name || 'Anonymous'}</div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.88rem', fontWeight: 700, color: '#1F1A1D' }}>
                        {PRODUCT_TYPE_LABELS[prod.product_type] || prod.product_type}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.88rem', fontWeight: 800, color: '#1F1A1D' }}>
                        {formatCurrency(prod.expected_price)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {isLive ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            letterSpacing: '0.3px'
                          }}>
                            <span style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
                            LIVE AUCTION
                          </span>
                        ) : isEnded ? (
                          <span style={{
                            backgroundColor: '#e2e8f0',
                            color: '#475569',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 800
                          }}>
                            ENDED
                          </span>
                        ) : (
                          <span style={{
                            backgroundColor: 'rgba(107, 27, 113, 0.1)',
                            color: '#6B1B71',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 800
                          }}>
                            UPCOMING
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        {isLive || isEnded ? (
                          <button
                            onClick={() => setSelectedLiveId(prod.product_id)}
                            className="btn btn-success"
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '0.35rem', 
                              fontSize: '0.8rem', 
                              padding: '0.4rem 0.85rem',
                              backgroundColor: isLive ? '#10b981' : '#6b7280',
                              borderColor: isLive ? '#10b981' : '#6b7280',
                              color: '#ffffff'
                            }}
                          >
                            <PlayCircle size={14} /> {isLive ? 'Monitor Live' : 'Monitor Feed'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#8B8278', fontStyle: 'italic' }}>No active monitoring</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Real-time Monitor Sidebar Panel */}
        {selectedLiveId && (
          <div style={{ position: 'sticky', top: '1.5rem' }}>
            <AuctionMonitorPanel 
              productId={selectedLiveId} 
              onClose={() => setSelectedLiveId(null)} 
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminProductsPage;
