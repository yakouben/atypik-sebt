"use client";

import { useState, useEffect } from 'react';
import { 
  Home, 
  Calendar, 
  Euro, 
  User, 
  Settings, 
  LogOut, 
  Plus, 
  Mail,
  MapPin as LocationIcon,
  Clock
} from 'lucide-react';
import { useAuthContext } from './AuthProvider';
import OwnerBookingsDashboard from './OwnerBookingsDashboard';

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
  created_at: string;
}

interface Booking {
  id: string;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  status: string;
  guest_count: number;
  properties: {
    id: string;
    name: string;
    location: string;
  };
  profiles: {
    full_name: string;
    email: string;
  };
  property: {
    id: string;
  };
}

export default function OwnerDashboard() {
  const { userProfile, getOwnerProperties, getOwnerBookings, signOut } = useAuthContext();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showReservations, setShowReservations] = useState(false);
  const [refreshingBookings, setRefreshingBookings] = useState(false);

  useEffect(() => {
    if (userProfile?.id) {
      loadOwnerData();
      refreshBookingData();
    }
  }, [userProfile]);

  useEffect(() => {
    if (activeTab === 'bookings') {
      refreshBookingData();
    }
  }, [activeTab]);

  const loadOwnerData = async () => {
    setLoading(true);
    try {
      const [propertiesData, bookingsData] = await Promise.all([
        getOwnerProperties(userProfile!.id),
        getOwnerBookings(userProfile!.id)
      ]);

      if (propertiesData.data) setProperties(propertiesData.data);
      if (bookingsData.data) setBookings(bookingsData.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh booking data
  const refreshBookingData = async () => {
    try {
      const response = await fetch('/api/bookings/owner');
      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setBookings(result.data);
          console.log('Bookings refreshed:', result.data);
        }
      }
    } catch (error) {
      console.error('Error refreshing booking data:', error);
    }
  };

  // Calculate total revenue from confirmed and completed bookings
  const calculateTotalRevenue = () => {
    return bookings
      .filter(booking => booking.status === 'confirmed' || booking.status === 'completed')
      .reduce((sum, booking) => sum + booking.total_price, 0);
  };

  // Get booking count by status
  const getBookingCountByStatus = (status: string) => {
    return bookings.filter(booking => booking.status === status).length;
  };

  // Get reservation count for a specific property
  const getPropertyBookingCount = (propertyId: string) => {
    console.log('Checking property ID:', propertyId);
    console.log('All bookings:', bookings);
    
    const count = bookings.filter(booking => {
      // Try both possible property ID fields
      const bookingPropertyId = booking.property?.id || booking.properties?.id;
      console.log('Booking property ID:', bookingPropertyId, 'Matches:', bookingPropertyId === propertyId);
      return bookingPropertyId === propertyId;
    }).length;
    
    console.log('Final count for property', propertyId, ':', count);
    return count;
  };

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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/logo-svg.png" 
                alt="AtypikHouse Logo" 
                className="w-20 h-20 object-contain mr-3"
              />
              <h1 className="text-xl font-semibold text-gray-900">Tableau de bord propriétaire</h1>
          </div>
          <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bonjour, {userProfile?.full_name || 'Propriétaire'}
              </span>
            <button 
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-[#2d5016] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Tableau de bord</span>
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'properties' 
                ? 'bg-[#2d5016] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Propriétés</span>
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'bookings' 
                ? 'bg-[#2d5016] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Réservations</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'settings' 
                ? 'bg-[#2d5016] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Paramètres</span>
          </button>
        </div>

        {/* Content */}
      <div className="p-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Enhanced Stats Cards */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
              <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 min-w-[160px] border border-blue-200">
                  <div className="flex flex-col items-center text-center">
                    <Home className="w-8 h-8 text-blue-500 mb-2" />
                    <p className="text-xs font-medium text-blue-600 mb-1">Total Propriétés</p>
                    <p className="text-2xl font-bold text-blue-900">{properties.length}</p>
                  </div>
                </div>
                
                <div className="flex-shrink-0 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 min-w-[160px] border border-yellow-200">
                  <div className="flex flex-col items-center text-center">
                    <Calendar className="w-8 h-8 text-yellow-500 mb-2" />
                    <p className="text-xs font-medium text-yellow-600 mb-1">Total Réservations</p>
                    <p className="text-2xl font-bold text-yellow-900">{bookings.length}</p>
                  </div>
                </div>
                
                <div className="flex-shrink-0 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 min-w-[160px] border border-green-200">
                  <div className="flex flex-col items-center text-center">
                    <Clock className="w-8 h-8 text-green-500 mb-2" />
                    <p className="text-xs font-medium text-green-600 mb-1">En Attente</p>
                    <p className="text-2xl font-bold text-green-900">
                      {bookings.filter(b => b.status === 'pending').length}
                    </p>
                  </div>
                </div>
                
                <div className="flex-shrink-0 bg-gradient-to-r from-[#4A7C59]/10 to-[#2C3E37]/10 rounded-xl p-4 min-w-[160px] border border-[#4A7C59]/20">
                  <div className="flex flex-col items-center text-center">
                    <Euro className="w-8 h-8 text-[#4A7C59] mb-2" />
                    <p className="text-xs font-medium text-[#4A7C59] mb-1">Revenus Totaux</p>
                    <p className="text-2xl font-bold text-[#2C3E37]">
                      €{bookings
                        .filter(b => b.status === 'confirmed' || b.status === 'completed')
                        .reduce((sum, b) => sum + b.total_price, 0)
                        .toLocaleString()}
                    </p>
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

            {/* Debug Section - Remove after fixing */}
            {bookings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-yellow-800 mb-2">Debug Info (Remove after fixing)</h3>
                <div className="text-sm text-yellow-700">
                  <p>Total bookings: {bookings.length}</p>
                  <p>Property IDs: {properties.map(p => p.id).join(', ')}</p>
                  <p>Booking property IDs: {bookings.map(b => b.property?.id || b.properties?.id || 'undefined').join(', ')}</p>
                </div>
              </div>
            )}

            {/* Add Property Button */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ajouter une nouvelle propriété
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Commencez à louer votre propriété en l'ajoutant à notre plateforme
                  </p>
                  <button className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] hover:from-[#2C3E37] hover:to-[#4A7C59] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#4A7C59]/25">
                    <Plus className="w-5 h-5" />
                    <span>Ajouter une propriété</span>
                  </button>
                </div>
              </div>

              {/* Recent Bookings */}
              {bookings.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Réservations récentes</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{booking.properties.name}</h4>
                            <p className="text-sm text-gray-600">{booking.properties.location}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">€{booking.total_price}</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status === 'confirmed' ? 'Confirmée' :
                               booking.status === 'pending' ? 'En attente' : booking.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>
                </div>
              )}
          </div>
        )}

        {activeTab === 'properties' && (
          <div>
            {!showReservations ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Mes propriétés</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowReservations(true)}
                      className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] hover:from-[#2C3E37] hover:to-[#4A7C59] text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#4A7C59]/25 flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Voir les réservations
                    </button>
                    <button className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] hover:from-[#2C3E37] hover:to-[#4A7C59] text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#4A7C59]/25 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Ajouter
                    </button>
                  </div>
                </div>
                
                {/* Properties Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        Aucune propriété trouvée
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Commencez par ajouter votre première propriété pour la louer.
                      </p>
                      <button className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] hover:from-[#2C3E37] hover:to-[#4A7C59] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#4A7C59]/25 flex items-center gap-2 mx-auto">
                        <Plus className="w-5 h-5" />
                        Ajouter ma première propriété
                      </button>
                    </div>
                  ) : (
                    properties.map((property) => (
                      <div key={property.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                        {/* Property Image */}
                        <div className="relative h-48">
                          {property.images && property.images.length > 0 ? (
                            <img
                              src={property.images[0]}
                              alt={property.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <Home className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          
                          {/* Category Badge */}
                          <div className="absolute bottom-4 left-4">
                            <span className="bg-[#4A7C59]/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                              {property.type}
                            </span>
                          </div>
                        </div>

                        {/* Property Info */}
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-900 truncate">
                              {property.name}
                            </h3>
                            <span className="bg-[#4A7C59] text-white px-2 py-1 rounded-lg text-sm font-semibold">
                              €{property.price_per_night}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <LocationIcon className="w-4 h-4" />
                              <span>{property.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{property.max_guests} invités</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                            <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
                              <Settings className="w-4 h-4" />
                              Modifier
                            </button>
                            <button className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Réservations {getPropertyBookingCount(property.id)}
                            </button>
                            <button className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowReservations(false)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Retour aux propriétés
                    </button>
                    <h2 className="text-xl font-semibold text-gray-900">Réservations de mes propriétés</h2>
                  </div>
                </div>
                <OwnerBookingsDashboard onBookingUpdate={refreshBookingData} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
              <OwnerBookingsDashboard onBookingUpdate={refreshBookingData} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Paramètres</h2>
            
            {/* Profile Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {userProfile?.full_name || 'Propriétaire'}
                  </h3>
                  <p className="text-gray-600">Propriétaire</p>
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

                  {userProfile?.what_you_own && (
                    <div className="flex items-center space-x-3">
                      <Home className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Ce que vous possédez</p>
                        <p className="text-gray-900">{userProfile.what_you_own}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Statistiques</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{properties.length}</p>
                        <p className="text-sm text-gray-600">Propriétés</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{bookings.length}</p>
                        <p className="text-sm text-gray-600">Réservations</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] hover:from-[#2C3E37] hover:to-[#4A7C59] text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Modifier mon profil
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
} 