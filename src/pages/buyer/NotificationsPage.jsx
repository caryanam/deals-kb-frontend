import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Clock, Eye } from 'lucide-react';
import { getNotifications, markNotificationAsRead } from '../../api/notificationApi';
import { formatDate } from '../../utils/helpers';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      // Reload alerts
      fetchAlerts();
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleInspectProduct = (productId) => {
    if (productId) {
      navigate(`/buyer/listings/${productId}`);
    }
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1F1A1D', fontFamily: "'Outfit', sans-serif" }}>Notifications</h1>
          <p style={{ color: '#8B8278', fontSize: '0.9rem' }}>Stay informed on listing approvals, live bidding outcomes, and platform alerts</p>
        </div>
        <button 
          onClick={fetchAlerts} 
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          disabled={loading}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            border: '3px solid #cbd5e1',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            borderLeftColor: '#6B1B71',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ color: '#8B8278', fontSize: '0.85rem' }}>Loading alerts feed...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: '#8B8278', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <Bell size={48} style={{ color: '#cbd5e1' }} />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4a1a50' }}>Your notification feed is empty</h3>
            <p style={{ fontSize: '0.9rem', color: '#8B8278', marginTop: '0.25rem' }}>We'll notify you here when important events happen.</p>
          </div>
        </div>
      ) : (
        /* Alerts Stack */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map((notif, idx) => (
            <div 
              key={notif.notification_id || notif.id || idx}
              style={{
                backgroundColor: notif.read ? '#ffffff' : '#f0f9ff',
                border: '1px solid #D8CFC1',
                borderColor: notif.read ? '#D8CFC1' : '#D8CFC1',
                borderRadius: '1rem',
                padding: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: notif.read ? '#f1f5f9' : '#F5ECDD',
                  color: notif.read ? '#8B8278' : '#6B1B71',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '0.1rem'
                }}>
                  <Bell size={18} />
                </div>
                <div>
                  <p style={{ 
                    fontSize: '0.95rem', 
                    color: '#4a1a50', 
                    fontWeight: notif.read ? 500 : 700,
                    lineHeight: 1.45
                  }}>
                    {notif.message}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: '#8B8278', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.35rem' }}>
                    <Clock size={12} /> {formatDate(notif.created_at) || 'Just now'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                {notif.product_id && (
                  <button
                    onClick={() => handleInspectProduct(notif.product_id)}
                    style={{
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#FAF6EA',
                      color: '#8B8278',
                      borderRadius: '0.5rem',
                      padding: '0.4rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Inspect Product"
                  >
                    <Eye size={16} />
                  </button>
                )}
                {!notif.read && (
                  <button
                    onClick={() => handleMarkRead(notif.notification_id || notif.id)}
                    style={{
                      border: '1px solid #D8CFC1',
                      backgroundColor: '#F5ECDD',
                      color: '#6B1B71',
                      borderRadius: '0.5rem',
                      padding: '0.4rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Simple inline refresh element definition
const RefreshCw = ({ size }) => <span style={{ display: 'inline-flex' }}>🔄</span>;

export default NotificationsPage;
