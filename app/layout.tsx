import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import PerformanceOptimizer from '@/components/PerformanceOptimizer';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#4A7C59',
};

export const metadata: Metadata = {
  title: {
    default: 'AtypikHouse - Hébergements insolites et éco-responsables',
    template: '%s | AtypikHouse'
  },
  description: 'Découvrez des hébergements uniques en France et en Europe : cabanes dans les arbres, yourtes traditionnelles et cabanes flottantes. Réservez votre séjour insolite avec AtypikHouse.',
  keywords: [
    'hébergements insolites',
    'cabanes dans les arbres', 
    'yourtes',
    'cabanes flottantes',
    'glamping',
    'éco-responsable',
    'France',
    'Europe',
    'AtypikHouse',
    'hébergement écologique',
    'vacances nature',
    'séjour insolite'
  ],
  authors: [{ name: 'AtypikHouse' }],
  creator: 'AtypikHouse',
  publisher: 'AtypikHouse',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://atypikhouse.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AtypikHouse - Hébergements insolites et éco-responsables',
    description: 'Découvrez des hébergements uniques en France et en Europe : cabanes dans les arbres, yourtes traditionnelles et cabanes flottantes.',
    url: 'https://atypikhouse.com',
    siteName: 'AtypikHouse',
    images: [
      {
        url: '/hero.jpg',
        width: 1200,
        height: 630,
        alt: 'AtypikHouse - Hébergements insolites',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AtypikHouse - Hébergements insolites et éco-responsables',
    description: 'Découvrez des hébergements uniques en France et en Europe.',
    images: ['/hero.jpg'],
    creator: '@atypikhouse',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'Travel',
  classification: 'Travel Agency',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "AtypikHouse",
    "description": "Hebergements insolites et ecoresponsables en France et en Europe",
    "url": "https://atypikhouse.com",
    "logo": "https://atypikhouse.com/logo-white.png",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Pierrefonds",
      "addressRegion": "Oise",
      "addressCountry": "FR"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "French"
    },
    "sameAs": [
      "https://facebook.com/atypikhouse",
      "https://instagram.com/atypikhouse"
    ],
    "areaServed": [
      {
        "@type": "Country",
        "name": "France"
      },
      {
        "@type": "Country", 
        "name": "Europe"
      }
    ],
    "serviceType": "Hebergements insolites et eco-responsables",
    "priceRange": "€€",
    "currenciesAccepted": "EUR",
    "paymentAccepted": "Credit Card, PayPal, Bank Transfer"
  };

  return (
    <html lang="fr" className={inter.variable}>
      <head>
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//images.pexels.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon */}
        <link rel="icon" href="/logo-white.png" sizes="32x32 48x48" />
        
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <PerformanceOptimizer>
        <AuthProvider>
          {children}
        </AuthProvider>
          <PerformanceMonitor />
        </PerformanceOptimizer>
      </body>
    </html>
  );
}
