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

    // Simple query: fetch ONLY the stored form data from bookings table
    // No joins, no complex fallbacks - just what the client submitted
    let query = supabase
      .from('bookings')
      .select(`
        id,
        check_in_date,
        check_out_date,
        total_price,
        status,
        guest_count,
        special_requests,
        full_name,
        email_or_phone,
        travel_type,
        created_at,
        updated_at,
        // Property data stored from the form
        property_name,
        property_location,
        property_price_per_night,
        property_max_guests,
        property_images,
        // Client data stored from the form
        client_id
      `)
      .eq('client_id', ownerId); // This should be the property owner ID

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

    console.log('🔍 Raw bookings data from form:', bookings);

    // Transform the data to match the expected format
    // All data comes directly from what the client submitted in the form
    const transformedBookings = (bookings || []).map(booking => {
      return {
        id: booking.id,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        total_price: booking.total_price,
        status: booking.status,
        guest_count: booking.guest_count,
        special_requests: booking.special_requests,
        // Client data from the form
        full_name: booking.full_name,
        email_or_phone: booking.email_or_phone,
        travel_type: booking.travel_type,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        // Property data from the form (stored when client submitted)
        property: {
          id: 'stored',
          name: booking.property_name || 'Nom non spécifié',
          location: booking.property_location || 'Localisation non spécifiée',
          images: booking.property_images || [],
          price_per_night: booking.property_price_per_night || 0,
          max_guests: booking.property_max_guests || 0
        },
        // Client info from the form
        client: {
          id: booking.client_id || 'unknown',
          full_name: booking.full_name || 'Client inconnu',
          email: booking.email_or_phone || 'Contact inconnu'
        }
      };
    });

    console.log('🔍 Transformed bookings (form data only):', transformedBookings);

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

    // Update the booking status
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