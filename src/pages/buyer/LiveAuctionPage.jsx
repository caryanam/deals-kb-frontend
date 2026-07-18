import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gavel, Clock, Trophy, AlertTriangle, RefreshCw, AlertCircle, PlayCircle, ImageOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAuctionSocket } from '../../hooks/useAuctionSocket';
import { getProductById } from '../../api/productApi';
import { formatCurrency, safeParseJSON, formatRelativeTime, getNameInitials } from '../../utils/helpers';
import { normalizeImageUrl, normalizePhotosArray, handleImageError } from '../../utils/imageUtils';

const formatTimer = (seconds = 0) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const INCREMENTS = {
  mobile: 50,
  laptop: 100,
  bike: 500,
  car: 1000
};

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
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mediaMode, setMediaMode] = useState('image'); // 'image' or 'video'
  const [activeImage, setActiveImage] = useState('');

  // Trigger periodic updates for relative times
  const [timeTick, setTimeTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeTick(prev => prev + 1);
    }, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // Load static product headers
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const details = await getProductById(productId);
        setProduct(details);
        const photosArray = normalizePhotosArray(details.photos, []);
        if (photosArray.length > 0) {
          setActiveImage(photosArray[0]);
        }
      } catch (err) {
        console.error('Failed to load product details for live auction page:', err);
      }
    };
    loadProduct();
  }, [productId]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const parsedAmount = nextBidAmount;
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setLocalError('Please enter a valid positive bid amount.');
      return;
    }

    // Bid Validation Rules
    if (!currentHighestBid || currentHighestBid === 0) {
      if (parsedAmount < startingBidAmount) {
        setLocalError(`Your first bid must be at least ${formatCurrency(startingBidAmount)}.`);
        return;
      }
    } else {
      const inc = INCREMENTS[product?.product_type] || 100;
      if (parsedAmount < currentHighestBid + inc) {
        setLocalError(`Your bid must exceed the current highest bid by at least ${formatCurrency(inc)} (Minimum bid: ${formatCurrency(currentHighestBid + inc)}).`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await placeBid(parsedAmount);
      setLocalError('');
    } catch (err) {
      // Temporary no-payment mode:
      // const required = err.data?.detail?.required_plan || err.data?.required_plan;
      // if (err.status === 402 || required) {
      //   setRequiredPlan(required || null);
      //   setShowPlans(true);
      //   setLocalError('');
      // } else {
      //   setLocalError(err.message || 'Failed to place bid.');
      // }
      setLocalError(err.message || 'Failed to place bid.');
    } finally {
      setSubmitting(false);
    }
  };

  const typeKey = product?.product_type?.toLowerCase()?.trim();
  const incVal = INCREMENTS[typeKey] || 100;
  const baseBid = currentHighestBid || 0;
  const startingBidAmount = Math.ceil(Number(product?.expected_price || 0) * 0.5);
  const nextBidAmount = baseBid > 0 ? baseBid + incVal : startingBidAmount;

  const isBiddingDisabled = submitting || auctionStatus !== 'live' || timer <= 0 || product?.is_cancelled || auctionStatus === 'cancelled';

  return (
    <div className="dashboard-page" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top Nav links */}
      <div className="responsive-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => navigate('/buyer/marketplace')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#8B8278', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
        >
          <ArrowLeft size={16} /> Back to Marketplace
        </button>

        {/* Connection status badge */}
        <div className="responsive-page-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#10b981' : '#ef4444',
            display: 'inline-block'
          }} />
          <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700 }}>
            {isConnected ? 'Real-Time Sync Active' : 'Connecting WebSocket...'}
          </span>
          {!isConnected && (
            <button onClick={reconnect} style={{ background: 'none', border: 'none', color: '#6B1B71', cursor: 'pointer', padding: 0 }}>
              <RefreshCw size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid splits details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '2rem' }} className="grid-cols-2 responsive-auction-grid">
        
        {/* Left column: Product Summary Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {product && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: '260px', backgroundColor: '#f1f5f9', position: 'relative' }}>
                {mediaMode === 'video' && product.video ? (
                  <video 
                    src={normalizeImageUrl(product.video)} 
                    controls 
                    style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000000' }}
                  />
                ) : activeImage ? (
                  <img 
                    src={activeImage} 
                    alt={product.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={handleImageError}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    color: '#64748b',
                    backgroundColor: '#f8fafc'
                  }}>
                    <ImageOff size={48} />
                    <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>No image uploaded</span>
                  </div>
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
                <span style={{ fontSize: '0.75rem', color: '#6B1B71', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Live Auction Room
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1F1A1D', fontFamily: "'Outfit', sans-serif", margin: '0.25rem 0' }}>
                  {product.title}
                </h2>
                <p style={{ color: '#8B8278', fontSize: '0.875rem' }}>
                  Category: <strong>{product.product_type}</strong> &bull; Brand: <strong>{product.brand}</strong> &bull; Model: <strong>{product.model}</strong>
                </p>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#FAF6EA',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.75rem',
                  marginTop: '1rem',
                  fontSize: '0.85rem',
                  color: '#8B8278',
                  lineHeight: 1.5
                }}>
                  {product.description}
                </div>
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="card" style={{ backgroundColor: '#F5ECDD', borderColor: '#D8CFC1' }}>
            <h4 style={{ color: '#7A2181', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
              <AlertTriangle size={16} /> Bidding Policy
            </h4>
            <p style={{ color: '#1e3a8a', fontSize: '0.8rem', lineHeight: 1.4 }}>
              By placing a bid, you contractually agree to purchase this item at this valuation if yours is the final highest bid registered upon auction conclusion. Bids cannot be retracted.
            </p>
          </div>
        </div>

        {/* Right column: Bidding Room console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Console Board */}
          <div className="card" style={{
            background: 'linear-gradient(to bottom, #1F1A1D, #2d0a32)',
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
                <div className="responsive-page-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                <Clock size={22} style={{ color: timer <= 10 ? '#ef4444' : '#965284' }} />
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
              <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Current Bid
              </span>
              <h3 style={{ fontSize: '3rem', fontWeight: 900, color: '#10b981', margin: '0.25rem 0', letterSpacing: '-0.03em' }}>
                {formatCurrency(currentHighestBid || 0)}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#8B8278', margin: 0 }}>
                Highest Bidder:{' '}<span className="bidder-avatar-row">{highestBidder ? <span className="bidder-avatar-chip">{getNameInitials(highestBidder)}</span> : <strong style={{ color: '#ffffff' }}>No bids placed</strong>}</span>
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
                <p style={{ fontSize: '0.9rem', color: '#8B8278', margin: 0 }}>
                  Winner:{' '}
                  {winner || highestBidder ? (
                    <span className="bidder-avatar-chip" style={{ fontSize: '0.9rem', minWidth: '2.35rem', height: '2.35rem' }}>
                      {winner ? getNameInitials(winner) : getNameInitials(highestBidder)}
                    </span>
                  ) : (
                    <strong style={{ color: '#ffffff', fontSize: '1.1rem' }}>No winning bids registered</strong>
                  )}
                </p>
                {(highestBidderId === user?.user_id || highestBidderId === user?.id) && (
                  <button
                    onClick={() => navigate(`/buyer/listings/${productId}`)}
                    className="btn btn-primary"
                    style={{
                      marginTop: '0.75rem',
                      width: '100%',
                      backgroundColor: '#6B1B71',
                      borderColor: '#6B1B71',
                      fontWeight: 800,
                      borderRadius: '0.5rem',
                      color: '#ffffff'
                    }}
                  >
                    Chat with Seller
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleBidSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={isBiddingDisabled}
                  style={{
                    width: '100%',
                    minHeight: '64px',
                    fontSize: '1.08rem',
                    fontWeight: 800,
                    borderRadius: '0.9rem',
                    backgroundColor: '#10b981',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                >
                  Bid {formatCurrency(incVal)}
                </button>
              </form>
            )}
          </div>

          {/* Bid History log */}
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid #D8CFC1', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Gavel size={16} style={{ color: '#6B1B71' }} /> Live Bids Log
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
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#8B8278', fontSize: '0.85rem' }}>
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
                      backgroundColor: index === 0 ? '#F5ECDD' : '#FAF6EA',
                      border: index === 0 ? '1px solid #D8CFC1' : '1px solid #D8CFC1',
                      borderRadius: '0.5rem'
                    }}
                  >
                    <div>
                      <div className="bidder-avatar-row">
                        <span className="bidder-avatar-chip bidder-avatar-chip--compact">
                          {getNameInitials(bid.bidderName || bid.bidder_name)}
                        </span>
                        {index === 0 && (
                        <span style={{
                          marginLeft: '0.5rem',
                          fontSize: '0.65rem',
                          backgroundColor: '#6B1B71',
                          color: '#ffffff',
                          padding: '0.15rem 0.35rem',
                          borderRadius: '0.25rem',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          Highest
                        </span>
                      )}
                      </div>
                      <p style={{ fontSize: '0.7rem', color: '#8B8278', margin: 0 }}>{formatRelativeTime(bid.created_at || bid.time)}</p>
                    </div>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: index === 0 ? '#10b981' : '#8B8278'
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

export default LiveAuctionPage;

