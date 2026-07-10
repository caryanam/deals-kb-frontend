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
      Please read this Refund Policy carefully before making any payment on DealsKB. By using our platform, you agree that subscription fees, listing fees, platform access charges, and related service charges are non-refundable once paid, except where required by applicable law.
    </InfoBox>

    <Section title="1. Platform Service Charges">
      <P>DealsKB may charge subscription fees, listing fees, platform access charges, or service fees for providing access to platform features. These charges are collected only for the use of DealsKB services and are not related to gambling, betting, wagering, lottery, prize money, or chance-based activity.</P>
      <P>Payment of any subscription or access fee only enables the user to use relevant platform services. It does not guarantee that a listed product will be sold, that a buyer or seller will complete a transaction, or that a user will receive confirmed offers or successful deal closure.</P>
    </Section>

    <Section title="2. Strict No Refund Policy">
      <P>All subscription fees, listing fees, platform access charges, and service fees paid to DealsKB are strictly non-refundable. Once payment is made, no cancellation, reversal, adjustment, or refund will be provided by DealsKB for activated or non-activated services.</P>
      <P>DealsKB does not guarantee that a listed product will be sold, that a buyer or seller will complete a transaction, that a user will receive responses or offers, or that any platform use will result in a successful deal. Accordingly, no refund will be given on the ground that a product was not sold, a deal was not completed, a user changed their mind, or the platform did not meet business expectations.</P>
    </Section>

    <Section title="3. No Refund Scenarios">
      <Ul items={[
        'No refund if a product is not sold',
        'No refund if a buyer or seller does not complete a transaction',
        'No refund if the user changes their mind after making payment',
        'No refund if the user does not use the subscription, listing, or platform access after payment',
        'No refund for dissatisfaction with response volume, lead quality, offer quality, or transaction outcome',
      ]} />
    </Section>

    <Section title="4. Legal Exception">
      <P>If any refund is required under applicable law or by a binding order of a competent authority, DealsKB will process such refund strictly to the extent legally required and to the original payment method, subject to verification and applicable processing timelines.</P>
    </Section>

    <Section title="5. No Gambling, Betting, Wagering, or Chance-Based Activity">
      <P>DealsKB is not a gambling, betting, wagering, lottery, casino, prize-based, or chance-based platform. DealsKB is a subscription-based online marketplace that allows users to list, discover, buy, and sell genuine products.</P>
      <P>Any price offer, interest request, or negotiation feature available on DealsKB is used only for product discovery, communication, and price discussion between buyers and sellers. It does not involve betting, wagering, prize money, lottery, or winning based on chance.</P>
    </Section>

    <Section title="6. User Responsibility">
      <P>Users are solely responsible for verifying product details, ownership, documents, condition, price, and transaction terms before completing any deal. DealsKB only provides a technology platform and does not become a party to the final sale transaction between buyer and seller.</P>
    </Section>

    <Section title="7. Contact">
      <P>For questions regarding this policy, contact <strong>support@dealskb.com</strong> with your registered details and payment reference. Caryanamindia Pvt Ltd, Pune, Maharashtra, India.</P>
    </Section>
  </LegalLayout>
);

export default RefundPolicyPage;
