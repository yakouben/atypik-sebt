import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    console.log('🚨 DEBUG: Client API called');
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ ERROR: Authentication failed:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔍 STEP 1: User authenticated:', user.id);

    // Get the client ID from query parameters
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    console.log('🔍 STEP 2: Client ID from params:', clientId);

    if (!clientId) {
      console.error('❌ ERROR: Client ID is missing');
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Verify the user is requesting their own bookings
    if (clientId !== user.id) {
      console.error('❌ ERROR: User ID mismatch:', { clientId, userId: user.id });
      return NextResponse.json(
        { error: 'Forbidden: You can only view your own bookings' },
        { status: 403 }
      );
    }

    console.log('🔍 STEP 3: User authorization verified');

    // PROBLEM HANDLING: Check if the stored property columns exist
    console.log('🔍 STEP 4: Checking if stored property columns exist...');
    const { data: columnCheck, error: columnError } = await supabase
      .from('bookings')
      .select('property_name, property_location, property_price_per_night, property_max_guests, property_images')
      .limit(1);
    
    if (columnError) {
      console.error('❌ ERROR: Stored property columns missing:', columnError);
      console.error('❌ This means the database migration was not run!');
      return NextResponse.json(
        { error: 'Database schema error: Stored property columns missing. Please run the migration.' },
        { status: 500 }
      );
    }
    
    console.log('🔍 STEP 4 SUCCESS: Stored property columns exist');
    console.log('🔍 Column check result:', columnCheck?.[0]);

    // PROBLEM HANDLING: Check if there are any bookings for this client
    console.log('🔍 STEP 5: Checking if client has any bookings...');
    const { data: clientCheck, error: clientCheckError } = await supabase
      .from('bookings')
      .select('id, property_name, property_location')
      .eq('client_id', clientId)
      .limit(5);
    
    if (clientCheckError) {
      console.error('❌ ERROR: Cannot check client bookings:', clientCheckError);
      return NextResponse.json(
        { error: 'Client check error: ' + clientCheckError.message },
        { status: 500 }
      );
    }
    
    console.log('🔍 STEP 5 RESULT: Client has bookings:', clientCheck?.length || 0);
    console.log('🔍 Sample client bookings:', clientCheck);

    // Simple query: fetch ONLY the stored form data from bookings table
    console.log('🔍 STEP 6: Fetching client bookings with stored data...');
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
        // Property data stored from the form
        property_name,
        property_location,
        property_price_per_night,
        property_max_guests,
        property_images
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('❌ ERROR: Failed to fetch client bookings:', bookingsError);
      return NextResponse.json(
        { error: 'Failed to fetch bookings: ' + bookingsError.message },
        { status: 500 }
      );
    }

    console.log('🔍 STEP 6 SUCCESS: Raw bookings fetched:', bookings?.length || 0);
    console.log('🔍 Sample raw booking data:', bookings?.[0]);

    // PROBLEM HANDLING: Check if stored property data exists
    console.log('🔍 STEP 7: Analyzing stored property data...');
    const bookingsWithStoredData = bookings?.filter(b => b.property_name && b.property_location) || [];
    const bookingsWithoutStoredData = bookings?.filter(b => !b.property_name || !b.property_location) || [];
    
    console.log('🔍 Bookings WITH stored property data:', bookingsWithStoredData.length);
    console.log('🔍 Bookings WITHOUT stored property data:', bookingsWithoutStoredData.length);
    
    if (bookingsWithoutStoredData.length > 0) {
      console.log('⚠️ WARNING: Some bookings missing stored property data:');
      console.log('⚠️ Sample missing data booking:', bookingsWithoutStoredData[0]);
    }

    // Transform the data to match the expected format
    console.log('🔍 STEP 8: Transforming booking data...');
    const transformedBookings = (bookings || []).map((booking, index) => {
      console.log(`🔍 Transforming booking ${index + 1}/${bookings.length}:`, {
        id: booking.id,
        hasPropertyName: !!booking.property_name,
        hasPropertyLocation: !!booking.property_location,
        propertyName: booking.property_name,
        propertyLocation: booking.property_location
      });

      const transformed = {
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
        // Property data from the form (stored when client submitted)
        properties: {
          id: 'stored',
          name: booking.property_name || 'Nom non spécifié',
          location: booking.property_location || 'Localisation non spécifiée',
          images: booking.property_images || []
        }
      };

      console.log(`🔍 Transformed booking ${index + 1}:`, {
        propertyName: transformed.properties.name,
        propertyLocation: transformed.properties.location,
        hasImages: transformed.properties.images.length > 0
      });

      return transformed;
    });

    console.log('🔍 STEP 8 SUCCESS: All bookings transformed');
    console.log('🔍 Final result count:', transformedBookings.length);

    return NextResponse.json({
      success: true,
      data: transformedBookings,
      message: 'Client bookings fetched successfully',
      debug: {
        totalBookings: bookings?.length || 0,
        withStoredData: bookingsWithStoredData.length,
        withoutStoredData: bookingsWithoutStoredData.length
      }
    });

  } catch (error) {
    console.error('❌ EXCEPTION in client bookings API:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 