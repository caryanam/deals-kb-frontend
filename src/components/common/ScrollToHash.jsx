import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToHash = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    } else {
      const resetScroll = () => {
        window.scrollTo(0, 0);
        if (document.documentElement) {
          document.documentElement.scrollTop = 0;
        }
        if (document.body) {
          document.body.scrollTop = 0;
        }
        const scrollContainers = document.querySelectorAll('.dashboard-scroll-page, .landing-page, [style*="overflow-y: auto"], [style*="overflow-y: scroll"]');
        scrollContainers.forEach((el) => {
          el.scrollTop = 0;
        });
      };

      resetScroll();
      setTimeout(resetScroll, 50);
      setTimeout(resetScroll, 150);
      setTimeout(resetScroll, 300);
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToHash;
