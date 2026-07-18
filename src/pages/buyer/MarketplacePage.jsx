import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProducts } from '../../api/productApi';
import ListingCard from '../../components/listings/ListingCard';
import { useAuth } from '../../hooks/useAuth';
import BiddingPassBanner from '../../components/listings/BiddingPassBanner';
import PricingPlanPopup from '../../components/listings/PricingPlanPopup';

export const MarketplacePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status');

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState(initialStatus || 'live_or_upcoming');
  const [showPlans, setShowPlans] = useState(false);

  // Build parameters according to backend spec
  const params = useMemo(() => {
    const p = {};
    if (selectedType !== 'all') {
      p.product_type = selectedType;
    }
    if (selectedStatus !== 'all') {
      p.status_filter = selectedStatus;
    }
    return p;
  }, [selectedType, selectedStatus]);

  const { data: listingsData = [], isLoading: loading, error: errorObj } = useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params)
  });
  const listings = Array.isArray(listingsData) ? listingsData : [];

  const error = errorObj ? (errorObj.response?.data?.detail || errorObj.response?.data?.message || 'Unable to load products. Please try again.') : null;

  useEffect(() => {
    if (initialStatus) {
      setSelectedStatus(initialStatus);
    }
  }, [initialStatus]);

  // Frontend local search filters
  const filteredListings = useMemo(() => {
    let result = listings;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        l => 
          l.title?.toLowerCase().includes(term) ||
          l.brand?.toLowerCase().includes(term) ||
          l.model?.toLowerCase().includes(term)
      );
    }
    return result;
  }, [searchTerm, listings]);

  const fetchListings = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  return (
    <div className="dashboard-page" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Page Header */}
      <div className="responsive-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1F1A1D', fontFamily: "'Outfit', sans-serif" }}>Product Marketplace</h1>
          <p style={{ color: '#8B8278', fontSize: '0.9rem' }}>Browse approved items, join live auctions, and place bids in real time</p>
        </div>
        <div className="responsive-page-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button 
            onClick={fetchListings} 
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            disabled={loading}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
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
          <button onClick={fetchListings} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#6B1B71', fontWeight: 700, cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {user?.role === 'Buyer' && <BiddingPassBanner productType={selectedType === 'all' ? 'mobile' : selectedType} />}

      {/* Search and Filters Card */}
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="responsive-filter-row" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          
          {/* Search bar */}
          <div style={{ flex: 2, minWidth: '280px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#8B8278' }} />
            <input
              type="text"
              placeholder="Search by brand, model, or title..."
              className="form-control"
              style={{ paddingLeft: '2.75rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Product Type Filter */}
          <div style={{ flex: 1, minWidth: '150px' }}>
            <select
              className="form-control"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="all">All Categories</option>
              <option value="car">Cars</option>
              <option value="bike">Bikes</option>
              <option value="laptop">Laptops</option>
              <option value="mobile">Mobiles</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ flex: 1, minWidth: '150px' }}>
            <select
              className="form-control"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="live_or_upcoming">Live or Upcoming</option>
              <option value="live">Live Auctions Only</option>
              <option value="approved">Upcoming Auctions</option>
              <option value="ended">Ended Auctions</option>
              <option value="all">All Listings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            border: '3px solid #cbd5e1',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            borderLeftColor: '#6B1B71',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ color: '#8B8278', fontSize: '0.9rem' }}>Loading listings...</span>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: '#8B8278', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <Search size={48} style={{ color: '#cbd5e1' }} />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4a1a50' }}>No listings found</h3>
            <p style={{ fontSize: '0.9rem', color: '#8B8278', marginTop: '0.25rem' }}>Try modifying your filters or search term.</p>
          </div>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedType('all');
              setSelectedStatus('live_or_upcoming');
            }} 
            className="btn btn-primary"
            style={{ width: 'fit-content', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3">
          {filteredListings.map(product => (
            <div key={product.product_id}>
              <ListingCard listing={product} />
            </div>
          ))}
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
        productType={selectedType === 'all' ? 'mobile' : selectedType}
        onClose={() => setShowPlans(false)}
      />
    </div>
  );
};

export default MarketplacePage;

