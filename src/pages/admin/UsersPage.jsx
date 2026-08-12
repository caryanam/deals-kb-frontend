import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, X, FileText, CheckCircle2, AlertTriangle, Eye, ShieldCheck, UserCheck } from 'lucide-react';
import { getAdminUsers, getAdminUserById } from '../../api/adminApi';
import { getProductById } from '../../api/productApi';
import { formatDate, formatINR, PRODUCT_TYPE_LABELS, safeParseJSON } from '../../utils/helpers';
import { toast } from 'react-toastify';

export const UsersPage = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal / Popup states
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers();
      setUsersList(data || []);
    } catch (err) {
      console.error('Failed to fetch user directory:', err);
      toast.error('Failed to fetch users registry list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserClick = async (userId) => {
    try {
      setLoadingUser(true);
      const data = await getAdminUserById(userId);
      setSelectedUser(data);
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      toast.error('Failed to retrieve user logs and listings.');
    } finally {
      setLoadingUser(false);
    }
  };

  const handleProductClick = async (prod) => {
    try {
      setLoadingUser(true);
      const productId = prod.product_id || prod.id;
      const details = await getProductById(productId);
      setSelectedProduct(details);
    } catch (err) {
      console.error('Failed to fetch product details:', err);
      setSelectedProduct(prod);
    } finally {
      setLoadingUser(false);
    }
  };

  // Exclude Admin users from the directory roster
  const nonAdminUsers = usersList.filter(u => u.role?.toLowerCase() !== 'admin');
  // Apply role filter
  const displayedUsers = roleFilter === 'all'
    ? nonAdminUsers
    : nonAdminUsers.filter(u => u.role?.toLowerCase() === roleFilter.toLowerCase());

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1F1A1D', fontFamily: "'Outfit', sans-serif" }}>Users Directory</h1>
          <p style={{ color: '#8B8278', fontSize: '0.9rem' }}>Roster of registered platform buyers and sellers on DealsKB</p>
        </div>
        <button 
          onClick={fetchUsers} 
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          disabled={loading}
        >
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Role Filter Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['all', 'Buyer', 'Seller', 'Dealer'].map((role) => {
          const isActive = roleFilter === role;
          const label = role === 'all' ? 'All' : role + 's';
          return (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              style={{
                padding: '0.45rem 1.2rem',
                borderRadius: '9999px',
                border: isActive ? '1px solid #6B1B71' : '1px solid #D8CFC1',
                backgroundColor: isActive ? '#6B1B71' : '#ffffff',
                color: isActive ? '#ffffff' : '#6B1B71',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
            >
              {label}
              <span style={{ marginLeft: '0.4rem', opacity: 0.75, fontSize: '0.75rem' }}>
                ({role === 'all' ? nonAdminUsers.length : nonAdminUsers.filter(u => u.role?.toLowerCase() === role.toLowerCase()).length})
              </span>
            </button>
          );
        })}
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
          <span style={{ color: '#8B8278', fontSize: '0.85rem' }}>Loading user directory...</span>
        </div>
      ) : nonAdminUsers.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: '#8B8278', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <Users size={48} style={{ color: '#cbd5e1' }} />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4a1a50' }}>No buyers or sellers registered</h3>
            <p style={{ fontSize: '0.9rem', color: '#8B8278', marginTop: '0.25rem' }}>No buyer or seller accounts found on the platform.</p>
          </div>
        </div>
      ) : (
        /* Roster Table (Without OAuth Provider column) */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAF6EA', borderBottom: '1px solid #D8CFC1' }}>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Full Name</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Email Address</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Mobile Number</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Role</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Active Plan & Plan ID</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Created Date</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Account Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.map((usr, idx) => (
                  <tr key={usr.user_id || usr.id || idx} style={{ borderBottom: '1px solid #D8CFC1' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.95rem', fontWeight: 700 }}>
                      <button 
                        onClick={() => handleUserClick(usr.user_id || usr.id)}
                        disabled={loadingUser}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6B1B71',
                          cursor: 'pointer',
                          padding: 0,
                          textAlign: 'left',
                          fontWeight: 700,
                          textDecoration: 'underline'
                        }}
                      >
                        {usr.name}
                      </button>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#8B8278' }}>
                      {usr.email}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#8B8278' }}>
                      {usr.mobile_number || usr.phone_number || 'N/A'}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: usr.role === 'Seller' ? '#10b981' : usr.role === 'Dealer' ? '#2563eb' : '#6B1B71',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        {usr.role === 'Seller' ? <ShieldCheck size={14} /> : usr.role === 'Dealer' ? <ShieldCheck size={14} /> : <UserCheck size={14} />}
                        {usr.role}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      {usr.active_plan ? (
                        <div>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '999px',
                            border: '1px solid #86efac'
                          }}>
                            <CheckCircle2 size={12} /> {usr.active_plan.plan_name}
                          </span>
                          <span style={{ display: 'block', fontSize: '0.68rem', fontFamily: 'monospace', color: '#4b5563', marginTop: '0.2rem', fontWeight: 700 }}>
                            ID: {usr.active_plan.plan_id}
                          </span>
                          {usr.active_plan.active_until && (
                            <span style={{ display: 'block', fontSize: '0.65rem', color: '#8B8278', marginTop: '0.1rem' }}>
                              Valid till: {formatDate(usr.active_plan.active_until)}
                            </span>
                          )}
                        </div>
                      ) : usr.role === 'Seller' ? (
                        <span style={{
                          fontSize: '0.72rem',
                          color: '#713F12',
                          backgroundColor: '#FEF9C3',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '999px',
                          border: '1px solid #FACC15',
                          fontWeight: 700,
                          display: 'inline-block'
                        }}>
                          📦 Pay-Per-Listing (₹0)
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '0.72rem',
                          color: '#6b7280',
                          backgroundColor: '#f3f4f6',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '999px',
                          fontWeight: 600,
                          display: 'inline-block'
                        }}>
                          ⚪ No Active Plan
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: '#8B8278' }}>
                      {formatDate(usr.created_at) || 'N/A'}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span className="badge" style={{
                        backgroundColor: usr.status === 'Suspended' ? '#fee2e2' : '#d1fae5',
                        color: usr.status === 'Suspended' ? '#b91c1c' : '#065f46',
                        fontSize: '0.7rem'
                      }}>
                        {usr.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USER DETAILS POPUP MODAL */}
      {selectedUser && (() => {
        const userDetails = selectedUser.user || selectedUser;
        const productsList = selectedUser.userlistedproducts || selectedUser.products || [];
        return (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(11, 15, 25, 0.75)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <div style={{
              backgroundColor: '#FAF6EA',
              borderRadius: '1.25rem',
              width: '100%',
              maxWidth: '650px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
              border: '1px solid #D8CFC1',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #D8CFC1',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#FAF6EA'
              }}>
                <div>
                  <span className="badge badge-approved" style={{ fontSize: '0.65rem' }}>User Profile Details</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.15rem 0 0 0', color: '#1F1A1D' }}>{userDetails.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B8278' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Metadata */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Email Address</span>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#4a1a50' }}>{userDetails.email}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Mobile Number</span>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#4a1a50' }}>{userDetails.mobile_number || userDetails.phone_number || 'N/A'}</p>
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Platform Role</span>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#4a1a50' }}>{userDetails.role}</p>
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#8B8278', fontWeight: 700, textTransform: 'uppercase' }}>Created Date</span>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#4a1a50' }}>{formatDate(userDetails.created_at) || 'N/A'}</p>
                  </div>
                </div>

                {/* Active Subscription & Plan ID Info */}
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1F1A1D', marginBottom: '0.75rem' }}>Active Subscription & Plan Details</h4>
                  {(!selectedUser.active_plans || selectedUser.active_plans.length === 0) && !userDetails.active_plan ? (
                    <div style={{ padding: '1rem', backgroundColor: '#FAF6EA', borderRadius: '0.5rem', color: '#8B8278', fontSize: '0.85rem' }}>
                      {userDetails.role === 'Seller' ? 'Seller Account (Pay-Per-Listing — ₹0 Offer Active)' : 'No active subscription plans found for this account.'}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {(selectedUser.active_plans || (userDetails.active_plan ? [userDetails.active_plan] : [])).map((plan, pIdx) => (
                        <div key={pIdx} style={{
                          padding: '0.85rem 1rem',
                          backgroundColor: '#f0fdf4',
                          border: '1.5px solid #86efac',
                          borderRadius: '0.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.5rem'
                        }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <strong style={{ color: '#166534', fontSize: '0.9rem' }}>{plan.plan_name}</strong>
                              <span style={{ fontSize: '0.68rem', backgroundColor: '#dcfce7', color: '#166534', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                                ACTIVE
                              </span>
                            </div>
                            <span style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: '#374151', marginTop: '0.2rem' }}>
                              <strong>Plan ID:</strong> {plan.plan_id}
                            </span>
                            {plan.product_type && (
                              <span style={{ display: 'block', fontSize: '0.72rem', color: '#4b5563', marginTop: '0.1rem' }}>
                                Category: {plan.product_type}
                              </span>
                            )}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            {plan.active_until && (
                              <span style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: 700, display: 'block' }}>
                                Valid until {formatDate(plan.active_until)}
                              </span>
                            )}
                            {plan.order_id && (
                              <span style={{ fontSize: '0.68rem', color: '#9ca3af', display: 'block', fontFamily: 'monospace' }}>
                                Ref: {plan.order_id}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* User Listings / Products */}
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1F1A1D', marginBottom: '0.75rem' }}>User Listed Products</h4>
                  {!productsList || productsList.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#FAF6EA', borderRadius: '0.5rem', color: '#8B8278', fontSize: '0.85rem' }}>
                      This user has not listed any products yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {productsList.map((prod) => (
                        <div 
                          key={prod.product_id || prod.id}
                          onClick={() => handleProductClick(prod)}
                          style={{
                            padding: '0.75rem 1rem',
                            border: '1px solid #D8CFC1',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            backgroundColor: '#FAF6EA',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAF6EA'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                        >
                          <div>
                            <strong style={{ fontSize: '0.875rem', color: '#6B1B71', textDecoration: 'underline' }}>{prod.title}</strong>
                            <span style={{ fontSize: '0.75rem', color: '#8B8278', display: 'block' }}>
                              Category: {PRODUCT_TYPE_LABELS[prod.product_type] || prod.product_type} &bull; Expected: {formatINR(prod.expected_price)}
                            </span>
                          </div>
                          <span className={`badge badge-${prod.status || 'pending'}`} style={{ fontSize: '0.65rem' }}>
                            {prod.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #D8CFC1', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#FAF6EA' }}>
                <button onClick={() => setSelectedUser(null)} className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SECONDARY PRODUCT DETAILS MODAL (Inside user profile popup) */}
      {selectedProduct && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 15, 25, 0.8)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: '#FAF6EA',
            borderRadius: '1.25rem',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #cbd5e1',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #D8CFC1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAF6EA'
            }}>
              <div>
                <span className={`badge badge-${selectedProduct.status || 'pending'}`} style={{ fontSize: '0.65rem' }}>
                  {selectedProduct.status}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.15rem 0 0 0', color: '#1F1A1D' }}>{selectedProduct.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B8278' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#8B8278', fontWeight: 600 }}>Brand:</span>
                  <p style={{ margin: 0, fontWeight: 700 }}>{selectedProduct.brand}</p>
                </div>
                <div>
                  <span style={{ color: '#8B8278', fontWeight: 600 }}>Model:</span>
                  <p style={{ margin: 0, fontWeight: 700 }}>{selectedProduct.model}</p>
                </div>
                <div>
                  <span style={{ color: '#8B8278', fontWeight: 600 }}>Expected Valuation:</span>
                  <p style={{ margin: 0, fontWeight: 800, color: '#10b981' }}>{formatINR(selectedProduct.expected_price)}</p>
                </div>
                <div>
                  <span style={{ color: '#8B8278', fontWeight: 600 }}>Condition:</span>
                  <p style={{ margin: 0, fontWeight: 700 }}>{selectedProduct.condition || 'Used'}</p>
                </div>
              </div>

              {selectedProduct.description && (
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                  <span style={{ color: '#8B8278', fontWeight: 600, fontSize: '0.85rem' }}>Description:</span>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#8B8278', lineHeight: 1.4 }}>
                    {selectedProduct.description}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #D8CFC1', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#FAF6EA' }}>
              <button onClick={() => setSelectedProduct(null)} className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                Back to Profile
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

export default UsersPage;
