import React, { useState } from 'react';
import { Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { subscribeNewsletter } from '../../api/newsletterApi';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const subscriberEmail = email.trim();
    if (!subscriberEmail) return;

    setLoading(true);
    try {
      const data = await subscribeNewsletter(subscriberEmail);
      toast.success(data?.message || 'Subscription email will be sent shortly!');
      setEmail('');
    } catch (err) {
      console.error('Newsletter subscription failed:', err);
      const errMsg = err.response?.data?.detail || err.response?.data?.message || 'Failed to send subscription email.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="landing-section" style={{
      background: 'radial-gradient(ellipse at center, #2d0a32 0%, #1F1A1D 100%)',
      color: '#ffffff',
      borderBottom: '1px solid #2d0a32'
    }}>
      <div className="landing-container" style={{ maxWidth: '800px', textAlign: 'center' }}>
        
        {/* Shield Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(107, 27, 113, 0.15)',
          color: '#965284',
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
          color: '#8B8278',
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
              border: '1px solid #4a1a50',
              backgroundColor: '#1F1A1D',
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
              backgroundColor: '#6B1B71',
              color: '#ffffff',
              border: 'none',
              padding: '0.9rem 1.75rem',
              borderRadius: '0.75rem',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(107, 27, 113, 0.2)',
              minWidth: '120px'
            }}
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {/* Small text info */}
        <p style={{
          fontSize: '0.75rem',
          color: '#8B8278',
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
