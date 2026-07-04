import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gavel, Clock, Trophy, AlertTriangle, ArrowUpRight, Plus, RefreshCw, AlertCircle, PlayCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAuctionSocket } from '../../hooks/useAuctionSocket';
import { getProductById } from '../../api/productApi';
import { formatCurrency, safeParseJSON } from '../../utils/helpers';
import PricingPlanPopup from '../../components/listings/PricingPlanPopup';

const formatTimer = (seconds = 0) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};
import BiddingPassBanner from '../../components/listings/BiddingPassBanner';

export const LiveAuctionPage = () => {
  const { auctionId: productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    isConnected,
    auctionStatus,
    currentHighestBid,
    highestBidder,
    highestBidderId,
    bidHistory,
    timer,
    winner,
    error,
    placeBid,
    reconnect
  } = useAuctionSocket(productId);

  const [product, setProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mediaMode, setMediaMode] = useState('image'); // 'image' or 'video'
  const [activeImage, setActiveImage] = useState('');
  const [showPlans, setShowPlans] = useState(false);
  const [requiredPlan, setRequiredPlan] = useState(null);

  // Load static product headers
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const details = await getProductById(productId);
        setProduct(details);
        const photosArray = safeParseJSON(details.photos, []);
        if (photosArray.length > 0) {
          setActiveImage(photosArray[0]);
        }
      } catch (err) {
        console.error('Failed to load product details for live auction page:', err);
      }
    };
    loadProduct();
  }, [productId]);

  // Set default bid increments on bid updates
  useEffect(() => {
    if (currentHighestBid) {
      setBidAmount(currentHighestBid + 500);
    } else if (product?.expected_price) {
      setBidAmount(product.expected_price);
    }
  }, [currentHighestBid, product]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const parsedAmount = Number(bidAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setLocalError('Please enter a valid positive bid amount.');
      return;
    }

    // Bid Validation Rules
    if (!currentHighestBid || currentHighestBid === 0) {
      if (product && parsedAmount < product.expected_price) {
        setLocalError('Your first bid is below the minimum starting bid for this listing.');
        return;
      }
    } else {
      if (parsedAmount < currentHighestBid + 100) {
        setLocalError(`Your bid must exceed the current highest bid by at least ₹100 (Minimum bid: ${formatCurrency(currentHighestBid + 100)}).`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await placeBid(parsedAmount);
      setLocalError('');
    } catch (err) {
      const required = err.data?.detail?.required_plan || err.data?.required_plan;
      if (err.status === 402 || required) {
        setRequiredPlan(required || null);
        setShowPlans(true);
        setLocalError('');
      } else {
        setLocalError(err.message || 'Failed to place bid.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickIncrement = (increment) => {
    setLocalError('');
    const base = currentHighestBid || (product?.expected_price || 0);
    setBidAmount(base + increment);
  };

  const isBiddingDisabled = submitting || auctionStatus !== 'live' || timer <= 0 || product?.is_cancelled || auctionStatus === 'cancelled';

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top Nav links */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => navigate('/buyer/marketplace')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
        >
          <ArrowLeft size={16} /> Back to Marketplace
        </button>

        {/* Connection status badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#10b981' : '#ef4444',
            display: 'inline-block'
          }} />
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
            {isConnected ? 'Real-Time Sync Active' : 'Connecting WebSocket...'}
          </span>
          {!isConnected && (
            <button onClick={reconnect} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0 }}>
              <RefreshCw size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid splits details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '2rem' }} className="grid-cols-2">
        
        {/* Left column: Product Summary Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {product && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: '260px', backgroundColor: '#f1f5f9', position: 'relative' }}>
                {mediaMode === 'video' && product.video ? (
                  <video 
                    src={product.video} 
                    controls 
                    style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000000' }}
                  />
                ) : (
                  <img 
                    src={activeImage || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=60'} 
                    alt={product.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}

                {/* Video toggle badge */}
                {product.video && (
                  <button
                    type="button"
                    onClick={() => setMediaMode(mediaMode === 'image' ? 'video' : 'image')}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      bottom: '0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      padding: '0.35rem 0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                  >
                    <PlayCircle size={14} style={{ color: '#ef4444' }} />
                    {mediaMode === 'image' ? 'Watch Walkthrough' : 'Show Cover'}
                  </button>
                )}
              </div>
              <div style={{ padding: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Live Auction Room
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0b0f19', fontFamily: "'Outfit', sans-serif", margin: '0.25rem 0' }}>
                  {product.title}
                </h2>
                <p style={{ color: '#475569', fontSize: '0.875rem' }}>
                  Category: <strong>{product.product_type}</strong> &bull; Brand: <strong>{product.brand}</strong> &bull; Model: <strong>{product.model}</strong>
                </p>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.75rem',
                  marginTop: '1rem',
                  fontSize: '0.85rem',
                  color: '#475569',
                  lineHeight: 1.5
                }}>
                  {product.description}
                </div>
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="card" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
            <h4 style={{ color: '#1e40af', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
              <AlertTriangle size={16} /> Bidding Policy
            </h4>
            <p style={{ color: '#1e3a8a', fontSize: '0.8rem', lineHeight: 1.4 }}>
              By placing a bid, you contractually agree to purchase this item at this valuation if yours is the final highest bid registered upon auction conclusion. Bids cannot be retracted.
            </p>
          </div>
        </div>

        {/* Right column: Bidding Room console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {user?.role === 'Buyer' && <BiddingPassBanner productType={product?.product_type || 'mobile'} />}
          
          {/* Main Console Board */}
          <div className="card" style={{
            background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
            color: '#ffffff',
            padding: '2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            
            {(auctionStatus === 'cancelled' || product?.is_cancelled) && (
              <div style={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                padding: '1rem',
                borderRadius: '0.75rem',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={18} />
                  <span>Auction Cancelled by Moderator</span>
                </div>
                {(error || product?.cancel_reason) && (
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 500, opacity: 0.9 }}>
                    Reason: {error || product?.cancel_reason}
                  </p>
                )}
              </div>
            )}

            {/* Clock Timer */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Time Remaining
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '0.5rem 1.5rem',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                animation: timer <= 10 && auctionStatus === 'live' ? 'pulse-live 1s infinite' : 'none'
              }}>
                <Clock size={22} style={{ color: timer <= 10 ? '#ef4444' : '#3b82f6' }} />
                <span style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  fontFamily: "'Outfit', sans-serif",
                  color: timer <= 10 ? '#ef4444' : '#ffffff'
                }}>
                  {formatTimer(timer)}
                </span>
              </div>
            </div>

            {/* Current Valuation Display */}
            <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Current Bid
              </span>
              <h3 style={{ fontSize: '3rem', fontWeight: 900, color: '#10b981', margin: '0.25rem 0', letterSpacing: '-0.03em' }}>
                {formatCurrency(currentHighestBid || 0)}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                Highest Bidder: <strong style={{ color: '#ffffff' }}>{highestBidder || 'No bids placed'}</strong>
              </p>
            </div>

            {/* Submission error message */}
            {(localError || error) && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.75rem',
                borderRadius: '0.75rem',
                color: '#fca5a5',
                fontSize: '0.8rem',
                textAlign: 'left',
                display: 'flex',
                gap: '0.25rem',
                alignItems: 'center'
              }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{localError || error}</span>
              </div>
            )}

            {/* Winner Board overlay */}
            {auctionStatus === 'ended' ? (
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                borderRadius: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}>
                <Trophy size={36} style={{ color: '#10b981' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Auction Ended</h3>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0 }}>
                  Winner:{' '}
                  <strong style={{ color: '#ffffff', fontSize: '1.1rem' }}>
                    {winner || highestBidder || 'No winning bids registered'}
                  </strong>
                </p>
              </div>
            ) : (
              <form onSubmit={handleBidSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#94a3b8' }}>₹</span>
                    <input
                      type="number"
                      className="form-control"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      disabled={isBiddingDisabled}
                      style={{
                        backgroundColor: '#070a10',
                        border: '1px solid #334155',
                        color: '#ffffff',
                        paddingLeft: '2rem',
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        height: '52px'
                      }}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={isBiddingDisabled}
                    style={{ height: '52px', padding: '0 2.25rem', fontSize: '1rem' }}
                  >
                    Bid
                  </button>
                </div>

                {/* Quick Increment Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickIncrement(500)}
                    disabled={isBiddingDisabled}
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.15rem'
                    }}
                  >
                    <Plus size={12} /> ₹500
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickIncrement(1000)}
                    disabled={isBiddingDisabled}
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.15rem'
                    }}
                  >
                    <Plus size={12} /> ₹1k
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickIncrement(2000)}
                    disabled={isBiddingDisabled}
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.15rem'
                    }}
                  >
                    <Plus size={12} /> ₹2k
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Bid History log */}
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Gavel size={16} style={{ color: '#2563eb' }} /> Live Bids Log
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              overflowY: 'auto',
              maxHeight: '260px',
              paddingRight: '0.25rem'
            }}>
              {bidHistory.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No bids have been submitted yet. Be the first to place a bid!
                </div>
              ) : (
                bidHistory.map((bid, index) => (
                  <div 
                    key={bid.id || index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: index === 0 ? '#eff6ff' : '#f8fafc',
                      border: index === 0 ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                      borderRadius: '0.5rem'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                        {bid.bidderName || bid.bidder_name}
                      </span>
                      {index === 0 && (
                        <span style={{
                          marginLeft: '0.5rem',
                          fontSize: '0.65rem',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          padding: '0.15rem 0.35rem',
                          borderRadius: '0.25rem',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          Highest
                        </span>
                      )}
                      <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>{bid.time || 'Just now'}</p>
                    </div>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '1rem',
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

      <PricingPlanPopup
        isOpen={showPlans}
        productType={product?.product_type || requiredPlan?.product_type || 'mobile'}
        requiredPlan={requiredPlan}
        onClose={() => setShowPlans(false)}
      />
    </div>
  );
};

export default LiveAuctionPage;
