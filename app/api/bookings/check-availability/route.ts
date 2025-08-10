import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const checkInDate = searchParams.get('checkInDate');
    const checkOutDate = searchParams.get('checkOutDate');

    if (!propertyId || !checkInDate || !checkOutDate) {
      return NextResponse.json({
        error: 'Missing required parameters: propertyId, checkInDate, checkOutDate'
      }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);

    console.log('🔍 Checking availability for:', {
      propertyId,
      checkInDate,
      checkOutDate
    });

    // Get all existing bookings for this property
    const { data: existingBookings, error } = await supabase
      .from('bookings')
      .select('id, check_in_date, check_out_date, status')
      .eq('property_id', propertyId)
      .in('status', ['pending', 'confirmed']);

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json({
        error: 'Failed to check availability'
      }, { status: 500 });
    }

    // Check for overlaps
    const hasOverlap = existingBookings?.some(booking => {
      const existingCheckIn = new Date(booking.check_in_date);
      const existingCheckOut = new Date(booking.check_out_date);
      const requestedCheckIn = new Date(checkInDate);
      const requestedCheckOut = new Date(checkOutDate);

      const overlaps = requestedCheckIn < existingCheckOut && requestedCheckOut > existingCheckIn;
      
      if (overlaps) {
        console.log('🚫 Overlap found with booking:', {
          bookingId: booking.id,
          existing: { check_in: booking.check_in_date, check_out: booking.check_out_date },
          requested: { check_in: checkInDate, check_out: checkOutDate }
        });
      }
      
      return overlaps;
    });

    const isAvailable = !hasOverlap;

    console.log('✅ Availability check result:', {
      isAvailable,
      totalExistingBookings: existingBookings?.length || 0,
      conflictingBookings: existingBookings?.filter(booking => {
        const existingCheckIn = new Date(booking.check_in_date);
        const existingCheckOut = new Date(booking.check_out_date);
        const requestedCheckIn = new Date(checkInDate);
        const requestedCheckOut = new Date(checkOutDate);
        return requestedCheckIn < existingCheckOut && requestedCheckOut > existingCheckIn;
      }).length || 0
    });

    return NextResponse.json({
      isAvailable,
      propertyId,
      requestedDates: {
        checkIn: checkInDate,
        checkOut: checkOutDate
      },
      existingBookings: existingBookings || [],
      conflictingBookings: existingBookings?.filter(booking => {
        const existingCheckIn = new Date(booking.check_in_date);
        const existingCheckOut = new Date(booking.check_out_date);
        const requestedCheckIn = new Date(checkInDate);
        const requestedCheckOut = new Date(checkOutDate);
        return requestedCheckIn < existingCheckOut && requestedCheckOut > existingCheckIn;
      }) || []
    });

  } catch (error) {
    console.error('Exception in availability check:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
} 