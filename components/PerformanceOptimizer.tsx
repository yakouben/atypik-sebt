"use client";

import { useEffect, useRef } from 'react';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

export default function PerformanceOptimizer({ children }: PerformanceOptimizerProps) {
  const isOptimized = useRef(false);

  useEffect(() => {
    if (isOptimized.current) return;
    isOptimized.current = true;

    // Optimize JavaScript execution
    const optimizeJavaScript = () => {
      // Defer non-critical JavaScript
      const scripts = document.querySelectorAll('script[data-defer]');
      scripts.forEach((script) => {
        if (script instanceof HTMLScriptElement) {
          script.defer = true;
        }
      });

      // Optimize event listeners
      const optimizeEventListeners = () => {
        // Use passive event listeners for better performance
        const addPassiveEventListener = (element: Element, event: string, handler: EventListener) => {
          element.addEventListener(event, handler, { passive: true });
        };

        // Optimize scroll events
        const scrollElements = document.querySelectorAll('[data-scroll-optimize]');
        scrollElements.forEach((element) => {
          let ticking = false;
          const handleScroll = () => {
            if (!ticking) {
              requestAnimationFrame(() => {
                // Handle scroll logic here
                ticking = false;
              });
              ticking = true;
            }
          };
          addPassiveEventListener(element, 'scroll', handleScroll);
        });
      };

      // Optimize images
      const optimizeImages = () => {
        const images = document.querySelectorAll('img[data-lazy]');
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              img.src = img.dataset.src || '';
              img.classList.remove('lazy');
              imageObserver.unobserve(img);
            }
          });
        });

        images.forEach((img) => imageObserver.observe(img));
      };

      // Optimize fonts
      const optimizeFonts = () => {
        if ('fonts' in document) {
          // Preload critical fonts
          const criticalFonts = [
            { family: 'Inter', weight: '400', style: 'normal' },
            { family: 'Inter', weight: '600', style: 'normal' },
          ];

          criticalFonts.forEach((font) => {
            (document as any).fonts.load(`${font.weight} 1em ${font.family}`).then(() => {
              document.documentElement.classList.add('fonts-loaded');
            });
          });
        }
      };

      // Run optimizations
      optimizeEventListeners();
      optimizeImages();
      optimizeFonts();
    };

    // Run optimization after a short delay to avoid blocking initial render
    const timeoutId = setTimeout(optimizeJavaScript, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Optimize resource loading
  useEffect(() => {
    const preloadCriticalResources = () => {
      // Preload critical CSS
      const criticalCSS = document.createElement('link');
      criticalCSS.rel = 'preload';
      criticalCSS.as = 'style';
      criticalCSS.href = '/globals.css';
      document.head.appendChild(criticalCSS);

      // Preload critical JavaScript
      const criticalJS = document.createElement('link');
      criticalJS.rel = 'preload';
      criticalJS.as = 'script';
      criticalJS.href = '/_next/static/chunks/main.js';
      document.head.appendChild(criticalJS);
    };

    // Only preload in production
    if (process.env.NODE_ENV === 'production') {
      preloadCriticalResources();
    }
  }, []);

  return <>{children}</>;
} 