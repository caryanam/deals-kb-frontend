import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Car, Loader2, Lock, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { checkRegistrationOtp, sendRegistrationOtp } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';

const roleOptions = ['Buyer', 'Seller', 'Dealer'];

export const RegisterPage = () => {
  const { register, token, user, authError, setAuthError, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('Buyer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (token && user) {
      navigate(getDashboardPath(user.role));
    }
    setAuthError(null);
  }, [token, user, navigate, setAuthError, getDashboardPath]);

  const resetEmailVerification = () => {
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setSuccessMsg('');
  };

  const validateTopFields = () => {
    if (!role) return 'Please select a role.';
    if (!name.trim()) return 'Full Name is required.';
    if (!email.trim()) return 'Email address is required for OTP verification.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address.';
    return '';
  };

  const handleSendOtp = async () => {
    setValidationError('');
    setSuccessMsg('');

    const error = validateTopFields();
    if (error) {
      setValidationError(error);
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      await sendRegistrationOtp({
        role,
        name: name.trim(),
        email: email.trim().toLowerCase()
      });
      setOtpSent(true);
      setOtpVerified(false);
      toast.success('Verification OTP sent to your email!');
      setSuccessMsg('Verification code sent to your email. Please verify it before continuing.');
    } catch (err) {
      console.error('Failed to send OTP:', err);
      const errMsg = err.response?.data?.detail || err.response?.data?.message || 'Failed to send verification OTP.';
      setValidationError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setValidationError('');
    setSuccessMsg('');

    if (!otp.trim()) {
      const errMsg = 'Please enter the OTP verification code.';
      setValidationError(errMsg);
      toast.error(errMsg);
      return;
    }

    setLoading(true);
    try {
      await checkRegistrationOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim()
      });
      setOtpVerified(true);
      toast.success('Email verified successfully!');
      setSuccessMsg('Email verified. You can now complete registration.');
    } catch (err) {
      console.error('Email OTP verification failed:', err);
      const errMsg = err.response?.data?.detail || err.response?.data?.message || 'OTP verification failed. Please check the code.';
      setValidationError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMsg('');

    const topError = validateTopFields();
    if (topError) {
      setValidationError(topError);
      toast.error(topError);
      return;
    }
    if (!otpVerified) {
      const errMsg = 'Please verify your email OTP before submitting.';
      setValidationError(errMsg);
      toast.error(errMsg);
      return;
    }
    const mobileRegex = /^[6-9]\d{9}$/;
    if (phoneNumber.trim() && !mobileRegex.test(phoneNumber.trim())) {
      const errMsg = 'Please enter a valid 10-digit Indian mobile number.';
      setValidationError(errMsg);
      toast.error(errMsg);
      return;
    }
    if (password.length < 6) {
      const errMsg = 'Password must be at least 6 characters long.';
      setValidationError(errMsg);
      toast.error(errMsg);
      return;
    }
    if (password !== confirmPassword) {
      const errMsg = 'Passwords do not match.';
      setValidationError(errMsg);
      toast.error(errMsg);
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password, role, phoneNumber, otp.trim());
      toast.success('Account registered successfully!');
      if (res.access_token && res.user) {
        setSuccessMsg('Registration successful! Logging you in...');
        setTimeout(() => navigate(getDashboardPath(res.user.role)), 1000);
      } else {
        setSuccessMsg('Registration successful! Redirecting to login page...');
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      const errMsg = err.message || 'Registration failed. Please try again.';
      setValidationError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const fieldDisabledUntilOtp = loading || !otpVerified;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0b0f19',
      backgroundImage: 'radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 40%)',
      padding: '1.5rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: '#ffffff',
        borderRadius: '1.25rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        padding: '2.5rem',
        border: '1px solid #1e293b'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Car size={32} style={{ color: '#2563eb' }} />
            <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: '#0b0f19', letterSpacing: 0 }}>
              Create Account
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
            Join AutoBid and start bidding or listing products today
          </p>
        </div>

        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: '#d1fae5',
            border: '1px solid #10b981',
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            color: '#065f46',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem'
          }}>
            <span>{successMsg}</span>
          </div>
        )}

        {(validationError || authError) && !successMsg && (
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
              <strong style={{ display: 'block', marginBottom: '0.15rem' }}>Registration Error</strong>
              <span>{validationError || authError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleVerifyAndRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Select Platform Role *</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              border: '1px solid #cbd5e1',
              borderRadius: '0.8rem',
              overflow: 'hidden',
              minHeight: '3.1rem',
              backgroundColor: '#f8fafc'
            }}>
              {roleOptions.map((roleOption) => {
                const selected = role === roleOption;
                return (
                  <button
                    key={roleOption}
                    type="button"
                    onClick={() => setRole(roleOption)}
                    disabled={loading || otpSent}
                    style={{
                      border: 'none',
                      borderRight: roleOption === 'Dealer' ? 'none' : '1px solid #cbd5e1',
                      backgroundColor: selected ? '#2563eb' : 'transparent',
                      color: selected ? '#ffffff' : '#0f172a',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: loading || otpSent ? 'not-allowed' : 'pointer',
                      opacity: loading || otpSent ? 0.7 : 1
                    }}
                  >
                    {roleOption}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="name-input">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                id="name-input"
                className="form-control"
                placeholder="John Doe"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (otpSent) resetEmailVerification();
                }}
                disabled={loading || otpVerified}
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="email-input">Email Address *</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  id="email-input"
                  className="form-control"
                  placeholder="buyer@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (otpSent) resetEmailVerification();
                  }}
                  disabled={loading || otpVerified}
                  style={{ paddingLeft: '2.75rem' }}
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || otpSent || otpVerified}
                className="btn btn-primary"
                style={{
                  padding: '0 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  backgroundColor: otpSent || otpVerified ? '#10b981' : '#2563eb',
                  borderColor: otpSent || otpVerified ? '#10b981' : '#2563eb',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                {loading && !otpSent ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {otpVerified ? 'Verified' : otpSent ? 'OTP Sent' : 'Send OTP'}
              </button>
            </div>
          </div>

          {otpSent && !otpVerified && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="otp-input">Enter Email OTP *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <ShieldCheck size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    id="otp-input"
                    className="form-control"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={loading}
                    style={{ paddingLeft: '2.75rem', fontWeight: 700, letterSpacing: '0.1rem' }}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyEmailOtp}
                  disabled={loading}
                  className="btn btn-success"
                  style={{
                    padding: '0 1rem',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    backgroundColor: '#10b981',
                    borderColor: '#10b981',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                  Verify OTP
                </button>
              </div>
              <button
                type="button"
                onClick={resetEmailVerification}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: '0.35rem 0 0' }}
              >
                Edit email / Resend OTP
              </button>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="phone-input">Mobile Number (Optional)</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                id="phone-input"
                className="form-control"
                placeholder="Enter 10-digit mobile"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={fieldDisabledUntilOtp}
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="password-input">Password * (Min 6 characters)</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="password"
                id="password-input"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={fieldDisabledUntilOtp}
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="confirm-password-input">Confirm Password *</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="password"
                id="confirm-password-input"
                className="form-control"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={fieldDisabledUntilOtp}
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !otpVerified}
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '1rem',
              marginTop: '0.25rem',
              opacity: loading || !otpVerified ? 0.55 : 1,
              cursor: loading || !otpVerified ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2rem',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '1.25rem',
          fontSize: '0.85rem'
        }}>
          <Link to="/login" style={{ color: '#64748b', fontWeight: 600 }}>Back to Login</Link>
          <span style={{ color: '#94a3b8' }}>
            Have account?{' '}
            <Link to="/login" style={{ color: '#2563eb', fontWeight: 700 }}>
              Sign In
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
