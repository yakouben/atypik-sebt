"use client";

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Home, 
  Calendar, 
  Settings, 
  LogOut,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  MapPin,
  Euro,
  Users,
  Phone,
  Mail,
  CalendarDays,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { useAuthContext } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface Reservation {
  id: string;
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

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

export default function OwnerReservationsPage() {
  const { userProfile, signOut } = useAuthContext();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
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
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);

  useEffect(() => {
    if (userProfile?.id) {
      loadReservations();
    }
  }, [userProfile]);

  useEffect(() => {
    filterReservations();
  }, [reservations, selectedStatus, searchQuery]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings/owner?ownerId=${userProfile!.id}`);
      const result = await response.json();
      
      if (response.ok && result.data) {
        setReservations(result.data);
        calculateStats(result.data);
      } else {
        console.error('Error loading reservations:', result.error);
        setReservations([]);
      }
    } catch (error) {
      console.error('Error loading reservations:', error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Reservation[]) => {
    const stats = {
      total: data.length,
      pending: data.filter(r => r.status === 'pending').length,
      confirmed: data.filter(r => r.status === 'confirmed').length,
      completed: data.filter(r => r.status === 'completed').length,
      cancelled: data.filter(r => r.status === 'cancelled').length,
      revenue: data.reduce((sum, r) => sum + ((r.status === 'completed' || r.status === 'confirmed') ? r.total_price : 0), 0)
    };
    setStats(stats);
  };

  const filterReservations = () => {
    let filtered = reservations;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(reservation => 
        reservation.full_name.toLowerCase().includes(query) ||
        reservation.property?.name?.toLowerCase().includes(query) ||
        reservation.property?.location?.toLowerCase().includes(query) ||
        reservation.email_or_phone.toLowerCase().includes(query)
      );
    }

    setFilteredReservations(filtered);
  };

  const handleStatusUpdate = async (reservationId: string, newStatus: string) => {
    try {
      console.log('🔍 Updating reservation:', { reservationId, newStatus });
      
      const response = await fetch('/api/bookings/owner', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: reservationId,
          status: newStatus
        }),
      });

      console.log('🔍 Response status:', response.status);

      if (response.ok) {
        console.log('✅ Reservation updated successfully');
        // Reload reservations to get updated data
        await loadReservations();
      } else {
        const result = await response.json();
        console.error('❌ Error updating reservation:', result);
        alert('Error updating reservation: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Exception updating reservation:', error);
      alert('Error updating reservation: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
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

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (result.error) {
        alert('Erreur lors de la déconnexion. Veuillez réessayer.');
      } else {
        router.push('/hero');
      }
    } catch (error) {
      alert('Erreur lors de la déconnexion. Veuillez réessayer.');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
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
                <p className="text-gray-600 text-sm">Gérez vos réservations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => router.push('/dashboard/owner')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Tableau de bord</span>
            </button>
            <button 
              onClick={() => router.push('/dashboard/owner')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Mes propriétés</span>
            </button>
            <button className="flex items-center space-x-2 text-green-600 font-medium">
              <Calendar className="w-5 h-5" />
              <span>Réservations</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Settings className="w-5 h-5" />
              <span>Paramètres</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleSignOut}
              className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-sm border border-red-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard/owner')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour au tableau de bord</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Réservations</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Réservations</p>
                <p className="text-2xl font-bold text-[#2C3E37]">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Confirmées</p>
                <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Revenus</p>
                <p className="text-2xl font-bold text-[#2C3E37]">{formatPrice(stats.revenue)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Euro className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, propriété, localisation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

        {/* Reservations List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {filteredReservations.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || selectedStatus !== 'all' ? 'Aucune réservation trouvée' : 'Aucune réservation'}
              </h3>
              <p className="text-gray-600">
                {searchQuery || selectedStatus !== 'all' 
                  ? 'Aucune réservation ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore de réservations pour vos propriétés.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredReservations.map((reservation) => (
                <div key={reservation.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left side - Reservation details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#2C3E37] rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{reservation.full_name}</h3>
                            <p className="text-sm text-gray-600">{reservation.email_or_phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(reservation.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(reservation.status)}
                              <span>{getStatusText(reservation.status)}</span>
                            </div>
                          </Badge>
                          {reservation.status === 'pending' && (
                            <div className="relative">
                              <select
                                onChange={(e) => handleStatusUpdate(reservation.id, e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1 pr-8 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                defaultValue=""
                              >
                                <option value="" disabled>Action</option>
                                <option value="confirmed">Confirmer</option>
                                <option value="cancelled">Refuser</option>
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {reservation.property?.name || 'Propriété inconnue'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDate(reservation.check_in_date)} - {formatDate(reservation.check_out_date)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {reservation.guest_count} {reservation.guest_count > 1 ? 'personnes' : 'personne'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Euro className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPrice(reservation.total_price)}
                          </span>
                        </div>
                      </div>

                      {reservation.special_requests && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Demandes spéciales:</strong> {reservation.special_requests}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      {reservation.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(reservation.id, 'completed')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Marquer comme terminée
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setShowReservationModal(true);
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Voir détails</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 