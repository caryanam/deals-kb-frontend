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
      <P>By accessing or using DealsKB (operated by Caryanamindia Pvt Ltd), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our platform. These terms apply to all users — Buyers, Sellers, and Dealers — participating in auctions for Cars, Bikes, Mobiles, and Laptops.</P>
    </Section>

    <Section title="2. Platform Overview">
      <P>DealsKB is an online auction marketplace. Sellers and Dealers list products which are verified by our Admin team. Buyers activate category-specific bidding passes to participate in live auctions. The highest bid at auction close wins the product.</P>
    </Section>

    <Section title="3. User Eligibility and Registration">
      <Ul items={[
        'You must be at least 18 years of age to register',
        'You must provide accurate registration information (name, mobile, email)',
        'One account per user — multiple accounts are not permitted',
        'Sellers and Dealers must provide valid business or identity documents when required',
        'DealsKB reserves the right to suspend or terminate accounts for policy violations',
      ]} />
    </Section>

    <Section title="4. Auction Rules">
      <P>All auctions on DealsKB operate under the following rules:</P>
      <Ul items={[
        'Buyers must activate a valid bidding pass for the relevant category before entering an auction',
        'Bids are binding — once placed, a bid cannot be withdrawn',
        'The highest bid at auction end determines the winner',
        'Shill bidding (fake bids by sellers to inflate prices) is strictly prohibited',
        'DealsKB Admin monitors all auctions for suspicious activity',
        'Auction times are final; extensions may occur only in the event of a last-minute bid as per platform rules',
        'DealsKB reserves the right to cancel any auction if fraud or policy violations are detected',
      ]} />
    </Section>

    <Section title="5. Buyer Rules">
      <Ul items={[
        'Bidding passes are category-specific and valid for 24 hours from activation',
        'Passes for Cars (₹499), Bikes (₹111), Laptops (₹51), and Mobiles (₹21) are non-transferable',
        'Winning a bid creates an obligation to complete the transaction with the seller',
        'Failure to complete a transaction after winning may result in account suspension',
        'Buyers are responsible for verifying product details before bidding',
      ]} />
    </Section>

    <Section title="6. Seller and Dealer Rules">
      <Ul items={[
        'Sellers must pay a listing fee per product: Cars (₹399), Bikes (₹99), Laptops (₹51), Mobiles (₹21)',
        'Dealers subscribe to a monthly plan of ₹500 for unlimited listings',
        'All product information, photos, and documents must be accurate and authentic',
        'Sellers must not withdraw a product after auction start without valid reason',
        'Sellers must complete the handover to the winning buyer within the agreed timeframe',
        'Fraudulent listings will result in permanent account ban and potential legal action',
      ]} />
    </Section>

    <Section title="7. Admin Verification">
      <P>All product listings undergo admin review before going live. Admin may request additional documents. DealsKB does not guarantee approval of any listing. Approved listings reflect verification of provided documents only — buyers are encouraged to conduct independent due diligence.</P>
    </Section>

    <Section title="8. Payments">
      <P>All payments are processed securely via Razorpay. DealsKB does not store payment card information. Transaction records are maintained for audit purposes. Disputes related to payments must be raised within 7 days of the transaction.</P>
    </Section>

    <Section title="9. Prohibited Activities">
      <Ul items={[
        'Shill bidding or coordinating bids to manipulate auction outcomes',
        'Listing counterfeit, stolen, or misrepresented products',
        'Creating multiple buyer accounts to gain unfair bidding advantages',
        'Harassing other users via the platform messaging system',
        'Circumventing platform fees by conducting transactions off-platform',
        'Attempting to hack, scrape, or disrupt platform services',
      ]} />
    </Section>

    <Section title="10. Limitation of Liability">
      <P>DealsKB acts as a marketplace facilitator. We are not responsible for the condition, authenticity, or delivery of products. Disputes between buyers and sellers should be resolved directly; DealsKB may assist in mediation but bears no financial liability for transaction outcomes.</P>
    </Section>

    <Section title="11. Changes to Terms">
      <P>DealsKB reserves the right to update these Terms at any time. Continued use of the platform after changes constitutes acceptance. We will notify registered users of material changes via email.</P>
    </Section>

    <Section title="12. Governing Law">
      <P>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Pune, Maharashtra.</P>
    </Section>

    <Section title="13. Contact">
      <P>For queries about these Terms, contact: <strong>support@dealskb.com</strong> | Caryanamindia Pvt Ltd, Pune, Maharashtra, India.</P>
    </Section>
  </LegalLayout>
);

export default TermsAndConditionsPage;
