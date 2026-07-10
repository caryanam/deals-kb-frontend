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

export const TermsAndConditionsPage = () => (
  <LegalLayout title="Terms & Conditions" lastUpdated="July 2026">
    <Section title="1. Acceptance of Terms">
      <P>By accessing or using DealsKB (operated by Caryanamindia Pvt Ltd), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the platform. These terms apply to all users, including Buyers, Sellers, and Dealers using DealsKB for supported product categories.</P>
    </Section>

    <Section title="2. Nature of Platform">
      <P>DealsKB is a subscription-based online marketplace that enables users to list, discover, buy, and sell genuine products. Users may browse products, show interest, submit price offers, receive responses, negotiate, and connect with buyers or sellers for lawful product transactions.</P>
      <P>Any price offer, interest request, or negotiation feature available on DealsKB is only a product discovery and communication mechanism between buyers and sellers. It does not involve gambling, betting, wagering, lottery, casino activity, prize money, or any chance-based activity.</P>
    </Section>

    <Section title="3. User Eligibility and Registration">
      <Ul items={[
        'You must be at least 18 years of age to register',
        'You must provide accurate registration information, including any details requested by DealsKB',
        'One account per user is generally permitted unless otherwise approved by DealsKB in writing',
        'Sellers and Dealers must provide valid business, identity, or product ownership documents when required',
        'DealsKB reserves the right to suspend or terminate accounts for policy violations',
      ]} />
    </Section>

    <Section title="4. Subscription and Platform Charges">
      <P>DealsKB may charge subscription fees, listing fees, platform access fees, or service charges for enabling users to access and use platform features. These charges are collected only for platform services and are not connected with gambling, betting, lottery, prize money, or any chance-based activity.</P>
      <P>Payment of a subscription, listing, or access fee only grants access to the relevant platform features. It does not guarantee that a product will be sold, purchased, converted into a confirmed lead, or completed as a final transaction.</P>
    </Section>

    <Section title="5. Buyer and Seller Responsibility">
      <Ul items={[
        'Sellers are responsible for the correctness of product details, ownership details, documents, condition, pricing, and legality of the listed product',
        'Buyers are responsible for independently verifying product condition, ownership, documents, pricing, and transaction terms before making any payment or confirming a purchase',
        'Users must ensure that all products listed or purchased through DealsKB are legal, genuine, and lawfully owned',
        'DealsKB only provides a technology platform and does not become a party to the final sale or purchase transaction between buyer and seller',
      ]} />
    </Section>

    <Section title="6. Seller and Dealer Rules">
      <Ul items={[
        'Sellers and Dealers must upload accurate product information, genuine photographs, and valid supporting documents where required',
        'Sellers and Dealers must respond honestly to buyer interest, price offers, and product-related queries',
        'Fraudulent listings, misleading descriptions, false ownership claims, or illegal products may result in suspension, permanent removal, and legal action',
        'DealsKB may request additional verification documents before allowing a listing to remain active on the platform',
      ]} />
    </Section>

    <Section title="7. Admin Verification">
      <P>DealsKB may review product listings and supporting documents before making them visible on the platform. DealsKB may request additional information, reject incomplete submissions, or remove listings that appear misleading, unlawful, or non-compliant. Any review performed by DealsKB is limited to platform-level checks and does not replace a buyer&apos;s or seller&apos;s own verification duties.</P>
    </Section>

    <Section title="8. Payments">
      <P>All payments on DealsKB are processed through authorized payment service providers. DealsKB does not guarantee uninterrupted payment services and does not store full payment card details. Transaction records may be maintained for compliance, reconciliation, customer support, and audit purposes.</P>
    </Section>

    <Section title="9. No Gambling, Betting, Wagering, or Chance-Based Activity">
      <P>DealsKB is not a gambling, betting, wagering, lottery, casino, prize-based, or chance-based platform. DealsKB is a subscription-based online marketplace that allows users to list, discover, buy, and sell genuine products.</P>
      <P>Any price offer, interest request, or negotiation feature available on DealsKB is used only for product discovery, communication, and price discussion between buyers and sellers. It does not involve betting, wagering, prize money, lottery, or winning based on chance.</P>
      <P>Users are strictly prohibited from using the platform for gambling, betting, fake price offers, fraudulent listings, illegal products, or any unlawful activity.</P>
    </Section>

    <Section title="10. Delivery and Final Transaction Responsibility">
      <P>DealsKB only provides a technology platform to help users discover products and connect with each other. DealsKB is not responsible for:</P>
      <Ul items={[
        'Product quality, condition, suitability, or authenticity',
        'Physical delivery, shipping, transportation, or logistics',
        'Ownership transfer formalities, registration, invoices, tax obligations, or local compliance requirements',
        'Delay, non-performance, or disputes between buyers and sellers',
        'Any loss or damage arising after users proceed with an off-platform or final transaction',
      ]} />
      <P style={{ marginTop: '8px' }}>The final transaction is solely between the buyer and the seller. Users must verify all deal terms before proceeding.</P>
    </Section>

    <Section title="11. Prohibited Activities">
      <Ul items={[
        'Gambling, betting, wagering, lottery, casino activities, or any chance-based use of the platform',
        'Fake price offers, fraudulent listings, fake identities, manipulated product information, or misleading descriptions',
        'Listing counterfeit, stolen, prohibited, or illegal products',
        'Manipulation of product offers, user communications, or platform visibility',
        'Harassment, abuse, threats, impersonation, or misuse of any messaging or contact features',
        'Attempting to scrape, hack, interfere with, or disrupt DealsKB services or infrastructure',
      ]} />
    </Section>

    <Section title="12. Disclaimer">
      <P>DealsKB does not operate any gambling, betting, wagering, lottery, casino, prize-based, or chance-based activity. All price offers, interest requests, or product-related communications made on the platform relate only to genuine products listed for sale and are used only for product discovery, communication, and price discussion between buyers and sellers.</P>
    </Section>

    <Section title="13. Limitation of Liability">
      <P>DealsKB acts only as a marketplace facilitator and technology service provider. To the fullest extent permitted by law, DealsKB shall not be liable for product defects, false representations by users, payment disputes between users, failed negotiations, delivery issues, ownership disputes, or transaction losses resulting from dealings between buyers and sellers.</P>
    </Section>

    <Section title="14. Changes to Terms">
      <P>DealsKB reserves the right to update these Terms at any time. Continued use of the platform after changes constitutes acceptance. We will notify registered users of material changes via email.</P>
    </Section>

    <Section title="15. Governing Law">
      <P>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Pune, Maharashtra.</P>
    </Section>

    <Section title="16. Contact">
      <P>For queries about these Terms, contact: <strong>support@dealskb.com</strong> | Caryanamindia Pvt Ltd, Pune, Maharashtra, India.</P>
    </Section>
  </LegalLayout>
);

export default TermsAndConditionsPage;
