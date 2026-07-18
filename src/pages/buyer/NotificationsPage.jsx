import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Clock, Eye, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationAsRead } from '../../api/notificationApi';
import { formatDate } from '../../utils/helpers';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedNotification, setSelectedNotification] = useState(null);

  const { data: notificationsData = [], isLoading: loading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications
  });
  const notifications = Array.isArray(notificationsData) ? notificationsData : [];

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err) => {
      console.error('Failed to mark notification read:', err);
    }
  });

  const handleMarkRead = (id) => {
    markReadMutation.mutate(id);
  };

  const handleInspectProduct = (productId) => {
    if (productId) {
      navigate(`/buyer/listings/${productId}`);
    }
  };

  const fetchAlerts = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
              key={notif.notif_id || idx}
              onClick={() => {
                setSelectedNotification(notif);
                if (!notif.read) {
                  handleMarkRead(notif.notif_id);
                }
              }}
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
                cursor: 'pointer',
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
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ 
                    fontSize: '0.95rem', 
                    color: '#4a1a50', 
                    fontWeight: notif.read ? 500 : 700,
                    lineHeight: 1.45,
                    margin: 0
                  }}>
                    {notif.message}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: '#8B8278', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.35rem' }}>
                    <Clock size={12} /> {formatDate(notif.created_at) || 'Just now'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                {notif.product_id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInspectProduct(notif.product_id);
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(notif.notif_id);
                    }}
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
      {selectedNotification && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(31, 26, 29, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '480px',
            backgroundColor: '#ffffff',
            borderRadius: '1rem',
            border: '1px solid #D8CFC1',
            boxShadow: 'var(--shadow-premium)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #D8CFC1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAF6EA'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1F1A1D', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} style={{ color: '#6B1B71' }} /> Notification Details
              </h3>
              <button
                onClick={() => setSelectedNotification(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B8278', display: 'flex', padding: 0 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#F5ECDD',
                  color: '#6B1B71',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bell size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1rem', fontWeight: 800, color: '#1F1A1D' }}>
                    {selectedNotification.title || 'Platform Alert'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#4a1a50', lineHeight: 1.5, whiteSpace: 'pre-wrap', textAlign: 'left' }}>
                    {selectedNotification.message}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: '#8B8278',
                paddingTop: '0.75rem',
                borderTop: '1px solid #f1f5f9'
              }}>
                <span>Received: {selectedNotification.created_at ? new Date(selectedNotification.created_at).toLocaleString() : 'Just now'}</span>
                <span style={{
                  backgroundColor: '#f1f5f9',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  fontWeight: 700,
                  color: '#8B8278'
                }}>
                  {selectedNotification.type || 'system'}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#FAF6EA',
              borderTop: '1px solid #D8CFC1',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem'
            }}>
              {selectedNotification.product_id && (
                <button
                  onClick={() => {
                    navigate(`/buyer/listings/${selectedNotification.product_id}`);
                    setSelectedNotification(null);
                  }}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  View Related Product
                </button>
              )}
              <button
                onClick={() => setSelectedNotification(null)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 700 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple inline refresh element definition
const RefreshCw = ({ size }) => <span style={{ display: 'inline-flex' }}>🔄</span>;

export default NotificationsPage;
