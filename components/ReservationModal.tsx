"use client";

import { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  Euro, 
  MapPin, 
  Clock, 
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Filter,
  ChevronDown
} from 'lucide-react';
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

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName?: string;
}

export default function ReservationModal({ isOpen, onClose, propertyId, propertyName }: ReservationModalProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    console.log('🔍 ReservationModal useEffect:', { isOpen, propertyId });
    if (isOpen && propertyId) {
      console.log('🔍 Loading reservations for property:', propertyId);
      loadReservations();
    }
  }, [isOpen, propertyId]);

  useEffect(() => {
    filterReservations();
  }, [reservations, selectedStatus]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching reservations from:', `/api/bookings?propertyId=${propertyId}`);
      const response = await fetch(`/api/bookings?propertyId=${propertyId}`);
      const result = await response.json();
      
      console.log('🔍 Reservation response:', result);
      
      if (response.ok && result.data) {
        setReservations(result.data);
        console.log('🔍 Reservations loaded:', result.data.length);
      } else {
        setError(result.error || 'Failed to load reservations');
        setReservations([]);
        console.error('🔍 Error loading reservations:', result.error);
      }
    } catch (error) {
      console.error('Error loading reservations:', error);
      setError('Failed to load reservations');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    if (selectedStatus === 'all') {
      setFilteredReservations(reservations);
    } else {
      setFilteredReservations(reservations.filter(reservation => reservation.status === selectedStatus));
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) {
    console.log('🔍 Modal not open, returning null');
    return null;
  }

  console.log('🔍 Rendering ReservationModal:', { isOpen, propertyId, propertyName });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Réservations
            </h2>
            {propertyName && (
              <p className="text-gray-600 mt-1">{propertyName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Filter Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filtrer par statut:</span>
            </div>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmées</option>
                <option value="cancelled">Annulées</option>
                <option value="completed">Terminées</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="text-sm text-gray-600">
              {filteredReservations.length} réservation{filteredReservations.length > 1 ? 's' : ''} trouvée{filteredReservations.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#2d5016]" />
              <span className="ml-3 text-gray-600">Chargement des réservations...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedStatus !== 'all' ? 'Aucune réservation trouvée' : 'Aucune réservation'}
              </h3>
              <p className="text-gray-600">
                {selectedStatus !== 'all' 
                  ? `Aucune réservation avec le statut "${getStatusText(selectedStatus)}" n'a été trouvée.`
                  : 'Aucune réservation n\'a été trouvée pour cette propriété.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#2d5016] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {reservation.full_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {reservation.email_or_phone}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(reservation.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(reservation.status)}
                        <span>{getStatusText(reservation.status)}</span>
                      </div>
                    </Badge>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {/* Dates */}
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-[#2d5016]" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(reservation.check_in_date)} - {formatDate(reservation.check_out_date)}
                        </p>
                        <p className="text-xs text-gray-600">Période de séjour</p>
                      </div>
                    </div>

                    {/* Guests */}
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-[#2d5016]" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {reservation.guest_count} {reservation.guest_count > 1 ? 'invités' : 'invité'}
                        </p>
                        <p className="text-xs text-gray-600">Nombre de personnes</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center space-x-2">
                      <Euro className="w-4 h-4 text-[#2d5016]" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          €{reservation.total_price}
                        </p>
                        <p className="text-xs text-gray-600">Prix total</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Travel Type */}
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#2d5016] rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        Type de voyage: <span className="font-medium text-gray-900 capitalize">
                          {reservation.travel_type}
                        </span>
                      </span>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Créé le {formatDateTime(reservation.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {reservation.special_requests && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Demandes spéciales:
                      </p>
                      <p className="text-sm text-blue-800">
                        {reservation.special_requests}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 