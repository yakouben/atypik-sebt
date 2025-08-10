"use client";

import { useEffect } from 'react';

// Extend the Window interface to include gtag
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: any) => void;
  }
}

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    // Track Core Web Vitals
    const trackWebVitals = () => {
      // LCP (Largest Contentful Paint)
      const trackLCP = () => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            const lcp = lastEntry.startTime;
            console.log('LCP:', lcp);
            // Send to analytics service
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'LCP', {
                value: Math.round(lcp),
                event_category: 'Web Vitals',
              });
            }
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      };

      // FID (First Input Delay)
      const trackFID = () => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const fidEntry = entry as PerformanceEventTiming;
            const fid = fidEntry.processingStart - fidEntry.startTime;
            console.log('FID:', fid);
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'FID', {
                value: Math.round(fid),
                event_category: 'Web Vitals',
              });
            }
          });
        });
        observer.observe({ entryTypes: ['first-input'] });
      };

      // CLS (Cumulative Layout Shift)
      const trackCLS = () => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          console.log('CLS:', clsValue);
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'CLS', {
              value: Math.round(clsValue * 1000) / 1000,
              event_category: 'Web Vitals',
            });
          }
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      };

      // FCP (First Contentful Paint)
      const trackFCP = () => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0];
          if (firstEntry) {
            const fcp = firstEntry.startTime;
            console.log('FCP:', fcp);
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'FCP', {
                value: Math.round(fcp),
                event_category: 'Web Vitals',
              });
            }
          }
        });
        observer.observe({ entryTypes: ['first-contentful-paint'] });
      };

      trackLCP();
      trackFID();
      trackCLS();
      trackFCP();
    };

    // Track page load performance
    const trackPageLoad = () => {
      if (typeof window !== 'undefined') {
        window.addEventListener('load', () => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
            const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
            
            console.log('Page Load Time:', loadTime);
            console.log('DOM Content Loaded:', domContentLoaded);
            
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'page_load', {
                value: Math.round(loadTime),
                event_category: 'Performance',
              });
            }
          }
        });
      }
    };

    // Track resource loading
    const trackResources = () => {
      if (typeof window !== 'undefined') {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              if (resourceEntry.duration > 3000) { // Track slow resources (>3s)
                console.log('Slow resource:', resourceEntry.name, resourceEntry.duration);
              }
            }
          });
        });
        observer.observe({ entryTypes: ['resource'] });
      }
    };

    trackWebVitals();
    trackPageLoad();
    trackResources();
  }, []);

  return null;
} 