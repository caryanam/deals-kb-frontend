import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { getProducts } from '../../api/productApi';
import { formatCurrency, safeParseJSON } from '../../utils/helpers';
import { normalizeImageUrl, handleImageError } from '../../utils/imageUtils';

const TopDealsSection = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(false);
      // Fetch verified, approved products from the backend API
      const data = await getProducts({ status_filter: 'approved' });
      setDeals(data || []);
    } catch (err) {
      console.error('Failed to load top deals for landing page:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  return (
    <section className="landing-section" style={{ backgroundColor: '#FAF6EA', borderTop: '1px solid #D8CFC1', borderBottom: '1px solid #D8CFC1' }}>
      <div className="landing-container">
        
        {/* Title */}
        <h2 className="landing-section-title">Top Deals</h2>
        <p className="landing-section-subtitle">
          Explore newly approved listings verified by our moderators. Be the first to place a bid when they go live.
        </p>

        {/* Loader/Grid display */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <RefreshCw size={36} className="spin-anim" style={{ color: '#6B1B71' }} />
          </div>
        ) : error ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            backgroundColor: '#fef2f2',
            color: '#b91c1c',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #fca5a5',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            <AlertCircle size={20} />
            <span>Unable to load top deals. Please refresh.</span>
          </div>
        ) : deals.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            backgroundColor: '#FAF6EA',
            borderRadius: '1rem',
            border: '1px solid #D8CFC1',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
          }}>
            <Sparkles size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4a5568', margin: '0 0 0.5rem 0' }}>No Deals Available</h3>
            <p style={{ color: '#718096', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>
              There are no approved deals available right now. Check back later or create a new listing.
            </p>
            <button 
              onClick={() => navigate('/seller/create-listing')}
              style={{
                backgroundColor: '#6B1B71',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1.25rem',
                borderRadius: '0.5rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              List Your Product
            </button>
          </div>
        ) : (
          <div className="landing-category-grid">
            {deals.slice(0, 4).map((product) => {
              const parsedPhotos = safeParseJSON(product.photos, []);
              const displayImage = parsedPhotos.length > 0 ? normalizeImageUrl(parsedPhotos[0]) : 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=400';
              
              return (
                <div 
                  key={product.product_id}
                  onClick={() => navigate(`/buyer/listings/${product.product_id}`)}
                  className="landing-category-card"
                  style={{ cursor: 'pointer' }}
                >
                  <div className="landing-category-img-container">
                    <img src={displayImage} alt={product.title} onError={handleImageError} />
                  </div>
                  <div className="landing-category-info">
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: '#6B1B71',
                      letterSpacing: '0.05em',
                      marginBottom: '0.25rem',
                      display: 'block'
                    }}>
                      {product.product_type}
                    </span>
                    
                    <h3 className="landing-category-title" style={{ fontSize: '1.05rem', lineHeight: 1.3, marginBottom: '0.75rem' }}>
                      {product.title}
                    </h3>
                    
                    <p className="landing-category-desc" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {product.description || 'Verified product listing in pristine condition.'}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: 'auto' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#8B8278', display: 'block', fontWeight: 600 }}>STATUS</span>
                        <strong style={{ fontSize: '1.1rem', color: '#1F1A1D', fontWeight: 800, textTransform: 'capitalize' }}>
                          {product.status || 'Approved'}
                        </strong>
                      </div>
                      <span className="landing-category-link" style={{ fontSize: '0.8rem' }}>
                        View Details <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
      <style>{`
        .spin-anim {
          animation: spin 1.2s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

export default TopDealsSection;
