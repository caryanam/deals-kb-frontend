import React from 'react';
import { Star } from 'lucide-react';

const TestimonialSection = () => {
  const reviews = [
    {
      name: 'Rohan Sharma',
      role: 'Verified Car Buyer',
      avatar: 'RS',
      text: 'I bought my first sedan on DealsKB. The 2-minute live bidding room was extremely thrilling and transparent! The admin documentation verification gives complete peace of mind.'
    },
    {
      name: 'Priyanka Patel',
      role: 'Independet Gadget Seller',
      avatar: 'PP',
      text: 'Selling my laptop was so simple. I uploaded photos and a quick video, and my listing was verified within hours. The auction closed successfully and the winner chatted with me to finalize payment.'
    },
    {
      name: 'Vikram Malhotra',
      role: 'Automobile Enthusiast',
      avatar: 'VM',
      text: 'The WebSocket synchronization is amazing! I tracked bids real-time on my smartphone without any page refreshes. The billing and verification checks are incredibly robust.'
    }
  ];

  return (
    <section id="testimonials" className="landing-section" style={{ backgroundColor: '#ffffff' }}>
      <div className="landing-container">
        
        {/* Title */}
        <h2 className="landing-section-title">What Our Users Say</h2>
        <p className="landing-section-subtitle">
          Read success stories from buyers and sellers who have used our secure auction system.
        </p>

        {/* Testimonials Grid */}
        <div className="landing-testimonial-grid">
          {reviews.map((rev, idx) => (
            <div key={idx} className="landing-testimonial-card">
              
              {/* Stars block */}
              <div style={{ display: 'flex', gap: '0.2rem', color: '#f59e0b' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>

              {/* Quote text */}
              <p className="landing-testimonial-quote">
                "{rev.text}"
              </p>

              {/* Author info */}
              <div className="landing-testimonial-author">
                <div className="landing-testimonial-avatar">
                  {rev.avatar}
                </div>
                <div className="landing-testimonial-details">
                  <strong>{rev.name}</strong>
                  <span>{rev.role}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialSection;
