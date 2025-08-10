"use client";

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Euro, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Phone,
  Mail,
  User,
  Filter,
  Search,
  Eye,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from './AuthProvider';

interface Booking {
  id: string;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  guest_count: number;
  special_requests?: string;
  full_name: string;
  email_or_phone: string;
  travel_type: 'friends' | 'family';
  created_at: string;
  updated_at: string;
  property: {
    id: string;
    name: string;
    location: string;
    images: string[];
    price_per_night: number;
  };
  client: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

interface OwnerBookingsDashboardProps {
  onBookingUpdate?: () => void;
}

export default function OwnerBookingsDashboard({ onBookingUpdate }: OwnerBookingsDashboardProps) {
  const { userProfile } = useAuthContext();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0
  });
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (userProfile?.id) {
      loadBookings();
    }
  }, [userProfile]);

  useEffect(() => {
    filterBookings();
  }, [bookings, selectedStatus, searchQuery]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings/owner?ownerId=${userProfile!.id}`);
      const result = await response.json();
      
      if (response.ok && result.data) {
        setBookings(result.data);
        calculateStats(result.data);
      } else {
        console.error('Error loading bookings:', result.error);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsData: Booking[]) => {
    const stats = {
      total: bookingsData.length,
      pending: bookingsData.filter(b => b.status === 'pending').length,
      confirmed: bookingsData.filter(b => b.status === 'confirmed').length,
      completed: bookingsData.filter(b => b.status === 'completed').length,
      cancelled: bookingsData.filter(b => b.status === 'cancelled').length,
      revenue: bookingsData
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + b.total_price, 0)
    };
    setStats(stats);
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
        booking.full_name.toLowerCase().includes(query) ||
        booking.property.name.toLowerCase().includes(query) ||
        booking.property.location.toLowerCase().includes(query) ||
        booking.email_or_phone.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/bookings/${bookingId}`, {
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
            booking.id === bookingId 
              ? { ...booking, status: newStatus as any }
              : booking
          )
        );
        
        // Show success message
        alert(`Réservation ${newStatus === 'confirmed' ? 'confirmée' : 'annulée'} avec succès !`);
        
        // Refresh the data
        await loadBookings();
        
        // Call the callback to refresh parent data
        if (onBookingUpdate) {
          onBookingUpdate();
        }
      } else {
        const errorData = await response.json();
        console.error('Error updating booking:', errorData);
        alert(`Erreur lors de la mise à jour: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.')) {
      return;
    }

    try {
      setLoading(true);
      
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
        
        // Call the callback to refresh parent data
        if (onBookingUpdate) {
          onBookingUpdate();
        }
      } else {
        const errorData = await response.json();
        console.error('Error deleting booking:', errorData);
        alert(`Erreur lors de la suppression: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Erreur lors de la suppression de la réservation');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5016]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Cards with Modern Design */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
          <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 min-w-[160px] border border-blue-200">
            <div className="flex flex-col items-center text-center">
              <Calendar className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-xs font-medium text-blue-600 mb-1">Total Réservations</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
          </div>
          
          <div className="flex-shrink-0 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 min-w-[160px] border border-yellow-200">
            <div className="flex flex-col items-center text-center">
              <Clock className="w-8 h-8 text-yellow-500 mb-2" />
              <p className="text-xs font-medium text-yellow-600 mb-1">En Attente</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
          </div>
          
          <div className="flex-shrink-0 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 min-w-[160px] border border-green-200">
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-xs font-medium text-green-600 mb-1">Confirmées</p>
              <p className="text-2xl font-bold text-green-900">{stats.confirmed}</p>
            </div>
          </div>
          
          <div className="flex-shrink-0 bg-gradient-to-r from-[#4A7C59]/10 to-[#2C3E37]/10 rounded-xl p-4 min-w-[160px] border border-[#4A7C59]/20">
            <div className="flex flex-col items-center text-center">
              <Euro className="w-8 h-8 text-[#4A7C59] mb-2" />
              <p className="text-xs font-medium text-[#4A7C59] mb-1">Revenus</p>
              <p className="text-2xl font-bold text-[#2C3E37]">{formatPrice(stats.revenue)}</p>
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
              placeholder="Rechercher par nom, propriété, lieu..."
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
          <h2 className="text-2xl font-bold text-gray-900">
            Réservations ({filteredBookings.length})
          </h2>
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
                : 'Vous n\'avez pas encore de réservations pour vos propriétés.'
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
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {booking.property.name}
                        </h3>
                        <p className="text-gray-600 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {booking.property.location}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="text-sm font-medium capitalize">
                          {booking.status === 'pending' ? 'En attente' :
                           booking.status === 'confirmed' ? 'Confirmée' :
                           booking.status === 'completed' ? 'Terminée' : 'Annulée'}
                        </span>
                      </div>
                    </div>

                    {/* Property Image */}
                    {booking.property.images && booking.property.images.length > 0 && (
                      <div className="relative h-32 rounded-xl overflow-hidden">
                        <img
                          src={booking.property.images[0]}
                          alt={booking.property.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    )}
                  </div>

                  {/* Client Information */}
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-[#4A7C59]" />
                        Informations Client
                      </h4>
                      <div className="space-y-2">
                      <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">Nom:</span>
                          <span className="text-gray-900">{booking.full_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{booking.email_or_phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{booking.guest_count} {booking.guest_count > 1 ? 'invités' : 'invité'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm bg-[#4A7C59]/10 text-[#4A7C59] px-2 py-1 rounded-full">
                            {booking.travel_type === 'family' ? 'Famille' : 'Amis'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Détails Réservation
                      </h4>
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
                        <Euro className="w-4 h-4 text-gray-400" />
                          <span className="font-bold text-lg text-[#4A7C59]">{formatPrice(booking.total_price)}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Créée le {formatDate(booking.created_at)}
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {booking.special_requests && (
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          Demandes Spéciales
                        </h4>
                        <p className="text-sm text-gray-700">{booking.special_requests}</p>
                      </div>
                    )}
                  </div>
                  </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100">
                    <Button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowBookingModal(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Voir détails
                    </Button>
                    
                    {booking.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          size="sm"
                          className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] hover:from-[#2C3E37] hover:to-[#4A7C59] text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#4A7C59]/25"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Confirmer
                        </Button>
                        <Button
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Refuser
                        </Button>
                      </div>
                    )}

                    {/* Delete Button for all statuses */}
                    <Button
                      onClick={() => deleteBooking(booking.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Supprimer
                    </Button>
                </div>
              </div>
            ))}
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
                {/* Left Column - Property and Client Info */}
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
                        <p className="text-lg font-bold text-gray-900">{selectedBooking.property.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{selectedBooking.property.location}</span>
              </div>
                      <div className="flex items-center gap-2">
                        <Euro className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{formatPrice(selectedBooking.property.price_per_night)} par nuit</span>
                </div>
              </div>

                    {/* Property Image */}
                    {selectedBooking.property.images && selectedBooking.property.images.length > 0 && (
                      <div className="mt-4 relative h-48 rounded-xl overflow-hidden">
                        <img
                          src={selectedBooking.property.images[0]}
                          alt={selectedBooking.property.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    )}
                  </div>

                  {/* Client Information */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-6 h-6 text-[#4A7C59]" />
                      Informations Client
                    </h3>
                    <div className="space-y-3">
                  <div>
                        <p className="text-sm font-medium text-gray-600">Nom complet</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedBooking.full_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{selectedBooking.email_or_phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{selectedBooking.guest_count} {selectedBooking.guest_count > 1 ? 'invités' : 'invité'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm bg-[#4A7C59]/10 text-[#4A7C59] px-3 py-1 rounded-full font-medium">
                          {selectedBooking.travel_type === 'family' ? 'Voyage en famille' : 'Voyage entre amis'}
                        </span>
                      </div>
                    </div>
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
                          {selectedBooking.status === 'pending' ? 'En attente de confirmation' :
                           selectedBooking.status === 'confirmed' ? 'Réservation confirmée' :
                           selectedBooking.status === 'completed' ? 'Séjour terminé' : 'Réservation annulée'}
                  </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedBooking.status === 'pending' ? 'Le client attend votre confirmation pour cette réservation.' :
                         selectedBooking.status === 'confirmed' ? 'La réservation a été confirmée et le client peut procéder au paiement.' :
                         selectedBooking.status === 'completed' ? 'Le séjour s\'est bien déroulé et la réservation est terminée.' : 'La réservation a été annulée.'}
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

              {/* Action Buttons */}
              {selectedBooking.status === 'pending' && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, 'confirmed');
                      setShowBookingModal(false);
                    }}
                      className="flex-1 bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] hover:from-[#2C3E37] hover:to-[#4A7C59] text-white px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#4A7C59]/25"
                  >
                      <CheckCircle className="w-5 h-5 mr-2" />
                    Confirmer la réservation
                  </Button>
                  <Button
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, 'cancelled');
                      setShowBookingModal(false);
                    }}
                    variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl font-semibold text-lg"
                  >
                      <XCircle className="w-5 h-5 mr-2" />
                    Refuser la réservation
                  </Button>
                  </div>
                </div>
              )}

              {/* Delete Button in Modal */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => {
                      deleteBooking(selectedBooking.id);
                      setShowBookingModal(false);
                    }}
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl font-semibold text-lg"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Supprimer la réservation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 