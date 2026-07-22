import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, RefreshCw, Compass } from 'lucide-react';

export const CurrentLocationMap = ({ onLocationChange }) => {
  const [position, setPosition] = useState(null); // { lat, lng }
  const [address, setAddress] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatAddress = (data) => {
    if (!data || !data.address) return 'Unknown Location';
    const addr = data.address;
    
    // Try to find the local area/suburb/locality
    const locality = addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || addr.subdivision || addr.subdistrict || addr.city_district;
    
    // Try to find the city/town/village
    const city = addr.city || addr.town || addr.village || addr.municipality || addr.county;
    
    // State
    const state = addr.state;

    if (locality && city) {
      return `${locality}, ${city}`;
    } else if (city) {
      return state ? `${city}, ${state}` : city;
    } else if (locality) {
      return state ? `${locality}, ${state}` : locality;
    }
    
    return data.display_name || 'Unknown Location';
  };

  const fetchLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });

        try {
          // Fetch reverse geocoded address from OpenStreetMap Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en'
              }
            }
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch address details.');
          }

          const data = await response.json();
          const shortAddr = formatAddress(data);
          
          setAddress(shortAddr);
          setFullAddress(data.display_name || '');
          setLoading(false);

          if (onLocationChange) {
            onLocationChange({
              latitude,
              longitude,
              address: shortAddr,
              fullAddress: data.display_name
            });
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          // Fallback to coordinates format if address lookup fails
          setAddress(`${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`);
          setFullAddress(`Latitude: ${latitude}, Longitude: ${longitude}`);
          setLoading(false);
          if (onLocationChange) {
            onLocationChange({ latitude, longitude });
          }
        }
      },
      (err) => {
        setLoading(false);
        console.error('Geolocation error:', err);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please allow location access in your browser settings.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Current position is unavailable. Please check your system settings.');
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

  useEffect(() => {
    fetchLocation();
  }, []);

  return (
    <div className="location-card-container" style={{
      width: '100%',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      backgroundColor: '#ffffff',
      border: '1px solid #D8CFC1',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Compass size={20} style={{ color: '#6B1B71' }} />
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1F1A1D' }}>Live Location</h3>
        </div>
        <button
          type="button"
          onClick={fetchLocation}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.55rem 1.25rem',
            backgroundColor: '#6B1B71',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 2px 6px rgba(107, 27, 113, 0.2)'
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#55155a'; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#6B1B71'; }}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Fetching...' : 'Refresh Location'}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Main location text panel */}
      <div style={{
        position: 'relative',
        width: '100%',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
        backgroundColor: '#FAF8F5',
        minHeight: '140px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        boxSizing: 'border-box'
      }}>
        {loading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            gap: '0.75rem'
          }}>
            <div style={{
              border: '3px solid #cbd5e1',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              borderLeftColor: '#6B1B71',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '0.9rem', color: '#8B8278', fontWeight: 650 }}>Retrieving current location...</span>
          </div>
        )}

        {error ? (
          <div style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            maxWidth: '400px'
          }}>
            <AlertTriangle size={36} style={{ color: '#dc2626' }} />
            <span style={{ fontSize: '0.9rem', color: '#dc2626', fontWeight: 700 }}>{error}</span>
            <button
              type="button"
              onClick={fetchLocation}
              style={{
                marginTop: '0.5rem',
                padding: '0.45rem 1rem',
                backgroundColor: '#FAF6EA',
                border: '1px solid #D8CFC1',
                borderRadius: '0.375rem',
                color: '#6B1B71',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Retry Permission/Access
            </button>
          </div>
        ) : position ? (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1.25rem',
            width: '100%',
            animation: 'fadeIn 0.4s ease-out'
          }}>
            <div style={{
              backgroundColor: 'rgba(107, 27, 113, 0.1)',
              borderRadius: '50%',
              padding: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B1B71',
              flexShrink: 0
            }}>
              <MapPin size={28} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h4 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1F1A1D', letterSpacing: '-0.02em' }}>
                  {address || 'Fetching Address...'}
                </h4>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: '#E2F0D9',
                  color: '#385723',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '1rem',
                  textTransform: 'uppercase'
                }}>
                  GPS Active
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#6B6259', lineHeight: 1.5, fontWeight: 500 }}>
                {fullAddress || 'Locating nearest landmark...'}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ color: '#8B8278', fontSize: '0.9rem', fontWeight: 650 }}>
            No location data available. Click Refresh to detect.
          </div>
        )}
      </div>

      {position && (
        <div style={{
          backgroundColor: '#FAF6EA',
          border: '1px solid #D8CFC1',
          borderRadius: '0.75rem',
          padding: '0.75rem 1rem',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latitude</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1F1A1D' }}>{position.lat.toFixed(6)}</span>
          </div>
          <div style={{ width: '1px', height: '24px', backgroundColor: '#D8CFC1' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Longitude</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1F1A1D' }}>{position.lng.toFixed(6)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentLocationMap;
