"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Euro, X, ChevronDown, Calendar, Eye, Star, MapPin as MapPinIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AuthPromptWidget from './AuthPromptWidget';
import { trackCtaClick, trackReservation } from '@/components/GoogleAnalytics';

interface SearchWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (results: any[]) => void;
}

interface Property {
  id: string;
  name: string;
  location: string;
  price_per_night: number;
  images: string[];
  category: string;
}

export default function SearchWidget({ isOpen, onClose, onSearch }: SearchWidgetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [category, setCategory] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const widgetRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Sample locations for dropdown
  const locations = [
    'France', 'Espagne', 'Italie', 'Portugal', 'Allemagne', 
    'Suisse', 'Belgique', 'Pays-Bas', 'Autriche', 'Grèce'
  ];

  // Sample categories
  const categories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'cabane_arbre', label: 'Cabanes dans les arbres' },
    { value: 'yourte', label: 'Yourtes' },
    { value: 'cabane_flottante', label: 'Cabanes flottantes' },
    { value: 'autre', label: 'Autres hébergements' }
  ];

  // Close widget when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close widget on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSearch = async () => {
    if (!searchQuery.trim() && !selectedLocation && !priceRange.min && !priceRange.max && !category) {
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      // Build search parameters
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery);
      if (selectedLocation) params.append('location', selectedLocation);
      if (priceRange.min) params.append('minPrice', priceRange.min);
      if (priceRange.max) params.append('maxPrice', priceRange.max);
      if (category) params.append('category', category);

      const response = await fetch(`/api/properties/simple-search?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.data || []);
        onSearch(data.data || []);
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

  const handlePropertyClick = (propertyId: string) => {
    onClose();
    router.push(`/properties/${propertyId}`);
  };

  const handlePropertyBook = (propertyId: string, propertyName: string) => {
    console.log('🔍 SearchWidget - Book button clicked for property:', propertyName);
    // Track CTA click
    trackCtaClick('reserver', 'search_widget');
    // Track reservation event
    trackReservation(propertyName, propertyId);
    setSelectedProperty(propertyName);
    setShowAuthPrompt(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLocation('');
    setPriceRange({ min: '', max: '' });
    setCategory('');
    setSearchResults([]);
    setShowResults(false);
  };

  const getCategoryLabel = (categoryValue: string) => {
    const cat = categories.find(c => c.value === categoryValue);
    return cat ? cat.label : categoryValue;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
      
                   {/* Search Widget */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 search-widget-container">
        <div 
          ref={widgetRef}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[98vh] overflow-hidden mx-2"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Rechercher un hébergement</h2>
                  <p className="text-sm text-white/80">Trouvez votre séjour parfait</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Single Scrollable Content */}
          <div className="h-[calc(98vh-120px)] overflow-y-auto search-widget-form custom-scrollbar">
            <div className="p-6 space-y-6">
              {/* Search Query - Hero Section */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Que recherchez-vous ?</h3>
                <p className="text-gray-600">Découvrez des hébergements uniques</p>
              </div>

              {/* Search Query */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Nom de l'hébergement
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ex: Cabane dans les arbres, Yourte, etc..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#4A7C59] focus:border-[#4A7C59] transition-all duration-200 text-base bg-white shadow-sm hover:shadow-md search-input-enhanced"
                  />
                </div>
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Location */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Localisation
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#4A7C59] focus:border-[#4A7C59] transition-all duration-200 appearance-none bg-white text-base shadow-sm hover:shadow-md search-input-enhanced"
                    >
                      <option value="">Tous les pays</option>
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Catégorie
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#4A7C59] focus:border-[#4A7C59] transition-all duration-200 appearance-none bg-white text-base shadow-sm hover:shadow-md search-input-enhanced"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Prix par nuit
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Euro className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#4A7C59] focus:border-[#4A7C59] transition-all duration-200 text-sm bg-white shadow-sm hover:shadow-md search-input-enhanced"
                      />
                    </div>
                    <div className="relative">
                      <Euro className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#4A7C59] focus:border-[#4A7C59] transition-all duration-200 text-sm bg-white shadow-sm hover:shadow-md search-input-enhanced"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="w-full py-4 bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] text-white rounded-2xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base"
                >
                  {isSearching ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Recherche en cours...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Search className="w-5 h-5" />
                      <span>Rechercher</span>
                    </div>
                  )}
                </button>
                
                <div className="flex justify-between items-center">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
                  >
                    Effacer les filtres
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </div>

              {/* Search Results */}
              {showResults && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Résultats ({searchResults.length})
                    </h3>
                    {searchResults.length > 0 && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>Hébergements vérifiés</span>
                      </div>
                    )}
                  </div>
                  
                  {isSearching ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Recherche en cours...</h4>
                      <p className="text-gray-600">Nous cherchons les meilleurs hébergements pour vous</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-4">
                      {searchResults.map((property) => (
                        <div
                          key={property.id}
                          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-[#4A7C59]/20 property-card-enhanced"
                        >
                          <div className="flex items-start space-x-4">
                            {/* Property Image */}
                            <div className="w-24 h-24 bg-gray-200 rounded-2xl flex-shrink-0 overflow-hidden shadow-sm">
                              {property.images?.[0] ? (
                                <img
                                  src={property.images[0]}
                                  alt={property.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                                  <MapPinIcon className="w-8 h-8 text-gray-500" />
                                </div>
                              )}
                            </div>
                            
                            {/* Property Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-bold text-gray-900 text-lg truncate">{property.name}</h4>
                                
                              </div>
                              
                              <div className="flex items-center space-x-2 mb-3">
                                <MapPinIcon className="w-4 h-4 text-gray-400" />
                                <p className="text-sm text-gray-600 truncate">{property.location}</p>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-2xl font-bold text-[#4A7C59]">€{property.price_per_night}</p>
                                  <p className="text-xs text-gray-500">par nuit</p>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handlePropertyClick(property.id)}
                                    className="px-4 py-2 text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-2 font-medium"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span>Voir</span>
                                  </button>
                                  
                                  <button
                                    onClick={() => handlePropertyBook(property.id, property.name)}
                                    className="px-6 py-2 text-sm bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
                                  >
                                    Réserver
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Aucun hébergement trouvé</h4>
                      <p className="text-gray-600 mb-4">Essayez de modifier vos critères de recherche</p>
                      <button
                        onClick={clearFilters}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                      >
                        Effacer les filtres
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {!showResults && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Prêt à découvrir ?</h3>
                  <p className="text-gray-600 mb-4">Utilisez les filtres ci-dessus pour commencer votre recherche</p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-[#4A7C59] rounded-full"></div>
                    <span>Hébergements uniques</span>
                    <div className="w-2 h-2 bg-[#4A7C59] rounded-full"></div>
                    <span>Réservations sécurisées</span>
                    <div className="w-2 h-2 bg-[#4A7C59] rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Prompt Widget */}
      <AuthPromptWidget
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        propertyName={selectedProperty}
      />
    </>
  );
}
