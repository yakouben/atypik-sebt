"use client";

import { useEffect, useState } from 'react';

interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogTags: Record<string, string>;
  twitterTags: Record<string, string>;
  structuredData: any;
  canonical: string;
  robots: string;
}

export default function SEOTester() {
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSEO = () => {
      const data: SEOData = {
        title: '',
        description: '',
        keywords: [],
        ogTags: {},
        twitterTags: {},
        structuredData: null,
        canonical: '',
        robots: ''
      };

      // Check title
      const title = document.querySelector('title');
      if (title) {
        data.title = title.textContent || '';
      }

      // Check meta description
      const description = document.querySelector('meta[name="description"]');
      if (description) {
        data.description = description.getAttribute('content') || '';
      }

      // Check keywords
      const keywords = document.querySelector('meta[name="keywords"]');
      if (keywords) {
        data.keywords = (keywords.getAttribute('content') || '').split(',').map(k => k.trim());
      }

      // Check Open Graph tags
      const ogTags = document.querySelectorAll('meta[property^="og:"]');
      ogTags.forEach(tag => {
        const property = tag.getAttribute('property') || '';
        const content = tag.getAttribute('content') || '';
        if (property && content) {
          data.ogTags[property] = content;
        }
      });

      // Check Twitter tags
      const twitterTags = document.querySelectorAll('meta[name^="twitter:"]');
      twitterTags.forEach(tag => {
        const name = tag.getAttribute('name') || '';
        const content = tag.getAttribute('content') || '';
        if (name && content) {
          data.twitterTags[name] = content;
        }
      });

      // Check structured data
      const structuredData = document.querySelector('script[type="application/ld+json"]');
      if (structuredData) {
        try {
          data.structuredData = JSON.parse(structuredData.textContent || '{}');
        } catch (error) {
          console.error('Error parsing structured data:', error);
        }
      }

      // Check canonical URL
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        data.canonical = canonical.getAttribute('href') || '';
      }

      // Check robots meta
      const robots = document.querySelector('meta[name="robots"]');
      if (robots) {
        data.robots = robots.getAttribute('content') || '';
      }

      setSeoData(data);
      setLoading(false);
    };

    checkSEO();
  }, []);

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-md">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        <span className="ml-2">Checking SEO...</span>
      </div>
    );
  }

  if (!seoData) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-md max-h-96 overflow-y-auto">
      <h3 className="font-bold text-lg mb-2">🔍 SEO Check</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Title:</strong> 
          <span className={seoData.title.length > 60 ? 'text-red-500' : 'text-green-500'}>
            {seoData.title} ({seoData.title.length}/60)
          </span>
        </div>
        
        <div>
          <strong>Description:</strong>
          <span className={seoData.description.length > 160 ? 'text-red-500' : 'text-green-500'}>
            {seoData.description} ({seoData.description.length}/160)
          </span>
        </div>
        
        <div>
          <strong>Keywords:</strong> {seoData.keywords.length > 0 ? seoData.keywords.join(', ') : 'None'}
        </div>
        
        <div>
          <strong>Open Graph Tags:</strong> {Object.keys(seoData.ogTags).length}
        </div>
        
        <div>
          <strong>Twitter Tags:</strong> {Object.keys(seoData.twitterTags).length}
        </div>
        
        <div>
          <strong>Structured Data:</strong> {seoData.structuredData ? '✅' : '❌'}
        </div>
        
        <div>
          <strong>Canonical URL:</strong> {seoData.canonical ? '✅' : '❌'}
        </div>
        
        <div>
          <strong>Robots Meta:</strong> {seoData.robots ? seoData.robots : 'None'}
        </div>
      </div>
    </div>
  );
} 