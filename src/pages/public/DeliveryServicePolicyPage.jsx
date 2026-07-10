import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
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
        <FileText size={40} style={{ color: '#B2772D' }} />
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

export const DeliveryServicePolicyPage = () => (
  <LegalLayout title="Delivery Service Policy" lastUpdated="July 2026">
    <Section title="1. Platform Role">
      <P>DealsKB is an online marketplace platform that helps buyers, sellers, and dealers connect for genuine product sale and purchase. DealsKB does not provide physical delivery, courier services, transportation, warehousing, or logistics support unless expressly stated otherwise in writing.</P>
    </Section>

    <Section title="2. Delivery Responsibility">
      <Ul items={[
        'Delivery, pickup, transportation, and handover arrangements are the sole responsibility of the buyer and seller.',
        'Users must independently agree on delivery timelines, inspection steps, ownership transfer formalities, and related terms.',
        'DealsKB is not responsible for delay, non-delivery, shipping issues, damage in transit, or post-handover disputes.',
      ]} />
    </Section>

    <Section title="3. Verification Before Handover">
      <P>Users are responsible for verifying product condition, ownership, supporting documents, payment terms, and handover arrangements before completing a transaction. DealsKB only provides a technology platform and does not become a party to the final transaction.</P>
    </Section>

    <Section title="4. Contact">
      <P>For policy-related queries, contact <strong>support@dealskb.com</strong> | Caryanamindia Pvt Ltd, Pune, Maharashtra, India.</P>
    </Section>
  </LegalLayout>
);

export default DeliveryServicePolicyPage;
