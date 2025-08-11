"use client";

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Home, 
  Calendar, 
  Settings, 
  Plus, 
  Edit, 
  Eye, 
  Star, 
  MapPin, 
  Users, 
  Euro,
  TreePine,
  LogOut,
  Mail,
  TrendingUp,
  TrendingDown,
  Camera,
  Wifi,
  Coffee,
  Car,
  Bath,
  Bed,
  Mountain,
  Tent,
  Castle,
  Caravan,
  Filter,
  MoreVertical,
  Trash2,
  Menu,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  ChevronDown,
  Search,
  CheckCircle2,
  Ban,
  X
} from 'lucide-react';
import { useAuthContext } from './AuthProvider';
import PropertyForm from './PropertyForm';
import { useRouter } from 'next/navigation';
import ReservationModal from '@/components/ReservationModal';
import { Badge } from '@/components/ui/badge';

interface Property {
  id: string;
  name: string;
  category: string;
  location: string;
  price_per_night: number;
  max_guests: number;
  rating: number;
  is_available: boolean;
  images: string[];
  description: string;
  maps_link: string;
  created_at: string;
}

interface Reservation {
  id: string;
  property_id: string;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  guest_count: number;
  special_requests?: string;
  full_name: string;
  email_or_phone: string;
  travel_type: string;
  created_at: string;
  property?: {
    id: string;
    name: string;
    location: string;
    images: string[];
    price_per_night: number;
  };
  client?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export default function GlampingDashboard() {
  const { userProfile, getOwnerProperties, getOwnerBookings, signOut } = useAuthContext();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedPropertyName, setSelectedPropertyName] = useState<string>('');
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [selectedBookingStatus, setSelectedBookingStatus] = useState<string>('all');
  const [filteredBookings, setFilteredBookings] = useState<Reservation[]>([]);
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (userProfile?.id) {
      loadData();
    }
  }, [userProfile]);

  useEffect(() => {
    if (activeTab === 'bookings') {
      loadBookings();
    }
  }, [activeTab]);

  useEffect(() => {
    filterBookings();
  }, [bookings, selectedBookingStatus, bookingSearchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadProperties(),
        loadBookings()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      if (userProfile?.id) {
        const propertiesData = await getOwnerProperties(userProfile.id);
        if (propertiesData.data) {
          setProperties(propertiesData.data);
        }
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const loadBookings = async () => {
    try {
      if (userProfile?.id) {
        const bookingsData = await getOwnerBookings(userProfile.id);
        if (bookingsData.data) {
          setBookings(bookingsData.data);
        }
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Filter by status
    if (selectedBookingStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === selectedBookingStatus);
    }

    // Filter by search query
    if (bookingSearchQuery) {
      const query = bookingSearchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.property?.name.toLowerCase().includes(query) ||
        booking.property?.location.toLowerCase().includes(query) ||
        booking.full_name.toLowerCase().includes(query) ||
        booking.email_or_phone.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setShowPropertyForm(true);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette propriété ? Cette action est irréversible.')) {
      return;
    }

    try {
      setDeletingProperty(propertyId);
      
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the property from local state
        setProperties(prevProperties => 
          prevProperties.filter(property => property.id !== propertyId)
        );
        
        // Show success message
        alert('Propriété supprimée avec succès !');
        
        // Refresh the data
        await loadProperties();
      } else {
        const errorData = await response.json();
        console.error('Error deleting property:', errorData);
        alert(`Erreur lors de la suppression: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Erreur lors de la suppression de la propriété');
    } finally {
      setDeletingProperty(null);
    }
  };

  const handlePropertySuccess = async () => {
    setShowPropertyForm(false);
    setEditingProperty(null);
    
    // Show success message
    setSuccessMessage(editingProperty ? 'Propriété mise à jour avec succès !' : 'Propriété ajoutée avec succès !');
    setShowSuccessMessage(true);
    
    // Hide success message after 5 seconds
    setTimeout(() => setShowSuccessMessage(false), 5000);
    
    // Refresh the entire dashboard data
    await loadData();
  };

  const handleReservationClick = (e: React.MouseEvent, propertyId: string, propertyName: string) => {
    e.preventDefault();
    setSelectedPropertyId(propertyId);
    setSelectedPropertyName(propertyName);
    setShowReservationModal(true);
  };

  const handleCloseReservationModal = () => {
    setShowReservationModal(false);
    setSelectedPropertyId(null);
    setSelectedPropertyName('');
  };

  const handleStatusUpdate = async (reservationId: string, newStatus: string) => {
    try {
      setUpdatingBooking(reservationId);
      
      const response = await fetch(`/api/bookings/${reservationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update the local state
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === reservationId 
              ? { ...booking, status: newStatus as any }
              : booking
          )
        );
        
        // Show success message
        alert(`Réservation ${newStatus === 'confirmed' ? 'confirmée' : newStatus === 'cancelled' ? 'annulée' : 'mise à jour'} avec succès !`);
        
        // Refresh the data
        await loadBookings();
      } else {
        const errorData = await response.json();
        console.error('Error updating booking:', errorData);
        alert(`Erreur lors de la mise à jour: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdatingBooking(null);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.')) {
      return;
    }

    try {
      setDeletingBooking(bookingId);
      
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the booking from local state
        setBookings(prevBookings => 
          prevBookings.filter(booking => booking.id !== bookingId)
        );
        
        // Show success message
        alert('Réservation supprimée avec succès !');
        
        // Refresh the data
        await loadBookings();
      } else {
        const errorData = await response.json();
        console.error('Error deleting booking:', errorData);
        alert(`Erreur lors de la suppression: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Erreur lors de la suppression de la réservation');
    } finally {
      setDeletingBooking(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Calculate stats for bookings
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    revenue: bookings.reduce((sum, b) => {
      if (b.status === 'completed' || b.status === 'confirmed') {
        return sum + b.total_price;
      }
      return sum;
    }, 0)
  };

  // Helper functions for status handling
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'confirmed':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'completed':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'cancelled':
        return 'border-red-200 bg-red-50 text-red-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmée';
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Helper function to format prices
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Helper function to get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  // Helper function to get category label
  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'treehouse': 'Cabane dans les arbres',
      'yurt': 'Yourte',
      'tent': 'Tente',
      'cabin': 'Chalet',
      'caravan': 'Caravane',
      'castle': 'Château',
      'mountain': 'Montagne',
      'beach': 'Plage',
      'forest': 'Forêt',
      'countryside': 'Campagne'
    };
    return categoryMap[category] || category;
  };

  // Helper function to get reservation count for a property
  const getReservationCount = (propertyId: string) => {
    return bookings.filter(booking => 
      booking.property_id === propertyId && 
      ['pending', 'confirmed'].includes(booking.status)
    ).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
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

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-lg max-w-md">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="flex-shrink-0 text-green-400 hover:text-green-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Bonjour Banner */}
        <div className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                {getGreeting()}, {userProfile?.full_name?.split(' ')[0] || 'Propriétaire'}!
              </h2>
              <p className="text-green-100 text-lg">
                Découvrez vos propriétés et gérez vos réservations
              </p>
            </div>
            <button
              onClick={() => setShowPropertyForm(true)}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium transition-all hover:bg-white/30 hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Ajouter une propriété
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 rounded-t-2xl mb-8">
          <div className="max-w-7xl mx-auto px-1 sm:px-2 md:px-4 lg:px-8">
            <div className="flex space-x-0 sm:space-x-0.5 md:space-x-1 lg:space-x-2 xl:space-x-4 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 sm:py-3 md:py-4 px-1 sm:px-1.5 md:px-2 lg:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'dashboard'
                    ? 'border-[#4A7C59] text-[#4A7C59]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2">
                  <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xl:inline">Vue d'ensemble</span>
                  <span className="hidden lg:inline xl:hidden">Vue d'ensemble</span>
                  <span className="hidden md:inline lg:hidden">Vue d'ensemble</span>
                  <span className="hidden sm:inline md:hidden">Vue d'ensemble</span>
                  <span className="sm:hidden">Vue</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className={`py-2 sm:py-3 md:py-4 px-1 sm:px-1.5 md:px-2 lg:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'properties'
                    ? 'border-[#4A7C59] text-[#4A7C59]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2">
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xl:inline">Propriétés</span>
                  <span className="hidden lg:inline xl:hidden">Propriétés</span>
                  <span className="hidden md:inline lg:hidden">Propriétés</span>
                  <span className="hidden sm:inline md:hidden">Propriétés</span>
                  <span className="sm:hidden">Props</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-2 sm:py-3 md:py-4 px-1 sm:px-1.5 md:px-2 lg:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'bookings'
                    ? 'border-[#4A7C59] text-[#4A7C59]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xl:inline">Réservations</span>
                  <span className="hidden lg:inline xl:hidden">Réservations</span>
                  <span className="hidden md:inline lg:hidden">Réservations</span>
                  <span className="hidden sm:inline md:hidden">Réservations</span>
                  <span className="sm:hidden">Réserv</span>
                  {bookings.length > 0 && (
                    <span className="bg-[#4A7C59] text-white text-xs rounded-full px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 min-w-[14px] sm:min-w-[16px] md:min-w-[20px] text-center text-xs">
                      {bookings.length}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Overview Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher vos propriétés..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Propriétés</p>
                    <p className="text-2xl font-bold text-[#2C3E37]">{properties.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Home className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Réservations</p>
                    <p className="text-2xl font-bold text-[#2C3E37]">{bookings.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Revenus</p>
                    <p className="text-2xl font-bold text-[#2C3E37]">{formatPrice(bookings.reduce((sum, b) => sum + ((b.status === 'completed' || b.status === 'confirmed') ? b.total_price : 0), 0))}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Euro className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Mes Propriétés</h2>
                <button
                  onClick={() => setShowPropertyForm(true)}
                  className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] text-white px-4 py-2 rounded-xl font-medium transition-all hover:shadow-lg flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>
              
              {properties.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                  <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune propriété</h3>
                  <p className="text-gray-600 mb-6">
                    Commencez par ajouter votre première propriété pour la louer
                  </p>
                  <button
                    onClick={() => setShowPropertyForm(true)}
                    className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg"
                  >
                    Ajouter une propriété
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {properties
                    .filter(property => 
                      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      property.location.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((property) => (
                    <div key={property.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 group cursor-pointer">
                      <div className="relative h-48 sm:h-52 lg:h-48 xl:h-52 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                        {property.images && property.images.length > 0 ? (
                          <img 
                            src={property.images[0]} 
                            alt={property.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                          </div>
                        )}
                    
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-[#4A7C59] text-white px-3 py-2 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm">
                            {getCategoryLabel(property.category)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 sm:p-5 lg:p-4 xl:p-5">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-[#2C3E37] text-base sm:text-lg group-hover:text-green-600 transition-colors duration-300 line-clamp-1">{property.name}</h3>
                          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                            €{property.price_per_night}
                          </div>
                        </div>
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
                        
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProperty(property);
                            }}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 hover:scale-105"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReservationClick(e, property.id, property.name);
                            }}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 hover:scale-105 relative"
                          >
                            <Calendar className="w-4 h-4" />
                            <span>Reserve</span>
                            <span className="ml-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium min-w-[20px] text-center text-xs">
                              {getReservationCount(property.id)}
                            </span>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProperty(property.id);
                            }}
                            disabled={deletingProperty === property.id}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 hover:scale-105"
                          >
                            {deletingProperty === property.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher vos propriétés..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Properties Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    Mes Propriétés ({properties.filter(property => 
                      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      property.location.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length})
                  </h3>
                  <button
                    onClick={() => setShowPropertyForm(true)}
                    className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] text-white px-4 py-2 rounded-xl font-medium transition-all hover:shadow-lg flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter</span>
                  </button>
                </div>
              </div>

              {properties.length === 0 ? (
                <div className="p-12 text-center">
                  <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune propriété</h3>
                  <p className="text-gray-500 mb-6">
                    Commencez par ajouter votre première propriété pour la louer
                  </p>
                  <button
                    onClick={() => setShowPropertyForm(true)}
                    className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg"
                  >
                    Ajouter une propriété
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {properties
                    .filter(property => 
                      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      property.location.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((property) => (
                    <div key={property.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Property Image */}
                        <div className="lg:col-span-1">
                          {property.images && property.images.length > 0 ? (
                            <div className="w-full h-32 rounded-lg overflow-hidden">
                              <img
                                src={property.images[0]}
                                alt={property.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Camera className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Property Details */}
                        <div className="lg:col-span-2 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-xl font-bold text-gray-900 mb-1">
                                {property.name}
                              </h4>
                              <p className="text-gray-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {property.location}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="bg-[#4A7C59] text-white px-3 py-1 rounded-full text-sm font-medium">
                                {getCategoryLabel(property.category)}
                              </span>
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                €{property.price_per_night}/nuit
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Bed className="w-4 h-4" />
                              <span>{property.max_guests} invités maximum</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{getReservationCount(property.id)} réservations actives</span>
                            </div>
                          </div>

                          {property.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {property.description}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="lg:col-span-1 space-y-2">
                          <button 
                            onClick={() => handleEditProperty(property)}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 hover:scale-105"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Modifier</span>
                          </button>
                          <button 
                            onClick={(e) => handleReservationClick(e, property.id, property.name)}
                            className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 hover:scale-105"
                          >
                            <Calendar className="w-4 h-4" />
                            <span>Voir réservations</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteProperty(property.id)}
                            disabled={deletingProperty === property.id}
                            className="w-full bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 hover:scale-105 disabled:opacity-50"
                          >
                            {deletingProperty === property.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                <span>Supprimer</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookings Management Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Horizontal Stats Navbar - Responsive Design */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              {/* Single Line Horizontal Navbar - No Wrapping */}
              <div className="flex flex-nowrap gap-2 sm:gap-3 overflow-x-auto pb-2">
                {/* Total */}
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-2 sm:p-3 border border-blue-200 min-w-[80px] sm:min-w-[100px]">
                  <div className="flex flex-col items-center text-center">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mb-1 sm:mb-2" />
                    <p className="text-xs font-medium text-blue-700 mb-1">Total</p>
                    <p className="text-sm sm:text-lg font-bold text-blue-900">{stats.total}</p>
                  </div>
                </div>
                
                {/* En attente */}
                <div className="flex-shrink-0 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-2 sm:p-3 border border-yellow-200 min-w-[80px] sm:min-w-[100px]">
                  <div className="flex flex-col items-center text-center">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mb-1 sm:mb-2" />
                    <p className="text-xs font-medium text-yellow-700 mb-1">En attente</p>
                    <p className="text-sm sm:text-lg font-bold text-yellow-900">{stats.pending}</p>
                  </div>
                </div>
                
                {/* Confirmées */}
                <div className="flex-shrink-0 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-2 sm:p-3 border border-green-200 min-w-[80px] sm:min-w-[100px]">
                  <div className="flex flex-col items-center text-center">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mb-1 sm:mb-2" />
                    <p className="text-xs font-medium text-green-700 mb-1">Confirmées</p>
                    <p className="text-sm sm:text-lg font-bold text-green-900">{stats.confirmed}</p>
                  </div>
                </div>
                
                {/* Annulées */}
                <div className="flex-shrink-0 bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-2 sm:p-3 border border-red-200 min-w-[80px] sm:min-w-[100px]">
                  <div className="flex flex-col items-center text-center">
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mb-1 sm:mb-2" />
                    <p className="text-xs font-medium text-red-700 mb-1">Annulées</p>
                    <p className="text-sm sm:text-lg font-bold text-red-900">{stats.cancelled}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gestion des réservations</h2>
                <p className="text-gray-600 mt-1">Confirmez, annulez ou supprimez les réservations de vos clients</p>
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
                      placeholder="Rechercher par nom de propriété, localisation, client..."
                      value={bookingSearchQuery}
                      onChange={(e) => setBookingSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={selectedBookingStatus}
                    onChange={(e) => setSelectedBookingStatus(e.target.value)}
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

              {filteredBookings.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Aucune réservation trouvée
                  </h3>
                  <p className="text-gray-500">
                    {selectedBookingStatus !== 'all' || bookingSearchQuery 
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
                                {booking.property ? booking.property.name : 'Propriété supprimée'}
                              </h4>
                              <p className="text-gray-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {booking.property ? booking.property.location : 'Localisation inconnue'}
                              </p>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              <span className="text-sm font-medium capitalize">
                                {getStatusText(booking.status)}
                              </span>
                            </div>
                          </div>

                          {/* Property Image - Only show if property exists */}
                          {booking.property?.images && booking.property.images.length > 0 && (
                            <div className="w-full h-32 rounded-lg overflow-hidden">
                              <img
                                src={booking.property.images[0]}
                                alt={booking.property.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Show placeholder if property was deleted */}
                          {!booking.property && (
                            <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                              <div className="text-center text-gray-500">
                                <Home className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">Propriété supprimée</p>
                              </div>
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
                                <span className="font-medium text-gray-700">Nom:</span> {booking.full_name}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Contact:</span> {booking.email_or_phone}
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

                        {/* Actions and Price */}
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
                          <div className="space-y-2">
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                  disabled={updatingBooking === booking.id}
                                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                  {updatingBooking === booking.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-4 h-4" />
                                      Confirmer
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                  disabled={updatingBooking === booking.id}
                                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                  {updatingBooking === booking.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  ) : (
                                    <>
                                      <Ban className="w-4 h-4" />
                                      Refuser
                                    </>
                                  )}
                                </button>
                              </>
                            )}
                            
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                disabled={updatingBooking === booking.id}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                {updatingBooking === booking.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    Marquer comme terminée
                                  </>
                                )}
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              disabled={deletingBooking === booking.id}
                              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-gray-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {deletingBooking === booking.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4" />
                                  Supprimer
                                </>
                              )}
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

      {/* Property Form Modal */}
      {showPropertyForm && (
        <PropertyForm
          isOpen={showPropertyForm}
          onClose={() => {
            setShowPropertyForm(false);
            setEditingProperty(null);
          }}
          property={editingProperty}
          onSuccess={handlePropertySuccess}
        />
      )}

      {/* Reservation Modal */}
      {showReservationModal && selectedPropertyId && (
        <ReservationModal
          isOpen={showReservationModal}
          onClose={handleCloseReservationModal}
          propertyId={selectedPropertyId}
          propertyName={selectedPropertyName}
        />
      )}
    </div>
  );
} 