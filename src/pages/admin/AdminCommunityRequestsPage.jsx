import React, { useState, useEffect } from 'react';
import { Compass, Search, Filter, RefreshCw, Layers, Award, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminGetCommunityRequests, adminUpdateCommunityRequestStatus } from '../../api/communityRequestsApi';
import { formatCurrency } from '../../utils/helpers';

export const AdminCommunityRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchAdminRequests = async () => {
    try {
      setLoading(true);
      const data = await adminGetCommunityRequests();
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to load admin demands:', err);
      toast.error('Unable to fetch community demand data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminRequests();
  }, []);

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await adminUpdateCommunityRequestStatus(requestId, newStatus);
      toast.success(`Request status updated to "${newStatus}"`);
      
      // Update local state directly to keep UI responsive
      setRequests(prev =>
        prev.map(r => r.request_id === requestId ? { ...r, status: newStatus } : r)
      );
    } catch (err) {
      console.error('Status change error:', err);
      toast.error(err.response?.data?.detail || 'Failed to update request status.');
    }
  };

  // Filter requests locally
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.created_by_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.request_id?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || req.product_type === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'active':
        return { backgroundColor: '#e6fffa', color: '#00a389' };
      case 'matched':
        return { backgroundColor: '#ebf8ff', color: '#2b6cb0' };
      case 'closed':
        return { backgroundColor: '#edf2f7', color: '#4a5568' };
      case 'disabled':
        return { backgroundColor: '#fff5f5', color: '#c53030' };
      default:
        return { backgroundColor: '#edf2f7', color: '#4a5568' };
    }
  };

  return (
    <div className="container-fluid" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '1.5rem' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1F1A1D', margin: 0, fontFamily: "'Outfit', sans-serif" }}>Community Demand Demands</h1>
          <p style={{ color: '#8B8278', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
            Monitor public buyer demand posts, interest volumes, and change status to match approved items.
          </p>
        </div>
        <button 
          onClick={fetchAdminRequests}
          className="btn btn-outline-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
          title="Refresh Demand List"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Stats Summary cards (4 tiles in a single row) */}
      <div className="grid grid-cols-4" style={{ gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Requests', value: requests.length, color: '#6B1B71' },
          { label: 'Active Demands', value: requests.filter(r => r.status === 'active').length, color: '#10b981' },
          { label: 'Matched Demands', value: requests.filter(r => r.status === 'matched').length, color: '#965284' },
          { label: 'Total Interested Signups', value: requests.reduce((sum, r) => sum + (r.interested_count || 0), 0), color: '#b2772d' }
        ].map((stat, i) => (
          <div key={i} className="card" style={{ borderColor: '#D8CFC1', borderRadius: '0.75rem', padding: '1.25rem', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8B8278', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{stat.label}</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: stat.color, margin: '0.25rem 0 0 0', fontFamily: "'Outfit', sans-serif" }}>
              {stat.value}
            </h2>
          </div>
        ))}
      </div>
          {/* Filters and Search toolbar */}
          <div className="card mb-4" style={{ borderColor: '#D8CFC1', borderRadius: '0.75rem', backgroundColor: '#ffffff' }}>
            <div className="card-body" style={{ padding: '1.25rem' }}>
              <div className="row g-3">
                
                {/* Search Input */}
                <div className="col-12">
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8B8278', marginBottom: '0.35rem', display: 'block' }}>Search Demands</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search brand, model, requester..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-control"
                      style={{ paddingLeft: '2.25rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}
                    />
                    <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#8B8278' }} />
                  </div>
                </div>

                {/* Category Filter as Premium Pills */}
                <div className="col-12 col-md-6">
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8B8278', marginBottom: '0.35rem', display: 'block' }}>Product Type</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {['all', 'car', 'bike', 'mobile', 'laptop'].map((cat) => {
                      const isActive = categoryFilter === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategoryFilter(cat)}
                          style={{
                            padding: '0.45rem 1.1rem',
                            borderRadius: '2rem',
                            border: isActive ? '1px solid #6B1B71' : '1px solid #D8CFC1',
                            backgroundColor: isActive ? '#6B1B71' : '#ffffff',
                            color: isActive ? '#ffffff' : '#6B1B71',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            transition: 'all 0.2s ease',
                            outline: 'none'
                          }}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status Filter as Premium Pills */}
                <div className="col-12 col-md-6">
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8B8278', marginBottom: '0.35rem', display: 'block' }}>Request Status</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {['all', 'active', 'matched', 'closed', 'disabled'].map((stat) => {
                      const isActive = statusFilter === stat;
                      return (
                        <button
                          key={stat}
                          type="button"
                          onClick={() => setStatusFilter(stat)}
                          style={{
                            padding: '0.45rem 1.1rem',
                            borderRadius: '2rem',
                            border: isActive ? '1px solid #6B1B71' : '1px solid #D8CFC1',
                            backgroundColor: isActive ? '#6B1B71' : '#ffffff',
                            color: isActive ? '#ffffff' : '#6B1B71',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            transition: 'all 0.2s ease',
                            outline: 'none'
                          }}
                        >
                          {stat}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </div>

      {/* Main Table Card */}
      <div className="card" style={{ borderColor: '#D8CFC1', borderRadius: '1rem', overflow: 'hidden' }}>
        <div className="card-body p-0">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <Compass size={40} style={{ color: '#8B8278', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8B8278', margin: 0 }}>No Demand Requests Found</h3>
              <p style={{ color: '#8B8278', fontSize: '0.85rem', marginTop: '0.25rem' }}>No items match your active filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                <thead className="table-light" style={{ fontWeight: 800, fontSize: '0.8rem', color: '#8B8278' }}>
                  <tr>
                    <th style={{ padding: '1rem' }}>Request ID</th>
                    <th style={{ padding: '1rem' }}>Type</th>
                    <th style={{ padding: '1rem' }}>Brand & Model</th>
                    <th style={{ padding: '1rem' }}>Budget Range</th>
                    <th style={{ padding: '1rem' }}>Interested Count</th>
                    <th style={{ padding: '1rem' }}>Requester</th>
                    <th style={{ padding: '1rem' }}>Created At</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => (
                    <tr key={req.request_id}>
                      <td style={{ padding: '1rem', fontWeight: 700, color: '#8B8278' }}>{req.request_id}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#6B1B71',
                          backgroundColor: '#F5ECDD',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.35rem'
                        }}>
                          {req.product_type}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 700, color: '#2d0a32' }}>
                        {req.brand} {req.model}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>
                        {formatCurrency(req.budget_min)} - {formatCurrency(req.budget_max)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
                          <Users size={14} style={{ color: '#6B1B71' }} />
                          <span>{req.interested_count}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600, color: '#4a1a50' }}>{req.created_by_name || 'Anonymous'}</div>
                        <div style={{ fontSize: '0.7rem', color: '#8B8278' }}>ID: {req.created_by_user_id || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '1rem', color: '#8B8278' }}>
                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          textTransform: 'capitalize',
                          ...getStatusBadgeStyle(req.status)
                        }}>
                          {req.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <select
                          className="form-select form-select-sm d-inline-block"
                          value={req.status}
                          onChange={(e) => handleStatusChange(req.request_id, e.target.value)}
                          style={{ width: '120px', borderRadius: '0.35rem', fontSize: '0.8rem' }}
                        >
                          <option value="active">Active</option>
                          <option value="matched">Matched</option>
                          <option value="closed">Closed</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminCommunityRequestsPage;
