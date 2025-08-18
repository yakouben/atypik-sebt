"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/components/AuthProvider';
import HeroSection from '@/components/HeroSection';
import { Mountain, TreePine, Castle, Caravan, Home as HomeIcon, Star, MapPin, Users, Euro, Shield, Heart, Zap, Globe, Building, Hotel, ArrowRight, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user, userProfile, loading } = useAuthContext();
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  // Scroll effect for progressive reveal
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-advance features for storytelling
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleReserverClick = () => {
    router.push('/auth/login');
  };

  const handleAddPropertyClick = () => {
    router.push('/host');
  };

  const handleConnexionClick = () => {
    router.push('/auth/login');
  };

  const handleInscriptionClick = () => {
    router.push('/auth/register');
  };

  const handleCategoryClick = (category: string) => {
    router.push(`/dashboard/client?category=${category}`);
  };

  const handlePropertyClick = (propertyId: string) => {
    router.push(`/properties/${propertyId}`);
  };

  const handleViewAllPropertiesClick = () => {
    router.push('/auth/login');
  };

  // Featured properties data
  const featuredProperties = [
    {
      id: '1',
      name: 'Cabane A-Frame en pleine nature',
      location: 'Forêt de Tazekka, Maroc',
      price: 130,
      guests: 10,
      image: 'https://plus.unsplash.com/premium_photo-1687710306899-10a3bfcacf9b?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      category: 'Cabanes dans les arbres'
    },
    {
      id: '2',
      name: 'Yourte traditionnelle',
      location: 'Montagnes de l\'Atlas',
      price: 95,
      guests: 6,
      image: 'https://plus.unsplash.com/premium_photo-1719610047551-d9343735daeb?q=80&w=1069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      category: 'Yourtes'
    },
    {
      id: '3',
      name: 'Cabane flottante sur le lac',
      location: 'Lac d\'Ifni, Maroc',
      price: 180,
      guests: 8,
      image: 'https://images.unsplash.com/photo-1583187231125-45b66b4eeb80?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      category: 'Cabanes flottantes'
    }
  ];

  // Categories data
  const categories = [
    {
      id: 1,
      name: 'Cabanes dans les arbres',
      description: 'Vivez une expérience unique perchée dans les arbres',
      image: '/img4.jpg',
      icon: TreePine,
      count: 12
    },
    {
      id: 2,
      name: 'Yourtes',
      description: 'Découvrez le confort traditionnel des yourtes',
      image: 'https://plus.unsplash.com/premium_photo-1686090449933-2057b9fba09c?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      icon: Castle,
      count: 8
    },
    {
      id: 3,
      name: 'Cabanes flottantes',
      description: 'Sur l\'eau, en harmonie avec les éléments',
      image: 'https://images.unsplash.com/photo-1618396755206-ff25b5737b8a?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      icon: Caravan,
      count: 6
    },
    {
      id: 4,
      name: 'Autres hébergements',
      description: 'Explorez notre collection d\'hébergements insolites',
      image: '/img1.jpg',
      icon: HomeIcon,
      count: 15
    }
  ];

  // Why choose us features with storytelling flow
  const features = [
    {
      icon: Eye,
      title: 'Voir une propriété',
      description: 'Découvrez des hébergements uniques avec des photos détaillées et des descriptions complètes',
      phonePosition: 'top-4 left-4',
      calloutPosition: 'top-0 left-0',
      storyStep: 'See a property'
    },
    {
      icon: Shield,
      title: 'Vérifier les équipements',
      description: 'Tous nos hébergements sont vérifiés et sécurisés pour votre tranquillité d\'esprit',
      phonePosition: 'top-1/2 -translate-y-1/2 right-4',
      calloutPosition: 'top-1/2 -translate-y-1/2 right-0',
      storyStep: 'Check amenities'
    },
    {
      icon: Zap,
      title: 'Réserver instantanément',
      description: 'Réservez en quelques clics et recevez une confirmation immédiate',
      phonePosition: 'bottom-1/2 translate-y-1/2 left-4',
      calloutPosition: 'bottom-1/2 translate-y-1/2 left-0',
      storyStep: 'Book instantly'
    },
    {
      icon: Heart,
      title: 'Voyager en sécurité',
      description: 'Plus de 40 hébergements insolites en Europe, tous sécurisés',
      phonePosition: 'bottom-4 right-4',
      calloutPosition: 'bottom-0 right-0',
      storyStep: 'Travel securely'
    }
  ];

  // Accommodation types for the new section
  const accommodationTypes = [
    {
      name: 'Hotels',
      icon: Hotel,
      isActive: true
    },
    {
      name: 'Cabins',
      icon: TreePine,
      isActive: false
    },
    {
      name: 'Luxe',
      icon: Building,
      isActive: false
    },
    {
      name: 'Castle',
      icon: Castle,
      isActive: false
    }
  ];

  // Unique stays images
  const uniqueStays = [
    {
      id: '1',
      image: '/img1.jpg',
      alt: 'Modern glass building with extensive facades'
    },
    {
      id: '2',
      image: '/img2.jpg',
      alt: 'Circular saucer-shaped building with domed glass roof'
    },
    {
      id: '3',
      image: '/img3.jpg',
      alt: 'Stacked dark grey rectangular modules with rounded corners'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection 
        onReserverClick={handleReserverClick}
        onAddPropertyClick={handleAddPropertyClick}
        onConnexionClick={handleConnexionClick}
        onInscriptionClick={handleInscriptionClick}
      />

      {/* Featured Properties Section - Modern Horizontal Navbar */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Hébergements en vedette
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez nos hébergements les plus populaires et réservez votre prochaine aventure
            </p>
          </div>
          
          {/* Modern Horizontal Flex Layout - Better Mobile Experience */}
          <div className="flex flex-nowrap gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {featuredProperties.map((property) => (
              <div 
                key={property.id}
                className="flex-shrink-0 w-80 sm:w-96 bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 hover:border-[#4A7C59]/30"
                onClick={() => handlePropertyClick(property.id)}
              >
                <div className="relative h-48 sm:h-56 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-800 shadow-lg group-hover:bg-[#4A7C59]/90 group-hover:text-white transition-all duration-300">
                      <Mountain className="w-3 h-3 text-green-600 group-hover:text-white transition-colors" />
                      <span>{property.category}</span>
                    </div>
                  </div>
                  
                </div>
                
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-[#4A7C59] transition-colors line-clamp-2">
                    {property.name}
                  </h3>
                  
                  <div className="flex items-center space-x-2 text-gray-600 text-sm mb-3 group-hover:text-[#4A7C59]/80 transition-colors">
                    <MapPin className="w-4 h-4 text-green-600 group-hover:text-[#4A7C59] transition-colors flex-shrink-0" />
                    <span className="truncate">{property.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 sm:space-x-4 text-sm text-gray-600 group-hover:text-[#4A7C59]/80 transition-colors">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-green-600 group-hover:text-[#4A7C59] transition-colors flex-shrink-0" />
                        <span className="hidden sm:inline">{property.guests} voyageurs</span>
                        <span className="sm:hidden">{property.guests}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-green-600 font-semibold group-hover:text-[#4A7C59] transition-colors">
                        <Euro className="w-4 h-4 flex-shrink-0" />
                        <span className="text-base sm:text-lg">{property.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Button 
              onClick={handleViewAllPropertiesClick}
              className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] hover:from-[#2C3E37] hover:to-[#4A7C59] text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#4A7C59]/25"
            >
              Voir tous les hébergements
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section - Modern Horizontal Navbar */}
      <section className="py-4 sm:py-2 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Explorez par catégorie
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Choisissez le type d'hébergement qui correspond à votre style de voyage et découvrez des expériences uniques
            </p>
          </div>
          
          {/* Modern Horizontal Navbar - Responsive Grid */}
          <div className="navbar-grid scrollbar-hide">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div 
                  key={category.id}
                  className="navbar-item group relative overflow-hidden rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-700 aspect-[4/3]"
                  onClick={() => handleCategoryClick(category.id.toString())}
                >
                  <div className="relative w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-[#4A7C59]/20 group-hover:via-[#4A7C59]/10 group-hover:to-transparent transition-all duration-500"></div>
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 text-white">
                      {/* Badge - Responsive positioning */}
                      <div className="absolute top-3 left-3 flex items-center space-x-2">
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full group-hover:bg-[#4A7C59]/80 transition-all duration-300">
                          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium bg-white/20 backdrop-blur-sm px-2 sm:px-4 py-1 sm:py-2 rounded-full group-hover:bg-[#4A7C59]/80 transition-all duration-300">
                          {category.count} hébergements
                        </span>
                      </div>
                      
                      {/* Category Name */}
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 text-white leading-tight">
                        {category.name}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-white text-sm sm:text-base mb-4 sm:mb-6 opacity-90 leading-relaxed line-clamp-2">
                        {category.description}
                      </p>
                      
                      {/* Discover Link */}
                      <div className="flex items-center space-x-2 sm:space-x-3 text-white">
                        <span className="font-semibold text-base sm:text-lg">Découvrir</span>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - Progressive Reveal Animation */}
      <section className="py-4 sm:py-4 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Centered Title */}
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 leading-tight">
              Pourquoi choisir AtypikHouse ?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Découvrez notre storytelling interactif qui vous guide à travers l'expérience utilisateur
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Phone Image with Progressive Reveal */}
            <div className="order-2 lg:order-1">
              <div className="relative flex justify-center lg:justify-start">
                <div className="relative w-64 sm:w-72 lg:w-96 h-auto max-w-sm lg:max-w-none">
                  {/* Phone Image - No background, clean display */}
                  <img
                    src="/phone4.png"
                    alt="AtypikHouse Mobile App"
                    className="w-full h-auto object-contain lg:h-[600px] lg:object-contain"
                  />

                  {/* Callout Bubbles for Active Features */}
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className={`absolute ${feature.phonePosition} transition-all duration-1000 ${
                        activeFeature === index 
                          ? 'opacity-100 scale-100' 
                          : 'opacity-0 scale-75'
                      }`}
                    >
                      {/* Callout Arrow */}
                      <div className={`absolute ${feature.calloutPosition} w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-[#4A7C59] transform rotate-45`}></div>
                      
                      {/* Callout Bubble */}
                      <div className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] text-white px-3 py-2 rounded-xl shadow-lg max-w-xs">
                        <div className="flex items-center space-x-2">
                          <feature.icon className="w-3 h-3" />
                          <span className="text-xs font-medium">{feature.storyStep}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Progressive Content */}
            <div className="order-1 lg:order-2">
              <div className="space-y-3 sm:space-y-4">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index}
                      className={`group bg-white rounded-2xl p-4 sm:p-5 shadow-lg transition-all duration-1000 border-2 cursor-pointer ${
                        activeFeature === index 
                          ? 'border-[#4A7C59] shadow-[#4A7C59]/25 scale-105' 
                          : 'border-gray-100 hover:border-[#4A7C59]/50'
                      }`}
                      onClick={() => setActiveFeature(index)}
                >
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-2xl transition-all duration-500 flex-shrink-0 ${
                          activeFeature === index
                            ? 'bg-gradient-to-br from-[#4A7C59] to-[#2C3E37] text-white scale-110 shadow-lg'
                            : 'bg-gray-100 text-gray-600 group-hover:bg-[#4A7C59]/10 group-hover:text-[#4A7C59]'
                        }`}>
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  </div>
                  
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-base sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2 transition-colors duration-300 ${
                            activeFeature === index ? 'text-[#4A7C59]' : 'text-gray-900'
                          }`}>
                    {feature.title}
                  </h3>
                  
                          <p className={`text-xs sm:text-sm lg:text-base leading-relaxed transition-all duration-500 ${
                            activeFeature === index 
                              ? 'text-gray-700 opacity-100' 
                              : 'text-gray-600 opacity-70'
                          }`}>
                    {feature.description}
                  </p>
                          
                          {/* Story Step Badge */}
                          <div className={`mt-2 sm:mt-3 inline-flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                            activeFeature === index
                              ? 'bg-[#4A7C59]/10 text-[#4A7C59]'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            <span>{feature.storyStep}</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                </div>
              );
            })}
          </div>
          
              <div className="text-center lg:text-left mt-6 sm:mt-8">
            <Button 
              onClick={handleInscriptionClick}
                  className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] hover:from-[#2C3E37] hover:to-[#4A7C59] text-white px-6 sm:px-8 lg:px-10 py-2 sm:py-3 lg:py-4 rounded-2xl font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#4A7C59]/25 w-full sm:w-auto"
            >
              Commencer l'aventure
            </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Logo and Description - Full width */}
            <div className="space-y-4">
              <div className="flex items-center">
                <img 
                  src="/logo-white.png" 
                  alt="AtypikHouse Logo" 
                  className="w-20 h-20 object-contain"
                />
                <span className="text-xl font-bold">AtypikHouse</span>
              </div>
              <p className="text-green-100 text-sm leading-relaxed">
                Découvrez des hébergements insolites et des expériences mémorables en Europe.
              </p>
            </div>

            {/* Quick Links and Contact - 2-column grid on sm */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-8">
              {/* Quick Links */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Liens rapides</h3>
                <div className="space-y-2">
                  <a href="/" className="block text-green-100 hover:text-white transition-colors text-sm hover:scale-105 transform duration-200">Accueil</a>
                  <a href="/blog" className="block text-green-100 hover:text-white transition-colors text-sm hover:scale-105 transform duration-200">Blog</a>
                  <a href="/qui-sommes-nous" className="block text-green-100 hover:text-white transition-colors text-sm hover:scale-105 transform duration-200">CGU</a>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Contact</h3>
                <div className="space-y-2 text-sm text-green-100">
                  <p className="hover:text-white transition-colors cursor-pointer">contact@dsp4-ddm-023dis3-4-g9.fr</p>
                  <p className="hover:text-white transition-colors cursor-pointer">+33 6 12 34 56 78</p>
                  <p className="hover:text-white transition-colors cursor-pointer">Europe</p>
                </div>
              </div>

              {/* Empty space for lg screens to maintain 3-column layout */}
              <div className="hidden lg:block"></div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <div className="space-y-4">
              <p className="text-green-100 text-sm leading-relaxed">
                Copyright © 2025 AtypikHouse<br />
                Tous droits réservés. Mentions légales.<br />
                Ce site est un projet étudiant fictif pour lequel aucun réel achat ou aucune réservation ne pourrait être effectué.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
