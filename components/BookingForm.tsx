"use client";

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Euro, 
  X, 
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from './AuthProvider';

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    name: string;
    price_per_night: number;
    max_guests: number;
    location: string;
    images?: string[];
  };
}

interface BookingFormData {
  full_name: string;
  email_or_phone: string;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  special_requests: string;
  travel_type: 'friends' | 'family';
}

export default function BookingForm({ isOpen, onClose, property }: BookingFormProps) {
  const { userProfile } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    full_name: userProfile?.full_name || '',
    email_or_phone: userProfile?.email || '',
    check_in_date: '',
    check_out_date: '',
    guest_count: 1,
    special_requests: '',
    travel_type: 'family'
  });

  // Initialize form data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        full_name: userProfile.full_name || '',
        email_or_phone: userProfile.email || ''
      }));
    }
  }, [userProfile]);

  // Calculate total price and nights
  const calculateTotal = () => {
    if (!formData.check_in_date || !formData.check_out_date) return 0;
    
    const checkIn = new Date(formData.check_in_date);
    const checkOut = new Date(formData.check_out_date);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    return nights * property.price_per_night;
  };

  const totalPrice = calculateTotal();
  const nights = formData.check_in_date && formData.check_out_date 
    ? Math.ceil((new Date(formData.check_out_date).getTime() - new Date(formData.check_in_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleInputChange = (field: keyof BookingFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Custom calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateSelected = (date: Date, type: 'check_in' | 'check_out') => {
    const dateStr = date.toISOString().split('T')[0];
    return type === 'check_in' ? formData.check_in_date === dateStr : formData.check_out_date === dateStr;
  };

  const isDateInRange = (date: Date) => {
    if (!formData.check_in_date || !formData.check_out_date) return false;
    const dateStr = date.toISOString().split('T')[0];
    const checkIn = new Date(formData.check_in_date);
    const checkOut = new Date(formData.check_out_date);
    const currentDate = new Date(dateStr);
    return currentDate > checkIn && currentDate < checkOut;
  };

  const handleDateSelect = (date: Date, type: 'check_in' | 'check_out') => {
    if (isDateInPast(date)) return;
    
    const dateStr = date.toISOString().split('T')[0];
    
    if (type === 'check_in') {
      setFormData(prev => ({ ...prev, check_in_date: dateStr }));
      setShowCheckInCalendar(false);
      // If check-out date is before check-in date, clear it
      if (formData.check_out_date && dateStr >= formData.check_out_date) {
        setFormData(prev => ({ ...prev, check_out_date: '' }));
      }
    } else {
      if (!formData.check_in_date || dateStr <= formData.check_in_date) return;
      setFormData(prev => ({ ...prev, check_out_date: dateStr }));
      setShowCheckOutCalendar(false);
    }
  };

  const renderCalendar = (type: 'check_in' | 'check_out') => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isPast = isDateInPast(date);
      const isSelected = isDateSelected(date, type);
      const isInRange = isDateInRange(date);
      const isDisabled = isPast || (type === 'check_out' && (!formData.check_in_date || date.toISOString().split('T')[0] <= formData.check_in_date));

      days.push(
        <button
          key={day}
          onClick={() => !isDisabled && handleDateSelect(date, type)}
          disabled={isDisabled}
          className={`h-12 w-12 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
            isSelected 
              ? 'bg-gradient-to-br from-[#2d5016] to-[#1a3a0f] text-white shadow-xl scale-110 ring-4 ring-[#2d5016]/30' 
              : isInRange 
                ? 'bg-gradient-to-br from-[#2d5016]/20 to-[#1a3a0f]/20 text-[#2d5016] hover:bg-[#2d5016]/30 hover:scale-105 shadow-lg' 
                : isDisabled 
                  ? 'text-gray-500 cursor-not-allowed opacity-50' 
                  : 'text-white hover:bg-white/20 hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-white/30'
          }`}
        >
          {isSelected && (
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
          )}
          <span className="relative z-10">{day}</span>
        </button>
      );
    }

    return days;
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.email_or_phone.trim()) {
      setError('Please enter your email or phone number');
      return false;
    }
    if (!formData.check_in_date) {
      setError('Please select a check-in date');
      return false;
    }
    if (!formData.check_out_date) {
      setError('Please select a check-out date');
      return false;
    }
    if (formData.guest_count < 1) {
      setError('Guest count must be at least 1');
      return false;
    }
    if (formData.guest_count > property.max_guests) {
      setError(`Maximum ${property.max_guests} guests allowed for this property`);
      return false;
    }
    if (totalPrice <= 0) {
      setError('Please select valid dates');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userProfile) {
      setError('Please sign in to make a booking');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      const bookingData = {
        property_id: property.id,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        guest_count: formData.guest_count,
        special_requests: formData.special_requests || null,
        total_price: totalPrice,
        full_name: formData.full_name,
        email_or_phone: formData.email_or_phone,
        travel_type: formData.travel_type
      };

      console.log('Submitting booking data:', bookingData);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response result:', result);

      if (!response.ok) {
        setError(result.error || 'Failed to create booking');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          full_name: userProfile?.full_name || '',
          email_or_phone: userProfile?.email || '',
          check_in_date: '',
          check_out_date: '',
          guest_count: 1,
          special_requests: '',
          travel_type: 'family'
        });
      }, 2000);

    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Close calendars when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.calendar-container')) {
        setShowCheckInCalendar(false);
        setShowCheckOutCalendar(false);
      }
    };

    if (showCheckInCalendar || showCheckOutCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCheckInCalendar, showCheckOutCalendar]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 scrollbar-custom">
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-br from-[#2d5016] to-[#1a3a0f] rounded-t-3xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Book this property</h2>
              <p className="text-green-100 text-sm opacity-90">{property.name}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          {/* Decorative element */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800 text-lg">Booking Successful!</h3>
                <p className="text-green-600">Your booking has been created successfully.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800 text-lg">Booking Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name *
            </label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#2d5016] transition-colors" />
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#2d5016]/20 focus:border-[#2d5016] transition-all duration-300 bg-gray-50/50 hover:bg-white"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          {/* Email or Phone */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email or Phone *
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#2d5016] transition-colors" />
              <input
                type="text"
                value={formData.email_or_phone}
                onChange={(e) => handleInputChange('email_or_phone', e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#2d5016]/20 focus:border-[#2d5016] transition-all duration-300 bg-gray-50/50 hover:bg-white"
                placeholder="Enter your email or phone number"
                required
              />
            </div>
          </div>

          {/* Travel Type */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              You come with
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleInputChange('travel_type', 'family')}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 group ${
                  formData.travel_type === 'family'
                    ? 'border-[#2d5016] bg-gradient-to-br from-[#2d5016]/10 to-[#1a3a0f]/10 text-[#2d5016] shadow-lg scale-105'
                    : 'border-gray-200 text-gray-600 hover:border-[#2d5016]/50 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    formData.travel_type === 'family' 
                      ? 'bg-[#2d5016] text-white' 
                      : 'bg-gray-200 text-gray-600 group-hover:bg-[#2d5016]/20'
                  }`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">Family</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('travel_type', 'friends')}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 group ${
                  formData.travel_type === 'friends'
                    ? 'border-[#2d5016] bg-gradient-to-br from-[#2d5016]/10 to-[#1a3a0f]/10 text-[#2d5016] shadow-lg scale-105'
                    : 'border-gray-200 text-gray-600 hover:border-[#2d5016]/50 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    formData.travel_type === 'friends' 
                      ? 'bg-[#2d5016] text-white' 
                      : 'bg-gray-200 text-gray-600 group-hover:bg-[#2d5016]/20'
                  }`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">Friends</span>
                </div>
              </button>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Check-in Date *
              </label>
              <div className="relative calendar-container group">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#2d5016] transition-colors" />
                <input
                  type="text"
                  value={formData.check_in_date}
                  onClick={() => setShowCheckInCalendar(!showCheckInCalendar)}
                  readOnly
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#2d5016]/20 focus:border-[#2d5016] transition-all duration-300 bg-gray-50/50 hover:bg-white cursor-pointer"
                  placeholder="Select check-in date"
                  required
                />
                {showCheckInCalendar && (
                  <div className="absolute top-full left-0 mt-3 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl z-50 border border-gray-700/50 backdrop-blur-xl animate-in fade-in-0 slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between mb-8">
                      <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="p-3 hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
                      >
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </button>
                      <h3 className="text-white font-bold text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="p-3 hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
                      >
                        <ChevronRight className="w-6 h-6 text-white" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-3 mb-6">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="h-12 flex items-center justify-center text-gray-300 text-sm font-bold">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-3">
                      {renderCalendar('check_in')}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Check-out Date *
              </label>
              <div className="relative calendar-container group">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#2d5016] transition-colors" />
                <input
                  type="text"
                  value={formData.check_out_date}
                  onClick={() => setShowCheckOutCalendar(!showCheckOutCalendar)}
                  readOnly
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#2d5016]/20 focus:border-[#2d5016] transition-all duration-300 bg-gray-50/50 hover:bg-white cursor-pointer"
                  placeholder="Select check-out date"
                  required
                />
                {showCheckOutCalendar && (
                  <div className="absolute top-full left-0 mt-3 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl z-50 border border-gray-700/50 backdrop-blur-xl animate-in fade-in-0 slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between mb-8">
                      <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="p-3 hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
                      >
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </button>
                      <h3 className="text-white font-bold text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="p-3 hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
                      >
                        <ChevronRight className="w-6 h-6 text-white" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-3 mb-6">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="h-12 flex items-center justify-center text-gray-300 text-sm font-bold">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-3">
                      {renderCalendar('check_out')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Guest Count */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Guests *
            </label>
            <div className="relative group">
              <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#2d5016] transition-colors" />
              <input
                type="number"
                value={formData.guest_count}
                onChange={(e) => handleInputChange('guest_count', parseInt(e.target.value) || 1)}
                min={1}
                max={property.max_guests}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#2d5016]/20 focus:border-[#2d5016] transition-all duration-300 bg-gray-50/50 hover:bg-white"
                placeholder="1"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Maximum {property.max_guests} guests allowed</p>
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Special Requests (Optional)
            </label>
            <div className="relative group">
              <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-[#2d5016] transition-colors" />
              <textarea
                value={formData.special_requests}
                onChange={(e) => handleInputChange('special_requests', e.target.value)}
                placeholder="Any special requests or requirements..."
                rows={3}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#2d5016]/20 focus:border-[#2d5016] transition-all duration-300 bg-gray-50/50 hover:bg-white resize-none"
              />
            </div>
          </div>

          {/* Enhanced Price Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 border border-gray-200">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">€{property.price_per_night} × {nights} nights</span>
                <span className="font-semibold text-lg">€{totalPrice}</span>
              </div>
              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-[#2d5016]">€{totalPrice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Submit Button */}
          <Button
            type="submit"
            disabled={loading || success}
            className="w-full bg-gradient-to-r from-[#2d5016] to-[#1a3a0f] hover:from-[#1a3a0f] hover:to-[#2d5016] text-white py-5 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating booking...</span>
              </div>
            ) : success ? (
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5" />
                <span>Booking Created!</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Euro className="w-5 h-5" />
                <span>Book Now - €{totalPrice}</span>
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
} 