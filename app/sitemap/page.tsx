import Link from 'next/link';
import { Home, Building, Users, FileText, Mail, Shield, BookOpen, MapPin, Calendar, Settings } from 'lucide-react';

export default function SitemapPage() {
  const sitemapSections = [
    {
      title: "Pages Principales",
      icon: Home,
      pages: [
        { name: "Accueil", href: "/", description: "Page d'accueil avec hébergements insolites" },
        { name: "Blog", href: "/blog", description: "Articles sur l'hébergement insolite et l'éco-tourisme" },
        { name: "Contact", href: "/contact", description: "Formulaire de contact et informations" },
      ]
    },
    {
      title: "Hébergements (Utilisateurs uniquement)",
      icon: Building,
      pages: [
        { name: "Tous les hébergements", href: "/dashboard/client", description: "Découvrir tous nos hébergements insolites" },
        { name: "Cabanes dans les arbres", href: "/dashboard/client?category=cabane_arbre", description: "Hébergements perchés dans les arbres" },
        { name: "Yourtes", href: "/dashboard/client?category=yourte", description: "Hébergements traditionnels en yourte" },
        { name: "Cabanes flottantes", href: "/dashboard/client?category=cabane_flottante", description: "Hébergements sur l'eau" },
      ]
    },
    {
      title: "Compte Utilisateur (Utilisateurs uniquement)",
      icon: Users,
      pages: [
        { name: "Connexion", href: "/auth/login", description: "Se connecter à votre compte" },
        { name: "Inscription", href: "/auth/register", description: "Créer un nouveau compte" },
        { name: "Tableau de bord client", href: "/dashboard/client", description: "Gérer vos réservations et profils" },
        { name: "Tableau de bord propriétaire", href: "/dashboard/owner", description: "Gérer vos propriétés et réservations" },
      ]
    },
    {
      title: "Informations Légales",
      icon: Shield,
      pages: [
        { name: "Conditions Générales d'Utilisation", href: "/qui-sommes-nous", description: "CGU et informations sur AtypikHouse" },
        { name: "Conditions Générales de Vente", href: "/cgv", description: "CGV et modalités de réservation" },
      ]
    },
    {
      title: "Ressources",
      icon: BookOpen,
      pages: [
        { name: "Blog - Glamping & Luxe Nature", href: "/blog?category=Glamping%20%26%20Luxe%20Nature", description: "Articles sur le glamping de luxe" },
        { name: "Blog - Cabanes & Hébergements", href: "/blog?category=Cabanes%20%26%20Hébergements%20Insolites", description: "Articles sur les hébergements insolites" },
        { name: "Blog - Culture & Traditions", href: "/blog?category=Culture%20%26%20Traditions", description: "Articles sur la culture locale" },
        { name: "Blog - Éco-tourisme", href: "/blog?category=Éco-tourisme%20%26%20Durabilité", description: "Articles sur l'éco-tourisme" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Breadcrumb Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-1 text-sm text-gray-600" aria-label="Breadcrumb">
            <Link 
              href="/" 
              className="flex items-center hover:text-[#4A7C59] transition-colors duration-200"
              aria-label="Accueil"
              prefetch={true}
            >
              <Home className="w-4 h-4" />
              <span className="sr-only">Accueil</span>
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-[#4A7C59] font-medium">Plan du site</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Plan du Site
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Découvrez toutes les pages et sections de notre site AtypikHouse. 
            Naviguez facilement pour trouver l'information que vous recherchez.
          </p>
        </div>

        {/* Sitemap Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sitemapSections.map((section, sectionIndex) => {
            const IconComponent = section.icon;
            return (
              <div key={sectionIndex} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex it ems-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#4A7C59]/10 rounded-full flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-[#4A7C59]" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                </div>
                
                <div className="space-y-4">
                  {section.pages.map((page, pageIndex) => (
                    <div key={pageIndex} className="border-l-4 border-[#4A7C59]/20 pl-4 hover:border-[#4A7C59] transition-all duration-200 transform hover:translate-x-1">
                      <Link 
                        href={page.href}
                        className="block group"
                        prefetch={true}
                        aria-label={`Aller à ${page.name}`}
                      >
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#4A7C59] transition-colors duration-200 mb-1">
                          {page.name}
                        </h3>
                        <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">
                          {page.description}
                        </p>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Informations Utiles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center group">
              <div className="w-12 h-12 bg-[#4A7C59]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#4A7C59]/20 transition-colors duration-200">
                <MapPin className="w-6 h-6 text-[#4A7C59]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Hébergements en Europe</h3>
              <p className="text-sm text-gray-600">
                Découvrez nos hébergements insolites dans toute l'Europe
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-12 h-12 bg-[#4A7C59]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#4A7C59]/20 transition-colors duration-200">
                <Calendar className="w-6 h-6 text-[#4A7C59]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Réservation Simple</h3>
              <p className="text-sm text-gray-600">
                Réservez facilement vos séjours insolites
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-12 h-12 bg-[#4A7C59]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#4A7C59]/20 transition-colors duration-200">
                <Settings className="w-6 h-6 text-[#4A7C59]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Support Client</h3>
              <p className="text-sm text-gray-600">
                Notre équipe est là pour vous accompagner
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
