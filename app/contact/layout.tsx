import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact - AtypikHouse',
  description: 'Contactez l\'équipe AtypikHouse pour toute question sur nos hébergements insolites. Réponse garantie sous 24h. Email, téléphone et formulaire de contact disponibles.',
  openGraph: {
    title: 'Contact AtypikHouse - Nous sommes là pour vous aider',
    description: 'Posez vos questions sur nos hébergements insolites. Notre équipe vous répond sous 24h.',
    images: ['/hero.jpg'],
  },
  twitter: {
    title: 'Contact AtypikHouse',
    description: 'Contactez-nous pour toute question sur nos hébergements insolites.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
