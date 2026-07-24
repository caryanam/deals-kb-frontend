import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClipboardList, Eye, Check, X, AlertTriangle, FileText, Film, RefreshCw } from 'lucide-react';
import { getProducts, reviewProduct } from '../../api/productApi';
import { formatINR, PRODUCT_TYPE_LABELS, safeParseJSON } from '../../utils/helpers';
import { normalizeImageUrl, getProductGalleryImages, handleImageError } from '../../utils/imageUtils';
import { toast } from 'react-toastify';

const VERIFICATION_DOCUMENT_KEYS = new Set(['rc_copy', 'insurance_copy', 'aadhaar_card', 'pan_card']);
const getVerificationDocuments = (docs = {}) => Object.fromEntries(
  Object.entries(docs || {}).filter(([key, value]) => VERIFICATION_DOCUMENT_KEYS.has(key) && value)
);

export const PendingListingsPage = () => {
  const [searchParams] = useSearchParams();
  const openId = searchParams.get('open');

  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Preview overlay state
  const [previewMedia, setPreviewMedia] = useState(null); // { type: 'image'|'video'|'pdf', src: string, title: string }

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const fetchPending = async () => {
    try {
      setLoading(true);
      // Retrieve products awaiting review
      const list = await getProducts({ status_filter: 'pending' });
      setPendingList(list || []);
    } catch (err) {
      console.error('Failed to load pending reviews:', err);
      toast.error('Failed to load verification queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  useEffect(() => {
    if (openId && pendingList.length > 0) {
      const listing = pendingList.find(p => p.product_id === openId);
      if (listing) {
        setSelectedListing(listing);
      }
    }
  }, [openId, pendingList]);

  const handleApprove = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Approve Listing',
      message: 'Are you sure you want to approve this product listing? It will immediately join the live marketplace catalog.',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await reviewProduct(id, { status: 'approved' });
          toast.success('Listing approved successfully!');
          setSelectedListing(null);
          fetchPending();
        } catch (err) {
          const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to approve listing.';
          toast.error(msg);
        } finally {
          setActionLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }

    try {
      setActionLoading(true);
      await reviewProduct(selectedListing.product_id, {
        status: 'rejected',
        reject_reason: rejectionReason
      });
      toast.success('Listing rejected successfully!');
      
      setSelectedListing(null);
      setRejectionReason('');
      setShowRejectForm(false);
      fetchPending();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to reject listing.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Render category specifications dynamically in modal
  const renderModalSpecs = () => {
    if (!selectedListing) return null;
    const specs = safeParseJSON(selectedListing.specifications, {});

    if (selectedListing.product_type === 'car' || selectedListing.product_type === 'bike') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }} className="grid-cols-2">
          <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Brand/Model</span>
            <p style={{ fontWeight: 700, margin: 0 }}>{selectedListing.brand} {selectedListing.model}</p>
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
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Expected Price</span>
            <p style={{ fontWeight: 700, margin: 0 }}>{formatINR(selectedListing.expected_price)}</p>
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
            <p style={{ fontWeight: 700, margin: 0 }}>{selectedListing.seller_name || 'Seller'}</p>
          </div>
        </div>
      );
    } else {
      // Laptop / Mobile Specs
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }} className="grid-cols-2">
          <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Brand/Model</span>
            <p style={{ fontWeight: 700, margin: 0 }}>{selectedListing.brand} {selectedListing.model}</p>
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
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Expected Valuation</span>
            <p style={{ fontWeight: 700, margin: 0 }}>{formatINR(selectedListing.expected_price)}</p>
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
          {specs.warranty_available && (
            <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Warranty Available</span>
              <p style={{ fontWeight: 700, margin: 0 }}>{specs.warranty_available}</p>
            </div>
          )}
          <div style={{ padding: '0.75rem', border: '1.5px solid #D8CFC1', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Seller Account</span>
            <p style={{ fontWeight: 700, margin: 0 }}>{selectedListing.seller_name || 'Seller'}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1F1A1D', fontFamily: "'Outfit', sans-serif" }}>Pending Verifications</h1>
          <p style={{ color: '#8B8278', fontSize: '0.9rem' }}>Inspect specifications, check legal attached documents, and approve or reject submissions</p>
        </div>
        <button 
          onClick={fetchPending} 
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
          <span style={{ color: '#8B8278', fontSize: '0.85rem' }}>Loading review queue...</span>
        </div>
      ) : pendingList.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: '#8B8278', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <ClipboardList size={48} style={{ color: '#cbd5e1' }} />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4a1a50' }}>Verification queue is clear</h3>
            <p style={{ fontSize: '0.9rem', color: '#8B8278', marginTop: '0.25rem' }}>No pending listings waiting for review.</p>
          </div>
        </div>
      ) : (
        /* Queue Table */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAF6EA', borderBottom: '1px solid #D8CFC1' }}>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Listing Title</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Brand & Model</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Valuation</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.map((listing) => (
                  <tr key={listing.product_id} style={{ borderBottom: '1px solid #D8CFC1' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.95rem', fontWeight: 700, color: '#1F1A1D' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{listing.title}</span>
                        {listing.is_relisted && (
                          <span 
                            title={`Relisted from Listing ID: ${listing.parent_product_id}`}
                            style={{
                              backgroundColor: '#faf5ff',
                              color: '#6B1B71',
                              border: '1px solid #d8b4fe',
                              borderRadius: '0.25rem',
                              padding: '0.1rem 0.4rem',
                              fontSize: '0.7rem',
                              fontWeight: 700
                            }}
                          >
                            Relisted
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      {PRODUCT_TYPE_LABELS[listing.product_type] || listing.product_type}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#8B8278' }}>
                      {listing.brand} {listing.model}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.95rem', fontWeight: 800, color: '#1F1A1D' }}>
                      {formatINR(listing.expected_price)}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <button
                        onClick={() => setSelectedListing(listing)}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Eye size={12} /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INSPECTION MODAL DRAWER OVERLAY */}
      {selectedListing && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 15, 25, 0.7)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: '#FAF6EA',
            borderRadius: '1.25rem',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            overflow: 'hidden'
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-pending">Inspection Queue</span>
                  {selectedListing.is_relisted && (
                    <span style={{
                      backgroundColor: '#faf5ff',
                      color: '#6B1B71',
                      border: '1px solid #d8b4fe',
                      borderRadius: '0.25rem',
                      padding: '0.1rem 0.4rem',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>
                      Relisted from #{selectedListing.parent_product_id}
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>
                  Inspect: {selectedListing.title}
                </h2>
              </div>
              <button 
                onClick={() => { setSelectedListing(null); setShowRejectForm(false); }} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B8278' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Media gallery */}
              <div>
                <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Photos (Click to preview)</span>
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {getProductGalleryImages(selectedListing).map((img, idx) => (
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
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <img src={normalizeImageUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={handleImageError} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Video preview marker */}
              {selectedListing.video && (
                <div style={{ padding: '1rem', border: '1px dashed #cbd5e1', borderRadius: '0.75rem', backgroundColor: '#FAF6EA' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#4a1a50', display: 'block', marginBottom: '0.5rem' }}>Video Walkthrough:</strong>
                  <div 
                    onClick={() => setPreviewMedia({ type: 'video', src: normalizeImageUrl(selectedListing.video), title: 'Listing Video Walkthrough' })}
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
                    <video src={normalizeImageUrl(selectedListing.video)} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, position: 'absolute', inset: 0 }} muted />
                  </div>
                </div>
              )}

              {/* Attributes specs sheet grid */}
              {renderModalSpecs()}

              {/* Attached documents list check */}
              {(() => {
                const docs = getVerificationDocuments(safeParseJSON(selectedListing.documents, {}));
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
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.5rem 0.75rem',
                              border: '1.5px solid #D8CFC1',
                              backgroundColor: '#F5ECDD',
                              borderRadius: '0.5rem',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: '#7A2181',
                              cursor: 'pointer'
                            }}
                          >
                            <FileText size={14} />
                            <span>{key.replace(/_/g, ' ').toUpperCase()}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Description */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Description</h4>
                <p style={{ color: '#8B8278', fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {selectedListing.description}
                </p>
              </div>

              {/* Rejection input overlay block */}
              {showRejectForm && (
                <form onSubmit={handleRejectSubmit} style={{
                  padding: '1.25rem',
                  backgroundColor: '#fef2f2',
                  border: '1.5px solid #fca5a5',
                  borderRadius: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  marginTop: '0.5rem'
                }}>
                  <h4 style={{ fontSize: '0.95rem', color: '#b91c1c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AlertTriangle size={16} /> Enter Rejection Reason
                  </h4>
                  <textarea
                    className="form-control"
                    placeholder="Specify why this listing is being rejected..."
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-end' }}>
                    <button 
                      type="button" 
                      onClick={() => setShowRejectForm(false)} 
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-danger" 
                      style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                      disabled={actionLoading}
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Actions Footer */}
            {!showRejectForm && (
              <div style={{
                padding: '1.5rem',
                borderTop: '1px solid #D8CFC1',
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
                backgroundColor: '#FAF6EA'
              }}>
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="btn btn-danger"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  disabled={actionLoading}
                >
                  <X size={16} /> Reject Listing
                </button>
                <button
                  onClick={() => handleApprove(selectedListing.product_id)}
                  className="btn btn-success"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#10b981' }}
                  disabled={actionLoading}
                >
                  <Check size={16} /> Approve Listing
                </button>
              </div>
            )}
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
              {previewMedia.src?.startsWith('data:') && (
                <a 
                  href={previewMedia.src} 
                  download={previewMedia.title.toLowerCase().replace(/\s+/g, '_')}
                  className="btn btn-secondary"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  Download File
                </a>
              )}
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
                  backgroundColor: '#10b981',
                  borderColor: '#10b981',
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

export default PendingListingsPage;
