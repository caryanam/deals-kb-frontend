import React, { useState, useEffect } from 'react';
import { normalizeImageUrl, handleImageError } from '../../utils/imageUtils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Gavel, AlertCircle, PlayCircle, RefreshCw, Trophy, Edit, Check, X, ImageOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getProducts, startAuction } from '../../api/productApi';
import { formatINR, PRODUCT_TYPE_LABELS, safeParseJSON } from '../../utils/helpers';
import { toast } from 'react-toastify';

export const MyListingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const basePath = user?.role === 'Dealer' ? '/dealer' : '/seller';
  const [searchParams] = useSearchParams();
  const filterStatus = searchParams.get('status');

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const filteredListings = filterStatus 
    ? listings.filter(l => l.status?.toLowerCase() === filterStatus.toLowerCase()) 
    : listings;

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const fetchListings = async () => {
    try {
      setLoading(true);
      // Backend expects mine='true' filter to retrieve user specific listings
      const myList = await getProducts({ mine: 'true' });
      setListings(myList || []);
    } catch (err) {
      console.error('Failed to load seller listings:', err);
      toast.error('Failed to load listings data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [user]);

  const handleStartAuction = (productId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Start Live Auction',
      message: 'Are you sure you want to trigger the 2-minute live auction timer for this product now?',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await startAuction(productId);
          toast.success('Auction started successfully!');
          navigate(`${basePath}/auction/${productId}`);
        } catch (err) {
          const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to start auction.';
          toast.error(msg);
        } finally {
          setActionLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleRelistClick = (productId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Relist in Marketplace',
      message: 'Do you want to relist this product? You can edit details before payment.',
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        navigate(`${basePath}/relist/${productId}`);
      }
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
        return <span className="badge badge-live">Live</span>;
      case 'approved':
        return <span className="badge badge-approved">Approved</span>;
      case 'pending':
        return <span className="badge badge-pending">Pending Review</span>;
      case 'rejected':
        return <span className="badge badge-rejected">Rejected</span>;
      case 'ended':
        return <span className="badge badge-ended">Ended</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1F1A1D', fontFamily: "'Outfit', sans-serif" }}>My Product Listings</h1>
          <p style={{ color: '#8B8278', fontSize: '0.9rem' }}>Check approval stages, review admin rejection comments, and activate live auctions</p>
        </div>
        <button 
          onClick={fetchListings} 
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          disabled={loading}
        >
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
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
          <span style={{ color: '#8B8278', fontSize: '0.85rem' }}>Loading my listings...</span>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: '#8B8278', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <Gavel size={48} style={{ color: '#cbd5e1' }} />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4a1a50' }}>No listings found matching this status</h3>
            <p style={{ fontSize: '0.9rem', color: '#8B8278', marginTop: '0.25rem' }}>Create a listing or clear filters to see more.</p>
          </div>
          <button 
            onClick={() => navigate(`${basePath}/create-listing`)} 
            className="btn btn-primary"
            style={{ width: 'fit-content', backgroundColor: '#10b981' }}
          >
            Create New Listing
          </button>
        </div>
      ) : (
        /* Listings roster */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredListings.map((product) => (
            <div key={product.product_id} className="card" style={{
              padding: '1.5rem',
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'center',
              flexWrap: 'wrap',
              border: product.status === 'rejected' ? '1px solid #fca5a5' : '1px solid #D8CFC1',
              backgroundColor: product.status === 'rejected' ? '#fffafb' : '#ffffff'
            }}>
              
              {/* Cover photo */}
              <div style={{
                width: '120px',
                height: '90px',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                backgroundColor: '#cbd5e1',
                flexShrink: 0
              }}>
                {(() => {
                  const photosArray = safeParseJSON(product.photos, []);
                  if (photosArray.length > 0) {
                    return (
                      <img 
                        src={normalizeImageUrl(photosArray[0])} 
                        alt="" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={handleImageError}
                      />
                    );
                  }
                  return (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      color: '#64748b',
                      backgroundColor: '#f8fafc'
                    }}>
                      <ImageOff size={20} />
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, textAlign: 'center' }}>No image</span>
                    </div>
                  );
                })()}
              </div>

              {/* Specs */}
              <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#1F1A1D' }}>
                    {product.title}
                  </h3>
                  {getStatusBadge(product.status)}
                </div>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#8B8278' }}>
                  Category: <strong>{PRODUCT_TYPE_LABELS[product.product_type] || product.product_type}</strong> &bull; Brand: <strong>{product.brand}</strong> &bull; Model: <strong>{product.model}</strong>
                </p>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#8B8278' }}>
                  Condition: <strong>{product.condition}</strong>
                </p>

                {/* Rejection comment display */}
                {product.status === 'rejected' && product.reject_reason && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#fee2e2',
                    border: '1.5px solid #fca5a5',
                    borderRadius: '0.5rem',
                    fontSize: '0.8rem',
                    color: '#b91c1c',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.35rem'
                  }}>
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '0.05rem' }} />
                    <div>
                      <strong>Rejection Reason:</strong> {product.reject_reason}
                    </div>
                  </div>
                )}

                {/* Ended auction stats */}
                {product.status === 'ended' && (
                  <div style={{
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.8rem',
                    color: '#047857'
                  }}>
                    <Trophy size={14} />
                    <span>
                      Sold to <strong>{product.winner_name || 'No winner'}</strong> for <strong>{formatINR(product.current_bid || 0)}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Actions panel */}
              <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0, alignItems: 'center' }}>
                {(product.status?.toLowerCase() === 'ended' || product.status?.toLowerCase() === 'unsold' || product.status?.toLowerCase() === 'no_winner' || product.status?.toLowerCase() === 'auction_ended_no_bid') && (!product.winner_id) && (
                  <button
                    onClick={() => handleRelistClick(product.product_id)}
                    className="btn btn-primary"
                    style={{
                      padding: '0.5rem 1.25rem',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    Relist in Marketplace →
                  </button>
                )}

                {product.status === 'approved' && (
                  <button
                    onClick={() => handleStartAuction(product.product_id)}
                    className="btn btn-success"
                    disabled={actionLoading}
                    style={{
                      padding: '0.5rem 1.25rem',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: '#6B1B71'
                    }}
                  >
                    <PlayCircle size={16} /> Start Auction
                  </button>
                )}

                {product.status === 'pending' && (
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#d97706',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontWeight: 600
                  }}>
                    Awaiting Admin Review
                  </div>
                )}

                {product.status === 'live' && (
                  <button
                    onClick={() => navigate(`${basePath}/auction/${product.product_id}`)}
                    className="btn btn-success"
                    style={{
                      padding: '0.5rem 1.25rem',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Gavel size={16} /> Open Auction
                  </button>
                )}

                {/* Edit listing conditionally for pending/rejected status */}
                {(product.status === 'pending' || product.status === 'rejected') && (
                  <button
                    onClick={() => navigate(`${basePath}/create-listing?edit=${product.product_id}`)}
                    className="btn btn-secondary"
                    style={{
                      padding: '0.5rem 1.25rem',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: '#f1f5f9',
                      borderColor: '#cbd5e1',
                      color: '#8B8278'
                    }}
                  >
                    <Edit size={14} /> Edit
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL OVERLAY */}
      {confirmModal.isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 15, 25, 0.7)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#FAF6EA',
            borderRadius: '1rem',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
            border: '1px solid #D8CFC1',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#1F1A1D' }}>
                {confirmModal.title}
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#8B8278', marginTop: '0.5rem', lineHeight: 1.5, marginBlockEnd: 0 }}>
                {confirmModal.message}
              </p>
            </div>
            <div style={{
              padding: '0.85rem 1.5rem',
              backgroundColor: '#FAF6EA',
              borderTop: '1px solid #D8CFC1',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem'
            }}>
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', height: '36px' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="btn btn-primary"
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.8rem',
                  backgroundColor: '#6B1B71',
                  borderColor: '#6B1B71',
                  height: '36px'
                }}
              >
                Confirm
              </button>
            </div>
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

export default MyListingsPage;
