import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, Lock, Mail, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import '../../styles/auth.css';
import loginBg from '../../assets/login_bg.png';

export const LoginPage = () => {
  const { login, authError, setAuthError } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
    <div className="auth-page login-auth">
      <img src={loginBg} className="auth-bg-img" alt="DealsKB Auction Background" />
      <div className="auth-overlay" />

      <div className="auth-content">
        <div className="auth-card-wrapper">
          <div className="auth-card login-card">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Car size={36} style={{ color: '#6B1B71' }} />
                <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: '#0f172a', letterSpacing: 0 }}>
                  DealsKB
                </span>
              </div>
              <p className="auth-muted-text" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                Log in to manage listings and bid on live auctions
              </p>
            </div>

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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="login-identifier-input">Mobile Number or Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#8B8278' }} />
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
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#8B8278' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password-input"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#8B8278',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
                  <Link to="/forgot-password" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
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
                  'Login'
                )}
              </button>
            </form>

            <div className="auth-card-divider" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '2rem',
              paddingTop: '1.25rem',
              fontSize: '0.85rem'
            }}>
              <Link to="/" className="auth-muted-text" style={{ fontWeight: 700 }}>Back to Home</Link>
              <span className="auth-muted-text">
                New?{' '}
                <Link to="/register" style={{ fontWeight: 800 }}>
                  Create Account
                </Link>
              </span>
            </div>
          </div>
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
