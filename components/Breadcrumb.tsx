"use client";

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`} aria-label="Breadcrumb">
      {/* Home Icon */}
      <Link 
        href="/" 
        className="flex items-center hover:text-[#4A7C59] transition-colors duration-200"
        aria-label="Accueil"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Accueil</span>
      </Link>
      
      {/* Breadcrumb Items */}
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          
          {item.current ? (
            <span className="text-[#4A7C59] font-medium" aria-current="page">
              {item.label}
            </span>
          ) : item.href ? (
            <Link 
              href={item.href}
              className="hover:text-[#4A7C59] transition-colors duration-200"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-500">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Helper function to generate breadcrumb items for different page types
export function generateBreadcrumbs(pageType: string, pageData?: any): BreadcrumbItem[] {
  switch (pageType) {
    case 'home':
      return [];
      
    case 'properties':
      return [
        { label: 'Propriétés', href: '/properties' }
      ];
      
    case 'property-detail':
      return [
        { label: 'Propriétés', href: '/properties' },
        { label: pageData?.title || 'Détail', current: true }
      ];
      
    case 'blog':
      return [
        { label: 'Blog', current: true }
      ];
      
    case 'blog-post':
      return [
        { label: 'Blog', href: '/blog' },
        { label: pageData?.title || 'Article', current: true }
      ];
      
    case 'cgu':
      return [
        { label: 'Conditions Générales d\'Utilisation', current: true }
      ];
      
    case 'cgv':
      return [
        { label: 'Conditions Générales de Vente', current: true }
      ];
      
    case 'contact':
      return [
        { label: 'Contact', current: true }
      ];
      
    case 'qui-sommes-nous':
      return [
        { label: 'Qui sommes-nous', current: true }
      ];
      
    case 'dashboard':
      return [
        { label: 'Tableau de bord', current: true }
      ];
      
    case 'client-dashboard':
      return [
        { label: 'Tableau de bord client', current: true }
      ];
      
    case 'owner-dashboard':
      return [
        { label: 'Tableau de bord propriétaire', current: true }
      ];
      
    case 'glamping-dashboard':
      return [
        { label: 'Tableau de bord glamping', current: true }
      ];
      
    case 'login':
      return [
        { label: 'Connexion', current: true }
      ];
      
    case 'register':
      return [
        { label: 'Inscription', current: true }
      ];
      
    case 'sitemap':
      return [
        { label: 'Plan du site', current: true }
      ];
      
    case 'properties':
      return [
        { label: 'Propriétés', current: true }
      ];
      
    case 'add-property':
      return [
        { label: 'Propriétés', href: '/dashboard' },
        { label: 'Ajouter une propriété', current: true }
      ];
      
    case 'edit-property':
      return [
        { label: 'Propriétés', href: '/dashboard' },
        { label: 'Modifier la propriété', current: true }
      ];
      
    case 'bookings':
      return [
        { label: 'Réservations', current: true }
      ];
      
    case 'profile':
      return [
        { label: 'Profil', current: true }
      ];
      
    default:
      return [];
  }
}
