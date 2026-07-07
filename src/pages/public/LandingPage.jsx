import React from 'react';
import HeroSection from "../../components/landing/HeroSection";
import CategorySection from "../../components/landing/CategorySection";
import LiveAuctionSection from "../../components/landing/LiveAuctionSection";
import HowItWorksSection from "../../components/landing/HowItWorksSection";
import AboutSection from "../../components/landing/AboutSection";
import AppComingSoonSection from "../../components/landing/AppComingSoonSection";
import NewsletterSection from "../../components/landing/NewsletterSection";
import Footer from "../../components/common/Footer";
import "../../styles/landing.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <HeroSection />
      <CategorySection />
      <LiveAuctionSection />
      <HowItWorksSection />
      <AboutSection />
      <AppComingSoonSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
