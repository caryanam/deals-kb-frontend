import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, Lock, Mail, Phone, Loader2, AlertCircle, ShieldCheck, Check } from 'lucide-react';
import { sendForgotPasswordOtp, verifyForgotPasswordOtp, resetPassword } from '../../api/authApi';
import { toast } from 'react-toastify';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  // Wizard steps: 1 = request credentials, 2 = verify otp, 3 = new password, 4 = complete
  const [step, setStep] = useState(1);

  // Input states
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Session keys
  const [resetToken, setResetToken] = useState('');

  // UX states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: Send Forgot Password OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      toast.error('Please enter a valid email address.');
      return;
    }

    if (!mobileNumber) {
      setErrorMsg('Please enter your mobile number.');
      toast.error('Please enter your mobile number.');
      return;
    }

    // Validate 10-digit Indian mobile format
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobileNumber)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      toast.error('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    try {
      await sendForgotPasswordOtp({ email, mobile_number: mobileNumber });
      toast.success('Forgot password OTP sent successfully!');
      setSuccessMsg('OTP code sent successfully to your mobile/email.');
      setStep(2);
    } catch (err) {
      console.error('Failed to send forgot password OTP:', err);
      const errMsg = err.response?.data?.detail || err.response?.data?.message || 'Failed to send OTP code.';
      setErrorMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
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
      const data = await verifyForgotPasswordOtp({ email, mobile_number: mobileNumber, otp: otp.trim() });
      toast.success('OTP verified successfully!');
      
      // Save reset token returned by backend
      setResetToken(data.reset_token);
      setSuccessMsg('OTP verified! Please set your new password.');
      setStep(3);
    } catch (err) {
      console.error('OTP verification failed:', err);
      const errMsg = err.response?.data?.detail || err.response?.data?.message || 'OTP verification failed.';
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
      await resetPassword({ email, reset_token: resetToken, new_password: password });
      toast.success('Password reset successfully!');
      setSuccessMsg('Password has been updated successfully.');
      setStep(4);
    } catch (err) {
      console.error('Password reset failed:', err);
      const errMsg = err.response?.data?.detail || err.response?.data?.message || 'Password reset failed.';
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
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.08) 0%, transparent 40%)',
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
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Car size={36} style={{ color: '#ef4444' }} />
            <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: '#0b0f19', letterSpacing: '-0.03em' }}>
              Reset Password
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
            {step === 1 && 'Enter credentials to receive recovery OTP'}
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

        {/* STEP 1: Enter Email & Phone */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="email-input">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  id="email-input"
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  style={{ paddingLeft: '2.75rem' }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="mobile-input">Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  id="mobile-input"
                  className="form-control"
                  placeholder="Enter 10-digit mobile"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
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
              style={{ width: '100%', padding: '0.8rem', backgroundColor: '#ef4444', borderColor: '#ef4444' }}
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
                <ShieldCheck size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
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
                style={{ flex: 2, padding: '0.8rem', backgroundColor: '#ef4444', borderColor: '#ef4444' }}
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
          </form>
        )}

        {/* STEP 3: Enter New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="password-input">New Password (Min 6 chars)</label>
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
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="confirm-input">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="password"
                  id="confirm-input"
                  className="form-control"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              style={{ width: '100%', padding: '0.8rem', backgroundColor: '#ef4444', borderColor: '#ef4444' }}
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
            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Password Reset Complete</h4>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
              Your account password has been updated. You can now use your new password to sign in.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', textDecoration: 'none', display: 'block', backgroundColor: '#10b981', borderColor: '#10b981' }}>
              Sign In Now
            </Link>
          </div>
        )}

        {/* Footer Back navigation */}
        {step !== 4 && (
          <div style={{
            marginTop: '2rem',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '1.25rem',
            textAlign: 'center',
            fontSize: '0.85rem'
          }}>
            <Link to="/login" style={{ color: '#64748b', fontWeight: 600 }}>← Cancel & Back</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
