/**
 * Google Analytics Component
 * Loads Google Analytics tracking script
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { debug } from '../shared/utils/debug';

export default function GoogleAnalytics() {
  const location = useLocation();

  // Get GA measurement ID from environment variable
  const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

  useEffect(() => {
    // Only load GA if measurement ID is configured
    if (!GA_MEASUREMENT_ID) {
      debug.log('GoogleAnalytics', 'No measurement ID configured');
      return;
    }

    // Load gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);

    return () => {
      // Cleanup script on unmount
      const scripts = document.querySelectorAll(`script[src*="googletagmanager"]`);
      scripts.forEach(s => s.remove());
    };
  }, [GA_MEASUREMENT_ID]);

  // Track page views on route change
  useEffect(() => {
    if (window.gtag && GA_MEASUREMENT_ID) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location, GA_MEASUREMENT_ID]);

  return null; // This component doesn't render anything
}
