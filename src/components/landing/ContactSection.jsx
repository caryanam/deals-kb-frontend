import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const PURPLE = '#6B1B71';
const BORDER = '#D8CFC1';
const GOLD = '#B2772D';

const contacts = [
  {
    Icon: Phone,
    label: 'Phone',
    value: '+91 98765 43210',
    href: 'tel:+919876543210',
  },
  {
    Icon: Mail,
    label: 'Email',
    value: 'support@dealskb.com',
    href: 'mailto:support@dealskb.com',
  },
  {
    Icon: MapPin,
    label: 'Location',
    value: 'Pune, Maharashtra, India',
    href: null,
  },
];

const ContactSection = () => {
  return (
    <section
      id="contact"
      style={{
        backgroundColor: '#ffffff',
        padding: '80px 24px',
      }}
    >
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Card */}
        <div
          style={{
            backgroundColor: '#fff',
            border: `1.5px solid ${BORDER}`,
            borderRadius: '24px',
            padding: '56px 48px',
            textAlign: 'center',
            boxShadow: '0 8px 40px rgba(107,27,113,0.09)',
          }}
        >
          {/* Badge */}
          <span
            style={{
              display: 'inline-block',
              backgroundColor: PURPLE,
              color: '#fff',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              padding: '6px 18px',
              borderRadius: '20px',
              marginBottom: '20px',
            }}
          >
            Contact Us
          </span>

          {/* Title */}
          <h2
            style={{
              fontSize: 'clamp(24px, 4vw, 38px)',
              fontWeight: '800',
              color: '#1a1a1a',
              margin: '0 0 10px',
            }}
          >
            Get in <span style={{ color: PURPLE }}>Touch</span>
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '16px',
              color: '#666',
              margin: '0 0 40px',
              lineHeight: '1.6',
            }}
          >
            We're here to help with your bidding journey
          </p>

          {/* Contact Items */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              marginBottom: '36px',
            }}
          >
            {contacts.map(({ Icon, label, value, href }, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  backgroundColor: '#FAF6EA',
                  border: `1px solid ${BORDER}`,
                  borderRadius: '14px',
                  padding: '18px 24px',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: PURPLE,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} color="#fff" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: GOLD,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      marginBottom: '2px',
                    }}
                  >
                    {label}
                  </div>
                  {href ? (
                    <a
                      href={href}
                      style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#1a1a1a',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = PURPLE)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#1a1a1a')}
                    >
                      {value}
                    </a>
                  ) : (
                    <span
                      style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#1a1a1a',
                      }}
                    >
                      {value}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Support note */}
          <p
            style={{
              fontSize: '13px',
              color: '#888',
              backgroundColor: '#FAF6EA',
              border: `1px dashed ${BORDER}`,
              borderRadius: '10px',
              padding: '14px 20px',
              margin: 0,
              lineHeight: '1.6',
            }}
          >
            💬 Our support team responds within <strong>24 hours</strong> on business days.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
