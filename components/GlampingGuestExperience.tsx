"use client";

import { useState, useEffect } from 'react';
import { 
  MapPin,
  Calendar,
  Users,
  Star,
  Bed,
  Bath,
  Wifi,
  Coffee,
  Car,
  Mountain,
  Home,
  Castle,
  Caravan,
  ArrowRight,
  TreePine,
  User,
  LogOut,
  Euro,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Filter,
  Search,
  LayoutDashboard
} from 'lucide-react';
import { useAuthContext } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

interface Property {
  id: string;
  name: string;
  type: string;
  location: string;
  price_per_night: number;
  max_guests: number;
  rating: number;
  is_available: boolean;
  images: string[];
  amenities: string[];
  description: string;
  category: string; // Added category field
}

interface Booking {
  id: string;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  status: string;
  guest_count: number;
  special_requests?: string;
  full_name?: string;
  email_or_phone?: string;
  travel_type?: string;
  created_at: string;
  properties: {
    name: string;
    location: string;
    images: string[];
  };
}

// Only the 4 database categories
const accommodationCategories = [
  { name: 'Tous', icon: TreePine, category: 'all' },
  { name: 'Cabanes dans les arbres', icon: TreePine, category: 'cabane_arbre' },
  { name: 'Yourtes', icon: Castle, category: 'yourte' },
  { name: 'Cabanes flottantes', icon: Caravan, category: 'cabane_flottante' },
  { name: 'Autres hébergements', icon: Home, category: 'autre' }
];

const amenities = [
  { name: 'WiFi', icon: Wifi },
  { name: 'Petit-déjeuner', icon: Coffee },
  { name: 'Parking', icon: Car },
  { name: 'Vue montagne', icon: Mountain }
];

export default function GlampingGuestExperience() {
  const { userProfile, getPublishedProperties, signOut } = useAuthContext();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('properties');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    loadProperties();
    if (userProfile?.id) {
      loadBookings();
    }
  }, [selectedCategory, userProfile]);

  useEffect(() => {
    filterBookings();
  }, [bookings, selectedStatus, searchQuery]);

  const loadProperties = async () => {
    // Don't block the entire UI for property loading
    setPropertiesLoading(true);
    try {
      const url = selectedCategory === 'all' 
        ? '/api/properties?published=true&available=true' 
        : `/api/properties?category=${selectedCategory}&published=true&available=true`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (response.ok && result.data) {
        setProperties(result.data);
        // Remove console.log for better performance
      } else {
        console.error('Error loading properties:', result.error);
        setProperties([]);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally {
      setPropertiesLoading(false);
    }
  };

  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const response = await fetch(`/api/bookings/client?clientId=${userProfile!.id}`);
      const result = await response.json();
      
      if (response.ok && result.data) {
        setBookings(result.data);
        // Remove console.log for better performance
      } else {
        console.error('Error loading bookings:', result.error);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.properties.name.toLowerCase().includes(query) ||
        booking.properties.location.toLowerCase().includes(query) ||
        (booking.full_name && booking.full_name.toLowerCase().includes(query))
      );
    }

    setFilteredBookings(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulé';
      case 'completed':
        return 'Terminé';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const calculateStats = () => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const totalSpent = bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + b.total_price, 0);

    return { total, pending, confirmed, completed, cancelled, totalSpent };
  };

  const stats = calculateStats();

  const handleSignOut = async () => {
    try {
      console.log('User initiated sign out...');
      const result = await signOut();
      
      if (result.error) {
        console.error('Sign out error:', result.error);
        // You could show an error message to the user here
      } else {
        console.log('Sign out successful, redirecting to landing page...');
        // The signOut function will handle the redirect automatically
      }
    } catch (error) {
      console.error('Sign out exception:', error);
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'cabane_arbre': return 'Cabane dans les arbres';
      case 'yourte': return 'Yourte';
      case 'cabane_flottante': return 'Cabane flottante';
      case 'autre': return 'Autre hébergement';
      default: return category;
    }
  };

  const handlePropertyClick = (propertyId: string) => {
    // Optimistic navigation - start transition immediately
    router.push(`/properties/${propertyId}`);
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || property.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  // Only show main loading for initial load, not for category changes
  const isInitialLoading = loading && properties.length === 0 && bookings.length === 0;

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2C3E37] to-[#4A7C59] rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2C3E37]">
                  Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={handleSignOut}
                className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 px-3 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-sm border border-red-200 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                {getGreeting()}, {userProfile?.full_name?.split(' ')[0] || 'Client'}!
              </h2>
              <p className="text-green-100 text-lg">
                Découvrez des hébergements insolites et éco-responsables en France et en Europe
              </p>
            </div>
            <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium transition-all hover:bg-white/30 hover:scale-105 shadow-lg">
              Commencer à explorer
            </button>
          </div>
        </div>

        {/* Modern Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-3 sm:flex sm:justify-start">
              {/* Dashboard Tab */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`relative group transition-all duration-300 ease-in-out ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-[#4A7C59]/5 to-[#2C3E37]/5 text-[#4A7C59]'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center justify-center py-4 sm:py-5 px-3 sm:px-6 space-y-2">
                  <div className="relative">
                    <LayoutDashboard className={`w-5 h-5 sm:w-6 sm:w-6 transition-all duration-300 ${
                      activeTab === 'dashboard' ? 'text-[#4A7C59]' : 'text-gray-500 group-hover:text-gray-700'
                    }`} />
                  </div>
                  <span className={`text-xs sm:text-sm font-medium transition-all duration-300 ${
                    activeTab === 'dashboard' ? 'font-semibold' : 'font-medium'
                  }`}>
                    <span className="sm:hidden">Vue</span>
                    <span className="hidden sm:inline">Vue d'ensemble</span>
                  </span>
                  
                  {/* Animated Underline */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 ease-out ${
                    activeTab === 'dashboard' 
                      ? 'bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] scale-x-100' 
                      : 'bg-transparent scale-x-0 group-hover:scale-x-100 group-hover:bg-gray-300'
                  }`} />
                </div>
              </button>

              {/* Properties Tab */}
              <button
                onClick={() => setActiveTab('properties')}
                className={`relative group transition-all duration-300 ease-in-out ${
                  activeTab === 'properties'
                    ? 'bg-gradient-to-r from-[#4A7C59]/5 to-[#2C3E37]/5 text-[#4A7C59]'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center justify-center py-4 sm:py-5 px-3 sm:px-6 space-y-2">
                  <div className="relative">
                    <Home className={`w-5 h-5 sm:w-6 sm:w-6 transition-all duration-300 ${
                      activeTab === 'properties' ? 'text-[#4A7C59]' : 'text-gray-500 group-hover:text-gray-700'
                    }`} />
                  </div>
                  <span className={`text-xs sm:text-sm font-medium transition-all duration-300 ${
                    activeTab === 'properties' ? 'font-semibold' : 'font-medium'
                  }`}>
                    <span className="sm:hidden">Props</span>
                    <span className="hidden sm:inline">Propriétés</span>
                  </span>
                  
                  {/* Animated Underline */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 ease-out ${
                    activeTab === 'properties' 
                      ? 'bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] scale-x-100' 
                      : 'bg-transparent scale-x-0 group-hover:scale-x-100 group-hover:bg-gray-300'
                  }`} />
                </div>
              </button>

              {/* Bookings Tab */}
              <button
                onClick={() => setActiveTab('bookings')}
                className={`relative group transition-all duration-300 ease-in-out ${
                  activeTab === 'bookings'
                    ? 'bg-gradient-to-r from-[#4A7C59]/5 to-[#2C3E37]/5 text-[#4A7C59]'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center justify-center py-4 sm:py-5 px-3 sm:px-6 space-y-2">
                  <div className="relative">
                    <Calendar className={`w-5 h-5 sm:w-6 sm:w-6 transition-all duration-300 ${
                      activeTab === 'bookings' ? 'text-[#4A7C59]' : 'text-gray-500 group-hover:text-gray-700'
                    }`} />
                    {/* Badge for booking count */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{bookings.length}</span>
                    </div>
                  </div>
                  <span className={`text-xs sm:text-sm font-medium transition-all duration-300 ${
                    activeTab === 'bookings' ? 'font-semibold' : 'font-medium'
                  }`}>
                    <span className="sm:hidden">Réserv</span>
                    <span className="hidden sm:inline">Réservations</span>
                  </span>
                  
                  {/* Animated Underline */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 ease-out ${
                    activeTab === 'bookings' 
                      ? 'bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] scale-x-100' 
                      : 'bg-transparent scale-x-0 group-hover:scale-x-100 group-hover:bg-gray-300'
                  }`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Enhanced Stats Cards */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              {/* Single Line Horizontal Navbar - No Wrapping */}
              <div className="flex flex-nowrap gap-2 sm:gap-3 overflow-x-auto pb-2">
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-2 sm:p-3 min-w-[80px] sm:min-w-[100px] border border-blue-200">
                  <div className="flex flex-col items-center text-center">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mb-1 sm:mb-2" />
                    <p className="text-xs font-medium text-blue-700 mb-1">Total</p>
                    <p className="text-sm sm:text-lg font-bold text-blue-900">{bookingsLoading ? '...' : stats.total}</p>
                  </div>
                </div>
                
                <div className="flex-shrink-0 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-2 sm:p-3 min-w-[80px] sm:min-w-[100px] border border-yellow-200">
                  <div className="flex flex-col items-center text-center">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mb-1 sm:mb-2" />
                    <p className="text-xs font-medium text-yellow-700 mb-1">En attente</p>
                    <p className="text-sm sm:text-lg font-bold text-yellow-900">{bookingsLoading ? '...' : stats.pending}</p>
                  </div>
                </div>
                
                <div className="flex-shrink-0 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-2 sm:p-3 min-w-[80px] sm:min-w-[100px] border border-green-200">
                  <div className="flex flex-col items-center text-center">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mb-1 sm:mb-2" />
                    <p className="text-xs font-medium text-green-700 mb-1">Confirmées</p>
                    <p className="text-sm sm:text-lg font-bold text-green-900">{bookingsLoading ? '...' : stats.confirmed}</p>
                  </div>
                </div>
                
                <div className="flex-shrink-0 bg-gradient-to-r from-[#4A7C59]/10 to-[#2C3E37]/10 rounded-xl p-2 sm:p-3 min-w-[80px] sm:min-w-[100px] border border-[#4A7C59]/20">
                  <div className="flex flex-col items-center text-center">
                    <Euro className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A7C59] mb-1 sm:mb-2" />
                    <p className="text-xs font-medium text-[#4A7C59] mb-1">Total Dépensé</p>
                    <p className="text-sm sm:text-lg font-bold text-[#2C3E37]">{bookingsLoading ? '...' : formatPrice(stats.totalSpent)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* My Bookings Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Mes réservations récentes</h3>
                  <button 
                    onClick={() => setActiveTab('bookings')}
                    className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
                  >
                    Voir toutes →
                  </button>
                </div>
              </div>
              
              {bookingsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement des réservations...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune réservation encore
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Commencez à explorer nos hébergements uniques et réservez votre premier séjour.
                  </p>
                  <button className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] hover:from-[#2C3E37] hover:to-[#4A7C59] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#4A7C59]/25">
                    Explorer les hébergements
                  </button>
                </div>
              ) : (
                <div className="space-y-4 p-6">
                  {bookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => {
                      setSelectedBooking(booking);
                      setShowBookingModal(true);
                    }}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">{booking.properties.name}</h4>
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">{booking.properties.location}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}</span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {booking.guest_count} invités
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-lg font-bold text-gray-900 mb-2">{formatPrice(booking.total_price)}</div>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            {getStatusText(booking.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <>
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher un hébergement..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Category Filters - Only the 4 database categories */}
                <div className="flex flex-wrap gap-2">
                  {accommodationCategories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.name}
                        onClick={() => setSelectedCategory(category.category)}
                        className={`px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center space-x-2 ${
                          selectedCategory === category.category
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Properties Grid */}
            <div>
              {propertiesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des propriétés...</p>
                  </div>
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center py-12">
                  <Mountain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun hébergement trouvé</h3>
                  <p className="text-gray-500">
                    {selectedCategory === 'all' 
                      ? 'Aucune propriété disponible pour le moment' 
                      : `Aucune propriété trouvée dans la catégorie "${getCategoryLabel(selectedCategory)}"`
                    }
                  </p>
                </div>
              ) : (
                <div className={`grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}>
                  {filteredProperties.map((property) => (
                    <div 
                      key={property.id} 
                      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 cursor-pointer group"
                      onClick={() => handlePropertyClick(property.id)}
                    >
                      <div className="relative h-48 sm:h-52 lg:h-48 xl:h-52 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                        {property.images && property.images.length > 0 ? (
                          <img 
                            src={property.images[0]} 
                            alt={property.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Mountain className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-[#4A7C59] text-white px-3 py-2 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm">
                            {getCategoryLabel(property.category)}
                          </span>
                        </div>
                        
                        {/* Price Tag */}
                        <div className="absolute bottom-3 right-3">
                          <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg border border-gray-100">
                            <span className="text-sm font-bold text-gray-900">€{property.price_per_night}</span>
                            <span className="text-xs text-gray-600 ml-1">/night</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 sm:p-5 lg:p-4 xl:p-5">
                        <h3 className="font-semibold text-[#2C3E37] mb-2 text-base sm:text-lg group-hover:text-green-600 transition-colors duration-300 line-clamp-1">{property.name}</h3>
                        <div className="flex items-center text-gray-600 mb-3">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="text-sm line-clamp-1">{property.location}</span>
                        </div>
                        
                        {/* Amenities */}
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex items-center text-gray-600">
                            <Bed className="w-4 h-4 mr-1" />
                            <span className="text-sm">{property.max_guests} guests</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-lg font-bold text-[#2C3E37]">€{property.price_per_night}</div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{property.rating || 4.9}</span>
                          </div>
                        </div>
                        
                        <button 
                          className="w-full bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] text-white px-4 py-3 rounded-xl font-medium transition-all hover:shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base group-hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePropertyClick(property.id);
                          }}
                        >
                          <Euro className="w-4 h-4 mr-1" />
                          <span>Réserver</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Horizontal Stats Navbar - Responsive Design */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                {/* Total */}
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 min-w-[140px] border border-blue-200">
                  <div className="flex flex-col items-center text-center">
                    <Calendar className="w-6 h-6 text-blue-600 mb-2" />
                    <p className="text-xs font-medium text-blue-700 mb-1">Total</p>
                    <p className="text-xl font-bold text-blue-900">{stats.total}</p>
                  </div>
                </div>
                
                {/* En attente */}
                <div className="flex-shrink-0 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 min-w-[140px] border border-yellow-200">
                  <div className="flex flex-col items-center text-center">
                    <Clock className="w-6 h-6 text-yellow-600 mb-2" />
                    <p className="text-xs font-medium text-yellow-700 mb-1">En attente</p>
                    <p className="text-xl font-bold text-yellow-900">{stats.pending}</p>
                  </div>
                </div>
                
                {/* Confirmées */}
                <div className="flex-shrink-0 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 min-w-[140px] border border-green-200">
                  <div className="flex flex-col items-center text-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                    <p className="text-xs font-medium text-green-700 mb-1">Confirmées</p>
                    <p className="text-xl font-bold text-green-900">{stats.confirmed}</p>
                  </div>
                </div>
                
                {/* Terminées */}
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 min-w-[140px] border border-blue-200">
                  <div className="flex flex-col items-center text-center">
                    <CheckCircle className="w-6 h-6 text-blue-600 mb-2" />
                    <p className="text-xs font-medium text-blue-700 mb-1">Terminées</p>
                    <p className="text-xl font-bold text-blue-900">{stats.completed}</p>
                  </div>
                </div>
                
                {/* Annulées */}
                <div className="flex-shrink-0 bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 min-w-[140px] border border-red-200">
                  <div className="flex flex-col items-center text-center">
                    <XCircle className="w-6 h-6 text-red-600 mb-2" />
                    <p className="text-xs font-medium text-red-700 mb-1">Annulées</p>
                    <p className="text-xl font-bold text-red-900">{stats.cancelled}</p>
                  </div>
                </div>
                
                {/* Total Dépensé */}
                <div className="flex-shrink-0 bg-gradient-to-r from-[#4A7C59]/10 to-[#2C3E37]/10 rounded-xl p-4 min-w-[140px] border border-[#4A7C59]/20">
                  <div className="flex flex-col items-center text-center">
                    <Euro className="w-6 h-6 text-[#4A7C59] mb-2" />
                    <p className="text-xs font-medium text-[#4A7C59] mb-1">Total Dépensé</p>
                    <p className="text-lg font-bold text-[#2C3E37]">{formatPrice(stats.totalSpent)}</p>
                  </div>
                </div>
              </div>
              
              {/* Scroll indicator for small screens */}
              <div className="flex justify-center mt-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full mx-1"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full mx-1"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full mx-1"></div>
              </div>
            </div>

            {/* Enhanced Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Historique des réservations</h2>
                <p className="text-gray-600 mt-1">Gérez et suivez toutes vos réservations</p>
              </div>
            </div>

            {/* Enhanced Filters and Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom de propriété, localisation..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmées</option>
                    <option value="completed">Terminées</option>
                    <option value="cancelled">Annulées</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bookings List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">
                  Réservations ({filteredBookings.length})
                </h3>
              </div>

              {bookingsLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement des réservations...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Aucune réservation trouvée
                  </h3>
                  <p className="text-gray-500">
                    {selectedStatus !== 'all' || searchQuery 
                      ? 'Aucune réservation ne correspond à vos critères de recherche.'
                      : 'Vous n\'avez pas encore de réservations.'
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredBookings.map((booking) => (
                    <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Property Information */}
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-xl font-bold text-gray-900 mb-1">
                                {booking.properties.name}
                              </h4>
                              <p className="text-gray-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {booking.properties.location}
                              </p>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              <span className="text-sm font-medium capitalize">
                                {getStatusText(booking.status)}
                              </span>
                            </div>
                          </div>

                          {/* Property Image */}
                          {booking.properties.images && booking.properties.images.length > 0 && (
                            <div className="w-full h-32 rounded-lg overflow-hidden">
                              <img
                                src={booking.properties.images[0]}
                                alt={booking.properties.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Dates and Guests */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>{booking.guest_count} invités</span>
                            </div>
                            {booking.special_requests && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Demandes spéciales:</span> {booking.special_requests}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Client Information */}
                        <div className="space-y-3">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <User className="w-5 h-5 text-blue-600" />
                              Informations client
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Nom:</span> {booking.full_name || 'Non spécifié'}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Contact:</span> {booking.email_or_phone || 'Non spécifié'}
                              </div>
                              {booking.travel_type && (
                                <div>
                                  <span className="font-medium text-gray-700">Type de voyage:</span> {booking.travel_type}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Booking Details */}
                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-green-600" />
                              Détails de la Réservation
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Créée le:</span> {formatDate(booking.created_at)}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Prix total:</span> {formatPrice(booking.total_price)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price and Actions */}
                        <div className="space-y-3">
                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Euro className="w-5 h-5 text-green-600" />
                              Prix
                            </h5>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-[#4A7C59] mb-2">
                                {formatPrice(booking.total_price)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Réservé le {formatDate(booking.created_at)}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowBookingModal(true);
                              }}
                              className="w-full bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] hover:from-[#2C3E37] hover:to-[#4A7C59] text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#4A7C59]/25 flex items-center justify-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              Voir détails
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Détails de la réservation</h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Property Information */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="w-6 h-6 text-blue-600" />
                  Informations sur l'hébergement
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nom de la propriété</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedBooking.properties.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Localisation</p>
                    <p className="text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {selectedBooking.properties.location}
                    </p>
                  </div>
                  {selectedBooking.properties.images && selectedBooking.properties.images.length > 0 && (
                    <div className="w-full h-48 rounded-lg overflow-hidden">
                      <img
                        src={selectedBooking.properties.images[0]}
                        alt={selectedBooking.properties.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Details */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-green-600" />
                  Détails de la Réservation
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Date d'arrivée</p>
                      <p className="text-lg font-semibold text-gray-900">{formatDate(selectedBooking.check_in_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Date de départ</p>
                      <p className="text-lg font-semibold text-gray-900">{formatDate(selectedBooking.check_out_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Nombre d'invités</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedBooking.guest_count} invités</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Prix total</p>
                      <p className="text-2xl font-bold text-[#4A7C59]">{formatPrice(selectedBooking.total_price)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Réservation créée le</p>
                      <p className="text-gray-700">{formatDate(selectedBooking.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-6 h-6 text-purple-600" />
                  Informations personnelles
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nom complet</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedBooking.full_name || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email ou téléphone</p>
                    <p className="text-gray-700">{selectedBooking.email_or_phone || 'Non spécifié'}</p>
                  </div>
                  {selectedBooking.travel_type && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Type de voyage</p>
                      <p className="text-gray-700">{selectedBooking.travel_type}</p>
                    </div>
                  )}
                  {selectedBooking.special_requests && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Demandes spéciales</p>
                      <p className="text-gray-700">{selectedBooking.special_requests}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Information */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                  Statut de la réservation
                </h4>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(selectedBooking.status)}`}>
                    {getStatusIcon(selectedBooking.status)}
                    <span className="font-medium capitalize">
                      {getStatusText(selectedBooking.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedBooking.status === 'pending' && 'Votre réservation est en cours de traitement par le propriétaire.'}
                    {selectedBooking.status === 'confirmed' && 'Votre réservation a été confirmée ! Préparez-vous pour votre séjour.'}
                    {selectedBooking.status === 'completed' && 'Votre séjour est terminé. Nous espérons que vous avez passé un excellent moment !'}
                    {selectedBooking.status === 'cancelled' && 'Cette réservation a été annulée.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 