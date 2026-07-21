import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { getPaymentStatus } from '../../api/paymentApi';
import { useAuth } from '../../hooks/useAuth';

const statusTone = (status) => {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'SUCCESS') return { label: 'Payment successful', color: '#166534', bg: '#dcfce7', icon: CheckCircle2 };
  if (['FAILED', 'ABORTED', 'INVALID'].includes(normalized)) return { label: 'Payment not completed', color: '#991b1b', bg: '#fee2e2', icon: AlertTriangle };
  return { label: 'Payment pending', color: '#075985', bg: '#e0f2fe', icon: Loader2 };
};

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const orderId = searchParams.get('order_id') || sessionStorage.getItem('pending_payment_order_id');
  const redirectStatus = searchParams.get('status');
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState('');

  const dashboardPath = useMemo(() => {
    if (user?.role === 'Seller') return '/seller/dashboard';
    if (user?.role === 'Dealer') return '/dealer/dashboard';
    if (user?.role === 'Admin') return '/admin/dashboard';
    return '/buyer/dashboard';
  }, [user]);

  const loadStatus = async () => {
    if (!orderId) {
      setLoading(false);
      setError('Payment order reference is missing.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await getPaymentStatus(orderId);
      setPayment(data);
      if (String(data.status || '').toUpperCase() === 'SUCCESS') {
        sessionStorage.removeItem('pending_payment_order_id');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not verify payment status. Please refresh after a moment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, [orderId]);

  const status = payment?.status || redirectStatus;
  const tone = statusTone(status);
  const Icon = tone.icon;

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#FAF6EA', padding: '1.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <section style={{ width: '100%', maxWidth: 520, background: '#fff', border: '1px solid #D8CFC1', borderRadius: '1rem', padding: '2rem', boxShadow: '0 18px 48px rgba(31, 26, 29, 0.12)', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 1rem', display: 'grid', placeItems: 'center', background: tone.bg, color: tone.color }}>
          <Icon size={32} style={loading ? { animation: 'spin 1s linear infinite' } : undefined} />
        </div>
        <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 900, color: '#1F1A1D' }}>{loading ? 'Checking payment...' : tone.label}</h1>
        <p style={{ margin: '0.65rem 0 0', color: '#8B8278', fontSize: '0.95rem', lineHeight: 1.55 }}>
          {orderId ? `Order ${orderId}` : 'No order reference was found.'}
        </p>
        {payment && (
          <p style={{ margin: '0.75rem 0 0', color: '#1F1A1D', fontSize: '0.95rem', fontWeight: 800 }}>
            {payment.currency} {payment.amount} · {payment.payment_type}
          </p>
        )}
        {error && <p style={{ margin: '1rem 0 0', color: '#b91c1c', fontWeight: 700 }}>{error}</p>}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <button type="button" onClick={loadStatus} disabled={loading} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
            <RefreshCw size={16} /> Refresh
          </button>
          <Link to={dashboardPath} className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Go to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
};

export default PaymentResultPage;
