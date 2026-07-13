import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      return;
    }

    const sectionId = hash.substring(1);

    requestAnimationFrame(() => {
      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  }, [hash]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1, // Trigger when 10% of the section is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-reveal-active');
          // Stop observing once animated
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('.scroll-reveal');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="landing-page">
      <HeroSection />
      
      <div className="scroll-reveal">
        <CategorySection />
      </div>
      
      <div className="scroll-reveal">
        <LiveAuctionSection />
      </div>
      
      <div className="scroll-reveal">
        <HowItWorksSection />
      </div>
      
      <div className="scroll-reveal">
        <AboutSection />
      </div>
      
      <div className="scroll-reveal">
        <AppComingSoonSection />
      </div>
      
      <div className="scroll-reveal">
        <NewsletterSection />
      </div>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
