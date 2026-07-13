import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, AlertTriangle, ShieldCheck, ArrowRight, UserCheck, X } from 'lucide-react';
import { verifyDeleteAccount, confirmDeleteAccount } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import Footer from '../../components/common/Footer';
import logoImg from '../../assets/logo.png';
import { toast } from 'react-toastify';

export const DeleteAccountPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [identifier, setIdentifier] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Confirmation state
  const [confirmationToken, setConfirmationToken] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleVerifyRequest = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      toast.error('Please complete both email/mobile and password fields.');
      return;
    }
    
    try {
      setLoading(true);
      const res = await verifyDeleteAccount({
        identifier: identifier.trim(),
        password: password
      });
      
      if (res.success && res.confirmationToken) {
        setConfirmationToken(res.confirmationToken);
        setShowConfirmModal(true);
        toast.info('Account verified. Please confirm deletion to proceed.');
      } else {
        toast.error(res.message || 'Verification failed.');
      }
    } catch (err) {
      console.error('Verification failed:', err);
      toast.error(err.response?.data?.detail || err.response?.data?.message || 'Invalid credentials or verification error.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeletion = async (e) => {
    e.preventDefault();
    if (confirmText !== 'DELETE') {
      toast.error("Please type 'DELETE' exactly to confirm.");
      return;
    }

    try {
      setLoading(true);
      const res = await confirmDeleteAccount({
        confirmationToken: confirmationToken,
        confirmation: 'DELETE'
      });

      if (res.success) {
        toast.success('Your account has been deleted successfully.');
        setShowConfirmModal(false);
        await logout('/');
      } else {
        toast.error(res.message || 'Deletion failed.');
      }
    } catch (err) {
      console.error('Account deletion failed:', err);
      toast.error(err.response?.data?.detail || err.response?.data?.message || 'Failed to complete account deletion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6EA', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
      
      {/* Brand Header */}
      <div style={{ background: '#090d16', padding: '1rem 2rem', display: 'flex', alignItems: 'center' }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textDecoration: 'none' }}>
          <img src={logoImg} alt="DealsKB Logo" style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#fff' }}>
            Deals<span style={{ color: '#c084fc' }}>KB</span>
          </span>
        </div>
      </div>

      {/* Main Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #3d0a42 0%, #1F1A1D 100%)', padding: '3.5rem 2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <Trash2 size={40} style={{ color: '#ef4444' }} />
        </div>
        <h1 style={{ color: '#fff', fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 800, margin: 0 }}>Delete Your Account</h1>
        <p style={{ color: '#a1a1aa', marginTop: '0.75rem', fontSize: '0.95rem', maxWidth: '700px', margin: '0.75rem auto 0 auto', lineHeight: 1.5 }}>
          Enter your registered email and password to request deletion of your DealsKB account. This flow is for buyers, sellers, and dealers who want to permanently remove account access.
        </p>
      </div>

      {/* Content Form Card */}
      <div style={{ maxWidth: '800px', margin: '3rem auto 5rem auto', padding: '0 1.5rem', width: '100%', flex: 1 }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          padding: '2.5rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
          border: '1px solid #D8CFC1'
        }}>
          
          {/* Policy Information Section */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #E2DCD0', paddingBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={20} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1F1A1D', margin: '0 0 0.5rem 0' }}>Delete Your DealsKB Account</h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: '0 0 0.75rem 0', lineHeight: 1.6 }}>
                At DealsKB, we respect your privacy and give you control over your account information. You can request account deletion by verifying your registered email and password.
              </p>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: '0 0 0.75rem 0', lineHeight: 1.6 }}>
                Once deletion is confirmed, your login access, profile details, listings history, bidding passes, transactions/payments history, and active chats/bids may be permanently removed from our platform.
              </p>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: '0 0 0.75rem 0', lineHeight: 1.6 }}>
                Some information may be retained where required for legal, payment, security, dispute resolution, audit, or compliance purposes.
              </p>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                Before deleting your account, make sure you have no active listings, ongoing bids, pending payouts, or unresolved transaction issues.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleVerifyRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#1F1A1D', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Email Address or Mobile Number
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. shubham.taware108@gmail.com"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#1F1A1D', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: '#dc2626',
                border: 'none',
                color: '#ffffff',
                padding: '0.85rem 1.5rem',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                marginTop: '0.5rem',
                width: 'fit-content'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            >
              <Trash2 size={16} /> Request Account Deletion
            </button>
          </form>

        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #D8CFC1',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowConfirmModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <AlertTriangle size={24} style={{ color: '#dc2626' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F1A1D', margin: 0 }}>Final Confirmation</h3>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              This action is <strong>irreversible</strong> and will permanently wipe your login sessions and listings. To confirm, please type <strong style={{ color: '#dc2626' }}>DELETE</strong> in the box below:
            </p>

            <form onSubmit={handleConfirmDeletion} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  outline: 'none',
                  textAlign: 'center',
                  fontWeight: 800,
                  letterSpacing: '1px'
                }}
              />

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || confirmText !== 'DELETE'}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    backgroundColor: confirmText === 'DELETE' ? '#dc2626' : '#fca5a5',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    cursor: confirmText === 'DELETE' ? 'pointer' : 'not-allowed'
                  }}
                >
                  {loading ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DeleteAccountPage;

