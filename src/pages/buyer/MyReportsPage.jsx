import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, AlertCircle } from 'lucide-react';
import { getMyReports } from '../../api/reportApi';
import { formatDate } from '../../utils/helpers';
import { toast } from 'react-toastify';

const REPORT_TYPE_LABELS = {
  suspicious_auction: 'Suspicious Auction Activity',
  fake_listing: 'Fake Listing',
  fake_bid: 'Fake Bid Placed',
  shill_bidding: 'Shill Bidding / Bid Manipulation',
  wrong_product_details: 'Wrong Product Details',
  fake_documents: 'Fake Verification Documents',
  abusive_user: 'Abusive User / Harassment',
  payment_contact_fraud: 'Payment or Contact Fraud',
  chat_abuse: 'Abusive or Inappropriate Messages',
  fraud_attempt: 'Fraud or Payment Request Outside Platform',
  spam: 'Spam or Repeated Unwanted Messages',
  seller_buyer_dispute: 'Seller / Buyer Dispute',
  other: 'Other Violation'
};

const STATUS_COLORS = {
  pending: { bg: '#fffbeb', text: '#d97706' },
  under_review: { bg: '#eff6ff', text: '#2563eb' },
  resolved: { bg: '#ecfdf5', text: '#10b981' },
  rejected: { bg: '#f1f5f9', text: '#64748b' },
  action_taken: { bg: '#fef2f2', text: '#ef4444' }
};

export const MyReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.report_type = typeFilter;
      
      const data = await getMyReports(params);
      setReports(data || []);
    } catch (err) {
      console.error('Failed to load my reports:', err);
      toast.error('Failed to load report history log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, typeFilter]);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0b0f19', fontFamily: "'Outfit', sans-serif" }}>My Reports</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Trace the statuses of violation reports you have filed on DealsKB</p>
        </div>
        <button 
          onClick={fetchReports} 
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          disabled={loading}
        >
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Filter Roster */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: '180px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Filter by Status</label>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
            <option value="action_taken">Action Taken</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: '220px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Filter by Violation Type</label>
          <select
            className="form-control"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Violation Types</option>
            {Object.entries(REPORT_TYPE_LABELS).map(([key, val]) => (
              <option key={key} value={key}>{val}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            border: '3px solid #cbd5e1',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            borderLeftColor: '#2563eb',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Loading report history...</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <ShieldAlert size={48} style={{ color: '#cbd5e1' }} />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155' }}>No reports filed</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.25rem' }}>You have not submitted any reports matching these filters.</p>
          </div>
        </div>
      ) : (
        /* Roster Table */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Report ID</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Violation Type</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Reason</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Product ID</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Submitted Date</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((rep) => {
                  const statusInfo = STATUS_COLORS[rep.status] || { bg: '#f1f5f9', text: '#64748b' };
                  return (
                    <tr key={rep.id || rep.report_id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
                        #{rep.id || rep.report_id}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                        {REPORT_TYPE_LABELS[rep.report_type] || rep.report_type}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#475569', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={rep.reason}>
                        {rep.reason}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                        {rep.product_id || 'N/A'}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span className="badge" style={{
                          backgroundColor: statusInfo.bg,
                          color: statusInfo.text,
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          fontWeight: 800
                        }}>
                          {rep.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                        {formatDate(rep.created_at) || 'N/A'}
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

export default MyReportsPage;
