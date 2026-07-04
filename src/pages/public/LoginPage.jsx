import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

export const LoginPage = () => {
  const { login, authError, setAuthError } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Note: No auto-redirect here. sessionStorage is tab-isolated,
  // so each new tab starts with no session. Only redirect after explicit login.
  useEffect(() => {
    setAuthError(null);
  }, [setAuthError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const normalizedIdentifier = identifier.trim();
    if (!normalizedIdentifier) {
      setErrorMsg('Please enter your mobile number or email.');
      toast.error('Please enter your mobile number or email.');
      return;
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!mobileRegex.test(normalizedIdentifier) && !emailRegex.test(normalizedIdentifier)) {
      setErrorMsg('Please enter a valid email or 10-digit Indian mobile number.');
      toast.error('Please enter a valid email or 10-digit Indian mobile number.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      toast.error('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const role = await login(normalizedIdentifier, password);
      toast.success('Signed in successfully!');
      const normalizedRole = role?.toLowerCase();
      if (normalizedRole === 'buyer') navigate('/buyer/dashboard');
      else if (normalizedRole === 'seller') navigate('/seller/dashboard');
      else if (normalizedRole === 'dealer') navigate('/dealer/dashboard');
      else if (normalizedRole === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      console.error('Login attempt failed:', err);
      const errMsg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Login failed. Invalid credentials.';
      setErrorMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0b0f19',
      backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.15) 0%, transparent 40%)',
      padding: '1.5rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        backgroundColor: '#ffffff',
        borderRadius: '1.25rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        padding: '2.5rem',
        border: '1px solid #1e293b'
      }}>
        {/* Logo and Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Car size={36} style={{ color: '#2563eb' }} />
            <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: '#0b0f19', letterSpacing: '-0.03em' }}>
              DealsKB
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
            Log in to manage listings and bid on live auctions
          </p>
        </div>

        {/* Global Error Banner */}
        {(errorMsg || authError) && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fca5a5',
            padding: '1rem',
            borderRadius: '0.75rem',
            color: '#b91c1c',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            lineHeight: 1.4
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '0.15rem' }}>Login Error</strong>
              <span>{errorMsg || authError}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="login-identifier-input">Mobile Number or Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                id="login-identifier-input"
                className="form-control"
                placeholder="Enter mobile number or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="password-input">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="password"
                id="password-input"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', marginTop: '0.5rem' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Navigation back / to register */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2rem',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '1.25rem',
          fontSize: '0.85rem'
        }}>
          <Link to="/" style={{ color: '#64748b', fontWeight: 600 }}>← Landing Page</Link>
          <span style={{ color: '#94a3b8' }}>
            New?{' '}
            <Link to="/register" style={{ color: '#2563eb', fontWeight: 700 }}>
              Create Account
            </Link>
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
