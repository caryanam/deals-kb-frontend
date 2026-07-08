import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart2, Clock, Eye, RefreshCw, Trophy } from 'lucide-react';
import { getPublicAuctionBids, getPublicAuctionProduct } from '../../api/productApi';
import { formatCurrency, PRODUCT_TYPE_LABELS, safeParseJSON } from '../../utils/helpers';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/api/ws/auction';

const formatTimer = (seconds = 0) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const secondsUntil = (dateValue) => {
  if (!dateValue) return 0;
  const diff = new Date(dateValue).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 1000));
};

export const PublicAuctionWatchPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [product, setProduct] = useState(null);
  const [bids, setBids] = useState([]);
  const [timer, setTimer] = useState(0);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const syncAuctionData = useCallback(async (silent = false) => {
    try {
      if (!silent) setError('');
      const [productDetails, bidRows] = await Promise.all([
        getPublicAuctionProduct(productId),
        getPublicAuctionBids(productId),
      ]);
      setProduct(productDetails);
      setBids(Array.isArray(bidRows) ? bidRows : []);
      setTimer(secondsUntil(productDetails.auction_end));
    } catch (err) {
      if (!silent) {
        setError(err.response?.data?.detail || err.response?.data?.message || 'Unable to load this live auction.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    syncAuctionData();
    const interval = setInterval(() => syncAuctionData(true), 1000);
    return () => clearInterval(interval);
  }, [syncAuctionData]);

  useEffect(() => {
    if (!productId) return undefined;
    const socket = new WebSocket(`${WS_BASE_URL}/${productId}`);
    socketRef.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onerror = () => setConnected(false);
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const eventName = payload.event || payload.type;
        const data = payload.data || payload;

        if (eventName === 'state') {
          setProduct((prev) => ({
            ...(prev || {}),
            status: data.status || prev?.status,
            current_bid: data.current_bid ?? prev?.current_bid,
            highest_bidder_name: data.highest_bidder_name || prev?.highest_bidder_name,
            bid_count: data.bid_count ?? prev?.bid_count,
          }));
          setTimer(data.time_left ?? data.timer ?? 0);
        }

        if (eventName === 'timer_tick') {
          setTimer(data.time_left ?? data.timer ?? 0);
        }

        if (eventName === 'new_bid') {
          setProduct((prev) => ({
            ...(prev || {}),
            status: 'live',
            current_bid: data.amount,
            highest_bidder_name: data.bidderName || data.bidder_name,
            bid_count: (prev?.bid_count || 0) + 1,
          }));
          setBids((prev) => [
            {
              bid_id: data.id || `public_${Date.now()}`,
              product_id: productId,
              bidder_name: data.bidderName || data.bidder_name || 'Bidder',
              amount: data.amount,
              created_at: new Date().toISOString(),
            },
            ...prev,
          ]);
          setTimer(data.time_left ?? 120);
        }

        if (eventName === 'auction_ended') {
          setProduct((prev) => ({
            ...(prev || {}),
            status: 'ended',
            winner_name: data.winnerName || data.winner_name || data.highest_bidder_name || prev?.highest_bidder_name,
          }));
          setTimer(0);
        }

        if (eventName === 'auction_cancelled') {
          setProduct((prev) => ({ ...(prev || {}), status: 'cancelled', cancel_reason: data.reason }));
          setTimer(0);
        }
      } catch (err) {
        console.error('Unable to read public auction update:', err);
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [productId]);

  const coverPhoto = useMemo(() => {
    const photos = safeParseJSON(product?.photos, []);
    return Array.isArray(photos) && photos.length > 0 ? photos[0] : '';
  }, [product?.photos]);

  const highestBid = product?.current_bid || bids[0]?.amount || 0;
  const highestBidder = product?.highest_bidder_name || bids[0]?.bidder_name || 'No bids placed';
  const statusLabel = product?.status ? product.status.replace('_', ' ') : 'loading';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f6f8fb', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a', fontWeight: 800 }}>
          <RefreshCw size={20} className="spin" /> Loading live auction...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f6f8fb', fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '1rem' }}>
        <div style={{ maxWidth: 460, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a' }}>Auction unavailable</h1>
          <p style={{ color: '#64748b' }}>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fb', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0f172a' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 10, background: '#0b1220', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <button type="button" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', border: 0, background: 'transparent', color: '#cbd5e1', fontWeight: 800, cursor: 'pointer' }}>
            <ArrowLeft size={18} /> DealsKB
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: connected ? '#86efac' : '#fecaca', fontSize: '0.85rem', fontWeight: 800 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#22c55e' : '#ef4444' }} />
            {connected ? 'Live feed connected' : 'Syncing feed'}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '1.5rem 1rem 2rem' }}>
        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(320px, 0.95fr)', gap: '1.25rem' }} className="public-auction-grid">
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, overflow: 'hidden', boxShadow: '0 18px 50px rgba(15, 23, 42, 0.08)' }}>
            <div style={{ aspectRatio: '16 / 9', background: 'linear-gradient(135deg, #111827, #4c1d95)', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
              {coverPhoto ? (
                <img src={coverPhoto} alt={product?.title || 'Auction item'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#e2e8f0' }}>
                  <Eye size={42} />
                  <div style={{ fontWeight: 900, marginTop: '0.5rem' }}>Live Auction Watch</div>
                </div>
              )}
            </div>
            <div style={{ padding: '1.25rem' }}>
              <span style={{ display: 'inline-flex', background: '#eef2ff', color: '#4338ca', borderRadius: 999, padding: '0.3rem 0.7rem', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>
                {PRODUCT_TYPE_LABELS[product?.product_type] || product?.product_type}
              </span>
              <h1 style={{ margin: '0.75rem 0 0.35rem', fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', lineHeight: 1.05 }}>{product?.title}</h1>
              <p style={{ margin: 0, color: '#64748b', fontWeight: 700 }}>
                {product?.brand} {product?.model} {product?.condition ? `- ${product.condition}` : ''}
              </p>
              <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>{product?.description || 'Watch this auction live in read-only mode.'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#0b1220', color: '#fff', borderRadius: 18, padding: '1.5rem', boxShadow: '0 18px 50px rgba(15, 23, 42, 0.18)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>Auction Status</div>
                  <div style={{ textTransform: 'capitalize', fontSize: '1.2rem', fontWeight: 900 }}>{statusLabel}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.08)', borderRadius: 999, padding: '0.5rem 0.9rem' }}>
                  <Clock size={18} color={timer <= 10 && product?.status === 'live' ? '#f87171' : '#c084fc'} />
                  <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{formatTimer(timer)}</span>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1rem', textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>Current Highest Bid</div>
                <div style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 950, color: '#22c55e', margin: '0.25rem 0' }}>{formatCurrency(highestBid)}</div>
                <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Lead bidder: <strong>{highestBidder}</strong></div>
              </div>

              {product?.status === 'ended' && (
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#86efac', fontWeight: 900 }}>
                  <Trophy size={20} /> Auction concluded
                </div>
              )}
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '1rem', boxShadow: '0 18px 50px rgba(15, 23, 42, 0.08)' }}>
              <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart2 size={18} color="#7c3aed" /> Live Bids
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: 330, overflowY: 'auto', paddingRight: 4 }}>
                {bids.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem 1rem', border: '1px dashed #cbd5e1', borderRadius: 14 }}>
                    No bids placed yet.
                  </div>
                ) : (
                  bids.map((bid, index) => (
                    <div key={bid.bid_id || `${bid.amount}-${index}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', border: '1px solid #e2e8f0', background: index === 0 ? '#f0fdf4' : '#fff', borderRadius: 14, padding: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 900 }}>{bid.bidder_name || 'Bidder'}</div>
                        <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{bid.created_at ? new Date(bid.created_at).toLocaleString('en-IN') : 'Just now'}</div>
                      </div>
                      <div style={{ fontWeight: 950, color: index === 0 ? '#16a34a' : '#0f172a' }}>{formatCurrency(bid.amount)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412', borderRadius: 16, padding: '0.9rem 1rem', fontWeight: 800 }}>
              This shared page is read-only. Login as a buyer from the marketplace to place bids.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PublicAuctionWatchPage;
