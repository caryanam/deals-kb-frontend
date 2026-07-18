import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Check window scroll
      if (window.scrollY > 300) {
        setIsVisible(true);
        return;
      }
      
      // Check custom containers
      const customContainers = [
        document.getElementById('root'),
        document.querySelector('.app-container'),
        document.querySelector('.app'),
        document.querySelector('.landing-page'),
        document.getElementById('page-scroll-container'),
        document.querySelector('.page-scroll-container'),
        document.querySelector('.main-content'),
        document.querySelector('.dashboard-main-content'),
      ];

      for (const container of customContainers) {
        if (container && container.scrollTop > 300) {
          setIsVisible(true);
          return;
        }
      }

      setIsVisible(false);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    
    // Also listen to custom containers
    const customContainers = [
      document.getElementById('root'),
      document.querySelector('.app-container'),
      document.querySelector('.app'),
      document.querySelector('.landing-page'),
      document.getElementById('page-scroll-container'),
      document.querySelector('.page-scroll-container'),
      document.querySelector('.main-content'),
      document.querySelector('.dashboard-main-content'),
    ];

    customContainers.forEach((container) => {
      if (container) {
        container.addEventListener('scroll', toggleVisibility, { passive: true });
      }
    });

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      customContainers.forEach((container) => {
        if (container) {
          container.removeEventListener('scroll', toggleVisibility);
        }
      });
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    const customContainers = [
      document.getElementById('root'),
      document.querySelector('.app-container'),
      document.querySelector('.app'),
      document.querySelector('.landing-page'),
      document.getElementById('page-scroll-container'),
      document.querySelector('.page-scroll-container'),
      document.querySelector('.main-content'),
      document.querySelector('.dashboard-main-content'),
    ];

    customContainers.forEach((container) => {
      if (container) {
        container.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 9999,
        backgroundColor: '#6B1B71',
        color: '#ffffff',
        border: 'none',
        borderRadius: '50%',
        width: '45px',
        height: '45px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
        transition: 'all 0.3s ease',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.backgroundColor = '#501254';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.backgroundColor = '#6B1B71';
      }}
      title="Scroll to Top"
    >
      <ArrowUp size={20} />
    </button>
  );
};

export default ScrollToTopButton;
