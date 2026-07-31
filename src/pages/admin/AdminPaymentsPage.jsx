import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Loader2, Check, ExternalLink, Clock, CreditCard,
  Smartphone, Laptop, Car, Bike, ShoppingBag, User, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getAdminPayments } from '../../api/paymentApi';
import { formatCurrency } from '../../utils/helpers';

/* ── helpers ─────────────────────────────────────── */
const PLAN_META = {
  buyer_mobile_day:           { label: 'Mobile',       color: '#6366f1', bg: '#eef2ff', Icon: Smartphone  },
  buyer_laptop_day:           { label: 'Laptop',       color: '#0891b2', bg: '#ecfeff', Icon: Laptop      },
  buyer_car_day:              { label: 'Car',          color: '#d97706', bg: '#fffbeb', Icon: Car          },
  buyer_bike_day:             { label: 'Bike',         color: '#16a34a', bg: '#f0fdf4', Icon: Bike         },
  seller_listing:             { label: 'Listing',      color: '#6B1B71', bg: '#fdf4ff', Icon: ShoppingBag  },
  dealer_car_monthly:         { label: 'Dealer Car',   color: '#d97706', bg: '#fffbeb', Icon: Car          },
  dealer_mobile_monthly:      { label: 'Dealer Mobile',color: '#6366f1', bg: '#eef2ff', Icon: Smartphone  },
  dealer_laptop_bike_monthly: { label: 'Dealer L/B',  color: '#0891b2', bg: '#ecfeff', Icon: Laptop       },
};

const getPlanMeta = (planId, paymentType) => {
  if (PLAN_META[planId]) return PLAN_META[planId];
  if (paymentType === 'SELLER_LISTING') return PLAN_META['seller_listing'];
  return { label: 'Pass', color: '#6B1B71', bg: '#fdf4ff', Icon: CreditCard };
};

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '';

/* ── sub-components ──────────────────────────────── */
const RequestCard = ({ req, approvingId, onApprove }) => {
  const { color, bg, Icon } = getPlanMeta(req.plan_id, req.payment_type);
  return (
    <div style={{
      backgroundColor: '#ffffff', borderRadius: '1.25rem', overflow: 'hidden',
      border: '1.5px solid #E5E0D8', boxShadow: '0 4px 18px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column',
      transition: 'transform 0.18s ease, box-shadow 0.18s ease'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.09)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.05)'; }}
    >
      <div style={{ backgroundColor: bg, padding: '1.25rem 1.25rem 1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', borderBottom: `1.5px solid ${color}22` }}>
        <div style={{ width: 44, height: 44, borderRadius: '0.75rem', backgroundColor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={22} color={color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color }}>{req.payment_type === 'SELLER_LISTING' ? 'Seller Listing Fee' : 'Buyer Bidding Pass'}</p>
          <h3 style={{ margin: '0.1rem 0 0', fontSize: '1rem', fontWeight: 900, color: '#1F1A1D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {req.plan_name || 'Payment Request'}
          </h3>
        </div>
        <span style={{ padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 800, backgroundColor: '#fef9c3', color: '#92400e', border: '1.5px solid #fbbf24', whiteSpace: 'nowrap' }}>
          Pending
        </span>
      </div>

      <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#F3EDF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={14} color="#6B1B71" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: '#1F1A1D' }}>{req.user_name}</p>
            <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 600, color: '#8B8278' }}>{req.user_role}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
          <span style={{ fontSize: '1.55rem', fontWeight: 950, color, lineHeight: 1 }}>{formatCurrency(Number(req.amount))}</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8B8278' }}>via UPI</span>
        </div>
        {req.payment_type === 'SELLER_LISTING' && req.product_title && (
          <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: '#6B1B71', backgroundColor: '#fdf4ff', borderRadius: '0.5rem', padding: '0.3rem 0.6rem' }}>
            📦 {req.product_title}
          </p>
        )}
      </div>

      <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid #F0EBE3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.72rem', color: '#8B8278', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Clock size={11} /> {fmtDate(req.initiated_at || req.created_at)}
        </span>
        <button
          type="button" onClick={() => onApprove(req)}
          disabled={approvingId === req.payment_id}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.5rem 1.15rem', borderRadius: '999px',
            fontSize: '0.8rem', fontWeight: 800,
            backgroundColor: '#16a34a', color: '#ffffff',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
            opacity: approvingId === req.payment_id ? 0.65 : 1
          }}
        >
          {approvingId === req.payment_id
            ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
            : <Check size={13} />}
          Approve
        </button>
      </div>
    </div>
  );
};

const HistoryCard = ({ item }) => {
  const isUpi = item.payment_gateway === 'UPI';
  const isPaid = item.status === 'SUCCESS' || item.status === 'PAID';
  const { color, bg, Icon } = getPlanMeta(item.plan_id, item.payment_type);
  return (
    <div style={{
      backgroundColor: '#ffffff', borderRadius: '1.25rem', overflow: 'hidden',
      border: '1.5px solid #E5E0D8', boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column',
      transition: 'transform 0.18s ease, box-shadow 0.18s ease'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.09)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.04)'; }}
    >
      <div style={{ backgroundColor: bg, padding: '1.1rem 1.25rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: `1.5px solid ${color}22` }}>
        <div style={{ width: 40, height: 40, borderRadius: '0.65rem', backgroundColor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={20} color={color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color }}>
            {item.payment_type === 'SELLER_LISTING' ? 'Seller Listing Fee' : 'Buyer Bidding Pass'}
          </p>
          <h3 style={{ margin: '0.1rem 0 0', fontSize: '0.95rem', fontWeight: 900, color: '#1F1A1D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.plan_name || item.payment_type}
          </h3>
        </div>
        <span style={{
          padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 800, whiteSpace: 'nowrap',
          backgroundColor: isPaid ? '#dcfce7' : '#fee2e2',
          color: isPaid ? '#166534' : '#991b1b',
          border: isPaid ? '1.5px solid #16a34a' : '1.5px solid #ef4444'
        }}>
          {isPaid ? 'Paid' : 'Failed'}
        </span>
      </div>

      <div style={{ padding: '0.9rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.55rem', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: '#F3EDF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={13} color="#6B1B71" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: '#1F1A1D' }}>{item.user_name}</p>
            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 600, color: '#8B8278' }}>{item.user_role}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 950, color, lineHeight: 1 }}>{formatCurrency(Number(item.amount))}</span>
          {isUpi && <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#166534', backgroundColor: '#f0fdf4', borderRadius: '0.4rem', padding: '0.1rem 0.4rem' }}>UPI</span>}
          {!isUpi && <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1d4ed8', backgroundColor: '#eff6ff', borderRadius: '0.4rem', padding: '0.1rem 0.4rem' }}>CCAvenue</span>}
        </div>
        {!isUpi && item.order_id && (
          <p style={{ margin: 0, fontSize: '0.68rem', color: '#8B8278', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Txn: {item.order_id}
          </p>
        )}
        {item.payment_type === 'SELLER_LISTING' && item.listing_id && isPaid && (
          <Link
            to={`/buyer/auction/${item.listing_id}`} target="_blank"
            style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B1B71', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'underline' }}
          >
            {item.product_title || 'View Listing'} <ExternalLink size={11} />
          </Link>
        )}
      </div>

      <div style={{ padding: '0.7rem 1.25rem', borderTop: '1px solid #F0EBE3' }}>
        <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Clock size={11} /> {fmtDate(item.completed_at || item.initiated_at || item.created_at)}
        </span>
      </div>
    </div>
  );
};

/* ── page ─────────────────────────────────────────── */
export const AdminPaymentsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [historyPage, setHistoryPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  const { data, isLoading: loading } = useQuery({
    queryKey: ['adminPayments'],
    queryFn: getAdminPayments,
    refetchInterval: 30000,   // auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
    onError: () => toast.error('Failed to retrieve payments queue.')
  });

  const requests = data?.requests || [];
  const history  = data?.history  || [];

  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE) || 1;
  const paginatedHistory = history.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1F1A1D', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
            Payment History Log
          </h1>
          <p style={{ color: '#8B8278', margin: '0.35rem 0 0', fontWeight: 600 }}>
            Review global transaction history and audit checkout records.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
          <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: '#6B1B71' }} />
        </div>
      ) : (
        /* ── History with 6 items/page Pagination ── */
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1F1A1D', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} style={{ color: '#8B8278' }} />
                Payments History
                {history.length > 0 && (
                  <span style={{ marginLeft: '0.35rem', backgroundColor: '#8B8278', color: '#fff', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.55rem' }}>
                    {history.length}
                  </span>
                )}
              </h2>

              {history.length > 0 && (
                <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700 }}>
                  Page {historyPage} of {totalPages} ({history.length} total)
                </span>
              )}
            </div>

            {history.length === 0 ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#8B8278', backgroundColor: '#FAF6EA', border: '1px solid #D8CFC1', borderRadius: '1.25rem', fontWeight: 700 }}>
                No transaction records in history yet.
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {paginatedHistory.map((item) => (
                    <HistoryCard key={item.payment_id} item={item} />
                  ))}
                </div>

                {/* Numbered Pagination Control Bar (6 entries per page) */}
                {totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '1.5rem',
                    padding: '0.85rem',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #E5E0D8',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                  }}>
                    <button
                      type="button"
                      disabled={historyPage === 1}
                      onClick={() => setHistoryPage(p => Math.max(p - 1, 1))}
                      style={{
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        color: historyPage === 1 ? '#cbd5e1' : '#1d4ed8',
                        background: 'none',
                        border: 'none',
                        cursor: historyPage === 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>

                    <div style={{ display: 'flex', items: 'center', gap: '0.35rem' }}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setHistoryPage(pageNum)}
                          style={{
                            minWidth: '34px',
                            height: '34px',
                            padding: '0 0.5rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.95rem',
                            fontWeight: historyPage === pageNum ? 900 : 700,
                            color: historyPage === pageNum ? '#ffffff' : '#1d4ed8',
                            backgroundColor: historyPage === pageNum ? '#6B1B71' : 'transparent',
                            border: historyPage === pageNum ? 'none' : '1px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={historyPage === totalPages}
                      onClick={() => setHistoryPage(p => Math.min(p + 1, totalPages))}
                      style={{
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        color: historyPage === totalPages ? '#cbd5e1' : '#1d4ed8',
                        background: 'none',
                        border: 'none',
                        cursor: historyPage === totalPages ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                )}
               </>
            )}
          </section>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
