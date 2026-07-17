import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, PlayCircle, BarChart2, ShieldAlert, X, Gavel, Clock, Trophy, Wifi, AlertTriangle, Film, FileText } from 'lucide-react';
import { getProducts } from '../../api/productApi';
import { useAuctionSocket } from '../../hooks/useAuctionSocket';
import { formatCurrency, formatDate, PRODUCT_TYPE_LABELS, safeParseJSON } from '../../utils/helpers';
import { normalizeImageUrl, handleImageError } from '../../utils/imageUtils';
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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);

  const filter = searchParams.get('filter') || 'all';

  const renderModalSpecs = () => {
    if (!selectedProduct) return null;
    const specs = safeParseJSON(selectedProduct.specifications, {});

    if (selectedProduct.product_type === 'car' || selectedProduct.product_type === 'bike') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }} className="grid-cols-2">
          <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Brand/Model</span>
            <p style={{ fontWeight: 700, margin: 0 }}>{selectedProduct.brand} {selectedProduct.model}</p>
          </div>
          <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Year</span>
            <p style={{ fontWeight: 700, margin: 0 }}>{specs.year || 'N/A'}</p>
          </div>
          <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Odometer</span>
            <p style={{ fontWeight: 700, margin: 0 }}>{specs.km_driven ? Number(specs.km_driven).toLocaleString() + ' km' : 'N/A'}</p>
          </div>
          <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Product Price</span>
            <p style={{ fontWeight: 700, margin: 0 }}>{formatCurrency(selectedProduct.product_price)}</p>
          </div>
          <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Expected Price</span>
            <p style={{ fontWeight: 700, margin: 0 }}>{formatCurrency(selectedProduct.expected_price)}</p>
          </div>
          <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Ownership</span>
            <p style={{ fontWeight: 700, margin: 0 }}>{specs.ownership || 'N/A'}</p>
          </div>
          <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Fuel Type</span>
            <p style={{ fontWeight: 700, margin: 0 }}>{specs.fuel_type || 'N/A'}</p>
          </div>
          <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Accident Logs</span>
            <p style={{ fontWeight: 700, color: specs.accidental === 'Yes' || specs.accidental === 'Accidental' ? '#ef4444' : '#10b981', margin: 0 }}>{specs.accidental || 'N/A'}</p>
          </div>
          <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Seller Account</span>
            <p style={{ fontWeight: 700, margin: 0 }}>{selectedProduct.seller_name || 'Seller'}</p>
          </div>
        </div>
      );
    } else {
      // Laptop / Mobile Specs
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }} className="grid-cols-2">
          <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Brand/Model</span>
            <p style={{ fontWeight: 700, margin: 0 }}>{selectedProduct.brand} {selectedProduct.model}</p>
          </div>
          {specs.processor && (
            <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Processor</span>
              <p style={{ fontWeight: 700, margin: 0 }}>{specs.processor}</p>
            </div>
          )}
          <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>RAM</span>
            <p style={{ fontWeight: 700, margin: 0 }}>{specs.ram || 'N/A'}</p>
          </div>
          <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Storage</span>
            <p style={{ fontWeight: 700, margin: 0 }}>{specs.storage || 'N/A'}</p>
          </div>
          {specs.battery_backup && (
            <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Battery Backup</span>
              <p style={{ fontWeight: 700, margin: 0 }}>{specs.battery_backup}</p>
            </div>
          )}
          {specs.imei_number && (
            <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>IMEI Number</span>
              <p style={{ fontWeight: 700, margin: 0 }}>{specs.imei_number}</p>
            </div>
          )}
          {specs.imei_available !== undefined && (
            <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>IMEI Verified</span>
              <p style={{ fontWeight: 700, margin: 0 }}>{specs.imei_available ? 'Yes' : 'No'}</p>
            </div>
          )}
          <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Product Price</span>
            <p style={{ fontWeight: 700, margin: 0 }}>{formatCurrency(selectedProduct.product_price)}</p>
          </div>
          <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Expected Valuation</span>
            <p style={{ fontWeight: 700, margin: 0 }}>{formatCurrency(selectedProduct.expected_price)}</p>
          </div>
          {specs.warranty_status && (
            <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Warranty</span>
              <p style={{ fontWeight: 700, margin: 0 }}>{specs.warranty_status}</p>
            </div>
          )}
          {specs.bill_available && (
            <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Bill Available</span>
              <p style={{ fontWeight: 700, margin: 0 }}>{specs.bill_available}</p>
            </div>
          )}
        </div>
      );
    }
  };

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
    if (filter === 'upcoming') return prod.status === 'approved';
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
        {['all', 'upcoming', 'live', 'ended'].map((type) => (
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
            {type === 'all' ? 'All Approved' : type === 'upcoming' ? 'Yet to Start' : type === 'live' ? 'Live Auctions' : 'Auction Ended'}
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
                        <div 
                          onClick={() => setSelectedProduct(prod)}
                          style={{ fontWeight: 800, color: '#6B1B71', fontSize: '0.92rem', cursor: 'pointer', textDecoration: 'underline' }}
                          title="Click to view details & files"
                        >
                          {prod.title}
                        </div>
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

      {/* PRODUCT DETAILS INSPECTION MODAL */}
      {selectedProduct && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 15, 25, 0.75)',
          zIndex: 150,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: '#FAF6EA',
            borderRadius: '1.25rem',
            width: '100%',
            maxWidth: '900px',
            maxHeight: '85vh',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #D8CFC1',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #D8CFC1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAF6EA'
            }}>
              <div>
                <span className="badge badge-approved" style={{ textTransform: 'uppercase' }}>Product Details ({selectedProduct.status})</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>
                  {selectedProduct.title}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B8278' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Photos */}
              <div>
                <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Photos (Click to preview)</span>
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {safeParseJSON(selectedProduct.photos, []).map((img, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setPreviewMedia({ type: 'image', src: normalizeImageUrl(img), title: `Product Photo ${idx + 1}` })}
                      style={{
                        width: '180px',
                        height: '130px',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '1px solid #cbd5e1',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      <img src={normalizeImageUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={handleImageError} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Walkthrough */}
              {selectedProduct.video && (
                <div style={{ padding: '1rem', border: '1px dashed #cbd5e1', borderRadius: '0.75rem', backgroundColor: '#FAF6EA' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#4a1a50', display: 'block', marginBottom: '0.5rem' }}>Video Walkthrough:</strong>
                  <div 
                    onClick={() => setPreviewMedia({ type: 'video', src: normalizeImageUrl(selectedProduct.video), title: 'Product Video Walkthrough' })}
                    style={{
                      width: '240px',
                      height: '135px',
                      backgroundColor: '#1F1A1D',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      border: '1px solid #D8CFC1'
                    }}
                  >
                    <Film size={28} style={{ color: '#ffffff', zIndex: 2 }} />
                    <span style={{ fontSize: '0.7rem', color: '#ffffff', position: 'absolute', bottom: '8px', zIndex: 2, fontWeight: 700 }}>Play Walkthrough Video</span>
                    <video src={normalizeImageUrl(selectedProduct.video)} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, position: 'absolute', inset: 0 }} muted />
                  </div>
                </div>
              )}

              {/* Specs */}
              {renderModalSpecs()}

              {/* Attached documents */}
              {(() => {
                const docs = safeParseJSON(selectedProduct.documents, {});
                if (!docs || Object.keys(docs).length === 0) return null;
                return (
                  <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>Attached Verification Documents (Click to preview)</span>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {Object.entries(docs).map(([key, val]) => {
                        const valStr = String(val || '').toLowerCase();
                        const isPdf = valStr.includes('application/pdf') || valStr.includes('.pdf');
                        const isImg = valStr.includes('image/') || valStr.includes('.jpg') || valStr.includes('.png') || valStr.includes('.jpeg') || valStr.includes('.webp');
                        const docTitle = key.replace('_', ' ').toUpperCase();

                        return (
                          <button 
                            key={key}
                            type="button"
                            onClick={() => {
                              const normalizedVal = normalizeImageUrl(val);
                              if (isPdf) {
                                window.open(normalizedVal, '_blank');
                              } else if (isImg) {
                                setPreviewMedia({ type: 'image', src: normalizedVal, title: docTitle });
                              } else {
                                window.open(normalizedVal, '_blank');
                              }
                            }}
                            style={{
                              padding: '0.75rem 1rem',
                              border: '1.5px dashed #6B1B71',
                              borderRadius: '0.5rem',
                              backgroundColor: '#ffffff',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: '#6B1B71'
                            }}
                          >
                            <FileText size={16} />
                            <span>{docTitle}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderTop: '1px solid #D8CFC1',
              backgroundColor: '#FAF6EA',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEDIA PREVIEW MODAL OVERLAY */}
      {previewMedia && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 15, 25, 0.9)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: '#FAF6EA',
            borderRadius: '1.25rem',
            width: '100%',
            maxWidth: '800px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            border: '1px solid #D8CFC1',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #D8CFC1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAF6EA'
            }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1F1A1D' }}>{previewMedia.title}</span>
              <button 
                onClick={() => setPreviewMedia(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B8278' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Viewer Content */}
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1F1A1D' }}>
              {previewMedia.type === 'image' && (
                <img 
                  src={previewMedia.src} 
                  alt="" 
                  style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '0.5rem' }} 
                  onError={handleImageError}
                />
              )}
              {previewMedia.type === 'video' && (
                <video 
                  src={previewMedia.src} 
                  controls 
                  autoPlay
                  style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '0.5rem' }} 
                />
              )}
              {previewMedia.type === 'pdf' && (
                <iframe 
                  src={previewMedia.src} 
                  style={{ width: '100%', height: '60vh', border: 'none', borderRadius: '0.5rem', backgroundColor: '#FAF6EA' }} 
                  title="PDF Preview"
                />
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#FAF6EA', borderTop: '1px solid #D8CFC1', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={() => setPreviewMedia(null)}
                className="btn btn-primary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
