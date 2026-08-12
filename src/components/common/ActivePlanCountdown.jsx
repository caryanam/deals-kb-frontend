import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

export const ActivePlanCountdown = ({ expiresAt, planName, planId, compact = false }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (!expiresAt) return;

    const calculate = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) return null;

  if (timeLeft.isExpired) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        backgroundColor: '#fef2f2',
        color: '#b91c1c',
        border: '1px solid #fecaca',
        borderRadius: '999px',
        padding: '0.15rem 0.5rem',
        fontSize: '0.7rem',
        fontWeight: 800
      }}>
        Expired
      </span>
    );
  }

  const countdownText = timeLeft.days > 0
    ? `${timeLeft.days}d ${String(timeLeft.hours).padStart(2, '0')}h ${String(timeLeft.minutes).padStart(2, '0')}m left`
    : `${timeLeft.hours}h ${String(timeLeft.minutes).padStart(2, '0')}m ${String(timeLeft.seconds).padStart(2, '0')}s left`;

  if (compact) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        backgroundColor: '#dcfce7',
        color: '#166534',
        border: '1px solid #86efac',
        borderRadius: '999px',
        padding: '0.15rem 0.5rem',
        fontSize: '0.72rem',
        fontWeight: 800,
        fontFamily: 'monospace'
      }}>
        <Clock size={11} color="#15803D" />
        {countdownText}
      </span>
    );
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.45rem',
      backgroundColor: '#f0fdf4',
      border: '1.5px solid #86efac',
      borderRadius: '0.5rem',
      padding: '0.35rem 0.75rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <CheckCircle2 size={14} color="#16A34A" />
      <div>
        {planName && (
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', display: 'block' }}>
            {planName} {planId && <span style={{ opacity: 0.8, fontFamily: 'monospace', fontWeight: 600 }}>({planId})</span>}
          </span>
        )}
        <span style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 900, fontFamily: 'monospace' }}>
          ⏳ Expires in: {countdownText}
        </span>
      </div>
    </div>
  );
};

export default ActivePlanCountdown;
