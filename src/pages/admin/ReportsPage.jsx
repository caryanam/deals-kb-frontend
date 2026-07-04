import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, X, AlertTriangle, AlertCircle, CheckCircle, UserCheck, ShieldClose, Trash, UserX, Flag, HelpCircle, FileText } from 'lucide-react';
import { getAdminReports, getAdminReportById, updateReportStatus, applyAdminAction } from '../../api/reportApi';
import { formatDate, formatINR } from '../../utils/helpers';
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

export const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Roster Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [productIdFilter, setProductIdFilter] = useState('');

  // Selected Report for Modal
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [reportDetails, setReportDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Moderation state variables
  const [adminNote, setAdminNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.report_type = typeFilter;
      if (productIdFilter.trim()) params.product_id = productIdFilter.trim();

      const data = await getAdminReports(params);
      setReports(data || []);
    } catch (err) {
      console.error('Failed to load reports log:', err);
      toast.error('Failed to fetch admin reports list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, typeFilter]);

  const handleRowClick = async (reportId) => {
    setSelectedReportId(reportId);
    setReportDetails(null);
    setAdminNote('');
    try {
      setLoadingDetails(true);
      const data = await getAdminReportById(reportId);
      // Flatten: backend returns { report, reporter, reported_user, product, bid_history }
      const flat = { ...data.report, reporter: data.reporter, reported_user: data.reported_user, product: data.product, bid_history: data.bid_history };
      setReportDetails(flat);
      setSelectedStatus(flat.status || 'pending');
      setAdminNote(flat.admin_note || '');
    } catch (err) {
      console.error('Failed to load report detail packet:', err);
      toast.error('Failed to retrieve full report details.');
      setSelectedReportId(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!adminNote.trim()) {
      toast.error('Please enter an admin note first.');
      return;
    }
    try {
      setActionLoading(true);
      const updated = await updateReportStatus(selectedReportId, {
        status: selectedStatus,
        admin_note: adminNote
      });
      toast.success(`Report status updated to: ${selectedStatus}`);
      
      // Reload details and list
      const details = await getAdminReportById(selectedReportId);
      const flat = { ...details.report, reporter: details.reporter, reported_user: details.reported_user, product: details.product, bid_history: details.bid_history };
      setReportDetails(flat);
      fetchReports();
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error(err.response?.data?.detail || 'Failed to update report status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyAction = async (actionType) => {
    if (!adminNote.trim()) {
      toast.error('Please enter an admin note specifying the reason for this action.');
      return;
    }
    try {
      setActionLoading(true);
      await applyAdminAction(selectedReportId, {
        action: actionType,
        admin_note: adminNote
      });
      toast.success(`Moderation Action Applied: ${actionType.replace('_', ' ').toUpperCase()}`);

      // Reload details and list
      const details = await getAdminReportById(selectedReportId);
      const flat = { ...details.report, reporter: details.reporter, reported_user: details.reported_user, product: details.product, bid_history: details.bid_history };
      setReportDetails(flat);
      fetchReports();
    } catch (err) {
      console.error('Failed to apply action:', err);
      toast.error(err.response?.data?.detail || 'Failed to execute moderation action.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0b0f19', fontFamily: "'Outfit', sans-serif" }}>Abuse Reports Log</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Review reported items, warn users, cancel auctions, and resolve violations</p>
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
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: '160px' }}>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: '200px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Filter by Type</label>
          <select
            className="form-control"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {Object.entries(REPORT_TYPE_LABELS).map(([key, val]) => (
              <option key={key} value={key}>{val}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: '180px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Search Product ID</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. prod_abc"
            value={productIdFilter}
            onChange={(e) => setProductIdFilter(e.target.value)}
          />
        </div>

        <button 
          onClick={fetchReports} 
          className="btn btn-primary"
          style={{ height: '42px', padding: '0 1.25rem' }}
        >
          Apply Filters
        </button>
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
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Loading reports list...</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <ShieldAlert size={48} style={{ color: '#cbd5e1' }} />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155' }}>No reports pending</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.25rem' }}>No platform abuse or listing reports matched the filters.</p>
          </div>
        </div>
      ) : (
        /* Roster Table */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Report ID</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Product ID</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Reporter Name</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Reporter Role</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Reported User ID</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Created At</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((rep) => {
                  const statusInfo = STATUS_COLORS[rep.status] || { bg: '#f1f5f9', text: '#64748b' };
                  return (
                    <tr 
                      key={rep.id || rep.report_id} 
                      onClick={() => handleRowClick(rep.id || rep.report_id)}
                      style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#2563eb' }}>
                        #{rep.id || rep.report_id}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: '#475569' }}>
                        {rep.product_id || 'N/A'}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
                        {rep.reporter_name || rep.reporter?.name || 'Anonymous'}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                        {rep.reporter_role || rep.reporter?.role || 'N/A'}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                        {rep.reported_user_id || 'N/A'}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                        {REPORT_TYPE_LABELS[rep.report_type] || rep.report_type}
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

      {/* DETAILED MODAL */}
      {selectedReportId && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 15, 25, 0.75)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '1.25rem',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #cbd5e1',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8fafc'
            }}>
              <div>
                <span className="badge badge-rejected" style={{ fontSize: '0.65rem', backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                  Moderation Details Case
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.15rem 0 0 0', color: '#0f172a' }}>
                  Report #{selectedReportId} Details
                </h3>
              </div>
              <button 
                onClick={() => setSelectedReportId(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {loadingDetails || !reportDetails ? (
              <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                <div style={{
                  border: '3px solid #cbd5e1',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  borderLeftColor: '#2563eb',
                  animation: 'spin 1s linear infinite'
                }} />
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Loading report details...</span>
              </div>
            ) : (
              /* Modal Body */
              <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Meta details split */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                  
                  {/* Left column: Report Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* Reason Card */}
                    <div className="card" style={{ backgroundColor: '#f8fafc', padding: '1rem' }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Reason Description</span>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.4 }}>
                        {reportDetails.reason}
                      </p>
                      
                      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                        <div>
                          <span style={{ color: '#64748b', fontWeight: 600 }}>Type:</span>
                          <span style={{ fontWeight: 700, marginLeft: '0.25rem' }}>{REPORT_TYPE_LABELS[reportDetails.report_type] || reportDetails.report_type}</span>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontWeight: 600 }}>Date:</span>
                          <span style={{ fontWeight: 700, marginLeft: '0.25rem' }}>{formatDate(reportDetails.created_at)}</span>
                        </div>
                      </div>

                      {/* Evidence */}
                      {reportDetails.evidence && reportDetails.evidence.length > 0 && (
                        <div style={{ marginTop: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>Evidence / Context</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {reportDetails.evidence.map((ev, i) => {
                              const isUrl = typeof ev === 'string' && (ev.startsWith('http://') || ev.startsWith('https://'));
                              return isUrl ? (
                                <a
                                  key={i}
                                  href={ev}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#2563eb',
                                    textDecoration: 'underline',
                                    fontWeight: 600
                                  }}
                                >
                                  📎 View Evidence File #{i + 1}
                                </a>
                              ) : (
                                <div
                                  key={i}
                                  style={{
                                    fontSize: '0.78rem',
                                    color: '#334155',
                                    backgroundColor: '#f1f5f9',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.4rem',
                                    padding: '0.35rem 0.6rem',
                                    fontFamily: 'monospace',
                                    wordBreak: 'break-word',
                                    lineHeight: 1.4
                                  }}
                                >
                                  {ev}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Participant Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="card" style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Reporter User</span>
                        <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginTop: '0.15rem' }}>
                          {reportDetails.reporter?.name || 'N/A'}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                          Role: {reportDetails.reporter?.role || 'N/A'} &bull; Email: {reportDetails.reporter?.email || 'N/A'}
                        </span>
                      </div>

                      <div className="card" style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Reported User</span>
                        <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginTop: '0.15rem' }}>
                          {reportDetails.reported_user?.name || 'N/A'}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                          Role: {reportDetails.reported_user?.role || 'N/A'} &bull; Email: {reportDetails.reported_user?.email || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Product Summary */}
                    {reportDetails.product && (
                      <div className="card" style={{ padding: '1rem' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Linked Product Details</span>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0.25rem 0', color: '#0f172a' }}>{reportDetails.product.title}</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: '#475569', marginTop: '0.25rem' }}>
                          <div>Brand: <strong>{reportDetails.product.brand || 'N/A'}</strong></div>
                          <div>Model: <strong>{reportDetails.product.model || 'N/A'}</strong></div>
                          <div>Product Price: <strong>{formatINR(reportDetails.product.product_price || 0)}</strong></div>
                          <div>Expected Price: <strong>{formatINR(reportDetails.product.expected_price || 0)}</strong></div>
                          <div>Status: <span className={`badge badge-${reportDetails.product.status}`} style={{ fontSize: '0.65rem' }}>{reportDetails.product.status}</span></div>
                        </div>

                        {/* Badges indicators */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                          {reportDetails.product.is_flagged && (
                            <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#d97706', fontSize: '0.65rem' }}>Flagged ⚠️</span>
                          )}
                          {reportDetails.product.is_cancelled && (
                            <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.65rem' }}>Cancelled 🛑</span>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Right column: Bid History & Moderation Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* Bid History */}
                    <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Product Bid Logs</span>
                      {!reportDetails.bid_history || reportDetails.bid_history.length === 0 ? (
                        <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                          No bids registered.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {reportDetails.bid_history.map((bid, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.25rem' }}>
                              <span style={{ fontWeight: 600 }}>{bid.bidderName || bid.bidder_name || 'Anonymous'}</span>
                              <strong style={{ color: '#2563eb' }}>{formatINR(bid.amount || 0)}</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Moderation Controls Console */}
                    <div className="card" style={{ padding: '1rem', border: '1.5px solid #2563eb', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <AlertTriangle size={14} /> Moderation Controls
                      </span>
                      
                      {/* Admin Note Input */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>Admin Note (Required for actions) *</label>
                        <textarea
                          rows={3}
                          className="form-control"
                          placeholder="e.g. Verified coordinates, suspicious bid sequences. Taking action."
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          style={{ fontSize: '0.8rem', resize: 'none' }}
                        />
                      </div>

                      {/* Status Update Trigger row */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                        <div style={{ flex: 1 }}>
                          <select
                            className="form-control"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            style={{ fontSize: '0.8rem', height: '36px' }}
                          >
                            <option value="pending">Pending</option>
                            <option value="under_review">Under Review</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                            <option value="action_taken">Action Taken</option>
                          </select>
                        </div>
                        <button
                          onClick={handleStatusUpdate}
                          disabled={actionLoading}
                          className="btn btn-secondary"
                          style={{ height: '36px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                        >
                          Update Status
                        </button>
                      </div>

                      {/* Moderation Actions grid buttons */}
                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Apply Moderation Action</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleApplyAction('warn_user')}
                            disabled={actionLoading}
                            className="btn btn-secondary"
                            style={{
                              fontSize: '0.75rem',
                              height: '34px',
                              color: '#d97706',
                              borderColor: '#fcd34d',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <AlertCircle size={12} /> Warn User
                          </button>
                          <button
                            onClick={() => handleApplyAction('block_user')}
                            disabled={actionLoading}
                            className="btn btn-secondary"
                            style={{
                              fontSize: '0.75rem',
                              height: '34px',
                              color: '#dc2626',
                              borderColor: '#fca5a5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <UserX size={12} /> Block User
                          </button>
                          <button
                            onClick={() => handleApplyAction('cancel_auction')}
                            disabled={actionLoading}
                            className="btn btn-secondary"
                            style={{
                              fontSize: '0.75rem',
                              height: '34px',
                              color: '#b91c1c',
                              borderColor: '#fca5a5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <ShieldClose size={12} /> Cancel Auction
                          </button>
                          <button
                            onClick={() => handleApplyAction('mark_product_flagged')}
                            disabled={actionLoading}
                            className="btn btn-secondary"
                            style={{
                              fontSize: '0.75rem',
                              height: '34px',
                              color: '#7c3aed',
                              borderColor: '#ddd6fe',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <Flag size={12} /> Flag Product
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f8fafc' }}>
              <button 
                onClick={() => setSelectedReportId(null)} 
                className="btn btn-secondary" 
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
              >
                Close Logs Case
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

export default ReportsPage;
