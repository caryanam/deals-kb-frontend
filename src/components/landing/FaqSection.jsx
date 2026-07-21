import React, { useState } from 'react';

const PURPLE = '#6B1B71';
const CREAM = '#FAF6EA';
const GOLD = '#B2772D';
const BORDER = '#D8CFC1';

const faqs = [
  {
    q: 'How does Dealskb work?',
    a: 'Register as a buyer, activate a 24-hour pass for the category you want (car, bike, mobile, or laptop), and place unlimited buy access during live sells. The highest buy price at sell end wins.',
  },
  {
    q: 'What is a Buyer Pass?',
    a: 'A bidding pass grans you 24 hours of unlimited access for a specific product category. Passes are priced at ₹1 for mobiles, ₹1 for laptops, ₹1 for bikes, and ₹1 for cars (inclusive of 18% GST).',
  },
  {
    q: 'How much does it cost to list a product as a seller?',
    a: 'Listing fees are ₹1 for mobiles, ₹1 for laptops, ₹1 for bikes, and ₹1 for cars (inclusive of 18% GST). Your product goes live after admin verification.',
  },
  {
    q: 'What is the Dealer Monthly Plan?',
    a: 'Dealers can subscribe to a monthly plan for unlimited listings: ₹1/month for Mobile/Laptop/Bike and ₹1/month for Cars (inclusive of 18% GST). This allows them to list multiple products without per-listing charges.',
  },
  {
    q: 'How does product approval work?',
    a: 'After a seller submits a listing with photos and documents, our admin team reviews it for authenticity. Once verified, it goes live for bidding.',
  },
  {
    q: 'What happens after I buy ?',
    a: 'After winning, DealsKB connects you with the seller. You complete the payment and product handover directly. Our platform facilitates secure communication throughout.',
  },
  {
    q: 'What is the refund policy for buyer passes?',
    a: 'Buyer passes are non-refundable once activated.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'Yes. All payments are processed through CCAvenue with industry-standard SSL encryption. We never store your card details.',
  },
];

const FaqItem = ({ faq, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        border: `1.5px solid ${open ? PURPLE : BORDER}`,
        borderRadius: '12px',
        marginBottom: '12px',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease',
        backgroundColor: '#fff',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          padding: '20px 24px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: '16px',
        }}
      >
        <span
          style={{
            fontSize: '15px',
            fontWeight: '600',
            color: open ? PURPLE : '#1a1a1a',
            lineHeight: '1.4',
            transition: 'color 0.2s ease',
            flex: 1,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: PURPLE,
              color: '#fff',
              fontSize: '12px',
              fontWeight: '700',
              marginRight: '12px',
              flexShrink: 0,
            }}
          >
            {index + 1}
          </span>
          {faq.q}
        </span>
        <span
          style={{
            fontSize: '22px',
            color: PURPLE,
            fontWeight: '400',
            lineHeight: '1',
            flexShrink: 0,
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
          }}
        >
          +
        </span>
      </button>

      <div
        style={{
          maxHeight: open ? '300px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.35s ease',
        }}
      >
        <p
          style={{
            margin: 0,
            padding: '0 24px 20px 62px',
            fontSize: '14px',
            color: '#555',
            lineHeight: '1.75',
          }}
        >
          {faq.a}
        </p>
      </div>
    </div>
  );
};

const FaqSection = () => {
  return (
    <section
      id="faqs"
      style={{
        backgroundColor: CREAM,
        padding: '80px 24px',
      }}
    >
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
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
              marginBottom: '18px',
            }}
          >
            FAQs
          </span>
          <h2
            style={{
              fontSize: 'clamp(26px, 4vw, 40px)',
              fontWeight: '800',
              color: '#1a1a1a',
              margin: '0 0 12px',
            }}
          >
            Frequently Asked <span style={{ color: PURPLE }}>Questions</span>
          </h2>
          <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
            Everything you need to know about bidding, listings, and payments on DealsKB.
          </p>
        </div>

        {/* Accordion */}
        <div>
          {faqs.map((faq, i) => (
            <FaqItem key={i} faq={faq} index={i} />
          ))}
        </div>

        {/* Footer note */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '36px',
            fontSize: '14px',
            color: '#888',
          }}
        >
          Still have questions?{' '}
          <a
            href="#contact"
            style={{ color: PURPLE, fontWeight: '600', textDecoration: 'none' }}
          >
            Contact our support team →
          </a>
        </p>
      </div>
    </section>
  );
};

export default FaqSection;
