import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Fuel, Gauge, Calendar, ShieldCheck, ArrowUpRight, Cpu, Layers, ImageOff } from 'lucide-react';
import { formatINR, PRODUCT_TYPE_LABELS, safeParseJSON } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { normalizeImageUrl, handleImageError } from '../../utils/imageUtils';

export const ListingCard = ({ listing: product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAction = (e) => {
    e.stopPropagation();
    if (product.status === 'live' && product.product_id) {
      navigate(`/buyer/auction/${product.product_id}`);
    } else {
      navigate(`/buyer/listings/${product.product_id}`);
    }
  };

  // Status Badge Selection
  const getStatusBadge = () => {
    const isBuyerLike = !user || user.role === 'Buyer';
    switch (product.status) {
      case 'live':
        return <span className="badge badge-live">Live Auction</span>;
      case 'approved':
        return <span className="badge badge-approved">{isBuyerLike ? 'Upcoming' : 'Approved'}</span>;
      case 'ended':
        return <span className="badge badge-ended">Ended</span>;
      case 'rejected':
        return <span className="badge badge-rejected">Rejected</span>;
      default:
        return <span className="badge badge-pending">Pending Review</span>;
    }
  };

  // Type-specific Specifications preview
  const renderSpecsPreview = () => {
    const specs = safeParseJSON(product.specifications, {});
    
    if (product.product_type === 'car' || product.product_type === 'bike') {
      return (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '0.35rem 0', padding: '0.35rem 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#8B8278', fontSize: '0.75rem' }}>
            <Calendar size={12} />
            <span>{specs.year || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#8B8278', fontSize: '0.75rem' }}>
            <Fuel size={12} />
            <span>{specs.fuel_type || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#8B8278', fontSize: '0.75rem' }}>
            <Gauge size={12} />
            <span>{specs.km_driven ? specs.km_driven.toLocaleString() + ' km' : 'N/A'}</span>
          </div>
        </div>
      );
    } else {
      // Laptop or Mobile
      return (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '0.35rem 0', padding: '0.35rem 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
          {specs.processor && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#8B8278', fontSize: '0.75rem' }}>
              <Cpu size={12} />
              <span>{specs.processor}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#8B8278', fontSize: '0.75rem' }}>
            <Layers size={12} />
            <span>{specs.ram || 'N/A'} RAM</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#8B8278', fontSize: '0.75rem' }}>
            <span>{specs.storage || 'N/A'} Disk</span>
          </div>
        </div>
      );
    }
  };

  const startingBidAmount = Math.ceil(Number(product?.expected_price || 0) * 0.5);
  const photosArray = safeParseJSON(product.photos, []);
  const coverPhoto = photosArray.length > 0
    ? normalizeImageUrl(photosArray[0])
    : '';

  return (
    <div 
      className="card" 
      onClick={() => navigate(`/buyer/listings/${product.product_id}`)}
      style={{
        padding: 0,
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      {/* Listing Cover Image */}
      <div style={{ position: 'relative', height: '170px', backgroundColor: '#f1f5f9' }}>
        {coverPhoto ? (
          <img 
            src={coverPhoto} 
            alt={product.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={handleImageError}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            color: '#64748b',
            backgroundColor: '#f8fafc'
          }}>
            <ImageOff size={30} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>No image uploaded</span>
          </div>
        )}
        <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', zIndex: 10 }}>
          {getStatusBadge()}
        </div>
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          zIndex: 10,
          backgroundColor: '#1F1A1D',
          color: '#ffffff',
          padding: '0.2rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase'
        }}>
          {PRODUCT_TYPE_LABELS[product.product_type] || product.product_type}
        </div>
      </div>

      {/* Listing Body Info */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.35rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>
            {product.brand} &bull; {product.model} &bull; {product.condition}
          </span>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.15rem', color: '#1F1A1D', lineHeight: 1.3 }}>
            {product.title}
          </h3>
        </div>

        {/* Dynamic Specifications preview */}
        {renderSpecsPreview()}

        {/* Bid status & CTA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.35rem' }}>
          {product.status === 'live' ? (
            <div>
              <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Current Bid</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1F1A1D', margin: 0 }}>
                {formatINR(product.current_bid || 0)}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 600 }}>Price</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1F1A1D', margin: 0 }}>
                {formatINR(product.expected_price || 0)}
              </p>
              <span style={{ fontSize: '0.72rem', color: '#8B8278', fontWeight: 700 }}>
                Bid starts from {formatINR(startingBidAmount || 0)}
              </span>
            </div>
          )}
          
          <button
            onClick={handleAction}
            className={`btn ${product.status === 'live' ? 'btn-success' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}
          >
            {product.status === 'live' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                Bid <ArrowUpRight size={12} />
              </span>
            ) : (
              'Details'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
