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

    // Fetch bookings for the client with stored property data
    const { data: bookings, error: bookingsError } = await supabase
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
        // Stored property data (from the form)
        property_name,
        property_location,
        property_price_per_night,
        property_max_guests,
        property_images,
        // Fallback: try to get live property data if available
        properties (
          id,
          name,
          location,
          images
        )
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('Error fetching client bookings:', bookingsError);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    // Transform the data to combine stored property data with client data
    const transformedBookings = (bookings || []).map(booking => {
      // Prioritize stored property data (from the form) over joined data
      const hasStoredPropertyData = booking.property_name && booking.property_location;
      const hasLivePropertyData = booking.properties && booking.properties.id;
      
      let finalPropertyData;
      
      if (hasStoredPropertyData) {
        // Use stored property data (most reliable)
        finalPropertyData = {
          id: 'stored',
          name: booking.property_name,
          location: booking.property_location,
          images: booking.property_images || [],
          price_per_night: booking.property_price_per_night || 0,
          max_guests: booking.property_max_guests || 0
        };
      } else if (hasLivePropertyData) {
        // Fallback to live property data
        finalPropertyData = {
          id: booking.properties.id,
          name: booking.properties.name,
          location: booking.properties.location,
          images: booking.properties.images || [],
          price_per_night: 0, // Not available in joined data
          max_guests: 0 // Not available in joined data
        };
      } else {
        // No property data available
        finalPropertyData = {
          id: 'unknown',
          name: 'Propriété inconnue',
          location: 'Localisation inconnue',
          images: [],
          price_per_night: 0,
          max_guests: 0
        };
      }

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
        // Combined property data
        properties: finalPropertyData
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedBookings,
      message: 'Client bookings fetched successfully'
    });

  } catch (error) {
    console.error('Error in GET /api/bookings/client:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 