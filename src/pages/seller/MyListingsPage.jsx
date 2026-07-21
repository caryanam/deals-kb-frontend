import React, { useMemo, useState } from 'react';
import { normalizeImageUrl, getProductCoverImage, getProductGalleryImages, handleImageError } from '../../utils/imageUtils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Gavel,
  AlertCircle,
  PlayCircle,
  RefreshCw,
  Trophy,
  Edit,
  CheckCircle2,
  ImageOff,
  Eye,
  X,
  FileText,
  Film,
  MessageSquare,
  Clock3,
  Loader2,
  ArrowUpRight
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { getProducts, getProductById, getProductBids, startAuction } from '../../api/productApi';
import { getSellerChatRequests } from '../../api/chatRequestApi';
import { formatINR, PRODUCT_TYPE_LABELS, safeParseJSON, getNameInitials, getBidderDisplayName } from '../../utils/helpers';
import { toast } from 'react-toastify';

const VERIFICATION_DOCUMENT_KEYS = new Set(['rc_copy', 'insurance_copy', 'aadhaar_card', 'pan_card']);
const getVerificationDocuments = (docs = {}) => Object.fromEntries(
  Object.entries(docs || {}).filter(([key, value]) => VERIFICATION_DOCUMENT_KEYS.has(key) && value)
);

const formatDateTime = (value) => {
  if (!value) return 'Just now';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Just now';
  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const SPEC_LABELS = {
  year: 'Manufacturing Year',
  km_driven: 'Kilometer Driven',
  insurance_details: 'Insurance Details',
  fuel_type: 'Fuel Type',
  ownership: 'Ownership',
  accidental: 'Accidental',
  transmission: 'Transmission',
  processor: 'Processor',
  ram: 'RAM',
  storage: 'Storage',
  graphics_card: 'Graphics Card',
  battery_backup: 'Battery Backup',
  battery_health: 'Battery Health',
  imei_number: 'IMEI Number',
  warranty_status: 'Warranty Status',
  bill_available: 'Bill Available',
  warranty_available: 'Warranty Available',
  condition: 'Condition',
  screen_size: 'Screen Size',
  purchase_year: 'Purchase Year'
};

const formatLabel = (key) => {
  if (!key) return 'Detail';
  if (SPEC_LABELS[key]) return SPEC_LABELS[key];
  return String(key)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatValue = (value, key = '') => {
  if (value === null || value === undefined || value === '') return 'Not added';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'Not added';
  if (key.toLowerCase() === 'year' || key.toLowerCase() === 'manufacturing_year') {
    return String(value);
  }
  if (typeof value === 'number') return Number.isFinite(value) ? value.toLocaleString('en-IN') : 'Not added';
  return String(value);
};

const sortByLatest = (items = [], field = 'created_at') => {
  return [...items].sort((left, right) => {
    const leftTime = new Date(left?.[field] || left?.updated_at || 0).getTime();
    const rightTime = new Date(right?.[field] || right?.updated_at || 0).getTime();
    return rightTime - leftTime;
  });
};

export const MyListingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const basePath = user?.role === 'Dealer' ? '/dealer' : '/seller';
  const [searchParams] = useSearchParams();
  const filterStatus = searchParams.get('status');

  const [selectedListingSummary, setSelectedListingSummary] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);

  const { data: listingsData = [], isLoading: loading } = useQuery({
    queryKey: ['myListings', user?.user_id || user?.id],
    queryFn: () => getProducts({ mine: 'true' }),
    enabled: !!user
  });
  const listings = Array.isArray(listingsData) ? listingsData : [];

  const { data: selectedListingData, isLoading: detailsLoading } = useQuery({
    queryKey: ['sellerListingDetails', selectedProductId],
    queryFn: () => getProductById(selectedProductId),
    enabled: !!selectedProductId,
    refetchOnWindowFocus: false
  });

  const { data: listingBidsData = [], isLoading: bidsLoading } = useQuery({
    queryKey: ['sellerListingBids', selectedProductId],
    queryFn: () => getProductBids(selectedProductId),
    enabled: !!selectedProductId,
    refetchInterval: selectedProductId ? 2000 : false,
    refetchOnWindowFocus: true
  });

  const { data: sellerChatRequestsData = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['sellerListingRequests', user?.user_id || user?.id],
    queryFn: getSellerChatRequests,
    enabled: !!selectedProductId && !!user && ['seller', 'dealer'].includes(user.role?.toLowerCase()),
    refetchOnWindowFocus: false
  });

  const startAuctionMutation = useMutation({
    mutationFn: startAuction,
    onSuccess: (data, productId) => {
      toast.success('Auction started successfully!');
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      navigate(`${basePath}/auction/${productId}`);
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to start auction.';
      toast.error(msg);
    }
  });

  const filteredListings = filterStatus
    ? listings.filter((listing) => listing.status?.toLowerCase() === filterStatus.toLowerCase())
    : listings;

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const modalListing = selectedListingData || selectedListingSummary;
  const modalPhotos = useMemo(() => getProductGalleryImages(modalListing), [modalListing]);
  const modalDocuments = useMemo(() => getVerificationDocuments(safeParseJSON(modalListing?.documents, {})), [modalListing]);
  const modalSpecifications = useMemo(() => safeParseJSON(modalListing?.specifications, {}), [modalListing]);
  const listingBids = useMemo(() => {
    const bidList = Array.isArray(listingBidsData) ? listingBidsData : [];
    return sortByLatest(bidList, 'created_at');
  }, [listingBidsData]);

  const activeChatRequest = useMemo(() => {
    const requestList = Array.isArray(sellerChatRequestsData) ? sellerChatRequestsData : [];
    const matches = requestList.filter((request) => request?.product_id === selectedProductId);
    return sortByLatest(matches, 'updated_at')[0] || null;
  }, [selectedProductId, sellerChatRequestsData]);

  const modalStartingBid = useMemo(() => Math.ceil(Number(modalListing?.expected_price || 0) * 0.5), [modalListing]);

  const detailEntries = useMemo(() => {
    if (!modalListing) return [];
    const fixedEntries = [
      ['Listing Status', modalListing.status || 'Not added'],
      ['Category', PRODUCT_TYPE_LABELS[modalListing.product_type] || modalListing.product_type || 'Not added'],
      ['Brand', modalListing.brand || 'Not added'],
      ['Model', modalListing.model || 'Not added'],
      ['Condition', modalListing.condition || 'Not added'],
      ['Expected Price', formatINR(modalListing.expected_price || 0)]
    ];

    const dynamicEntries = Object.entries(modalSpecifications || {})
      .filter(([key, value]) => !['brand', 'model', 'condition'].includes(key) && value !== null && value !== undefined && value !== '')
      .map(([key, value]) => [formatLabel(key), formatValue(value, key)]);

    return [...fixedEntries, ...dynamicEntries];
  }, [modalListing, modalSpecifications]);

  const closeDetailsModal = () => {
    setSelectedListingSummary(null);
    setSelectedProductId(null);
    setPreviewMedia(null);
  };

  const fetchListings = () => {
    queryClient.invalidateQueries({ queryKey: ['myListings'] });
  };

  const handleStartAuction = (productId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Start Live Auction',
      message: 'Are you sure you want to trigger the 2-minute live auction timer for this product now?',
      onConfirm: () => {
        startAuctionMutation.mutate(productId);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleRelistClick = (productId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Relist in Marketplace',
      message: 'Do you want to relist this product? You can edit details before payment.',
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        navigate(`${basePath}/relist/${productId}`);
      }
    });
  };

  const handleOpenListingDetails = (listing) => {
    setSelectedListingSummary(listing);
    setSelectedProductId(listing.product_id);
  };

  const handleOpenChatPanel = () => {
    if (!activeChatRequest) return;

    const status = String(activeChatRequest.status || '').toUpperCase();
    if (status === 'ACCEPTED' && (activeChatRequest.conversation_id || activeChatRequest.conversation?.conversation_id)) {
      const chatId = activeChatRequest.conversation_id || activeChatRequest.conversation?.conversation_id;
      localStorage.setItem('open_chat_id', chatId);
      window.dispatchEvent(new CustomEvent('dealskb:open-chat', { detail: { chatId } }));
    } else {
      localStorage.setItem('open_chat_request_id', activeChatRequest.request_id);
      window.dispatchEvent(new CustomEvent('dealskb:open-chat-request', { detail: { requestId: activeChatRequest.request_id } }));
    }

    closeDetailsModal();
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

  const renderRequestSummary = () => {
    if (requestsLoading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', color: '#8B8278', minHeight: '120px' }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Loading buyer action...</span>
        </div>
      );
    }

    if (!activeChatRequest) {
      return (
        <div style={{
          border: '1px dashed #D8CFC1',
          borderRadius: '0.9rem',
          padding: '1rem',
          backgroundColor: '#fffdf7',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8B8278' }}>
            <Clock3 size={16} />
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#4a1a50' }}>Buyer action is pending</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.5, color: '#8B8278' }}>
            Once the winning buyer sends a purchase request, you will be able to open the chats and conversations window from here.
          </p>
        </div>
      );
    }

    const status = String(activeChatRequest.status || '').toUpperCase();
    const tone = status === 'ACCEPTED'
      ? { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', note: 'Buyer request accepted. Open chat to continue the deal.' }
      : status === 'REJECTED'
        ? { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', note: 'This request was rejected. You can still review it from chats.' }
        : { bg: '#fffbeb', border: '#fde68a', text: '#b45309', note: 'Buyer has contacted you. Open chat to review the request.' };

    return (
      <div style={{
        border: `1px solid ${tone.border}`,
        borderRadius: '0.95rem',
        padding: '1rem',
        backgroundColor: tone.bg,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.7rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', color: tone.text, display: 'block' }}>
              Buyer Request
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1F1A1D', display: 'block', marginTop: '0.15rem' }}>
              {getBidderDisplayName(activeChatRequest.buyer_name, activeChatRequest.buyer_id, user)}
            </span>
          </div>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 900,
            color: tone.text,
            border: `1px solid ${tone.border}`,
            borderRadius: '999px',
            padding: '0.18rem 0.55rem',
            backgroundColor: '#ffffff80'
          }}>
            {status || 'PENDING'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.65rem', fontSize: '0.78rem', color: '#8B8278' }}>
          <div>
            <strong style={{ color: '#1F1A1D' }}>Winning Bid:</strong><br />
            {formatINR(activeChatRequest.winning_bid_amount || 0)}
          </div>
          <div>
            <strong style={{ color: '#1F1A1D' }}>Created:</strong><br />
            {formatDateTime(activeChatRequest.created_at)}
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.5, color: '#4a1a50' }}>
          {activeChatRequest.buyer_message || tone.note}
        </p>

        {activeChatRequest.seller_response_message && (
          <div style={{
            borderRadius: '0.75rem',
            padding: '0.8rem 0.9rem',
            backgroundColor: '#ffffff',
            border: '1px solid #eadfcf',
            fontSize: '0.78rem',
            lineHeight: 1.45,
            color: '#8B8278'
          }}>
            <strong style={{ color: '#1F1A1D' }}>Your latest response:</strong><br />
            {activeChatRequest.seller_response_message}
          </div>
        )}

        <button
          type="button"
          onClick={handleOpenChatPanel}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', width: '100%' }}
        >
          <MessageSquare size={16} />
          Open Chat
        </button>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1F1A1D', fontFamily: "'Outfit', sans-serif" }}>My Product Listings</h1>
          <p style={{ color: '#8B8278', fontSize: '0.9rem' }}>Check approval stages, open listing details, review bids, and manage live auctions.</p>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredListings.map((product) => {
            const coverPhoto = getProductCoverImage(product);
            return (
              <div key={product.product_id} className="card" style={{
                padding: '1.5rem',
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'center',
                flexWrap: 'wrap',
                border: product.status === 'rejected' ? '1px solid #fca5a5' : '1px solid #D8CFC1',
                backgroundColor: product.status === 'rejected' ? '#fffafb' : '#ffffff'
              }}>
                <div style={{
                  width: '120px',
                  height: '90px',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  backgroundColor: '#cbd5e1',
                  flexShrink: 0,
                  cursor: 'pointer'
                }} onClick={() => handleOpenListingDetails(product)}>
                  {coverPhoto ? (
                    <img
                      src={coverPhoto}
                      alt=""
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
                      gap: '0.25rem',
                      color: '#64748b',
                      backgroundColor: '#f8fafc'
                    }}>
                      <ImageOff size={20} />
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, textAlign: 'center' }}>No image</span>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenListingDetails(product)}
                      style={{
                        padding: 0,
                        background: 'none',
                        border: 'none',
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: '#1F1A1D',
                        cursor: 'pointer',
                        textAlign: 'left',
                        textDecoration: 'underline'
                      }}
                    >
                      {product.title}
                    </button>
                    {getStatusBadge(product.status)}
                  </div>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#8B8278' }}>
                    Category: <strong>{PRODUCT_TYPE_LABELS[product.product_type] || product.product_type}</strong> | Brand: <strong>{product.brand}</strong> | Model: <strong>{product.model}</strong>
                  </p>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#8B8278' }}>
                    Condition: <strong>{product.condition}</strong>
                  </p>

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
                        Sold to {product.winner_name ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', verticalAlign: 'middle' }}>
                            <span className="bidder-avatar-chip bidder-avatar-chip--compact" style={{ margin: 0 }}>{getNameInitials(product.winner_name)}</span>
                            <strong style={{ fontWeight: 800 }}>{getBidderDisplayName(product.winner_name, product.winner_id, user)}</strong>
                          </span>
                        ) : (
                          <strong>No winner</strong>
                        )} for <strong>{formatINR(product.current_bid || 0)}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenListingDetails(product)}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Eye size={14} /> View Details
                  </button>

                  {(product.status?.toLowerCase() === 'ended' || product.status?.toLowerCase() === 'unsold' || product.status?.toLowerCase() === 'no_winner' || product.status?.toLowerCase() === 'auction_ended_no_bid') && (!product.winner_id) && (
                    <button
                      onClick={() => handleRelistClick(product.product_id)}
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                    >
                      Relist in Marketplace
                    </button>
                  )}

                  {product.status === 'approved' && (
                    <button
                      onClick={() => handleStartAuction(product.product_id)}
                      className="btn btn-success"
                      disabled={startAuctionMutation.isPending}
                      style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#6B1B71' }}
                    >
                      <PlayCircle size={16} /> Start Auction
                    </button>
                  )}

                  {product.status === 'pending' && (
                    <div style={{ fontSize: '0.8rem', color: '#d97706', backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 600 }}>
                      Awaiting Admin Review
                    </div>
                  )}

                  {product.status === 'live' && (
                    <button
                      onClick={() => navigate(`${basePath}/auction/${product.product_id}`)}
                      className="btn btn-success"
                      style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Gavel size={16} /> Open Auction
                    </button>
                  )}

                  {(product.status === 'pending' || product.status === 'rejected') && (
                    <button
                      onClick={() => navigate(`${basePath}/create-listing?edit=${product.product_id}`)}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#f1f5f9', borderColor: '#cbd5e1', color: '#8B8278' }}
                    >
                      <Edit size={14} /> Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalListing && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 15, 25, 0.7)',
          zIndex: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#FAF6EA',
            borderRadius: '1.25rem',
            width: '100%',
            maxWidth: '1180px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1.35rem 1.5rem',
              borderBottom: '1px solid #D8CFC1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '1rem',
              backgroundColor: '#FAF6EA'
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {getStatusBadge(modalListing.status)}
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B1B71', textTransform: 'uppercase' }}>
                    Seller Listing View
                  </span>
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.35rem 0 0 0', color: '#1F1A1D' }}>
                  {modalListing.title}
                </h2>
                <p style={{ margin: '0.35rem 0 0 0', color: '#8B8278', fontSize: '0.88rem' }}>
                  {PRODUCT_TYPE_LABELS[modalListing.product_type] || modalListing.product_type} | {modalListing.brand} | {modalListing.model}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDetailsModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B8278', display: 'flex', padding: '0.15rem' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{
              padding: '0.8rem 1.5rem',
              borderBottom: '1px solid #E6DED0',
              backgroundColor: '#fffdf7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#8B8278', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Bids will start from</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#10b981' }}>
                {formatINR(modalStartingBid || 0)} <span style={{ color: '#8B8278', fontSize: '0.78rem', fontWeight: 700 }}>(50% of expected price)</span>
              </span>
            </div>

            <div className="seller-listing-detail-grid" style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 0.95fr)', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
                <section className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1F1A1D' }}>Photos</h3>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#8B8278' }}>Click any photo to preview it larger.</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B8278' }}>{modalPhotos.length} uploaded</span>
                  </div>

                  {modalPhotos.length > 0 ? (
                    <div className="seller-listing-photo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.9rem' }}>
                      {modalPhotos.map((photo, index) => (
                        <button
                          key={`${photo}-${index}`}
                          type="button"
                          onClick={() => setPreviewMedia({ type: 'image', src: photo, title: `Product Photo ${index + 1}` })}
                          style={{
                            border: '1px solid #D8CFC1',
                            borderRadius: '0.85rem',
                            padding: 0,
                            overflow: 'hidden',
                            backgroundColor: '#ffffff',
                            cursor: 'pointer',
                            minHeight: '140px'
                          }}
                        >
                          <img src={photo} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} onError={handleImageError} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      border: '1px dashed #D8CFC1',
                      borderRadius: '0.85rem',
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      color: '#8B8278'
                    }}>
                      <ImageOff size={24} />
                      <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>No photos uploaded</span>
                    </div>
                  )}
                </section>

                {modalListing.video && (
                  <section className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1F1A1D' }}>Video Walkthrough</h3>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#8B8278' }}>Open the recorded walkthrough to inspect the listing better.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewMedia({ type: 'video', src: normalizeImageUrl(modalListing.video), title: 'Listing Video Walkthrough' })}
                      style={{
                        border: '1px solid #D8CFC1',
                        borderRadius: '0.95rem',
                        backgroundColor: '#1F1A1D',
                        color: '#ffffff',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Film size={20} />
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800 }}>Play Walkthrough</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#D8CFC1' }}>Open video preview</span>
                        </div>
                      </div>
                      <ArrowUpRight size={18} />
                    </button>
                  </section>
                )}

                {Object.keys(modalDocuments || {}).length > 0 && (
                  <section className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1F1A1D' }}>Documents</h3>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#8B8278' }}>Open KYC and verification documents attached with this listing.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {Object.entries(modalDocuments).map(([key, rawValue]) => {
                        const documentUrl = normalizeImageUrl(rawValue);
                        const lowered = String(rawValue || '').toLowerCase();
                        const isVideo = lowered.includes('.mp4') || lowered.includes('video/');
                        const isPdf = lowered.includes('.pdf') || lowered.includes('application/pdf');
                        const previewType = isVideo ? 'video' : isPdf ? 'pdf' : 'image';
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setPreviewMedia({ type: previewType, src: documentUrl, title: formatLabel(key) })}
                            style={{
                              border: '1px solid #D8CFC1',
                              borderRadius: '0.75rem',
                              backgroundColor: '#ffffff',
                              color: '#4a1a50',
                              padding: '0.75rem 0.9rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.55rem',
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            <FileText size={16} />
                            {formatLabel(key)}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                <section className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1F1A1D' }}>Details & Specifications</h3>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#8B8278' }}>Everything the seller added for this listing, all in one place.</p>
                  </div>
                  <div className="seller-listing-spec-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.8rem' }}>
                    {detailEntries.map(([label, value]) => (
                      <div key={`${label}-${value}`} style={{ border: '1px solid #E6DED0', borderRadius: '0.8rem', backgroundColor: '#fffdf7', padding: '0.85rem 0.95rem' }}>
                        <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#8B8278', marginBottom: '0.3rem' }}>{label}</span>
                        <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#1F1A1D', lineHeight: 1.45 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {modalListing.description && (
                  <section className="card" style={{ padding: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1F1A1D' }}>Seller Description</h3>
                    <p style={{ margin: '0.7rem 0 0 0', fontSize: '0.86rem', color: '#8B8278', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                      {modalListing.description}
                    </p>
                  </section>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
                {['approved', 'pending'].includes(modalListing.status) ? (
                  <section className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1F1A1D' }}>Bidding Yet to Start</h3>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#8B8278' }}>This approved listing is yet to start auction.</p>
                    </div>
                    <div style={{
                      border: '1px dashed #D8CFC1',
                      borderRadius: '0.9rem',
                      padding: '1rem',
                      backgroundColor: '#fffdf7',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8B8278' }}>
                        <Clock3 size={16} />
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#4a1a50' }}>Auction not started</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.5, color: '#8B8278' }}>
                        Once this approved listing goes live and concludes, the winning buyer's chat and contact options will become available here.
                      </p>
                    </div>
                  </section>
                ) : (
                  <section className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1F1A1D' }}>Buyer Chat Status</h3>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#8B8278' }}>See whether the winning buyer has reached out yet.</p>
                    </div>
                    {renderRequestSummary()}
                  </section>
                )}

                <section className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem', minHeight: '320px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1F1A1D' }}>Live Bids</h3>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#8B8278' }}>Real-time bid activity with bidder name and timestamp.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectedProductId && queryClient.invalidateQueries({ queryKey: ['sellerListingBids', selectedProductId] })}
                      className="btn btn-secondary"
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <RefreshCw size={14} style={{ animation: bidsLoading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
                    </button>
                  </div>

                  {detailsLoading && !selectedListingData ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', color: '#8B8278', minHeight: '180px' }}>
                      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Loading listing details...</span>
                    </div>
                  ) : listingBids.length === 0 ? (
                    <div style={{
                      border: '1px dashed #D8CFC1',
                      borderRadius: '0.9rem',
                      padding: '1.4rem',
                      backgroundColor: '#fffdf7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: '0.45rem',
                      color: '#8B8278',
                      minHeight: '180px'
                    }}>
                      <CheckCircle2 size={20} />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>No bids yet for this listing.</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '420px', paddingRight: '0.1rem' }}>
                      {listingBids.map((bid, index) => (
                        <div key={bid.bid_id || `${bid.bidder_id}-${bid.created_at}-${index}`} style={{
                          border: index === 0 ? '1px solid #bbf7d0' : '1px solid #E6DED0',
                          backgroundColor: index === 0 ? '#f0fdf4' : '#ffffff',
                          borderRadius: '0.9rem',
                          padding: '0.9rem 1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '0.9rem',
                          alignItems: 'flex-start'
                        }}>
                          <div style={{ minWidth: 0 }}>
                            <div className="bidder-avatar-row" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <span className="bidder-avatar-chip bidder-avatar-chip--compact">{getNameInitials(bid.bidder_name || 'Bidder')}</span>
                              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1F1A1D' }}>
                                {getBidderDisplayName(bid.bidder_name, bid.bidder_id, user)}
                              </span>
                            </div>
                            <span style={{ display: 'block', fontSize: '0.76rem', color: '#8B8278', marginTop: '0.18rem' }}>{formatDateTime(bid.created_at)}</span>
                            {index === 0 && (
                              <span style={{ display: 'inline-block', marginTop: '0.45rem', fontSize: '0.68rem', fontWeight: 900, color: '#166534', backgroundColor: '#dcfce7', borderRadius: '999px', padding: '0.18rem 0.55rem' }}>
                                Highest Bid
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '1rem', fontWeight: 900, color: index === 0 ? '#047857' : '#1F1A1D', whiteSpace: 'nowrap' }}>
                            {formatINR(bid.amount || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

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
            maxWidth: '860px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            border: '1px solid #D8CFC1',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #D8CFC1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAF6EA' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1F1A1D' }}>{previewMedia.title}</span>
              <button type="button" onClick={() => setPreviewMedia(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B8278' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1F1A1D' }}>
              {previewMedia.type === 'image' && (
                <img src={previewMedia.src} alt="" style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '0.5rem' }} onError={handleImageError} />
              )}
              {previewMedia.type === 'video' && (
                <video src={previewMedia.src} controls autoPlay style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: '0.5rem' }} />
              )}
              {previewMedia.type === 'pdf' && (
                <iframe src={previewMedia.src} style={{ width: '100%', height: '65vh', border: 'none', borderRadius: '0.5rem', backgroundColor: '#FAF6EA' }} title="Document Preview" />
              )}
            </div>

            <div style={{ padding: '0.85rem 1.5rem', backgroundColor: '#FAF6EA', borderTop: '1px solid #D8CFC1', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setPreviewMedia(null)} className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
            <div style={{ padding: '0.85rem 1.5rem', backgroundColor: '#FAF6EA', borderTop: '1px solid #D8CFC1', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', height: '36px' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="btn btn-primary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', backgroundColor: '#6B1B71', borderColor: '#6B1B71', height: '36px' }}
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

        @media (max-width: 980px) {
          .seller-listing-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 720px) {
          .seller-listing-spec-grid,
          .seller-listing-photo-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MyListingsPage;
