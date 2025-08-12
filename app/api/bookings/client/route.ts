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

    // Fetch bookings for the client
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

    return NextResponse.json({
      success: true,
      data: bookings || [],
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