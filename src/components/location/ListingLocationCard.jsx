import React, { useState, useEffect } from 'react';
import { MapPin, LocateFixed, Pencil, Check, Loader2, AlertTriangle, Search } from 'lucide-react';

export const ListingLocationCard = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isChanging, setIsChanging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Derive the active value structure
  const loc = value || {
    address: '',
    latitude: null,
    longitude: null,
    accuracy: null
  };

  // Helper to format Nominatim response
  const formatAddress = (data) => {
    if (!data || !data.address) return '';
    const addr = data.address;
    const locality = addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || addr.subdivision || addr.subdistrict || addr.city_district;
    const city = addr.city || addr.town || addr.village || addr.municipality || addr.county;
    const state = addr.state;
    const country = addr.country;

    if (locality && city) {
      return `${locality}, ${city}, ${state ? state + ', ' : ''}${country || ''}`;
    } else if (city) {
      return `${city}, ${state ? state + ', ' : ''}${country || ''}`;
    } else if (locality) {
      return `${locality}, ${state ? state + ', ' : ''}${country || ''}`;
    }
    return data.display_name || '';
  };

  const handleDetectLocation = () => {
    setError(null);
    setLoading(true);

    if (!navigator.geolocation) {
      setError('Browser does not support geolocation.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        try {
          // Fetch reverse-geocoded address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: { 'Accept-Language': 'en' }
            }
          );
          
          if (!response.ok) {
            throw new Error('Reverse geocoding failed.');
          }

          const data = await response.json();
          const formatted = formatAddress(data);

          onChange({
            address: formatted || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            latitude,
            longitude,
            accuracy: Math.round(accuracy)
          });
          setLastUpdated(new Date());
          setIsChanging(false);
        } catch (err) {
          console.error('Error reverse geocoding:', err);
          // Fallback to raw lat/lng address representation
          onChange({
            address: `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`,
            latitude,
            longitude,
            accuracy: Math.round(accuracy)
          });
          setLastUpdated(new Date());
          setIsChanging(false);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        console.error('Geolocation error:', err);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission was denied. Please allow location access and try again.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('We could not detect your location. Please check your system GPS and try again.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out. Please try again.');
            break;
          default:
            setError('An unknown error occurred while retrieving your location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    setError(null);
    setLoading(true);

    try {
      // Query Nominatim search API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&addressdetails=1&limit=1&countrycodes=in`,
        {
          headers: { 'Accept-Language': 'en' }
        }
      );

      if (!response.ok) {
        throw new Error('Search request failed.');
      }

      const results = await response.json();
      if (results && results.length > 0) {
        const item = results[0];
        const formatted = formatAddress(item);
        onChange({
          address: formatted || item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          accuracy: null
        });
        setLastUpdated(new Date());
        setIsChanging(false);
      } else {
        // Fallback: If no results found, let the user type manually
        onChange({
          address: searchQuery.trim(),
          latitude: null,
          longitude: null,
          accuracy: null
        });
        setLastUpdated(new Date());
        setIsChanging(false);
      }
    } catch (err) {
      console.error('Search location error:', err);
      // Fallback: save query as address text directly
      onChange({
        address: searchQuery.trim(),
        latitude: null,
        longitude: null,
        accuracy: null
      });
      setLastUpdated(new Date());
      setIsChanging(false);
    } finally {
      setLoading(false);
    }
  };

  const handleManualConfirm = () => {
    if (!searchQuery.trim()) return;
    onChange({
      address: searchQuery.trim(),
      latitude: null,
      longitude: null,
      accuracy: null
    });
    setLastUpdated(new Date());
    setIsChanging(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchLocation();
    }
  };

  // Determine current active view state
  let viewState = 'default';
  if (loading) {
    viewState = 'loading';
  } else if (isChanging) {
    viewState = 'change-location';
  } else if (loc.address || loc.latitude) {
    viewState = 'success';
  }

  // Pre-fill input search query on state transition
  useEffect(() => {
    if (isChanging && loc.address) {
      setSearchQuery(loc.address);
    }
  }, [isChanging]);

  return (
    <div className="listing-location-card" style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' }}>
      <style>{`
        .loc-card-container {
          width: 100%;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
          box-sizing: border-box;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .loc-card-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.25rem;
          flex-wrap: wrap;
        }
        .loc-card-left {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          flex: 1;
          min-width: 250px;
        }
        .loc-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justifyContent: center;
          flex-shrink: 0;
        }
        .loc-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
        }
        .loc-heading {
          margin: 0;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #8B8278;
        }
        .loc-main-text {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 800;
          color: #1F1A1D;
          line-height: 1.3;
        }
        .loc-sub-text {
          margin: 0;
          font-size: 0.85rem;
          color: #8B8278;
          line-height: 1.45;
        }
        .loc-badge-accuracy {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: 1rem;
          text-transform: uppercase;
          width: fit-content;
          margin-top: 0.1rem;
        }
        .loc-search-row {
          display: flex;
          gap: 0.5rem;
          width: 100%;
          align-items: center;
        }
        .loc-btn-detect {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.85rem 1.5rem;
          background-color: #6B1B71;
          color: #ffffff;
          border: none;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
          min-height: 48px;
        }
        .loc-btn-detect:hover:not(:disabled) {
          background-color: #55155a;
        }
        .loc-btn-change {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.65rem 1.25rem;
          border: 1.5px solid #6B1B71;
          color: #6B1B71;
          background-color: transparent;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 40px;
        }
        .loc-btn-change:hover {
          background-color: rgba(107, 27, 113, 0.05);
        }
        .loc-error-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #dc2626;
          font-size: 0.85rem;
          font-weight: 700;
          margin-top: 0.5rem;
          padding: 0.5rem;
          background-color: #fef2f2;
          border-radius: 0.5rem;
          border: 1px solid #fee2e2;
        }
        .loc-btn-confirm {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background-color: #6B1B71;
          color: #ffffff;
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
          flex-shrink: 0;
        }
        .loc-btn-confirm:hover {
          background-color: #55155a;
        }
        .loc-bottom-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          border-top: 1px solid #D8CFC1;
          padding-top: 1rem;
          margin-top: 0.5rem;
        }
        .loc-link-action {
          color: #6B1B71;
          background: none;
          border: none;
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
          text-decoration: underline;
          padding: 0.25rem 0;
        }
        .loc-link-action:hover {
          color: #55155a;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-loader {
          animation: spin 1s linear infinite;
        }
        @media (max-width: 768px) {
          .loc-card-inner {
            flex-direction: column;
            align-items: stretch;
          }
          .loc-btn-detect {
            width: 100%;
          }
          .loc-btn-change {
            width: 100%;
          }
        }
      `}</style>

      {/* 1. DEFAULT STATE */}
      {viewState === 'default' && (
        <div className="loc-card-container" style={{ backgroundColor: 'rgba(107, 27, 113, 0.03)', border: '1px solid #D8CFC1' }}>
          <div className="loc-card-inner">
            <div className="loc-card-left">
              <div className="loc-icon-circle" style={{ backgroundColor: 'rgba(107, 27, 113, 0.1)', color: '#6B1B71' }}>
                <LocateFixed size={22} />
              </div>
              <div className="loc-details">
                <h4 className="loc-heading">Listing Location</h4>
                <p className="loc-main-text">No location selected</p>
                <p className="loc-sub-text">This is the location where the product will be listed from.</p>
              </div>
            </div>
            <button type="button" className="loc-btn-detect" onClick={handleDetectLocation}>
              <LocateFixed size={18} />
              Detect Current Location
            </button>
          </div>
        </div>
      )}

      {/* 2. LOADING STATE */}
      {viewState === 'loading' && (
        <div className="loc-card-container" style={{ backgroundColor: 'rgba(107, 27, 113, 0.03)', border: '1px solid #D8CFC1' }}>
          <div className="loc-card-inner">
            <div className="loc-card-left">
              <div className="loc-icon-circle" style={{ backgroundColor: 'rgba(107, 27, 113, 0.1)', color: '#6B1B71' }}>
                <LocateFixed size={22} />
              </div>
              <div className="loc-details">
                <h4 className="loc-heading">Listing Location</h4>
                <p className="loc-main-text">No location selected</p>
                <p className="loc-sub-text">This is the location where the product will be listed from.</p>
              </div>
            </div>
            <button type="button" className="loc-btn-detect" disabled style={{ opacity: 0.7, cursor: 'not-allowed' }}>
              <Loader2 size={18} className="spin-loader" />
              Detecting Location...
            </button>
          </div>
        </div>
      )}

      {/* 3. SUCCESS STATE */}
      {viewState === 'success' && (
        <div className="loc-card-container" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid #bbf7d0' }}>
          <div className="loc-card-inner">
            <div className="loc-card-left">
              <div className="loc-icon-circle" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <MapPin size={22} />
              </div>
              <div className="loc-details">
                <h4 className="loc-heading">Listing Location</h4>
                <p className="loc-main-text" style={{ fontSize: '1.05rem', color: '#166534' }}>{loc.address}</p>
                
                {loc.accuracy && (
                  <span className="loc-badge-accuracy" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                    Accurate to {loc.accuracy} meters
                  </span>
                )}
                
                <p className="loc-sub-text" style={{ marginTop: '0.25rem' }}>This is the location where the product will be listed from.</p>
                {lastUpdated && (
                  <span style={{ fontSize: '0.75rem', color: '#8B8278', marginTop: '0.2rem', display: 'block' }}>
                    Last updated: Just now
                  </span>
                )}
              </div>
            </div>
            <button type="button" className="loc-btn-change" onClick={() => setIsChanging(true)}>
              <Pencil size={14} />
              Change Location
            </button>
          </div>
        </div>
      )}

      {/* 4. CHANGE-LOCATION STATE */}
      {viewState === 'change-location' && (
        <div className="loc-card-container" style={{ backgroundColor: '#ffffff', border: '1px solid #D8CFC1' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h4 className="loc-heading">Listing Location</h4>
            <p className="loc-sub-text" style={{ fontWeight: 700, color: '#1F1A1D', margin: 0 }}>
              Search for area, city or pin code
            </p>
          </div>

          <div className="loc-search-row">
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                className="form-control"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Baner, Pune or 411045"
                style={{
                  width: '100%',
                  padding: '0.85rem 1.15rem 0.85rem 2.5rem',
                  borderRadius: '0.85rem',
                  border: '1px solid #D8CFC1',
                  fontSize: '0.9rem',
                  height: '48px',
                  boxSizing: 'border-box'
                }}
              />
              <Search size={16} style={{ position: 'absolute', left: '1rem', color: '#8B8278' }} />
            </div>
            <button type="button" className="loc-btn-confirm" onClick={handleSearchLocation} title="Confirm / Search Location">
              <Check size={20} />
            </button>
          </div>

          <div className="loc-bottom-actions">
            <button type="button" className="loc-link-action" onClick={handleDetectLocation}>
              Use my current location
            </button>
            <button
              type="button"
              className="loc-btn-detect"
              onClick={handleDetectLocation}
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', minHeight: '36px', height: '36px' }}
            >
              <LocateFixed size={14} />
              Detect Again
            </button>
          </div>
        </div>
      )}

      {/* ERROR DISPLAY */}
      {error && (
        <div className="loc-error-box">
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ListingLocationCard;
