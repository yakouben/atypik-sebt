import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plan du Site - AtypikHouse',
  description: 'Découvrez toutes les pages et sections de notre site AtypikHouse. Naviguez facilement pour trouver l\'information que vous recherchez.',
  openGraph: {
    title: 'Plan du Site - AtypikHouse',
    description: 'Découvrez toutes les pages et sections de notre site AtypikHouse. Naviguez facilement pour trouver l\'information que vous recherchez.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plan du Site - AtypikHouse',
    description: 'Découvrez toutes les pages et sections de notre site AtypikHouse. Naviguez facilement pour trouver l\'information que vous recherchez.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SitemapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
