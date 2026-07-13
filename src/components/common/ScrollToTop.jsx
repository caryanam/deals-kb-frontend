import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const QUICK_LINK_HASHES = [
  '#home',
  '#products',
  '#our-products',
  '#marketplace',
  '#how-it-works',
  '#about-us',
  '#contact',
];

const ScrollToTop = () => {
  const { pathname, hash, search } = useLocation();

  useEffect(() => {
    const isLandingPageQuickLink =
      pathname === '/' &&
      QUICK_LINK_HASHES.includes(hash);

    if (isLandingPageQuickLink) {
      return;
    }

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });

      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

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
            left: 0,
            behavior: 'auto',
          });
          container.scrollTop = 0;
        }
      });
    };

    requestAnimationFrame(() => {
      scrollToTop();
      setTimeout(scrollToTop, 20);
      setTimeout(scrollToTop, 50);
      setTimeout(scrollToTop, 150);
      setTimeout(scrollToTop, 300);
    });
  }, [pathname, hash, search]);

  return null;
};

export default ScrollToTop;
