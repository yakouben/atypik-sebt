import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the client ID from query parameters
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const debug = searchParams.get('debug') === 'true';

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Verify the user is requesting their own bookings
    if (clientId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only view your own bookings' },
        { status: 403 }
      );
    }

    console.log('🔍 Fetching bookings for client:', clientId);

    // First, let's check what columns exist in the bookings table
    if (debug) {
      const { data: tableInfo, error: tableError } = await supabase
        .from('bookings')
        .select('*')
        .limit(1);
      
      console.log('📋 Table structure check:', { tableInfo, tableError });
    }

    // Fetch bookings for the client with property information
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')  // Select all columns to see what we have
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('Error fetching client bookings:', bookingsError);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    console.log('✅ Found bookings:', bookings?.length || 0);
    if (debug && bookings && bookings.length > 0) {
      console.log('🔍 Sample booking data:', bookings[0]);
    }

    // Transform the data to match the expected interface
    const transformedBookings = (bookings || []).map(booking => ({
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
      properties: {
        name: booking.property_name || 'Propriété inconnue',
        location: booking.property_location || 'Localisation inconnue',
        images: booking.property_images || []
      }
    }));

    return NextResponse.json({
      success: true,
      data: transformedBookings,
      message: 'Client bookings fetched successfully',
      count: transformedBookings.length,
      debug: debug ? {
        clientId,
        totalBookings: bookings?.length || 0,
        sampleBooking: bookings && bookings.length > 0 ? bookings[0] : null,
        transformedCount: transformedBookings.length
      } : undefined
    });

  } catch (error) {
    console.error('Error in GET /api/bookings/client:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
