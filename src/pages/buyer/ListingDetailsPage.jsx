import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Fuel, Calendar, Gauge, ShieldCheck, AlertCircle, PlayCircle, CheckCircle, Cpu, Layers, HardDrive, FileText, Trophy, ArrowRight, MessageSquare, X } from 'lucide-react';
import { getProductById, getSellerContact, getWinnerContact, getProductBids } from '../../api/productApi';
import { createConversation } from '../../api/chatApi';
import { createChatRequest } from '../../api/chatRequestApi';
import { createReport } from '../../api/reportApi';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, PRODUCT_TYPE_LABELS, safeParseJSON } from '../../utils/helpers';
import { toast } from 'react-toastify';
import PricingPlanPopup from '../../components/listings/PricingPlanPopup';
import { getMyPlans } from '../../api/paymentApi';

export const ListingDetailsPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeImage, setActiveImage] = useState('');
  const [mediaMode, setMediaMode] = useState('image'); // 'image' or 'video'

  // Seller contact states (Buyer View)
  const [sellerContact, setSellerContact] = useState(null);
  const [contactError, setContactError] = useState('');
  const [loadingContact, setLoadingContact] = useState(false);

  // Winner contact states (Seller View)
  const [winnerContact, setWinnerContact] = useState(null);
  const [winnerContactError, setWinnerContactError] = useState('');
  const [loadingWinnerContact, setLoadingWinnerContact] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [bidHistoryList, setBidHistoryList] = useState([]);
  const [showPlans, setShowPlans] = useState(false);
  const [requiredPlan, setRequiredPlan] = useState(null);

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

  const loadProductData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const details = await getProductById(productId);
      setProduct(details);
      
      const photosArray = safeParseJSON(details.photos, []);
      if (photosArray.length > 0) {
        setActiveImage(photosArray[0]);
      }

      // Fetch bids history log
      try {
        const bids = await getProductBids(productId);
        setBidHistoryList(bids || []);
      } catch (err) {
        console.warn('Failed to load bids list:', err);
      }
    } catch (err) {
      console.error('Failed to load product details:', err);
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Unable to load product details. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductData();
  }, [productId]);

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
            const required = (plans || []).find((plan) => plan.product_type === product.product_type && plan.role === 'Buyer');
            setRequiredPlan(required || null);
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
        return <span className="badge badge-approved">Approved</span>;
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
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Manufacturing Year</span>
            <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{specs.year || 'N/A'}</p>
          </div>
          <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Fuel Type</span>
            <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{specs.fuel_type || 'N/A'}</p>
          </div>
          <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Odometer Reading</span>
            <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{specs.km_driven ? specs.km_driven.toLocaleString() + ' km' : 'N/A'}</p>
          </div>
          <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Ownership History</span>
            <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{specs.ownership || 'N/A'}</p>
          </div>
          <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Insurance Status</span>
            <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{specs.insurance_status || 'N/A'}</p>
          </div>
          {specs.transmission && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Transmission</span>
              <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{specs.transmission}</p>
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
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Processor</span>
              <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{specs.processor}</p>
            </div>
          )}
          <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>RAM Memory</span>
            <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{specs.ram || 'N/A'}</p>
          </div>
          <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Storage Capacity</span>
            <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{specs.storage || 'N/A'}</p>
          </div>
          {specs.imei_available !== undefined && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>IMEI Verified</span>
              <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{specs.imei_available ? 'Yes' : 'No'}</p>
            </div>
          )}
          {specs.imei_number && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>IMEI Number</span>
              <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{specs.imei_number}</p>
            </div>
          )}
          {specs.screen_size && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Screen Size</span>
              <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{specs.screen_size}</p>
            </div>
          )}
          {specs.graphics && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Graphics Card</span>
              <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{specs.graphics}</p>
            </div>
          )}
          {specs.battery_health && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Battery Health</span>
              <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{specs.battery_health}</p>
            </div>
          )}
          {specs.battery_backup && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Battery Backup</span>
              <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{specs.battery_backup}</p>
            </div>
          )}
          {specs.warranty_status && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Warranty Status</span>
              <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{specs.warranty_status}</p>
            </div>
          )}
          {specs.bill_available && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Bill Available</span>
              <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{specs.bill_available}</p>
            </div>
          )}
          {specs.warranty_available && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Warranty Available</span>
              <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{specs.warranty_available}</p>
            </div>
          )}
        </div>
      );
    }
  };

  const renderDocuments = () => {
    const docs = safeParseJSON(product.documents, {});
    if (Object.keys(docs).length === 0) return null;

    return (
      <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <FileText size={16} style={{ color: '#2563eb' }} /> Attached Legal Verification Docs
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
              backgroundColor: '#f8fafc',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#334155'
            }}>
              <CheckCircle size={14} style={{ color: '#10b981' }} />
              <span>{key.replace('_', ' ').toUpperCase()}</span>
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
          borderLeftColor: '#2563eb',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading specifications...</span>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', maxWidth: '600px', margin: '2rem auto' }}>
        <AlertCircle size={48} style={{ color: '#ef4444' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Product details error</h2>
        <p style={{ color: '#64748b' }}>{errorMsg || 'Failed to retrieve details.'}</p>
        <button onClick={handleBack} className="btn btn-primary">
          Back to Marketplace
        </button>
      </div>
    );
  }

  const gallery = safeParseJSON(product.photos, []);

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
          color: '#64748b',
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
                src={product.video} 
                controls 
                style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000000' }}
              />
            ) : (
              <img 
                src={activeImage || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=60'} 
                alt={product.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
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
                  border: mediaMode === 'image' && activeImage === img ? '2.5px solid #2563eb' : '1px solid #cbd5e1',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                  border: mediaMode === 'video' ? '2.5px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: '#0f172a',
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
            
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0b0f19', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', marginBottom: '0.5rem', lineHeight: 1.25 }}>
              {product.title}
            </h1>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                Brand: <strong>{product.brand}</strong> &bull; Model: <strong>{product.model}</strong> &bull; Condition: <strong>{product.condition}</strong>
              </p>
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
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  {product.status === 'live' ? 'Current Highest Bid' : 'Listing Status'}
                </span>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: '#0b0f19', margin: 0 }}>
                  {product.status === 'live' ? formatCurrency(product.current_bid || 0) : (product.status || '').toUpperCase()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Bidding status</span>
                <p style={{ fontWeight: 800, color: product.status === 'live' ? '#ef4444' : '#2563eb', textTransform: 'capitalize', margin: 0 }}>
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
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '0.75rem',
                color: '#1e40af',
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
                  color: '#475569',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600
                }}>
                  <CheckCircle size={18} style={{ color: '#64748b' }} />
                  <span>Bidding concluded. Winner: <strong>{product.winner_name || 'No bids placed'}</strong></span>
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
                        backgroundColor: '#2563eb',
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
                    border: '1.5px solid #2563eb',
                    borderRadius: '0.75rem',
                    backgroundColor: '#eff6ff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#1e40af', fontSize: '0.85rem', fontWeight: 700 }}>
                      <CheckCircle size={16} style={{ color: '#2563eb' }} />
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
                        backgroundColor: '#2563eb',
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
            <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.6 }}>
              {product.description}
            </p>
          </div>

          {/* Optional video walkthrough link */}
          {product.video && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <PlayCircle size={20} style={{ color: '#2563eb' }} />
              <a href={product.video} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.9rem' }}>
                Open Video Walkthrough
              </a>
            </div>
          )}

          {/* Seller Bids Received Log */}
          {isSeller && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={16} style={{ color: '#2563eb' }} /> Bids Received Log ({bidHistoryList.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
                {bidHistoryList.length === 0 ? (
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '1.5rem 0' }}>
                    No bids received yet.
                  </span>
                ) : (
                  bidHistoryList.map((bid, idx) => (
                    <div key={bid.id || idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      fontSize: '0.85rem'
                    }}>
                      <div>
                        <span style={{ fontWeight: 700, color: '#334155' }}>{bid.bidderName || bid.bidder_name || 'Anonymous'}</span>
                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>{bid.time || 'N/A'}</p>
                      </div>
                      <span style={{ fontWeight: 800, color: '#2563eb' }}>{formatCurrency(bid.amount)}</span>
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
            backgroundColor: '#ffffff',
            borderRadius: '1rem',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8fafc'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertCircle size={20} style={{ color: '#ef4444' }} /> Report Listing Violation
              </h3>
              <button 
                type="button"
                onClick={() => setShowReportModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitReport}>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Select Type */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#334155' }}>Violation Type *</label>
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
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#334155' }}>Reason Details (Minimum 10 characters) *</label>
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
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#334155' }}>Evidence Attachment Link (Optional)</label>
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
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
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

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <PricingPlanPopup
        isOpen={showPlans}
        productType={product?.product_type || requiredPlan?.product_type || 'mobile'}
        requiredPlan={requiredPlan}
        onClose={() => setShowPlans(false)}
        onActivated={() => navigate(`/buyer/auction/${product.product_id}`)}
      />
    </div>
  );
};

export default ListingDetailsPage;
