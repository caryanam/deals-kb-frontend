import React, { useState } from 'react';
import { X, CheckCircle, Loader2, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { createManualPayment } from '../../api/paymentApi';
import { formatCurrency } from '../../utils/helpers';
import qrPaymentImg from '../../assets/qr_payment.jpg';

export const UpiPaymentModal = ({
  isOpen,
  onClose,
  amount,
  planName,
  paymentType,
  planId,
  listingId,
  onSuccess
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmitRequest = async () => {
    try {
      setSubmitting(true);
      await createManualPayment({
        payment_type: paymentType,
        plan_id: planId || undefined,
        listing_id: listingId || undefined,
        subscription_plan_id: planId || undefined
      });
      setSuccess(true);
      toast.success('Your payment request has been sent for approval.');
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to submit manual payment request:', err);
      toast.error(err.response?.data?.detail || 'Failed to submit payment request.');
    } finally {
      setSubmitting(false);
    }
  };

  const origAmt = Number(amount) || 1;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 11000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.5rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '370px',
        maxHeight: '94vh',
        backgroundColor: '#FAF6EA',
        borderRadius: '1.25rem',
        border: '3px solid #1F1A1D',
        boxShadow: '6px 6px 0px #1F1A1D',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '0.75rem 1rem',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          borderBottom: '1.5px solid #1F1A1D',
          backgroundColor: '#FAF6EA',
          zIndex: 10
        }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#1F1A1D' }}>Scan &amp; Pay</h3>
          {!success && (
            <button
              onClick={onClose}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1F1A1D', display: 'flex', alignItems: 'center' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          overflowY: 'auto',
          flex: 1
        }}>
          {success ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center', padding: '1.5rem 0' }}>
              <CheckCircle size={50} style={{ color: '#16a34a', animation: 'bounce 1s infinite' }} />
              <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1F1A1D', margin: 0 }}>Request Submitted!</h4>
              <p style={{ fontSize: '0.8rem', color: '#8B8278', margin: 0, lineHeight: 1.4 }}>
                Your payment request has been sent for approval. Admin will verify and activate your pass shortly.
              </p>
            </div>
          ) : (
            <>
              {/* Plan info & slashed price */}
              <div style={{ textAlign: 'center', width: '100%' }}>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>{planName}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                  {origAmt > 1 && (
                    <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '1.1rem', fontWeight: 700 }}>
                      {formatCurrency(origAmt)}
                    </span>
                  )}
                  <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 950, color: '#6B1B71' }}>₹1.00</h2>
                </div>
                <span style={{
                  display: 'inline-block',
                  marginTop: '0.2rem',
                  padding: '0.15rem 0.55rem',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #f59e0b',
                  borderRadius: '0.4rem',
                  fontSize: '0.68rem',
                  fontWeight: 800
                }}>
                  🔥 Launch Offer ₹1 till 31 Aug
                </span>
              </div>

              {/* Clean Google Pay QR Image */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '3.5px solid #1F1A1D',
                borderRadius: '0.85rem',
                padding: '0.4rem',
                boxShadow: '3px 3px 0px #1F1A1D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '150px',
                height: '150px'
              }}>
                <img
                  src={qrPaymentImg}
                  alt="Google Pay UPI QR Code"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>

              {/* UPI ID Info */}
              <div style={{
                textAlign: 'center',
                border: '2px dashed #D8CFC1',
                borderRadius: '0.65rem',
                padding: '0.4rem 0.75rem',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.4)'
              }}>
                <span style={{ fontSize: '0.65rem', color: '#8B8278', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>UPI ID</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1F1A1D', letterSpacing: '0.02em' }}>7755994123@slc</span>
              </div>

              {/* Info Note */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.4rem',
                backgroundColor: '#e0f2fe',
                border: '1.5px solid #0284c7',
                borderRadius: '0.65rem',
                padding: '0.45rem 0.75rem',
                width: '100%',
                color: '#0369a1',
                fontSize: '0.72rem',
                fontWeight: 700,
                lineHeight: 1.35,
                textAlign: 'left'
              }}>
                <Info size={14} style={{ flexShrink: 0, marginTop: '0.05rem', color: '#0284c7' }} />
                <div>
                  Our integrated CC Avenue UPI &amp; QR payment option will be available soon.
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#8B8278', textAlign: 'center', lineHeight: 1.35, fontWeight: 700 }}>
                Scan the QR code above and transfer exactly <strong style={{ color: '#16a34a' }}>₹1.00</strong>. After payment, click below to notify admin.
              </div>

              {/* Action Button */}
              <button
                onClick={handleSubmitRequest}
                disabled={submitting}
                style={{
                  width: '100%',
                  height: '42px',
                  backgroundColor: '#6B1B71',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '999px',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(107, 27, 113, 0.25)',
                  marginTop: '0.15rem'
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...
                  </>
                ) : (
                  'Done Payment? Request Approval'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpiPaymentModal;
