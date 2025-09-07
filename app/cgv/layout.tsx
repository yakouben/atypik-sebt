import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente - AtypikHouse',
  description: 'Consultez les conditions générales de vente d\'AtypikHouse : tarifs, modalités de paiement, annulations, remboursements et responsabilités pour nos hébergements insolites.',
  openGraph: {
    title: 'CGV - AtypikHouse',
    description: 'Conditions générales de vente et informations commerciales pour AtypikHouse.',
    images: ['/hero.jpg'],
  },
};

export default function CGVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
