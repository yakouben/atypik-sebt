import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching bookings for owner:', ownerId);

    // Build the query - only fetch client data, not property data
    // First get the property IDs owned by this owner
    const { data: ownedProperties, error: propertyError } = await supabase
      .from('properties')
      .select('id')
      .eq('owner_id', ownerId);

    if (propertyError) {
      console.error('Error fetching owned properties:', propertyError);
      return NextResponse.json(
        { error: 'Failed to fetch owned properties' },
        { status: 500 }
      );
    }

    const ownedPropertyIds = ownedProperties?.map(p => p.id) || [];
    
    if (ownedPropertyIds.length === 0) {
      return NextResponse.json({ 
        data: [],
        count: 0
      });
    }

    // Now get bookings for those properties
    let query = supabase
      .from('bookings')
      .select(`
        *,
        profiles:client_id (
          id,
          full_name,
          email
        )
      `)
      .in('property_id', ownedPropertyIds);

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Add ordering and limit
    query = query.order('created_at', { ascending: false }).limit(limit);

    const { data: bookings, error } = await query;

    if (error) {
      console.error('Error fetching owner bookings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    console.log('🔍 Raw bookings data:', bookings);

    // Transform the data - only client and booking data, no property data
    const transformedBookings = bookings?.map((booking) => {
      console.log('🔍 Processing booking:', booking.id);
      
      const clientData = booking.profiles || {};
      
      console.log('🔍 Using only client and booking data');
      
      return {
        id: booking.id,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        total_price: booking.total_price,
        status: booking.status,
        guest_count: booking.guest_count,
        special_requests: booking.special_requests,
        full_name: booking.full_name,
        email_or_phone: booking.email_or_phone,
        travel_type: booking.travel_type,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        // No property data - only client and booking info
        client: {
          id: clientData.id || 'unknown',
          full_name: clientData.full_name || 'Client inconnu',
          email: clientData.email || 'Email inconnu'
        }
      };
    }) || [];

    console.log('🔍 Transformed bookings:', transformedBookings);

    return NextResponse.json({ 
      data: transformedBookings,
      count: transformedBookings.length
    });

  } catch (error) {
    console.error('Exception in owner bookings API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, status } = body;

    console.log('🔍 PATCH request received:', { bookingId, status });

    if (!bookingId || !status) {
      console.error('❌ Missing required fields:', { bookingId, status });
      return NextResponse.json(
        { error: 'Booking ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      console.error('❌ Invalid status:', status);
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: pending, confirmed, cancelled, completed' },
        { status: 400 }
      );
    }

    console.log('🔍 Updating booking:', bookingId, 'to status:', status);

    // First, let's check if the booking exists and we can access it
    const { data: existingBooking, error: checkError } = await supabase
      .from('bookings')
      .select('id, status, property_id')
      .eq('id', bookingId)
      .single();

    if (checkError) {
      console.error('❌ Error checking booking:', checkError);
      return NextResponse.json(
        { error: 'Booking not found or access denied: ' + checkError.message },
        { status: 404 }
      );
    }

    if (!existingBooking) {
      console.error('❌ Booking not found:', bookingId);
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    console.log('✅ Booking found:', existingBooking);

    // Now try to update the booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating booking:', updateError);
      return NextResponse.json(
        { error: 'Failed to update booking: ' + updateError.message },
        { status: 500 }
      );
    }

    console.log('✅ Booking updated successfully:', updatedBooking);

    return NextResponse.json({ 
      data: updatedBooking,
      message: 'Booking status updated successfully' 
    });

  } catch (error) {
    console.error('❌ Exception in booking update API:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 