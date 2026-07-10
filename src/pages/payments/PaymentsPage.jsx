import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { getMyPayments } from '../../api/paymentApi';

const formatINR = (amountInPaise = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format((amountInPaise || 0) / 100);

const PaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const roleLabel = useMemo(() => user?.role || 'User', [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const paymentData = await getMyPayments();
      setPayments(Array.isArray(paymentData) ? paymentData : []);
    } catch (err) {
      console.error('Failed to load payment data:', err);
      toast.error(err.response?.data?.detail || 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1F1A1D', margin: 0 }}>Payments</h1>
          <p style={{ color: '#8B8278', margin: '0.35rem 0 0' }}>{roleLabel} payment history.</p>
        </div>
        <button type="button" onClick={loadData} disabled={loading} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
          <Loader2 size={30} style={{ animation: 'spin 1s linear infinite', color: '#6B1B71' }} />
        </div>
      ) : (
          <section style={{ backgroundColor: '#FAF6EA', border: '1px solid #D8CFC1', borderRadius: '0.75rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #D8CFC1' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1F1A1D' }}>Payment History</h2>
            </div>
            {payments.length === 0 ? (
              <div style={{ padding: '2rem', color: '#8B8278', textAlign: 'center' }}>No payments yet.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead style={{ backgroundColor: '#FAF6EA', color: '#8B8278' }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '0.85rem 1rem' }}>Plan</th>
                      <th style={{ textAlign: 'left', padding: '0.85rem 1rem' }}>Amount</th>
                      <th style={{ textAlign: 'left', padding: '0.85rem 1rem' }}>Status</th>
                      <th style={{ textAlign: 'left', padding: '0.85rem 1rem' }}>Order</th>
                      <th style={{ textAlign: 'left', padding: '0.85rem 1rem' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => {
                      const statusLabel = payment.status === 'paid' ? 'Paid' : payment.status === 'failed' ? 'Failed' : 'Not completed';
                      const gatewayOrderId = payment.cashfree_order_id || payment.razorpay_order_id || '-';
                      return (
                        <tr key={payment.payment_id} style={{ borderTop: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#1F1A1D' }}>{payment.plan_name}</td>
                          <td style={{ padding: '0.85rem 1rem', color: '#8B8278' }}>{formatINR(payment.amount)}</td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{
                              padding: '0.25rem 0.55rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              backgroundColor: payment.status === 'paid' ? '#dcfce7' : payment.status === 'failed' ? '#fee2e2' : '#e0f2fe',
                              color: payment.status === 'paid' ? '#166534' : payment.status === 'failed' ? '#991b1b' : '#075985'
                            }}>
                              {statusLabel}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#8B8278' }}>{gatewayOrderId}</td>
                          <td style={{ padding: '0.85rem 1rem', color: '#8B8278' }}>{payment.created_at ? new Date(payment.created_at).toLocaleString() : ''}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
      )}
    </div>
  );
};

export default PaymentsPage;
