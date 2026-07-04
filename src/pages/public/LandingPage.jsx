import React from 'react';
import HeroSection from "../../components/landing/HeroSection";
import CategorySection from "../../components/landing/CategorySection";
import LiveAuctionSection from "../../components/landing/LiveAuctionSection";
import HowItWorksSection from "../../components/landing/HowItWorksSection";
import WhyChooseSection from "../../components/landing/WhyChooseSection";
import TopDealsSection from "../../components/landing/TopDealsSection";
import TestimonialSection from "../../components/landing/TestimonialSection";
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
      <WhyChooseSection />
      <TopDealsSection />
      <TestimonialSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
