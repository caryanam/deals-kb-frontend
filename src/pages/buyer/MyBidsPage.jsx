import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Landmark, ArrowUpRight, Trophy, Eye, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getMyBids } from '../../api/userApi';
import { getProductById } from '../../api/productApi';
import { formatINR, PRODUCT_TYPE_LABELS } from '../../utils/helpers';
import { toast } from 'react-toastify';

export const MyBidsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));

  const activeTab = searchParams.get('tab') || 'all';

  const [bidsList, setBidsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync tab from URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const loadMyBids = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const bidsData = await getMyBids();
      
      // Enrich bid history objects with product stats
      const enriched = await Promise.all(
        bidsData.map(async (bid) => {
          try {
            const product = await getProductById(bid.product_id);
            return {
              ...bid,
              product
            };
          } catch (err) {
            return {
              ...bid,
              product: { title: 'Unknown Product', expected_price: 0, product_type: 'unknown' }
            };
          }
        })
      );
      
      setBidsList(enriched);
    } catch (err) {
      console.error('Failed to load my bidding history:', err);
      toast.error('Failed to load bidding history logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyBids();
  }, [user]);

  const handleAction = (bid) => {
    if (bid.product.status === 'live') {
      navigate(`/buyer/auction/${bid.product.product_id}`);
    } else {
      navigate(`/buyer/listings/${bid.product.product_id}`);
    }
  };

  const handleTabChange = (tabName) => {
    const params = new URLSearchParams(window.location.search);
    if (tabName === 'all') {
      params.delete('tab');
    } else {
      params.set('tab', tabName);
    }
    navigate(`?${params.toString()}`);
    setSearchParams(params);
  };

  // Filter based on selected tab
  const filteredBids = activeTab === 'won'
    ? bidsList.filter(bid => {
        const p = bid.product;
        const isWinner = p && p.status === 'ended' && (p.winner_id === user.user_id || p.winner_id === user.id);
        return isWinner;
      })
    : bidsList;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1F1A1D', fontFamily: "'Outfit', sans-serif" }}>My Bidding Logs</h1>
          <p style={{ color: '#8B8278', fontSize: '0.9rem' }}>Track listings you have placed bids on and check your winning results</p>
        </div>
        <button 
          onClick={loadMyBids} 
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          disabled={loading}
        >
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Tabs navigation */}
      <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid #D8CFC1', marginBottom: '1.5rem' }}>
        <button
          onClick={() => handleTabChange('all')}
          style={{
            padding: '0.6rem 1.25rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: activeTab === 'all' ? '#6B1B71' : '#8B8278',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'all' ? '3px solid #6B1B71' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          All My Bids
        </button>
        <button
          onClick={() => handleTabChange('won')}
          style={{
            padding: '0.6rem 1.25rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: activeTab === 'won' ? '#6B1B71' : '#8B8278',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'won' ? '3px solid #6B1B71' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          My Wins 🏆
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            border: '3px solid #cbd5e1',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            borderLeftColor: '#6B1B71',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ color: '#8B8278', fontSize: '0.85rem' }}>Retrieving bid registry...</span>
        </div>
      ) : filteredBids.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: '#8B8278', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <Landmark size={48} style={{ color: '#cbd5e1' }} />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4a1a50' }}>
              {activeTab === 'won' ? 'No auction wins yet' : 'You have not placed any bids yet'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#8B8278', marginTop: '0.25rem' }}>
              {activeTab === 'won' ? 'Place bids on live auctions to start winning.' : 'Browse active products in the marketplace and join the bidding rooms.'}
            </p>
          </div>
          <button onClick={() => navigate('/buyer/marketplace')} className="btn btn-primary" style={{ width: 'fit-content' }}>
            Browse Marketplace
          </button>
        </div>
      ) : (
        /* Roster Grid */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAF6EA', borderBottom: '1px solid #D8CFC1' }}>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Product</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>My Bid</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Highest Bid / Winner</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBids.map((bid) => {
                  const product = bid.product;
                  const isEnded = product.status === 'ended';
                  const isWinner = isEnded && (product.winner_id === user.user_id || product.winner_id === user.id);

                  return (
                    <tr key={bid.bid_id || bid.id} style={{ borderBottom: '1px solid #D8CFC1' }}>
                      {/* Product details */}
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.95rem', color: '#1F1A1D' }}>{product.title}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#8B8278', textTransform: 'capitalize' }}>
                            Status: {product.status}
                          </span>
                        </div>
                      </td>

                      {/* Product Type Badge */}
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {PRODUCT_TYPE_LABELS[product.product_type] || product.product_type}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        {product.status === 'live' ? (
                          <span className="badge badge-live">Live</span>
                        ) : isEnded ? (
                          <span className="badge badge-ended">Ended</span>
                        ) : (
                          <span className="badge badge-approved">{product.status}</span>
                        )}
                      </td>

                      {/* My Bid Column */}
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.95rem', fontWeight: 700, color: '#6B1B71' }}>
                        {formatINR(bid.amount)}
                      </td>

                      {/* Current Bid Column */}
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.95rem', fontWeight: 700 }}>
                        {isWinner ? (
                          <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Trophy size={12} /> Won ({formatINR(product.current_bid)})
                          </span>
                        ) : (
                          formatINR(product.current_bid || 0)
                        )}
                      </td>

                      {/* Action Column */}
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <button
                          onClick={() => handleAction(bid)}
                          className={`btn ${product.status === 'live' ? 'btn-success' : 'btn-secondary'}`}
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          {product.status === 'live' ? (
                            <>Bidding Room <ArrowUpRight size={12} /></>
                          ) : (
                            <>Inspect <Eye size={12} /></>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MyBidsPage;
