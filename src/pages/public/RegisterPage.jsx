import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Car, Loader2, Lock, Mail, Phone, ShieldCheck, User, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { checkRegistrationOtp, sendRegistrationOtp } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/auth.css';
import loginBg from '../../assets/login_bg.png';

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
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (token && user) {
      navigate(getDashboardPath(user.role));
    }
    setAuthError(null);
  }, [token, user, navigate, setAuthError, getDashboardPath]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const resetEmailVerification = () => {
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setResendCooldown(0);
    setSuccessMsg('');
  };

  const validateTopFields = () => {
    if (!role) return 'Please select a role.';
    if (!name.trim()) return 'Full Name is required.';
    if (!email.trim()) return 'Email Address is required.';
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address.';
    return '';
  };

  const handleSendOtp = async () => {
    setValidationError('');
    setSuccessMsg('');

    const topError = validateTopFields();
    if (topError) {
      setValidationError(topError);
      toast.error(topError);
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
      setResendCooldown(30);
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

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading || loading || otpVerified) return;
    setValidationError('');
    setSuccessMsg('');

    const topError = validateTopFields();
    if (topError) {
      setValidationError(topError);
      toast.error(topError);
      return;
    }

    setResendLoading(true);
    try {
      await sendRegistrationOtp({
        role,
        name: name.trim(),
        email: email.trim().toLowerCase()
      });
      setOtp('');
      setOtpSent(true);
      setOtpVerified(false);
      setResendCooldown(30);
      toast.success('New OTP sent to your email!');
      setSuccessMsg('New verification code sent to your email.');
    } catch (err) {
      console.error('Failed to resend OTP:', err);
      const errMsg = err.response?.data?.detail || err.response?.data?.message || 'Failed to resend verification OTP.';
      setValidationError(errMsg);
      toast.error(errMsg);
    } finally {
      setResendLoading(false);
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
    <div className="auth-page register-auth">
      <img src={loginBg} className="auth-bg-img" alt="DealsKB Auction Background" />
      <div className="auth-overlay" />

      <div className="auth-content">
        <div className="auth-card-wrapper">
          <div className="auth-card register-card">
            <div style={{ textAlign: 'center', marginBottom: '0.85rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                <Car size={26} style={{ color: '#ffffff' }} />
                <span style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: '#ffffff', letterSpacing: 0 }}>
                  Create Account
                </span>
              </div>
              <p className="auth-muted-text" style={{ fontSize: '0.8rem', fontWeight: 500, margin: 0 }}>
                Register to continue on DealsKB
              </p>
            </div>

            {successMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#d1fae5',
                border: '1px solid #10b981',
                padding: '0.4rem 0.65rem',
                borderRadius: '0.5rem',
                color: '#065f46',
                fontSize: '0.78rem',
                fontWeight: 600,
                marginBottom: '0.65rem'
              }}>
                <span>{successMsg}</span>
              </div>
            )}

            {(validationError || authError) && !successMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                padding: '0.4rem 0.65rem',
                borderRadius: '0.5rem',
                color: '#b91c1c',
                fontSize: '0.78rem',
                marginBottom: '0.65rem',
                lineHeight: 1.3
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.05rem' }}>Registration Error</strong>
                  <span>{validationError || authError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleVerifyAndRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '0.2rem' }}>Select Platform Role *</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  minHeight: '2.3rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
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
                          borderRight: roleOption === 'Dealer' ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                          backgroundColor: selected ? '#6B1B71' : 'transparent',
                          color: selected ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                          fontWeight: 800,
                          fontSize: '0.8rem',
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
                <label className="form-label" htmlFor="name-input" style={{ fontSize: '0.78rem', marginBottom: '0.2rem' }}>Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#8B8278' }} />
                  <input
                    type="text"
                    id="name-input"
                    className="form-control"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (otpSent) resetEmailVerification();
                    }}
                    disabled={loading || otpVerified}
                    style={{ paddingLeft: '2.5rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', fontSize: '0.85rem' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="email-input" style={{ fontSize: '0.78rem', marginBottom: '0.2rem' }}>Email Address *</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#8B8278' }} />
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
                      style={{ paddingLeft: '2.5rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || otpSent || otpVerified}
                    className="btn btn-primary"
                    style={{
                      padding: '0 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      backgroundColor: otpSent || otpVerified ? '#10b981' : '#6B1B71',
                      borderColor: otpSent || otpVerified ? '#10b981' : '#6B1B71',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      borderRadius: '0.5rem'
                    }}
                  >
                    {loading && !otpSent ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                    {otpVerified ? 'Verified' : otpSent ? 'OTP Sent' : 'Verify Email'}
                  </button>
                </div>
              </div>

              {otpSent && !otpVerified && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="otp-input" style={{ fontSize: '0.78rem', marginBottom: '0.2rem' }}>Email Verification OTP *</label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <ShieldCheck size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#8B8278' }} />
                      <input
                        type="text"
                        id="otp-input"
                        className="form-control"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        disabled={loading || otpVerified}
                        style={{
                          paddingLeft: '2.5rem',
                          paddingRight: '7.25rem',
                          paddingTop: '0.45rem',
                          paddingBottom: '0.45rem',
                          fontSize: '0.85rem',
                          fontWeight: 700
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendCooldown > 0 || resendLoading || loading || otpVerified}
                        style={{
                          position: 'absolute',
                          right: '0.35rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          border: 'none',
                          borderRadius: '0.45rem',
                          backgroundColor: resendCooldown > 0 ? '#e5e7eb' : '#6B1B71',
                          color: resendCooldown > 0 ? '#6b7280' : '#ffffff',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '0.35rem 0.55rem',
                          minWidth: '5.9rem',
                          cursor: resendCooldown > 0 || resendLoading || loading || otpVerified ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {resendLoading ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyEmailOtp}
                      disabled={loading || !otp.trim()}
                      className="btn btn-primary"
                      style={{ padding: '0 0.85rem', fontSize: '0.8rem', fontWeight: 700, backgroundColor: '#10b981', borderColor: '#10b981', borderRadius: '0.5rem' }}
                    >
                      {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Confirm Code'}
                    </button>
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="phone-input" style={{ fontSize: '0.78rem', marginBottom: '0.2rem' }}>Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#8B8278' }} />
                  <input
                    type="tel"
                    id="phone-input"
                    className="form-control"
                    placeholder="Enter mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={fieldDisabledUntilOtp}
                    style={{ paddingLeft: '2.5rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="password-input" style={{ fontSize: '0.78rem', marginBottom: '0.2rem' }}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#8B8278' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password-input"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={fieldDisabledUntilOtp}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', fontSize: '0.85rem' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.85rem',
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
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !otpVerified}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  fontSize: '0.9rem',
                  marginTop: '0.4rem',
                  opacity: loading || !otpVerified ? 0.55 : 1,
                  cursor: loading || !otpVerified ? 'not-allowed' : 'pointer',
                  borderRadius: '0.5rem'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Registering...
                  </>
                ) : (
                  'Register →'
                )}
              </button>
            </form>

            <div className="auth-card-divider" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '0.85rem',
              paddingTop: '0.65rem',
              fontSize: '0.8rem'
            }}>
              <span className="auth-muted-text">
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#ffffff', fontWeight: 700 }}>
                  Login
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
