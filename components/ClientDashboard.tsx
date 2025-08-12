"use client";

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Home, 
  Calendar, 
  User, 
  TreePine,
  LogOut,
  Search,
  MapPin,
  Users,
  Euro,
  Star,
  Eye,
  Mail,
  Phone,
  MapPin as LocationIcon,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuthContext } from './AuthProvider';
import { useRouter } from 'next/navigation';

type TabType = 'dashboard' | 'properties' | 'bookings' | 'profile';

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

export default function ClientDashboard() {
  const { userProfile, signOut } = useAuthContext();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (userProfile?.id) {
      loadClientData();
    }
  }, [userProfile]);

  useEffect(() => {
    filterBookings();
  }, [bookings, selectedStatus, searchQuery]);

  const loadClientData = async () => {
    setLoading(true);
    try {
      // Use the new API route instead of direct Supabase query
      const response = await fetch(`/api/bookings/client?clientId=${userProfile!.id}`);
      const result = await response.json();
      
      if (response.ok && result.data) {
        setBookings(result.data);
        console.log('Bookings loaded successfully:', result.data);
      } else {
        console.error('Error loading bookings:', result.error);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error loading client data:', error);
      setBookings([]);
    } finally {
      setLoading(false);
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Bonjour';
    } else if (hour < 18) {
      return 'Bon après-midi';
    } else {
      return 'Bonsoir';
    }
  };

  if (loading) {
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Section - Updated to match owner dashboard design */}
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
                      activeTab === ('properties' as TabType)
                        ? 'bg-gradient-to-r from-[#4A7C59]/5 to-[#2C3E37]/5 text-[#4A7C59]'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center py-4 sm:py-5 px-3 sm:px-6 space-y-2">
                      <div className="relative">
                        <Home className={`w-5 h-5 sm:w-6 sm:w-6 transition-all duration-300 ${
                          activeTab === ('properties' as TabType) ? 'text-[#4A7C59]' : 'text-gray-500 group-hover:text-gray-700'
                        }`} />
                      </div>
                      <span className={`text-xs sm:text-sm font-medium transition-all duration-300 ${
                        activeTab === ('properties' as TabType) ? 'font-semibold' : 'font-medium'
                      }`}>
                        <span className="sm:hidden">Props</span>
                        <span className="hidden sm:inline">Propriétés</span>
                      </span>
                      
                      {/* Animated Underline */}
                      <div className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 ease-out ${
                        activeTab === ('properties' as TabType) 
                          ? 'bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] scale-x-100' 
                          : 'bg-transparent scale-x-0 group-hover:scale-x-100 group-hover:bg-gray-300'
                      }`} />
                    </div>
          </button>

                  {/* Bookings Tab */}
          <button
            onClick={() => setActiveTab('bookings')}
                    className={`relative group transition-all duration-300 ease-in-out ${
                      activeTab === ('bookings' as TabType)
                        ? 'bg-gradient-to-r from-[#4A7C59]/5 to-[#2C3E37]/5 text-[#4A7C59]'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
                    <div className="flex flex-col items-center justify-center py-4 sm:py-5 px-3 sm:px-6 space-y-2">
                      <div className="relative">
                        <Calendar className={`w-5 h-5 sm:w-6 sm:w-6 transition-all duration-300 ${
                          activeTab === ('bookings' as TabType) ? 'text-[#4A7C59]' : 'text-gray-500 group-hover:text-gray-700'
                        }`} />
                        {/* Badge for booking count */}
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{bookings.length}</span>
          </div>
          </div>
                      <span className={`text-xs sm:text-sm font-medium transition-all duration-300 ${
                        activeTab === ('bookings' as TabType) ? 'font-semibold' : 'font-medium'
                      }`}>
                        <span className="sm:hidden">Réserv</span>
                        <span className="hidden sm:inline">Réservations</span>
                      </span>
                      
                      {/* Animated Underline */}
                      <div className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 ease-out ${
                        activeTab === ('bookings' as TabType) 
                          ? 'bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] scale-x-100' 
                          : 'bg-transparent scale-x-0 group-hover:scale-x-100 group-hover:bg-gray-300'
                      }`} />
                    </div>
              </button>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              {/* Single Line Horizontal Navbar - No Wrapping */}
              <div className="flex flex-nowrap gap-2 sm:gap-3 overflow-x-auto pb-2">
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-2 sm:p-3 min-w-[80px] sm:min-w-[100px] border border-blue-200">
                  <div className="flex flex-col items-center text-center">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mb-1 sm:mb-2" />
                    <p className="text-xs font-medium text-blue-700 mb-1">Total</p>
                    <p className="text-sm sm:text-lg font-bold text-blue-900">{stats.total}</p>
                  </div>
                </div>
                
                <div className="flex-shrink-0 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-2 sm:p-3 min-w-[80px] sm:min-w-[100px] border border-yellow-200">
                  <div className="flex flex-col items-center text-center">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mb-1 sm:mb-2" />
                    <p className="text-xs font-medium text-yellow-700 mb-1">En attente</p>
                    <p className="text-sm sm:text-lg font-bold text-yellow-900">{stats.pending}</p>
                  </div>
                </div>
                
                <div className="flex-shrink-0 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-2 sm:p-3 min-w-[80px] sm:min-w-[100px] border border-green-200">
                  <div className="flex flex-col items-center text-center">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mb-1 sm:mb-2" />
                    <p className="text-xs font-medium text-green-700 mb-1">Confirmées</p>
                    <p className="text-sm sm:text-lg font-bold text-green-900">{stats.confirmed}</p>
                  </div>
                </div>
                
                <div className="flex-shrink-0 bg-gradient-to-r from-[#4A7C59]/10 to-[#2C3E37]/10 rounded-xl p-2 sm:p-3 min-w-[80px] sm:min-w-[100px] border border-[#4A7C59]/20">
                  <div className="flex flex-col items-center text-center">
                    <Euro className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A7C59] mb-1 sm:mb-2" />
                    <p className="text-xs font-medium text-[#4A7C59] mb-1">Total Dépensé</p>
                    <p className="text-sm sm:text-lg font-bold text-[#2C3E37]">{formatPrice(stats.totalSpent)}</p>
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
              
              {bookings.length === 0 ? (
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
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Parcourir les propriétés</h2>
            {/* Properties browsing content */}
            <p className="text-gray-600">Exploration des propriétés à venir...</p>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Historique des réservations</h2>
                <p className="text-gray-600 mt-1">Gérez et suivez toutes vos réservations</p>
              </div>
            </div>

            {/* Enhanced Filters and Search */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Status Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      selectedStatus === 'all'
                        ? 'bg-[#4A7C59] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tous ({stats.total})
                  </button>
                  <button
                    onClick={() => setSelectedStatus('pending')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      selectedStatus === 'pending'
                        ? 'bg-yellow-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    En Attente ({stats.pending})
                  </button>
                  <button
                    onClick={() => setSelectedStatus('confirmed')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      selectedStatus === 'confirmed'
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Confirmées ({stats.confirmed})
                  </button>
                  <button
                    onClick={() => setSelectedStatus('completed')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      selectedStatus === 'completed'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Terminées ({stats.completed})
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par propriété, lieu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-[#4A7C59] transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Bookings List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">
                  Réservations ({filteredBookings.length})
                </h3>
              </div>

              {filteredBookings.length === 0 ? (
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
                            <div className="relative h-32 rounded-xl overflow-hidden">
                              <img
                                src={booking.properties.images[0]}
                                alt={booking.properties.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                          )}
                        </div>

                        {/* Booking Details */}
                        <div className="space-y-3">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-blue-600" />
                              Détails Réservation
                            </h5>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">Arrivée:</span>
                                <span className="text-gray-900">{formatDate(booking.check_in_date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">Départ:</span>
                                <span className="text-gray-900">{formatDate(booking.check_out_date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-900">{booking.guest_count} invités</span>
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

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mon profil</h2>
            
            {/* Profile Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Mon Profil
                  </h3>
                  <p className="text-gray-600">Client</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="text-gray-900">{userProfile?.email || 'Non renseigné'}</p>
                    </div>
                  </div>
                  
                  {userProfile?.address && (
                    <div className="flex items-center space-x-3">
                      <LocationIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Adresse</p>
                        <p className="text-gray-900">{userProfile.address}</p>
                      </div>
                    </div>
                  )}

                  {userProfile?.reservation_type && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Type de réservation préféré</p>
                        <p className="text-gray-900">{userProfile.reservation_type}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Statistiques</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{bookings.length}</p>
                        <p className="text-sm text-gray-600">Réservations</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {formatPrice(bookings.reduce((sum, booking) => sum + booking.total_price, 0))}
                        </p>
                        <p className="text-sm text-gray-600">Total dépensé</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] hover:from-[#2C3E37] hover:to-[#4A7C59] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#4A7C59]/25">
                  Modifier mon profil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Détails de la réservation
                </h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Property Info */}
                <div className="space-y-6">
                  {/* Property Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-blue-600" />
                      Informations Propriété
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Nom de la propriété</p>
                        <p className="text-lg font-bold text-gray-900">{selectedBooking.properties.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{selectedBooking.properties.location}</span>
                      </div>
                    </div>

                    {/* Property Image */}
                    {selectedBooking.properties.images && selectedBooking.properties.images.length > 0 && (
                      <div className="mt-4 relative h-48 rounded-xl overflow-hidden">
                        <img
                          src={selectedBooking.properties.images[0]}
                          alt={selectedBooking.properties.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Booking Details and Status */}
                <div className="space-y-6">
                  {/* Booking Details */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-green-600" />
                      Détails de la Réservation
                    </h3>
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

                  {/* Status Information */}
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                      Statut de la Réservation
                    </h3>
                    <div className="space-y-3">
                      <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border ${getStatusColor(selectedBooking.status)}`}>
                        {getStatusIcon(selectedBooking.status)}
                        <span className="font-semibold capitalize">
                          {getStatusText(selectedBooking.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedBooking.status === 'pending' ? 'Votre réservation est en attente de confirmation par le propriétaire.' :
                         selectedBooking.status === 'confirmed' ? 'Votre réservation a été confirmée ! Vous pouvez procéder au paiement.' :
                         selectedBooking.status === 'completed' ? 'Votre séjour s\'est bien déroulé et la réservation est terminée.' : 'La réservation a été annulée.'}
                      </p>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {selectedBooking.special_requests && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-6 h-6 text-purple-600" />
                        Demandes Spéciales
                      </h3>
                      <div className="bg-white/50 rounded-xl p-4">
                        <p className="text-gray-700 leading-relaxed">{selectedBooking.special_requests}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 