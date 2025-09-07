"use client";

import { TreePine, ArrowUpRight, MessageCircle, Phone, MapPin, Play, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { trackEvent, trackCtaClick } from './GoogleAnalytics';
import ReCaptchaModal from './ReCaptchaModal';
import { useRouter } from 'next/navigation';
import SearchWidget from './SearchWidget';

interface HeroSectionProps {
  onReserverClick?: () => void;
  onAddPropertyClick?: () => void;
  onConnexionClick?: () => void;
  onInscriptionClick?: () => void;
}

export default function HeroSection({ onReserverClick, onAddPropertyClick, onConnexionClick, onInscriptionClick }: HeroSectionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [showReCaptchaModal, setShowReCaptchaModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showSearchWidget, setShowSearchWidget] = useState(false);
  const router = useRouter();

  const images = [
    {
      src: '/img1.jpg',
      alt: 'Hébergements avec vue imprenable',
      tag: '#Vues imprenables',
      hasPlayButton: false
    },
    {
      src: '/img2.jpg',
      alt: 'Hébergements acceptant les animaux',
      tag: '#Animaux acceptés',
      hasPlayButton: true
    },
    {
      src: '/img3.jpg',
      alt: 'Randonnées et activités nature',
      tag: '#Randonnées',
      hasPlayButton: false
    }
  ];

  const handleContactClick = () => {
    console.log('🔍 Contact button clicked, opening reCAPTCHA modal...');
    trackEvent('click', 'navigation', 'recaptcha_modal_open');
    setShowReCaptchaModal(true);
    console.log('🔍 Modal state set to true');
  };

  const handleReCaptchaSuccess = () => {
    trackEvent('click', 'navigation', 'recaptcha_verification_success');
    window.location.href = '/contact';
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoScrolling) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [isAutoScrolling, images.length]);

  const nextImage = () => {
    setIsAutoScrolling(false); // Pause auto-scroll on manual interaction
    trackEvent('interaction', 'carousel', 'next_image');
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setIsAutoScrolling(false); // Pause auto-scroll on manual interaction
    trackEvent('interaction', 'carousel', 'prev_image');
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setIsAutoScrolling(false); // Pause auto-scroll on manual interaction
    trackEvent('interaction', 'carousel', `go_to_image_${index}`);
    setCurrentImageIndex(index);
  };

  // Resume auto-scroll after 5 seconds of inactivity
  useEffect(() => {
    if (isAutoScrolling) return;

    const timeout = setTimeout(() => {
      setIsAutoScrolling(true);
    }, 500);

    return () => clearTimeout(timeout);
  }, [isAutoScrolling]);

  const handleReserverClick = () => {
    trackEvent('click', 'cta_button', 'reserver_main_hero');
    trackCtaClick('reserver', 'hero_section');
    onReserverClick?.();
  };

  const handleAddPropertyClick = () => {
    trackEvent('click', 'cta_button', 'add_property_main_hero');
    onAddPropertyClick?.();
  };

  const handleConnexionClick = () => {
    trackEvent('click', 'cta_button', 'connexion_main_hero');
    onConnexionClick?.();
  };

  const handleInscriptionClick = () => {
    trackEvent('click', 'cta_button', 'inscription_main_hero');
    onInscriptionClick?.();
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);
    
    try {
      // First, let's debug what's in the database
      const debugResponse = await fetch('/api/debug/properties');
      const debugData = await debugResponse.json();
      console.log('🔍 Debug data:', debugData);

      const response = await fetch(`/api/properties/simple-search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(data.data || []);
        setShowSearchResults(true);
        trackEvent('search', 'properties', query);
        console.log('✅ Search results:', data.data);
      } else {
        console.error('❌ Erreur lors de la recherche:', data.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handlePropertyClick = (propertyId: string) => {
    trackEvent('click', 'search_result', propertyId);
    setShowSearchResults(false);
    router.push(`/properties/${propertyId}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const openSearchWidget = () => {
    setShowSearchWidget(true);
    trackEvent('click', 'search_widget', 'open');
  };

  const closeSearchWidget = () => {
    setShowSearchWidget(false);
  };

  const handleWidgetSearch = (results: any[]) => {
    setSearchResults(results);
    trackEvent('search', 'widget_search', 'completed');
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryClick = (category: string) => {
    trackEvent('click', 'property_category', category);
    // Add your category navigation logic here
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Blurred Background */}
      <div className="absolute inset-0">
        <img
          src="/hero.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl">
          {/* White Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 shadow-2xl">
            
            {/* Header Inside White Card */}
            <header className="mb-8 lg:mb-12">
              <div className="flex items-center justify-between">
                {/* Left Side - Logo and Navigation */}
                <div className="flex items-center space-x-6 lg:space-x-8">
                  {/* Logo */}
                  <div className="flex items-center ">
                    <img 
                      src="/logo-svg.png" 
                      alt="Logo AtypikHouse" 
                      className="w-20 h-20 object-contain"
                    />
                    <span className="text-xl font-bold text-gray-900">AtypikHouse</span>
                  </div>
                  
                                      {/* Tablet & Desktop Navigation */}
                   <nav className="hidden md:flex items-center space-x-3 md:space-x-4 lg:space-x-6">
                     <a href="#" className="bg-gradient-to-r from-[#3D6B4A] to-[#2C3E37] text-white px-3 md:px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-lg text-sm md:text-base" aria-label="Retour à l'accueil">Accueil</a>
                     <button onClick={handleContactClick} className="text-gray-700 border border-gray-300 px-3 md:px-4 py-2 rounded-full font-medium hover:bg-gray-50 transition-colors text-sm md:text-base" aria-label="Ouvrir le formulaire de contact">Contact</button>
                                         <a 
                       href="/blog" 
                       onClick={() => trackEvent('click', 'navigation', 'blog_link')}
                       className="text-gray-700 border border-gray-300 px-3 md:px-4 py-2 rounded-full font-medium hover:bg-gray-50 transition-colors text-sm md:text-base"
                     >
                      Blog
                    </a>
                  </nav>
                </div>
                
                {/* Right Side - Search and Actions */}
                <div className="flex items-center space-x-4 lg:space-x-6">
                  {/* Global Search Bar */}
                  <div className="relative search-container">
                    <button
                      onClick={openSearchWidget}
                      className="search-button w-full sm:w-64 pl-10 pr-4 py-2.5 sm:py-3 rounded-full text-left text-gray-500 transition-all duration-200 flex items-center shadow-sm"
                    >
                      <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-3" />
                      <span className="text-sm sm:text-base font-medium">Rechercher </span>
                    </button>
                  </div>
                  
                                      {/* Navigation Links */}
                   <nav className="hidden md:flex items-center space-x-3 md:space-x-4">
                     <button 
                       onClick={onConnexionClick}
                       className="text-gray-700 border border-gray-300 px-3 md:px-4 py-2 rounded-full font-medium hover:bg-gray-50 transition-colors text-sm md:text-base"
                     >
                       Connexion
                     </button>
                     <button 
                       onClick={onInscriptionClick}
                       className="bg-gradient-to-r from-[#3D6B4A] to-[#2C3E37] text-white px-3 md:px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#3D6B4A]/25 text-sm md:text-base"
                     >
                      Inscription
                    </button>
                  </nav>
                  
                  {/* Mobile Menu Button */}
                  <button 
                    className="md:hidden text-gray-700 p-2 border border-gray-300 rounded-full"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Ouvrir le menu de navigation"
                    aria-expanded={isMobileMenuOpen}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Mobile Menu */}
              {isMobileMenuOpen && (
                <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
                  {/* Mobile Search Button */}
                  <div className="mb-4">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openSearchWidget();
                      }}
                      className="mobile-search-button w-full pl-10 pr-4 py-3 rounded-full text-left text-gray-500 transition-all duration-200 flex items-center shadow-sm"
                    >
                      <Search className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm font-medium">Rechercher</span>
                    </button>
                  </div>
                  
                  <nav className="space-y-3">
                    <a href="#" className="block text-gray-700 font-medium">Accueil</a>
                    <button onClick={handleContactClick} className="block w-full text-left text-gray-700 font-medium">Contact</button>
                    <a 
                      href="/blog" 
                      onClick={() => trackEvent('click', 'navigation', 'blog_link_mobile')}
                      className="block text-gray-700 font-medium"
                    >
                      Blog
                    </a>
                    <button 
                      onClick={handleConnexionClick}
                      className="block w-full text-left text-gray-700 font-medium"
                    >
                      Connexion
                    </button>
                    <button 
                      onClick={handleInscriptionClick}
                      className="block w-full text-left text-gray-700 font-medium"
                    >
                      Inscription
                    </button>
                  </nav>
                </div>
              )}
            </header>
            
                          {/* Mobile Layout - Single Column */}
             <div className="md:hidden space-y-8 sm:space-y-10">
              {/* Main Heading */}
              <div className="text-center space-y-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                  Hébergements insolites
                  <br />
                  & glamping
                </h1>
                <p className="text-sm sm:text-base text-gray-500 font-medium">Depuis 2023</p>
              </div>

              {/* Description */}
              <div className="text-center space-y-4">
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-sm mx-auto">
                  Nos hébergements vous immergent dans la beauté de la nature. Profitez de votre temps avec des choix d'hébergements uniques.
                </p>
              </div>

              {/* Retreat Info */}
              <div className="text-center space-y-4">
               
                
                <div className="flex items-center justify-center space-x-3 pt-2">
                  <button 
                    onClick={handleReserverClick}
                    className="bg-gradient-to-r from-[#3D6B4A] to-[#2C3E37] text-white px-8 py-4 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#3D6B4A]/25 text-sm sm:text-base w-full max-w-xs"
                  >
                    Réserver maintenant
                  </button>
                  <button 
                    onClick={() => trackEvent('click', 'cta_button', 'arrow_right_mobile')}
                    className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <ArrowUpRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Mobile Image Carousel */}
              <div className="relative space-y-4">
                <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src={images[currentImageIndex].src}
                    alt={images[currentImageIndex].alt}
                    className="w-full h-full object-cover transition-all duration-300 ease-in-out"
                  />
                  
                  {/* Play Button Overlay */}
                  {images[currentImageIndex].hasPlayButton && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 text-gray-900 ml-1" />
                      </div>
                    </div>
                  )}
                  
                  {/* Image Tag */}
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-900 shadow-sm">
                      {images[currentImageIndex].tag}
                    </span>
                  </div>
                </div>

                {/* Carousel Navigation */}
                <div className="flex items-center justify-between px-4">
                  <button 
                    onClick={prevImage}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {/* Dots Indicator */}
                  <div className="flex space-x-3">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-gray-900' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button 
                    onClick={nextImage}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

                         {/* Tablet & Desktop Layout - Two Column */}
             <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 items-start">
              {/* Left Section - Main Heading */}
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
                  Hébergements insolites
                  <br />
                  & glamping
                </h1>
              </div>

              {/* Right Section - Description and CTA */}
              <div className="space-y-4 sm:space-y-6">
                {/* Description */}
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">
                    Nos hébergements vous immergent dans la beauté de la nature. Profitez de votre temps avec des choix d'hébergements uniques.
                  </p>
                  <p className="text-gray-500 font-medium text-sm sm:text-base">Depuis 2025</p>
                </div>

                {/* Retreat Info */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Atypik </h3>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Glamping situé en pleine nature avec vue sur les paysages.
                  </p>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handleReserverClick}
                      className="bg-gradient-to-r from-[#3D6B4A] to-[#2C3E37] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#3D6B4A]/25 text-sm sm:text-base"
                    >
                      Réserver maintenant
                    </button>
                    <button 
                      onClick={() => trackEvent('click', 'cta_button', 'arrow_right_desktop')}
                      className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

                         {/* Tablet & Desktop Image Gallery */}
             <div className="hidden md:block mt-8 sm:mt-12 md:mt-14 lg:mt-16">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-7 lg:gap-8">
                {/* Card 1 - Awesome Views */}
                <div className="relative group">
                  {/* Image Previews */}
                  <div className="flex space-x-1 sm:space-x-2 mb-3 sm:mb-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden">
                      <img src="/img1.jpg" alt="Aperçu 1" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden">
                      <img src="/img2.jpg" alt="Aperçu 2" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden">
                      <img src="/img3.jpg" alt="Aperçu 3" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">50+</span>
                    </div>
                  </div>
                  
                  {/* Main Image */}
                  <div className="relative h-48 sm:h-56 lg:h-64 xl:h-80 rounded-xl sm:rounded-2xl overflow-hidden">
                    <img 
                      src="/img1.jpg" 
                      alt="Hébergements avec vue imprenable" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
                      <span className="bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-gray-900">
                        #Vues imprenables
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2 - Pet Friendly */}
                <div className="relative group">
                  <div className="relative h-48 sm:h-56 lg:h-64 xl:h-80 rounded-xl sm:rounded-2xl overflow-hidden">
                    <img 
                      src="/img2.jpg" 
                      alt="Hébergements acceptant les animaux" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-4 h-4 sm:w-6 sm:h-6 text-gray-900 ml-0.5 sm:ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
                      <span className="bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-gray-900">
                        #Animaux acceptés
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 3 - Hiking */}
                <div className="relative group sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div></div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-600">Plus sur nos expériences</span>
                      <button 
                        onClick={() => trackEvent('click', 'cta_button', 'more_experiences')}
                        className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                        aria-label="Découvrir plus d'expériences"
                      >
                        <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative h-48 sm:h-56 lg:h-64 xl:h-80 rounded-xl sm:rounded-2xl overflow-hidden">
                    <img 
                      src="/img3.jpg" 
                      alt="Randonnées et activités nature" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
                      <span className="bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-gray-900">
                        #Randonnées
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ReCAPTCHA Modal */}
      <ReCaptchaModal 
        isOpen={showReCaptchaModal} 
        onSuccess={handleReCaptchaSuccess}
        onClose={() => setShowReCaptchaModal(false)} 
      />

      {/* Search Widget */}
      <SearchWidget
        isOpen={showSearchWidget}
        onClose={closeSearchWidget}
        onSearch={handleWidgetSearch}
      />
    </section>
  );
} 
