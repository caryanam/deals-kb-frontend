import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import Footer from '../../components/common/Footer';
import logoImg from '../../assets/logo.png';

const LegalLayout = ({ title, lastUpdated, children }) => (
  <div style={{ minHeight: '100vh', background: '#FAF6EA', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
    <div style={{ background: '#090d16', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <img src={logoImg} alt="DealsKB Logo" style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#fff' }}>
          Deals<span style={{ color: '#c084fc' }}>KB</span>
        </span>
      </Link>
    </div>
    <div style={{ background: 'linear-gradient(135deg, #3d0a42 0%, #1F1A1D 100%)', padding: '3.5rem 2rem', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <RefreshCw size={40} style={{ color: '#B2772D' }} />
      </div>
      <h1 style={{ color: '#fff', fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 800, margin: 0 }}>{title}</h1>
      <p style={{ color: '#8B8278', marginTop: '0.5rem', fontSize: '0.9rem' }}>Last updated: {lastUpdated}</p>
    </div>
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem 5rem 2rem', flex: 1, width: '100%' }}>
      {children}
    </div>
    <Footer />
  </div>
);

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '2.5rem' }}>
    <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#1F1A1D', borderLeft: '4px solid #6B1B71', paddingLeft: '0.75rem', marginBottom: '1rem' }}>
      {title}
    </h2>
    <div style={{ color: '#8B8278', lineHeight: 1.75, fontSize: '0.92rem' }}>{children}</div>
  </div>
);

const P = ({ children }) => <p style={{ marginBottom: '0.75rem' }}>{children}</p>;
const Ul = ({ items }) => (
  <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0 0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
    {items.map((item, i) => <li key={i}>{item}</li>)}
  </ul>
);

const InfoBox = ({ children }) => (
  <div style={{ background: '#F5ECDD', border: '1px solid #D8CFC1', borderLeft: '4px solid #B2772D', borderRadius: '0.5rem', padding: '1rem 1.25rem', marginBottom: '1rem', color: '#8B8278', fontSize: '0.9rem', lineHeight: 1.65 }}>
    {children}
  </div>
);

export const RefundPolicyPage = () => (
  <LegalLayout title="Refund Policy" lastUpdated="July 2026">
    <InfoBox>
      Please read this Refund Policy carefully before making any purchase on DealsKB. By using our platform, you agree to the refund terms outlined below for bidding passes, listing fees, and dealer plans.
    </InfoBox>

    <Section title="1. Overview">
      <P>DealsKB (operated by Caryanamindia Pvt Ltd) offers three types of paid features: Buyer Bidding Passes, Seller Listing Fees, and Dealer Monthly Plans. Each has a distinct refund policy as described below.</P>
    </Section>

    <Section title="2. Buyer Bidding Passes — Refund Policy">
      <P>Bidding passes grant 24-hour access to live auctions for a specific category (Cars, Bikes, Mobiles, or Laptops). Pass pricing:</P>
      <Ul items={[
        'Mobile Pass: ₹12.98 / 24 hours (incl. 18% GST)',
        'Laptop Pass: ₹24.78 / 24 hours (incl. 18% GST)',
        'Bike Pass: ₹60.18 / 24 hours (incl. 18% GST)',
        'Car Pass: ₹119.18 / 24 hours (incl. 18% GST)',
      ]} />
      <P><strong>Non-refundable after activation:</strong> Once a bidding pass is activated and auction access is granted, no refund will be issued, regardless of whether bids were placed or the auction was won.</P>
      {/* <P><strong>Eligible for refund (credit):</strong></P>
      <Ul items={[
        'If the auction you purchased the pass for is cancelled by the seller before auction start, your pass amount will be credited to your DealsKB wallet within 5–7 business days',
        'If a technical error on our platform prevents you from accessing an active auction despite a valid pass, contact support within 24 hours for review',
        'If DealsKB cancels an auction due to platform issues or admin action, affected pass holders will receive a full credit',
      ]} /> */}
    </Section>

    <Section title="3. Seller Listing Fees — Refund Policy">
      <P>Sellers pay a one-time listing fee per product. Fee structure:</P>
      <Ul items={[
        'Mobile Listing: ₹11.80 (incl. 18% GST)',
        'Laptop Listing: ₹23.60 (incl. 18% GST)',
        'Bike Listing: ₹59 (incl. 18% GST)',
        'Car Listing: ₹118 (incl. 18% GST)',
      ]} />
      <P><strong>Non-refundable after admin review begins:</strong> Once your listing has been submitted and the admin review process has started, the listing fee is non-refundable.</P>
      {/* <P><strong>Eligible for refund:</strong></P>
      <Ul items={[
        'If a listing is rejected by admin due to a platform-side error (not due to inaccurate product information), a full refund will be processed',
        'If you cancel a listing within 1 hour of submission and before admin review starts, a refund may be requested',
        'Refunds for valid cases are processed within 7–10 business days to the original payment method',
      ]} /> */}
      <P><strong>Not eligible for refund:</strong></P>
      <Ul items={[
        'Listings rejected due to inaccurate or fraudulent product information, missing documents, or policy violations',
        'Listings that went live and received bids, even if the seller wishes to withdraw',
      ]} />
    </Section>

    <Section title="4. Dealer Monthly Plan — Refund Policy">
      <P>Dealers subscribe to a monthly plan at ₹500/month for unlimited product listings.</P>
      <P><strong>Non-refundable:</strong> Monthly dealer plans are non-refundable once the billing period has started. You may cancel your plan at any time; the plan remains active until the end of the current billing period.</P>
      {/* <P><strong>Eligible for refund:</strong></P>
      <Ul items={[
        'If you were charged erroneously (e.g., double charge) due to a payment gateway error, contact support within 3 business days for resolution',
        'If DealsKB discontinues the Dealer Plan service with less than 7 days notice, a pro-rated refund will be issued',
      ]} /> */}
    </Section>

    <Section title="5. Delivery & Handover Policy">
      <P>DealsKB is a marketplace platform and does not handle physical delivery of products (Cars, Bikes, Mobiles, or Laptops). The buyer and seller are responsible for agreeing on and completing the handover directly after auction completion.</P>
      <P>DealsKB facilitates communication between the winning buyer and the seller. DealsKB is not liable for delays, damage during handover, or failure to deliver products. All disputes regarding product condition or delivery should be raised with the seller directly, with DealsKB available for mediation support.</P>
    </Section>

    {/* <Section title="6. Refund Process">
      <P>To request a refund for an eligible case:</P>
      <Ul items={[
        'Email support@dealskb.com with subject line: "Refund Request – [Order ID]"',
        'Include your registered email, transaction ID, and reason for refund request',
        'Our team will review within 3 business days and respond with a decision',
        'Approved refunds are processed to the original payment method within 7–10 business days',
      ]} />
    </Section> */}

    <Section title="6. Contact">
      <P>For refund queries: <strong>support@dealskb.com</strong> | Caryanamindia Pvt Ltd, Pune, Maharashtra, India | Phone: +91 99232 24600</P>
    </Section>
  </LegalLayout>
);

export default RefundPolicyPage;
