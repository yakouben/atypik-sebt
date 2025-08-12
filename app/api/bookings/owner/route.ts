import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    console.log('🚨 DEBUG: API called with params:', { ownerId, status, limit });

    if (!ownerId) {
      console.error('❌ ERROR: Owner ID is missing');
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching bookings for owner:', ownerId);

    // PROBLEM HANDLING: First, let's check what's in the bookings table
    console.log('🔍 STEP 1: Checking bookings table structure...');
    const { data: sampleBooking, error: sampleError } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ ERROR: Cannot access bookings table:', sampleError);
      return NextResponse.json(
        { error: 'Database access error: ' + sampleError.message },
        { status: 500 }
      );
    }
    
    console.log('🔍 STEP 1 SUCCESS: Bookings table accessible');
    console.log('🔍 Sample booking structure:', Object.keys(sampleBooking?.[0] || {}));

    // PROBLEM HANDLING: Check if the stored property columns exist
    console.log('🔍 STEP 2: Checking if stored property columns exist...');
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
    
    console.log('🔍 STEP 2 SUCCESS: Stored property columns exist');
    console.log('🔍 Column check result:', columnCheck?.[0]);

    // PROBLEM HANDLING: Check if there are any bookings for this owner
    console.log('🔍 STEP 3: Checking if owner has any bookings...');
    const { data: ownerCheck, error: ownerCheckError } = await supabase
      .from('bookings')
      .select('id, client_id, property_name, property_location')
      .eq('client_id', ownerId)
      .limit(5);
    
    if (ownerCheckError) {
      console.error('❌ ERROR: Cannot check owner bookings:', ownerCheckError);
      return NextResponse.json(
        { error: 'Owner check error: ' + ownerCheckError.message },
        { status: 500 }
      );
    }
    
    console.log('🔍 STEP 3 RESULT: Owner has bookings:', ownerCheck?.length || 0);
    console.log('🔍 Sample owner bookings:', ownerCheck);

    // PROBLEM HANDLING: Check if the owner ID logic is correct
    console.log('🔍 STEP 4: Checking owner ID logic...');
    console.log('🔍 Current query uses client_id = ownerId, but this might be wrong!');
    console.log('🔍 We need to find bookings where the property belongs to this owner');

    // CORRECTED QUERY: Find bookings where the property belongs to this owner
    // First, get all properties owned by this owner
    console.log('🔍 STEP 5: Getting properties owned by:', ownerId);
    const { data: ownerProperties, error: propertiesError } = await supabase
      .from('properties')
      .select('id')
      .eq('owner_id', ownerId);
    
    if (propertiesError) {
      console.error('❌ ERROR: Cannot get owner properties:', propertiesError);
      return NextResponse.json(
        { error: 'Properties fetch error: ' + propertiesError.message },
        { status: 500 }
      );
    }
    
    const ownerPropertyIds = ownerProperties?.map(p => p.id) || [];
    console.log('🔍 STEP 5 RESULT: Owner has properties:', ownerPropertyIds);

    if (ownerPropertyIds.length === 0) {
      console.log('⚠️ WARNING: Owner has no properties, returning empty result');
      return NextResponse.json({ 
        data: [],
        count: 0,
        debug: 'Owner has no properties'
      });
    }

    // Now get bookings for these properties
    console.log('🔍 STEP 6: Getting bookings for owner properties...');
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
        property_id,
        // Property data stored from the form
        property_name,
        property_location,
        property_price_per_night,
        property_max_guests,
        property_images,
        // Client data stored from the form
        client_id
      `)
      .in('property_id', ownerPropertyIds);

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Add ordering and limit
    query = query.order('created_at', { ascending: false }).limit(limit);

    const { data: bookings, error } = await query;

    if (error) {
      console.error('❌ ERROR: Failed to fetch bookings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings: ' + error.message },
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

      console.log(`🔍 Transformed booking ${index + 1}:`, {
        propertyName: transformed.property.name,
        propertyLocation: transformed.property.location,
        hasImages: transformed.property.images.length > 0
      });

      return transformed;
    });

    console.log('🔍 STEP 8 SUCCESS: All bookings transformed');
    console.log('🔍 Final result count:', transformedBookings.length);

    return NextResponse.json({ 
      data: transformedBookings,
      count: transformedBookings.length,
      debug: {
        totalBookings: bookings?.length || 0,
        withStoredData: bookingsWithStoredData.length,
        withoutStoredData: bookingsWithoutStoredData.length,
        ownerPropertyIds: ownerPropertyIds
      }
    });

  } catch (error) {
    console.error('❌ EXCEPTION in owner bookings API:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
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