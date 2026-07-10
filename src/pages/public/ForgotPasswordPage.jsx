import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, Lock, Mail, Loader2, AlertCircle, ShieldCheck, Check, Eye, EyeOff } from 'lucide-react';
import { sendForgotPasswordOtp, verifyForgotPasswordOtp, resetPassword } from '../../api/authApi';
import { toast } from 'react-toastify';
import '../../styles/auth.css';
import loginBg from '../../assets/login_bg.mp4';
import logoImg from '../../assets/logo.png';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  // Wizard steps: 1 = request credentials, 2 = verify otp, 3 = new password, 4 = complete
  const [step, setStep] = useState(1);

  // Input states
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Session keys
  const [resetToken, setResetToken] = useState('');

  // UX states
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const getApiErrorMessage = (err, fallback) => {
    const detail = err?.response?.data?.detail || err?.response?.data?.message || err?.message;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((item) => item?.msg || item?.message || JSON.stringify(item))
        .join(', ');
    }
    if (detail && typeof detail === 'object') {
      return detail.msg || detail.message || JSON.stringify(detail);
    }
    if (err?.code === 'ECONNABORTED') {
      return 'OTP request timed out. Please check backend/email service and try again.';
    }
    return fallback;
  };

  // Step 1: Send Forgot Password OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const normalizedIdentifier = identifier.trim();
    if (!normalizedIdentifier) {
      setErrorMsg('Please enter mobile or email.');
      toast.error('Please enter mobile or email.');
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!emailRegex.test(normalizedIdentifier) && !mobileRegex.test(normalizedIdentifier)) {
      setErrorMsg('Please enter a valid email or 10-digit Indian mobile number.');
      toast.error('Please enter a valid email or 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    try {
      await sendForgotPasswordOtp({ identifier: normalizedIdentifier });
      toast.success('Forgot password OTP sent successfully!');
      setSuccessMsg('OTP code sent successfully.');
      setResendCooldown(30);
      setStep(2);
    } catch (err) {
      console.error('Failed to send forgot password OTP:', err);
      const errMsg = getApiErrorMessage(err, 'Failed to send OTP code.');
      setErrorMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setErrorMsg('');
    setSuccessMsg('');
    setResendLoading(true);
    try {
      await sendForgotPasswordOtp({ identifier: identifier.trim() });
      toast.success('OTP resent successfully!');
      setSuccessMsg('New OTP sent successfully.');
      setResendCooldown(30);
    } catch (err) {
      console.error('Failed to resend forgot password OTP:', err);
      const errMsg = getApiErrorMessage(err, 'Failed to resend OTP code.');
      setErrorMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setResendLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otp.trim()) {
      setErrorMsg('Please enter the OTP code.');
      toast.error('Please enter the OTP code.');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyForgotPasswordOtp({ identifier: identifier.trim(), otp: otp.trim() });
      toast.success('OTP verified successfully!');
      setResetToken(data.reset_token);
      setSuccessMsg('OTP verified! Please set your new password.');
      setStep(3);
    } catch (err) {
      console.error('OTP verification failed:', err);
      const errMsg = getApiErrorMessage(err, 'OTP verification failed.');
      setErrorMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ identifier: identifier.trim(), reset_token: resetToken, new_password: password });
      toast.success('Password reset successfully!');
      setSuccessMsg('Password has been updated successfully.');
      setStep(4);
    } catch (err) {
      console.error('Password reset failed:', err);
      const errMsg = getApiErrorMessage(err, 'Password reset failed.');
      setErrorMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page forgot-auth">
      <video className="auth-bg-img" autoPlay muted loop playsInline preload="auto">
        <source src={loginBg} type="video/mp4" />
      </video>
      <div className="auth-overlay" />

      <div className="auth-content">
        <div className="auth-card forgot-card">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <img src={logoImg} alt="DealsKB Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: '#0f172a', letterSpacing: '-0.03em' }}>
                Reset Password
              </span>
            </div>
            <p className="auth-muted-text" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
              {step === 1 && 'Enter mobile or email to receive recovery OTP'}
              {step === 2 && 'Enter verification code'}
              {step === 3 && 'Choose your new login password'}
              {step === 4 && 'Recovery completed successfully!'}
            </p>
          </div>

        {/* Alerts */}
        {successMsg && step !== 4 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#d1fae5',
            border: '1px solid #10b981',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            color: '#065f46',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.5rem'
          }}>
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fca5a5',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            color: '#b91c1c',
            fontSize: '0.85rem',
            lineHeight: 1.4,
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Enter Email or Mobile */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="identifier-input">Mobile or Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#000000' }} />
                <input
                  type="text"
                  id="identifier-input"
                  className="form-control"
                  placeholder="Enter mobile or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={loading}
                  style={{ paddingLeft: '2.75rem' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.8rem' }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Sending OTP...
                </>
              ) : (
                'Send Verification OTP'
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="otp-input">Verification Code (OTP)</label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#000000' }} />
                <input
                  type="text"
                  id="otp-input"
                  className="form-control"
                  placeholder="Enter OTP code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading}
                  style={{ paddingLeft: '2.75rem', fontWeight: 700, letterSpacing: '0.1rem' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={loading}
                onClick={() => { setStep(1); setSuccessMsg(''); }}
                style={{ flex: 1, padding: '0.8rem' }}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 2, padding: '0.8rem' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP Code'
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading || resendLoading || resendCooldown > 0}
              style={{
                border: 'none',
                background: 'transparent',
                color: resendCooldown > 0 ? '#8B8278' : '#6B1B71',
                fontWeight: 800,
                cursor: resendCooldown > 0 || loading || resendLoading ? 'not-allowed' : 'pointer',
                padding: '0.2rem',
                alignSelf: 'center'
              }}
            >
              {resendLoading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Resending OTP...
                </span>
              ) : resendCooldown > 0 ? (
                `Resend OTP in ${resendCooldown}s`
              ) : (
                'Resend OTP'
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Enter New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="password-input">New Password (Min 6 chars)</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#000000' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password-input"
                  className="form-control"
                  placeholder="••••••••"
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
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="confirm-input">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#000000' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirm-input"
                  className="form-control"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={loading}
                onClick={() => { setStep(2); setSuccessMsg(''); }}
                style={{ flex: 1, padding: '0.8rem' }}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 2, padding: '0.8rem' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Resetting...
                  </>
                ) : (
                  'Save New Password'
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Reset Success Screen */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#d1fae5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.5rem'
            }}>
              <Check size={32} />
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F1A1D', margin: 0 }}>Password Reset Complete</h4>
            <p style={{ fontSize: '0.875rem', color: '#8B8278', lineHeight: 1.5 }}>
              Your account password has been updated. You can now use your new password to sign in.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', textDecoration: 'none', display: 'block', backgroundColor: '#10b981', borderColor: '#10b981' }}>
              Sign In Now
            </Link>
          </div>
        )}

        {/* Footer Back navigation */}
        {step !== 4 && (
          <div className="auth-card-divider" style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            textAlign: 'center',
            fontSize: '0.85rem'
          }}>
            <Link to="/login" style={{ color: '#6B1B71', fontWeight: 600 }}>← Cancel &amp; Back to Login</Link>
          </div>
        )}
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

export default ForgotPasswordPage;
