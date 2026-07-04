import React, { useState } from 'react';
import { Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setTimeout(() => {
      toast.success('Successfully subscribed to deals alerts!');
      setEmail('');
      setLoading(false);
    }, 1000);
  };

  return (
    <section className="landing-section" style={{
      background: 'radial-gradient(ellipse at center, #1e293b 0%, #0b0f19 100%)',
      color: '#ffffff',
      borderBottom: '1px solid #1e293b'
    }}>
      <div className="landing-container" style={{ maxWidth: '800px', textAlign: 'center' }}>
        
        {/* Shield Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(37, 99, 235, 0.15)',
          color: '#3b82f6',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <Mail size={24} />
        </div>

        {/* Text */}
        <h2 style={{
          fontSize: '2.25rem',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '1rem',
          fontFamily: "'Outfit', sans-serif"
        }}>
          Never Miss an Auction Deal
        </h2>
        <p style={{
          color: '#94a3b8',
          fontSize: '1rem',
          lineHeight: 1.6,
          marginBottom: '2.5rem',
          maxWidth: '560px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Subscribe to our weekly alerts newsletter to get notified on newly listed cars, laptops, mobiles, and bikes going live in your area.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          gap: '0.75rem',
          maxWidth: '500px',
          width: '100%',
          margin: '0 auto',
          flexWrap: 'wrap'
        }}>
          <input 
            type="email" 
            placeholder="Enter your email address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              flex: 1,
              padding: '0.9rem 1.25rem',
              borderRadius: '0.75rem',
              border: '1px solid #334155',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontSize: '0.9rem',
              outline: 'none',
              minWidth: '240px'
            }}
          />
          <button 
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '0.9rem 1.75rem',
              borderRadius: '0.75rem',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
              minWidth: '120px'
            }}
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {/* Small text info */}
        <p style={{
          fontSize: '0.75rem',
          color: '#475569',
          marginTop: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.35rem'
        }}>
          <ShieldCheck size={12} style={{ color: '#10b981' }} />
          Your email address is safe with us. Unsubscribe at any time.
        </p>

      </div>
    </section>
  );
};

export default NewsletterSection;
