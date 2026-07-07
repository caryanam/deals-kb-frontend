import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import Footer from '../../components/common/Footer';
import logoImg from '../../assets/logo.png';
import '../../styles/landing.css';

const LegalLayout = ({ title, lastUpdated, children }) => (
  <div style={{ minHeight: '100vh', background: '#FAF6EA', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
    {/* Navbar strip */}
    <div style={{ background: '#090d16', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <img src={logoImg} alt="DealsKB Logo" style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#fff' }}>
          Deals<span style={{ color: '#c084fc' }}>KB</span>
        </span>
      </Link>
    </div>

    {/* Hero band */}
    <div style={{ background: 'linear-gradient(135deg, #3d0a42 0%, #1F1A1D 100%)', padding: '3.5rem 2rem', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <Shield size={40} style={{ color: '#B2772D' }} />
      </div>
      <h1 style={{ color: '#fff', fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 800, margin: 0 }}>{title}</h1>
      <p style={{ color: '#8B8278', marginTop: '0.5rem', fontSize: '0.9rem' }}>Last updated: {lastUpdated}</p>
    </div>

    {/* Content */}
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem 5rem 2rem', flex: 1, width: '100%' }}>
      {children}
    </div>

    {/* Standard Footer */}
    <Footer />
  </div>
);

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '2.5rem' }}>
    <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#1F1A1D', borderLeft: '4px solid #6B1B71', paddingLeft: '0.75rem', marginBottom: '1rem' }}>
      {title}
    </h2>
    <div style={{ color: '#8B8278', lineHeight: 1.75, fontSize: '0.92rem' }}>
      {children}
    </div>
  </div>
);

const P = ({ children }) => <p style={{ marginBottom: '0.75rem' }}>{children}</p>;
const Ul = ({ items }) => (
  <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0 0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
    {items.map((item, i) => <li key={i}>{item}</li>)}
  </ul>
);

export const PrivacyPolicyPage = () => (
  <LegalLayout title="Privacy Policy" lastUpdated="July 2026">
    <Section title="1. Introduction">
      <P>Welcome to DealsKB ("we", "our", "us"). DealsKB is operated by Caryanamindia Pvt Ltd, an online auction marketplace for Cars, Bikes, Mobiles, and Laptops. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform.</P>
      <P>By registering or using DealsKB, you agree to the collection and use of information as described in this policy.</P>
    </Section>

    <Section title="2. Information We Collect">
      <P>We collect the following types of information:</P>
      <Ul items={[
        'Registration details: Name, email address, mobile number, and role (Buyer, Seller, or Dealer)',
        'Bidding activity: Products you bid on, bidding pass purchases, and auction participation history',
        'Listing information: Product details, photos, and documents uploaded by Sellers and Dealers',
        'Payment data: Transaction IDs, order references, and payment status via Razorpay (we do not store card details)',
        'Device and usage data: IP address, browser type, and pages visited for analytics purposes',
        'Communication data: Messages exchanged between buyers and sellers on the platform',
      ]} />
    </Section>

    <Section title="3. How We Use Your Information">
      <P>We use collected information to:</P>
      <Ul items={[
        'Create and manage your DealsKB account',
        'Process bidding pass activations and auction participation',
        'Verify seller and dealer listings submitted for admin approval',
        'Process and confirm payments via Razorpay',
        'Facilitate communication between winning buyers and sellers',
        'Send notifications about auction results, bid status, and platform updates',
        'Detect fraud, shill bidding, and policy violations',
        'Improve our platform and develop new features',
      ]} />
    </Section>

    <Section title="4. Sharing Your Information">
      <P>We do not sell your personal data. We may share information with:</P>
      <Ul items={[
        'Razorpay – for secure payment processing',
        'Admin team – for listing verification and dispute resolution',
        'Winning buyer and seller – limited contact information shared after auction completion',
        'Legal authorities – when required by applicable law',
      ]} />
    </Section>

    <Section title="5. Bidding and Auction Data">
      <P>Your bid amounts, bidding pass history, and auction participation records are stored for transparency and dispute resolution purposes. Bid data for a specific auction may be visible to all participants in that auction room.</P>
    </Section>

    <Section title="6. Data Security">
      <P>We implement industry-standard security measures including SSL encryption and secure database storage. Passwords are hashed and never stored in plain text. Payment data is handled entirely by Razorpay under PCI DSS compliance.</P>
    </Section>

    <Section title="7. Data Retention">
      <P>We retain your account data for as long as your account is active. Completed auction records are retained for 3 years for compliance purposes. You may request account deletion by contacting support@dealskb.com.</P>
    </Section>

    <Section title="8. Your Rights">
      <P>You have the right to:</P>
      <Ul items={[
        'Access and review your personal data',
        'Request correction of inaccurate information',
        'Request deletion of your account and associated data',
        'Opt out of marketing communications',
        'Lodge a complaint with the relevant data protection authority',
      ]} />
    </Section>

    <Section title="9. Cookies">
      <P>DealsKB uses session-based storage and minimal cookies for authentication and functionality. We do not use third-party advertising cookies.</P>
    </Section>

    <Section title="10. Contact">
      <P>For privacy-related queries, contact us at: <strong>support@dealskb.com</strong> or write to Caryanamindia Pvt Ltd, Pune, Maharashtra, India.</P>
    </Section>
  </LegalLayout>
);

export default PrivacyPolicyPage;
