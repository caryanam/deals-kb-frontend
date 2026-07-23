import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Fuel, Calendar, Gauge, ShieldCheck, AlertCircle, PlayCircle, CheckCircle, Cpu, Layers, HardDrive, FileText, Trophy, ArrowRight, MessageSquare, X, ImageOff, MapPin, Heart } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductById, getSellerContact, getWinnerContact, getProductBids } from '../../api/productApi';
import { createConversation } from '../../api/chatApi';
import { createChatRequest } from '../../api/chatRequestApi';
import { createReport } from '../../api/reportApi';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, PRODUCT_TYPE_LABELS, safeParseJSON, getNameInitials, getBidderDisplayName } from '../../utils/helpers';
import { normalizeImageUrl, getProductGalleryImages, handleImageError } from '../../utils/imageUtils';
import { toast } from 'react-toastify';
import { getMyPlans } from '../../api/paymentApi';
import PricingPlanPopup from '../../components/listings/PricingPlanPopup';

const VERIFICATION_DOCUMENT_KEYS = new Set(['rc_copy', 'insurance_copy', 'aadhaar_card', 'pan_card']);
const getVerificationDocuments = (docs = {}) => Object.fromEntries(
  Object.entries(docs || {}).filter(([key, value]) => VERIFICATION_DOCUMENT_KEYS.has(key) && value)
);

export const ListingDetailsPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: product, isLoading: loading, error: errorProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId
  });

  const { data: bidHistoryList = [] } = useQuery({
    queryKey: ['productBids', productId],
    queryFn: () => getProductBids(productId),
    enabled: !!productId
  });

  const errorMsg = errorProduct ? (errorProduct.response?.data?.detail || errorProduct.response?.data?.message || 'Unable to load product details. Please try again.') : '';

  const [activeImage, setActiveImage] = useState('');
  const [mediaMode, setMediaMode] = useState('image'); // 'image' or 'video'
  const [showPlans, setShowPlans] = useState(false);
  const [requiredPlan, setRequiredPlan] = useState(null);

  const photosArray = useMemo(() => {
    return product ? getProductGalleryImages(product) : [];
  }, [product]);

  useEffect(() => {
    if (photosArray.length > 0 && !activeImage) {
      setActiveImage(photosArray[0]);
    }
  }, [photosArray, activeImage]);

  useEffect(() => {
    setActiveImage('');
  }, [productId]);

  // Seller contact states (Buyer View)
  const [sellerContact, setSellerContact] = useState(null);
  const [contactError, setContactError] = useState('');
  const [loadingContact, setLoadingContact] = useState(false);

  // Winner contact states (Seller View)
  const [winnerContact, setWinnerContact] = useState(null);
  const [winnerContactError, setWinnerContactError] = useState('');
  const [loadingWinnerContact, setLoadingWinnerContact] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  // Report states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('suspicious_auction');
  const [reportReason, setReportReason] = useState('');
  const [reportEvidence, setReportEvidence] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const handleStartChat = async () => {
    try {
      setLoadingChat(true);
      const request = await createChatRequest(productId);
      const chatId = request?.conversation_id || request?.conversation?.conversation_id;

      if (request?.status === 'ACCEPTED' && chatId) {
        localStorage.setItem('open_chat_id', chatId);
        window.dispatchEvent(new CustomEvent('dealskb:open-chat', { detail: { chatId } }));
        toast.success('Chat room opened!');
        return;
      }

      toast.success('Request sent to seller. Chat will open once the seller accepts your request.');
    } catch (err) {
      console.error('Failed to initiate chat:', err);
      const rawDetail = err.response?.data?.detail;
      const detailMsg = Array.isArray(rawDetail)
        ? rawDetail.map(d => d.msg).join(', ')
        : (typeof rawDetail === 'string' ? rawDetail : '');
      const errMsg = detailMsg || err.response?.data?.message || err.message || 'Failed to initialize chat connection.';
      toast.error(errMsg);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleOpenAcceptedChat = async () => {
    try {
      setLoadingChat(true);
      const conversation = await createConversation(productId);
      const chatId = conversation?.conversation_id || conversation?.id || conversation?.data?.conversation_id;
      if (!chatId) {
        throw new Error('Failed to resolve conversation ID from server response.');
      }
      localStorage.setItem('open_chat_id', chatId);
      window.dispatchEvent(new CustomEvent('dealskb:open-chat', { detail: { chatId } }));
      toast.success('Chat room opened!');
    } catch (err) {
      console.error('Failed to open accepted chat:', err);
      const rawDetail = err.response?.data?.detail;
      const detailMsg = Array.isArray(rawDetail)
        ? rawDetail.map(d => d.msg).join(', ')
        : (typeof rawDetail === 'string' ? rawDetail : '');
      toast.error(detailMsg || err.response?.data?.message || err.message || 'Chat opens after seller accepts the request.');
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (reportReason.trim().length < 10) {
      toast.error('Reason must be at least 10 characters.');
      return;
    }

    try {
      setSubmittingReport(true);
      await createReport({
        product_id: productId,
        reported_user_id: product.seller_id,
        report_type: reportType,
        reason: reportReason.trim(),
        evidence: reportEvidence.trim() ? [reportEvidence.trim()] : []
      });
      toast.success('Report submitted successfully');
      setShowReportModal(false);
      setReportReason('');
      setReportEvidence('');
    } catch (err) {
      console.error('Failed to submit report:', err);
      const errMsg = err.response?.data?.detail || err.response?.data?.message || '';
      if (errMsg.toLowerCase().includes('already submitted') || errMsg.toLowerCase().includes('duplicate') || err.response?.status === 400) {
        toast.error('You have already submitted this report and it is under review');
      } else {
        toast.error(errMsg || 'Failed to submit report.');
      }
    } finally {
      setSubmittingReport(false);
    }
  };

  const isSeller = user && product && (user.user_id === product.seller_id || user.id === product.seller_id);
  const isBuyer = !user || user.role === 'Buyer';

  const [isLiked, setIsLiked] = useState(() => {
    try {
      const liked = JSON.parse(localStorage.getItem('dealskb_liked_listings') || '[]');
      return liked.includes(productId);
    } catch {
      return false;
    }
  });

  const handleLikeToggle = () => {
    try {
      const liked = JSON.parse(localStorage.getItem('dealskb_liked_listings') || '[]');
      let nextLiked = [];
      if (liked.includes(productId)) {
        nextLiked = liked.filter(id => id !== productId);
        setIsLiked(false);
      } else {
        nextLiked = [...liked, productId];
        setIsLiked(true);
      }
      localStorage.setItem('dealskb_liked_listings', JSON.stringify(nextLiked));
    } catch (err) {
      console.error(err);
    }
  };

  const handleFetchWinnerContact = async () => {
    try {
      setLoadingWinnerContact(true);
      setWinnerContactError('');
      const data = await getWinnerContact(productId);
      setWinnerContact(data.winner);
    } catch (err) {
      console.error('Failed to retrieve winner contact details:', err);
      const status = err.response?.status;
      if (status === 400) {
        setWinnerContactError('Winner contact is available only after auction ends');
      } else if (status === 403) {
        setWinnerContactError('Winner contact is available only to the seller');
      } else {
        setWinnerContactError(err.response?.data?.detail || err.response?.data?.message || 'Failed to retrieve winner contact.');
      }
    } finally {
      setLoadingWinnerContact(false);
    }
  };

  const handleFetchContact = async () => {
    try {
      setLoadingContact(true);
      setContactError('');
      const data = await getSellerContact(productId);
      setSellerContact(data.seller);
    } catch (err) {
      console.error('Failed to retrieve seller contact details:', err);
      const status = err.response?.status;
      if (status === 400) {
        setContactError('Seller contact is available only after auction ends');
      } else if (status === 403) {
        setContactError('Seller contact is available only to the winning buyer');
      } else if (status === 401) {
        setContactError('Login required to view contact details.');
      } else {
        setContactError(err.response?.data?.detail || err.response?.data?.message || 'Failed to retrieve contact details.');
      }
    } finally {
      setLoadingContact(false);
    }
  };

  const loadProductData = () => {
    queryClient.invalidateQueries({ queryKey: ['product', productId] });
    queryClient.invalidateQueries({ queryKey: ['productBids', productId] });
  };

  const handleBack = () => {
    navigate('/buyer/marketplace');
  };

  const handleJoinAuction = async () => {
    if (product && product.status === 'live') {
      if (user?.role === 'Buyer') {
        try {
          const plans = await getMyPlans();
          const activePlan = (plans || []).find((plan) => plan.product_type === product.product_type && plan.active);
          if (!activePlan) {
            setRequiredPlan(null);
            setShowPlans(true);
            return;
          }
        } catch (err) {
          console.warn('Failed to check bidding pass:', err);
          setShowPlans(true);
          return;
        }
      }
      navigate(`/buyer/auction/${product.product_id}`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
        return <span className="badge badge-live">Bidding Live</span>;
      case 'approved':
        return <span className="badge badge-approved">Upcoming</span>;
      case 'ended':
        return <span className="badge badge-ended">Auction Ended</span>;
      case 'rejected':
        return <span className="badge badge-rejected">Rejected</span>;
      default:
        return <span className="badge badge-pending">Pending Review</span>;
    }
  };

  const renderSpecifications = () => {
    const specs = safeParseJSON(product.specifications, {});
    
    if (product.product_type === 'car' || product.product_type === 'bike') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>Manufacturing Year</span>
            <p style={{ fontWeight: 700, color: '#1F1A1D', margin: 0 }}>{specs.year || 'N/A'}</p>
          </div>
          <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>Fuel Type</span>
            <p style={{ fontWeight: 700, color: '#1F1A1D', margin: 0 }}>{specs.fuel_type || 'N/A'}</p>
          </div>
          <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>Odometer Reading</span>
            <p style={{ fontWeight: 700, color: '#1F1A1D', margin: 0 }}>{specs.km_driven ? specs.km_driven.toLocaleString() + ' km' : 'N/A'}</p>
          </div>
          <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>Ownership History</span>
            <p style={{ fontWeight: 700, color: '#1F1A1D', margin: 0 }}>{specs.ownership || 'N/A'}</p>
          </div>
          <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>Insurance Status</span>
            <p style={{ fontWeight: 700, color: '#1F1A1D', margin: 0 }}>{specs.insurance_status || 'N/A'}</p>
          </div>
          {specs.transmission && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>Transmission</span>
              <p style={{ fontWeight: 700, color: '#1F1A1D', margin: 0 }}>{specs.transmission}</p>
            </div>
          )}
        </div>
      );
    } else {
      // Laptop or Mobile specs
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {specs.processor && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>Processor</span>
              <p style={{ fontWeight: 700, color: '#1F1A1D', margin: 0 }}>{specs.processor}</p>
            </div>
          )}
          <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>RAM Memory</span>
            <p style={{ fontWeight: 700, color: '#1F1A1D', margin: 0 }}>{specs.ram || 'N/A'}</p>
          </div>
          <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>Storage Capacity</span>
            <p style={{ fontWeight: 700, color: '#1F1A1D', margin: 0 }}>{specs.storage || 'N/A'}</p>
          </div>
          {specs.imei_available !== undefined && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>IMEI Verified</span>
              <p style={{ fontWeight: 700, color: '#1F1A1D', margin: 0 }}>{specs.imei_available ? 'Yes' : 'No'}</p>
            </div>
          )}
          {specs.imei_number && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>IMEI Number</span>
              <p style={{ fontWeight: 700, color: '#1F1A1D', margin: 0 }}>{specs.imei_number}</p>
            </div>
          )}
          {specs.screen_size && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>Screen Size</span>
              <p style={{ fontWeight: 700, color: '#1F1A1D', margin: 0 }}>{specs.screen_size}</p>
            </div>
          )}
          {specs.graphics && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>Graphics Card</span>
              <p style={{ fontWeight: 700, color: '#1F1A1D', margin: 0 }}>{specs.graphics}</p>
            </div>
          )}
          {specs.battery_health && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>Battery Health</span>
              <p style={{ fontWeight: 700, color: '#1F1A1D', margin: 0 }}>{specs.battery_health}</p>
            </div>
          )}
          {specs.battery_backup && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>Battery Backup</span>
              <p style={{ fontWeight: 700, color: '#1F1A1D', margin: 0 }}>{specs.battery_backup}</p>
            </div>
          )}
          {specs.warranty_status && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>Warranty Status</span>
              <p style={{ fontWeight: 700, color: '#1F1A1D', margin: 0 }}>{specs.warranty_status}</p>
            </div>
          )}
          {specs.bill_available && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>Bill Available</span>
              <p style={{ fontWeight: 700, color: '#1F1A1D', margin: 0 }}>{specs.bill_available}</p>
            </div>
          )}
          {specs.warranty_available && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>Warranty Available</span>
              <p style={{ fontWeight: 700, color: '#1F1A1D', margin: 0 }}>{specs.warranty_available}</p>
            </div>
          )}
        </div>
      );
    }
  };

  const renderDocuments = () => {
    const docs = getVerificationDocuments(safeParseJSON(product.documents, {}));
    if (Object.keys(docs).length === 0) return null;

    return (
      <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <FileText size={16} style={{ color: '#6B1B71' }} /> Attached Legal Verification Docs
        </h4>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
          {Object.entries(docs).map(([key, val]) => (
            <div key={key} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              border: '1.5px solid #cbd5e1',
              borderRadius: '0.5rem',
              backgroundColor: '#FAF6EA',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#4a1a50'
            }}>
              <CheckCircle size={14} style={{ color: '#10b981' }} />
              <span>{key.replace(/_/g, ' ').toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column', gap: '1rem' }}>
        <div style={{
          border: '3px solid #cbd5e1',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          borderLeftColor: '#6B1B71',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ color: '#8B8278', fontSize: '0.9rem' }}>Loading specifications...</span>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', maxWidth: '600px', margin: '2rem auto' }}>
        <AlertCircle size={48} style={{ color: '#ef4444' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Product details error</h2>
        <p style={{ color: '#8B8278' }}>{errorMsg || 'Failed to retrieve details.'}</p>
        <button onClick={handleBack} className="btn btn-primary">
          Back to Marketplace
        </button>
      </div>
    );
  }

  const gallery = getProductGalleryImages(product);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Back CTA */}
      <button 
        onClick={handleBack} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'none',
          border: 'none',
          color: '#8B8278',
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}
      >
        <ArrowLeft size={16} /> Back to Marketplace
      </button>

      {/* Main Grid splits details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }} className="grid-cols-2">
        
        {/* Left column: Images / Video */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            height: '400px',
            backgroundColor: '#f1f5f9',
            borderRadius: '1rem',
            overflow: 'hidden',
            border: '1px solid #cbd5e1'
          }}>
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
          </div>

          {/* Thumbnail list */}
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem', alignItems: 'center' }}>
            {gallery.map((img, index) => (
              <button
                key={index}
                onClick={() => { setActiveImage(img); setMediaMode('image'); }}
                style={{
                  width: '80px',
                  height: '60px',
                  borderRadius: '0.5rem',
                  border: mediaMode === 'image' && activeImage === img ? '2.5px solid #6B1B71' : '1px solid #cbd5e1',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={handleImageError} />
              </button>
            ))}

            {/* Video Walkthrough Thumbnail tab */}
            {product.video && (
              <button
                onClick={() => setMediaMode('video')}
                style={{
                  width: '80px',
                  height: '60px',
                  borderRadius: '0.5rem',
                  border: mediaMode === 'video' ? '2.5px solid #6B1B71' : '1px solid #cbd5e1',
                  backgroundColor: '#1F1A1D',
                  color: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0
                }}
              >
                <PlayCircle size={20} style={{ color: '#ef4444' }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Walkthrough</span>
              </button>
            )}
          </div>
        </div>

        {/* Right column: Specs and CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Header Info */}
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
                {PRODUCT_TYPE_LABELS[product.product_type] || product.product_type}
              </span>
              {getStatusBadge(product.status)}
              {product.is_flagged && (
                <span className="badge" style={{ backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', fontSize: '0.7rem', fontWeight: 800 }}>
                  Flagged ⚠️
                </span>
              )}
              {product.is_cancelled && (
                <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontSize: '0.7rem', fontWeight: 800 }}>
                  Auction Cancelled 🛑
                </span>
              )}
            </div>
            
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1F1A1D', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', marginBottom: '0.5rem', lineHeight: 1.25, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {product.title}
              <button
                type="button"
                onClick={handleLikeToggle}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isLiked ? '#ef4444' : '#8B8278',
                  padding: '0.25rem',
                  transition: 'transform 0.15s ease'
                }}
                title={isLiked ? 'Remove from Liked' : 'Add to Liked'}
              >
                <Heart size={24} fill={isLiked ? '#ef4444' : 'none'} />
              </button>
            </h1>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <p style={{ color: '#8B8278', fontSize: '0.95rem', margin: 0 }}>
                Brand: <strong>{product.brand}</strong> &bull; Model: <strong>{product.model}</strong> &bull; Condition: <strong>{product.condition}</strong>
              </p>
              {product.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6B1B71', fontSize: '0.9rem', fontWeight: 650, marginTop: '0.35rem' }}>
                  <MapPin size={14} />
                  <span>Location: {product.location.address}</span>
                </div>
              )}
              {user && user.role?.toLowerCase() !== 'admin' && (
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    border: '1px solid #fca5a5',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <AlertCircle size={12} /> Report Listing
                </button>
              )}
            </div>
          </div>

          {/* Bid Status Banner */}
          <div className="card" style={{
            backgroundColor: '#FAF6EA',
            border: '1px solid #cbd5e1',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>
                  {isBuyer ? 'Bidding Status' : (product.status === 'live' ? 'Current Highest Bid' : 'Listing Status')}
                </span>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: '#1F1A1D', margin: 0 }}>
                  {isBuyer ? (product.status === 'live' ? 'Live' : (product.status || '').toUpperCase()) : (product.status === 'live' ? formatCurrency(product.current_bid || 0) : (product.status || '').toUpperCase())}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Bidding status</span>
                <p style={{ fontWeight: 800, color: product.status === 'live' ? '#ef4444' : '#6B1B71', textTransform: 'capitalize', margin: 0 }}>
                  {product.status}
                </p>
              </div>
            </div>

            {/* CTA action buttons */}
            {product.is_cancelled ? (
              <div style={{
                padding: '1rem',
                backgroundColor: '#fef2f2',
                border: '1.5px solid #fca5a5',
                borderRadius: '0.75rem',
                color: '#991b1b',
                fontSize: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontWeight: 600
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={18} style={{ color: '#ef4444' }} />
                  <span>Auction Cancelled</span>
                </div>
                {product.cancel_reason && (
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f1d1d', fontWeight: 500 }}>
                    Reason: {product.cancel_reason}
                  </p>
                )}
              </div>
            ) : product.status === 'live' ? (
              <button 
                onClick={handleJoinAuction}
                className="btn btn-success"
                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                Place Bid <ArrowRight size={18} />
              </button>
            ) : product.status === 'approved' ? (
              <div style={{
                padding: '1rem',
                backgroundColor: '#F5ECDD',
                border: '1px solid #D8CFC1',
                borderRadius: '0.75rem',
                color: '#7A2181',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600
              }}>
                <AlertCircle size={18} />
                <span>Auction not started yet. The seller or admin will trigger the live bidding timer shortly.</span>
              </div>
            ) : product.status === 'ended' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.75rem',
                  color: '#8B8278',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600
                }}>
                  <CheckCircle size={18} style={{ color: '#8B8278' }} />
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                    Bidding concluded. Winner:{' '}
                    {product.winner_name ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span className="bidder-avatar-chip bidder-avatar-chip--compact">{getNameInitials(product.winner_name)}</span>
                        <strong style={{ fontWeight: 800 }}>
                          {getBidderDisplayName(product.winner_name, product.winner_id, user)}
                        </strong>
                      </span>
                    ) : (
                      <strong>No bids placed</strong>
                    )}
                  </span>
                </div>

                {/* Seller contact detail visibility panel */}
                {user && (user.user_id === product.winner_id || user.id === product.winner_id) && (
                  <div style={{
                    padding: '1rem',
                    border: '1.5px solid #10b981',
                    borderRadius: '0.75rem',
                    backgroundColor: '#f0fdf4',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#166534', fontSize: '0.85rem', fontWeight: 700 }}>
                      <Trophy size={16} style={{ color: '#10b981' }} />
                      <span>Congratulations! You won this listing.</span>
                    </div>

                    <button
                      onClick={handleStartChat}
                      disabled={loadingChat}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        fontSize: '0.85rem',
                        backgroundColor: '#6B1B71',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: 700,
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        marginTop: '0.5rem'
                      }}
                    >
                      {loadingChat ? 'Sending Request...' : <>Contact Seller <MessageSquare size={14} /></>}
                    </button>
                  </div>
                )}

                {/* Winner contact details (Seller View) */}
                {isSeller && product.winner_id && (
                  <div style={{
                    padding: '1rem',
                    border: '1.5px solid #6B1B71',
                    borderRadius: '0.75rem',
                    backgroundColor: '#F5ECDD',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#7A2181', fontSize: '0.85rem', fontWeight: 700 }}>
                      <CheckCircle size={16} style={{ color: '#6B1B71' }} />
                      <span>This is your listing. Bidding concluded.</span>
                    </div>

                    <button
                      onClick={handleOpenAcceptedChat}
                      disabled={loadingChat}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        fontSize: '0.85rem',
                        backgroundColor: '#6B1B71',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: 700,
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        marginTop: '0.5rem'
                      }}
                    >
                      {loadingChat ? 'Opening Chat...' : <>Chat with Winner <MessageSquare size={14} /></>}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                padding: '1rem',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '0.75rem',
                color: '#b45309',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600
              }}>
                <AlertCircle size={18} />
                <span>This product listing is undergoing administrator quality verification checks.</span>
              </div>
            )}
          </div>

          {/* Specifications table */}
          {renderSpecifications()}

          {/* Documents indicator */}
          {renderDocuments()}

          {/* Description */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Listing Description</h3>
            <p style={{ color: '#8B8278', fontSize: '0.925rem', lineHeight: 1.6 }}>
              {product.description}
            </p>
          </div>

          {/* Optional video walkthrough link */}
          {product.video && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <PlayCircle size={20} style={{ color: '#6B1B71' }} />
              <a href={normalizeImageUrl(product.video)} target="_blank" rel="noopener noreferrer" style={{ color: '#6B1B71', fontWeight: 700, fontSize: '0.9rem' }}>
                Open Video Walkthrough
              </a>
            </div>
          )}

          {/* Seller Bids Received Log */}
          {isSeller && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid #D8CFC1', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={16} style={{ color: '#6B1B71' }} /> Bids Received Log ({bidHistoryList.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
                {bidHistoryList.length === 0 ? (
                  <span style={{ fontSize: '0.85rem', color: '#8B8278', textAlign: 'center', padding: '1.5rem 0' }}>
                    No bids received yet.
                  </span>
                ) : (
                  bidHistoryList.map((bid, idx) => (
                    <div key={bid.id || idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#FAF6EA',
                      border: '1px solid #D8CFC1',
                      borderRadius: '0.5rem',
                      fontSize: '0.85rem'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span className="bidder-avatar-chip bidder-avatar-chip--compact">{getNameInitials(bid.bidderName || bid.bidder_name || 'Anonymous')}</span>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1F1A1D' }}>
                            {getBidderDisplayName(bid.bidderName || bid.bidder_name, bid.bidderId || bid.bidder_id, user)}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.7rem', color: '#8B8278', margin: 0 }}>{bid.time || 'N/A'}</p>
                      </div>
                      {!isBuyer && <span style={{ fontWeight: 800, color: '#6B1B71' }}>{formatCurrency(bid.amount)}</span>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* REPORT MODAL OVERLAY */}
      {showReportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 15, 25, 0.75)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          <div style={{
            backgroundColor: '#FAF6EA',
            borderRadius: '1rem',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
            border: '1px solid #D8CFC1',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #D8CFC1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAF6EA'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#1F1A1D', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertCircle size={20} style={{ color: '#ef4444' }} /> Report Listing Violation
              </h3>
              <button 
                type="button"
                onClick={() => setShowReportModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B8278' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitReport}>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Select Type */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#4a1a50' }}>Violation Type *</label>
                  <select
                    className="form-control"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    required
                    style={{ height: '42px', fontSize: '0.875rem' }}
                  >
                    <option value="suspicious_auction">Suspicious Auction Activity</option>
                    <option value="fake_listing">Fake Listing</option>
                    <option value="fake_bid">Fake Bid Placed</option>
                    <option value="shill_bidding">Shill Bidding / Bid Manipulation</option>
                    <option value="wrong_product_details">Wrong Product Details</option>
                    <option value="fake_documents">Fake Verification Documents</option>
                    <option value="abusive_user">Abusive User / Harassment</option>
                    <option value="payment_contact_fraud">Payment or Contact Fraud</option>
                    <option value="other">Other Violation</option>
                  </select>
                </div>

                {/* Reason Text */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#4a1a50' }}>Reason Details (Minimum 10 characters) *</label>
                  <textarea
                    rows={4}
                    className="form-control"
                    placeholder="Provide details about why you are reporting this listing. Be as specific as possible."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                    style={{ fontSize: '0.875rem', lineHeight: 1.4 }}
                  />
                  <span style={{ fontSize: '0.7rem', color: reportReason.trim().length >= 10 ? '#10b981' : '#ef4444', fontWeight: 600, marginTop: '0.25rem', display: 'block' }}>
                    {reportReason.trim().length} / 10 characters minimum
                  </span>
                </div>

                {/* Evidence URL / Base64 */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#4a1a50' }}>Evidence Attachment Link (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Host url, screenshot link, or base64 data"
                    value={reportEvidence}
                    onChange={(e) => setReportEvidence(e.target.value)}
                    style={{ height: '42px', fontSize: '0.875rem' }}
                  />
                </div>

              </div>

              {/* Form Footer */}
              <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid #D8CFC1',
                backgroundColor: '#FAF6EA',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem'
              }}>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport || reportReason.trim().length < 10}
                  className="btn btn-primary"
                  style={{
                    padding: '0.5rem 1.5rem',
                    fontSize: '0.85rem',
                    backgroundColor: '#dc2626',
                    borderColor: '#dc2626'
                  }}
                >
                  {submittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PricingPlanPopup
        isOpen={showPlans}
        productType={product?.product_type}
        requiredPlan={requiredPlan}
        onClose={() => setShowPlans(false)}
        onActivated={() => {
          loadProductData();
        }}
      />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ListingDetailsPage;
