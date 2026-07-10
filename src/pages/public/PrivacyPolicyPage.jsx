import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import Footer from '../../components/common/Footer';
import logoImg from '../../assets/logo.png';
import '../../styles/landing.css';

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
        <Shield size={40} style={{ color: '#B2772D' }} />
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
      <P>Welcome to DealsKB ("we", "our", "us"). DealsKB is operated by Caryanamindia Pvt Ltd. DealsKB is a subscription-based online product listing and product discovery marketplace for Cars, Bikes, Mobiles, and Laptops.</P>
      <P>This Privacy Policy explains how we collect, use, store, share, and protect your personal information when you access or use our platform.</P>
      <P>DealsKB is not a gambling, betting, wagering, lottery, casino, prize-based, or chance-based platform. Any product offer, interest request, price discussion, or negotiation feature available on DealsKB is used only for genuine product sale and purchase communication between users.</P>
    </Section>

    <Section title="2. Information We Collect">
      <P>We collect the following types of information:</P>
      <Ul items={[
        'Registration details: Name, email address, mobile number, password, account role such as Buyer, Seller, or Dealer, and other account-related details.',
        'Product interest and offer activity: Products you view, save, show interest in, send price offers for, negotiate on, or interact with through the platform.',
        'Subscription and platform access details: Subscription plan details, listing access, platform access status, payment references, and service activation details.',
        'Listing information: Product details, photos, videos, ownership-related documents, condition details, pricing information, and other information uploaded by Sellers or Dealers.',
        'Payment data: Transaction IDs, order references, payment status, invoice details, and payment confirmation details processed through Razorpay or other approved payment partners. We do not store card numbers, CVV, UPI PIN, net banking passwords, or other sensitive payment credentials.',
        'Device and usage data: IP address, browser type, device information, operating system, pages visited, session activity, and platform usage details for security, analytics, and service improvement.',
        'Communication data: Messages, enquiries, interest requests, offer-related discussions, and communication exchanged between buyers, sellers, dealers, and our support or admin team.',
      ]} />
    </Section>

    <Section title="3. How We Use Your Information">
      <P>We use collected information to:</P>
      <Ul items={[
        'Create and manage your DealsKB account.',
        'Provide access to product listing, product discovery, subscription, and marketplace features.',
        'Process subscription fees, listing fees, platform access charges, and other service-related payments.',
        'Activate seller, buyer, or dealer subscription services.',
        'Verify seller and dealer listings submitted for admin approval.',
        'Review product details, uploaded photos, videos, and documents for platform safety and authenticity.',
        'Facilitate communication between interested buyers, sellers, and dealers.',
        'Send notifications about account status, product interest, price offers, listing status, payment status, subscription status, and platform updates.',
        'Detect fraud, fake listings, misleading product information, suspicious activity, misuse of the platform, and policy violations.',
        'Improve platform performance, user experience, security, and new features.',
        'Comply with legal, regulatory, accounting, tax, and compliance requirements.',
      ]} />
    </Section>

    <Section title="4. Sharing Your Information">
      <P>We do not sell your personal data.</P>
      <P>We may share limited information with:</P>
      <Ul items={[
        'Razorpay or payment partners: For secure payment processing, payment confirmation, refunds, and transaction verification.',
        'Admin and support team: For listing verification, account support, dispute handling, fraud prevention, document review, and service management.',
        'Interested buyer, seller, or dealer: Limited contact or product-related information may be shared when required to enable genuine product sale or purchase communication.',
        'Service providers: Trusted technology, hosting, analytics, communication, storage, and support service providers who help us operate the platform.',
        'Legal authorities: When required by applicable law, court order, government request, legal process, or to protect our rights, users, or platform security.',
      ]} />
    </Section>

    <Section title="5. Product Interest, Price Offer, and Listing Data">
      <P>DealsKB stores product interest details, price offer history, listing activity, subscription access history, and communication records for transparency, safety, fraud prevention, and dispute resolution.</P>
      <P>Any price offer, interest request, or product-related communication made on the platform is only for genuine product discovery, price discussion, and sale or purchase communication. It does not involve gambling, betting, wagering, lottery, prize money, or any chance-based activity.</P>
      <P>Certain product listing details may be visible to other users depending on platform functionality. However, sensitive personal information is shared only as required for genuine platform use, legal compliance, or dispute resolution.</P>
    </Section>

    <Section title="6. Data Security">
      <P>We implement reasonable technical and organizational security measures to protect your personal information.</P>
      <P>These may include:</P>
      <Ul items={[
        'SSL encryption',
        'Secure database storage',
        'Password hashing',
        'Access controls',
        'Authentication mechanisms',
        'Payment processing through secure payment partners',
        'Monitoring for suspicious or unauthorized activity',
      ]} />
      <P>Passwords are never stored in plain text. Payment information is processed securely by Razorpay or other approved payment partners. DealsKB does not store sensitive card details, CVV, UPI PIN, or banking passwords.</P>
      <P>However, no online platform can guarantee complete security. Users are responsible for keeping their login credentials confidential and must immediately notify us of any unauthorized account activity.</P>
    </Section>

    <Section title="7. Data Retention">
      <P>We retain your account data for as long as your account remains active or as required to provide our services.</P>
      <P>Product listing records, subscription records, payment references, communication records, and transaction-related data may be retained for legal, accounting, tax, fraud prevention, dispute resolution, and compliance purposes.</P>
      <P>You may request account deletion by contacting us at support@dealskb.com. After account deletion, we may retain certain information where required by applicable law, legitimate business purposes, dispute resolution, fraud prevention, or regulatory compliance.</P>
    </Section>

    <Section title="8. Your Rights">
      <P>Subject to applicable law, you may have the right to:</P>
      <Ul items={[
        'Access and review your personal data.',
        'Request correction of inaccurate or incomplete information.',
        'Request deletion of your account and associated personal data.',
        'Withdraw consent where processing is based on consent.',
        'Opt out of marketing communications.',
        'Request information about how your data is used.',
        'Raise concerns or complaints regarding privacy or data handling.',
      ]} />
      <P>To exercise these rights, you may contact us at support@dealskb.com.</P>
    </Section>

    <Section title="9. Cookies and Similar Technologies">
      <P>DealsKB may use session-based storage, local storage, and minimal cookies for authentication, security, account login, user preferences, and platform functionality.</P>
      <P>We may also use basic analytics tools to understand platform performance and improve user experience.</P>
      <P>We do not use third-party advertising cookies for targeted advertising without proper user consent where required by law.</P>
    </Section>

    <Section title="10. No Gambling, Betting, or Chance-Based Activity">
      <P>DealsKB is a product listing and product discovery marketplace. DealsKB does not operate any gambling, betting, wagering, lottery, casino, prize-based, or chance-based activity.</P>
      <P>Any product offer, interest request, price discussion, or negotiation feature available on DealsKB is used only for genuine product sale and purchase communication between buyers, sellers, and dealers.</P>
      <P>Platform charges, subscription fees, listing fees, or access fees are collected only for providing access to DealsKB services and are not connected with gambling, betting, prize money, lottery, or chance-based activity.</P>
    </Section>

    <Section title="11. Children&apos;s Privacy">
      <P>DealsKB is intended for users who are legally capable of entering into binding agreements under applicable law. Users below the legally permitted age should not use the platform without appropriate parental or legal guardian consent.</P>
      <P>We do not knowingly collect personal information from children where prohibited by law.</P>
    </Section>

    <Section title="12. Updates to This Privacy Policy">
      <P>We may update this Privacy Policy from time to time to reflect changes in our platform, services, legal requirements, or business practices.</P>
      <P>Updated versions will be posted on the platform with the revised effective date. Continued use of DealsKB after updates means you accept the revised Privacy Policy.</P>
    </Section>

    <Section title="13. Contact">
      <P>For privacy-related queries, data requests, or complaints, contact us at:</P>
      <P><strong>Email:</strong> support@dealskb.com</P>
      <P><strong>Company:</strong> Caryanamindia Pvt Ltd</P>
      <P><strong>Address:</strong> Pune, Maharashtra, India</P>
    </Section>
  </LegalLayout>
);

export default PrivacyPolicyPage;
