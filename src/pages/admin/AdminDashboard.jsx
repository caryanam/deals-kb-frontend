import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, ShieldCheck, ClipboardList, CheckCircle2, Gavel, Award, ArrowRight, Activity, DollarSign, RefreshCw, XCircle, Filter } from 'lucide-react';
import { getAdminAnalytics } from '../../api/adminApi';
import { getProducts } from '../../api/productApi';
import { formatINR, PRODUCT_TYPE_LABELS, safeParseJSON } from '../../utils/helpers';
import { toast } from 'react-toastify';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const listRef = useRef(null);

  // States
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Registry / History lists states
  const [products, setProducts] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // all, approved, rejected, live, ended
  const [categoryFilter, setCategoryFilter] = useState('All'); // All, Car, Bike, Laptop, Mobile

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load both analytics and the list of products
      const [analyticsData, productsData] = await Promise.all([
        getAdminAnalytics(),
        getProducts()
      ]);
      
      setAnalytics(analyticsData);
      setProducts(productsData || []);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to retrieve admin parameters.');
      toast.error('Failed to load dashboard parameters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCardClick = (status) => {
    setStatusFilter(status);
    // Smooth scroll to the listing registry section
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter products based on status and category
  const filteredProducts = products.filter(p => {
    const matchesStatus = statusFilter === 'all' || p.status?.toLowerCase() === statusFilter;
    const matchesCategory = categoryFilter === 'All' || p.product_type?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesStatus && matchesCategory;
  });

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(to right, #1F1A1D, #2d0a32)',
        padding: '2.5rem',
        borderRadius: '1rem',
        color: '#ffffff',
        marginBottom: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Outfit', sans-serif", marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Administrator Control Panel
          </h1>
          <p style={{ color: '#8B8278', fontSize: '0.95rem', margin: 0 }}>
            Manage user rosters, inspect and verify product specifications, and review real-time platform metrics.
          </p>
        </div>
        <button 
          onClick={loadDashboardData}
          disabled={loading}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
        >
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh Data
        </button>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          color: '#b91c1c',
          padding: '1rem',
          borderRadius: '0.75rem',
          marginBottom: '2rem',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={loadDashboardData} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#6B1B71', fontWeight: 700, cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {/* Roster counts */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#8B8278', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Overview</h2>
      <div className="grid grid-cols-3" style={{ marginBottom: '2.5rem' }}>
        
        {/* Total Users */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#F5ECDD', color: '#6B1B71', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Total Users</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{loading ? '...' : analytics?.total_users}</h3>
          </div>
        </div>

        {/* Buyers */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#F5ECDD', color: '#965284', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Platform Buyers</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{loading ? '...' : analytics?.total_buyers}</h3>
          </div>
        </div>

        {/* Sellers */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Platform Sellers</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{loading ? '...' : analytics?.total_sellers}</h3>
          </div>
        </div>
      </div>

      {/* Listing counts */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#8B8278', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory Overview</h2>
      <div className="grid grid-cols-3" style={{ marginBottom: '2.5rem' }}>
        
        {/* Pending approvals */}
        <div 
          className="card hover-card" 
          onClick={() => navigate('/admin/listings/pending')}
          style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer' }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Pending Review</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#d97706' }}>{loading ? '...' : analytics?.pending_listings}</h3>
          </div>
        </div>

        {/* Approved listings */}
        <div 
          className="card hover-card" 
          onClick={() => handleCardClick('approved')}
          style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer' }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Approved</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{loading ? '...' : analytics?.approved_listings}</h3>
          </div>
        </div>

        {/* Rejected listings */}
        <div 
          className="card hover-card" 
          onClick={() => handleCardClick('rejected')}
          style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer' }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Rejected</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{loading ? '...' : analytics?.rejected_listings || 0}</h3>
          </div>
        </div>

        {/* Live auctions */}
        <div 
          className="card hover-card" 
          onClick={() => handleCardClick('live')}
          style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer' }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#F5ECDD', color: '#965284', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Gavel size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Live Auctions</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#6B1B71' }}>{loading ? '...' : analytics?.live_auctions}</h3>
          </div>
        </div>

        {/* Completed auctions */}
        <div 
          className="card hover-card" 
          onClick={() => handleCardClick('ended')}
          style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer' }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#f1f5f9', color: '#8B8278', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Completed</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{loading ? '...' : analytics?.ended_auctions}</h3>
          </div>
        </div>
      </div>

      {/* Roster GMV */}
      <div className="grid grid-cols-2" style={{ marginBottom: '2.5rem' }}>
        
        {/* GMV Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Platform GMV</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#0369a1' }}>
              {loading ? '...' : formatINR(analytics?.gmv || 0)}
            </h3>
          </div>
        </div>

        {/* Total Bids Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#faf5ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Gavel size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Total Bids Placed</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#7e22ce' }}>
              {loading ? '...' : analytics?.total_bids || 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Activity Warning */}
      {analytics?.pending_listings > 0 && (
        <div className="card" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          backgroundColor: '#fffbeb',
          border: '1.5px solid #fde68a',
          borderRadius: '0.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2.5rem'
        }}>
          <div>
            <strong style={{ color: '#b45309', fontSize: '0.95rem' }}>Review Queue Warning</strong>
            <p style={{ color: '#b45309', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
              There are currently <strong>{analytics?.pending_listings} product listings</strong> waiting for admin check.
            </p>
          </div>
          <button 
            onClick={() => navigate('/admin/listings/pending')} 
            className="btn btn-primary"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#d97706', border: 'none' }}
          >
            Start Reviewing <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* PRODUCT LISTING REGISTRY / HISTORY */}
      <div ref={listRef} className="card" style={{ padding: '1.5rem', scrollMarginTop: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #D8CFC1', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F1A1D', margin: 0 }}>Listing Registry History</h3>
            <p style={{ fontSize: '0.8rem', color: '#8B8278', marginTop: '0.15rem' }}>Roster of products on the platform filtered by approval status and type</p>
          </div>

          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} style={{ color: '#8B8278' }} />
              <select
                className="form-control"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ padding: '0.35rem 1.5rem 0.35rem 0.75rem', fontSize: '0.8rem', height: '34px', width: '130px' }}
              >
                <option value="All">All Categories</option>
                <option value="Car">Cars</option>
                <option value="Bike">Bikes</option>
                <option value="Laptop">Laptops</option>
                <option value="Mobile">Mobiles</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Tabs Navigation */}
        <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid #D8CFC1', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '1px' }}>
          {['all', 'approved', 'rejected', 'live', 'ended'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '0.6rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: statusFilter === status ? '#6B1B71' : '#8B8278',
                background: 'none',
                border: 'none',
                borderBottom: statusFilter === status ? '3px solid #6B1B71' : '3px solid transparent',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease'
              }}
            >
              {status === 'all' ? 'All Listings' : status}
            </button>
          ))}
        </div>

        {/* Tab content list */}
        {filteredProducts.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#8B8278', fontSize: '0.85rem' }}>
            No listings found matching this status or category.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAF6EA', borderBottom: '1px solid #D8CFC1' }}>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Product</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Expected Valuation</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Seller</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.product_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 700, color: '#1F1A1D' }}>
                      {p.title}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#8B8278' }}>
                      {PRODUCT_TYPE_LABELS[p.product_type] || p.product_type}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge badge-${p.status || 'pending'}`} style={{ fontSize: '0.65rem' }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 800, color: '#1F1A1D' }}>
                      {formatINR(p.expected_price)}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#8B8278' }}>
                      {p.seller_name || 'Seller'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .hover-card {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .hover-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
