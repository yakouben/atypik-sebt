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

    // STEP 1: Get all properties owned by this user
    const { data: ownedProperties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, name, location, images, price_per_night, max_guests')
      .eq('owner_id', ownerId);

    if (propertiesError) {
      console.error('❌ Error fetching owned properties:', propertiesError);
      return NextResponse.json(
        { error: 'Failed to fetch owned properties' },
        { status: 500 }
      );
    }

    const propertyIds = ownedProperties?.map(p => p.id) || [];
    console.log('🏠 OWNED PROPERTIES:', ownedProperties);
    console.log('🆔 PROPERTY IDs:', propertyIds);

    if (propertyIds.length === 0) {
      return NextResponse.json({ 
        data: [],
        count: 0,
        message: 'No properties found for this owner'
      });
    }

    // STEP 2: Get all bookings for these properties
    let query = supabase
      .from('bookings')
      .select(`
        id,
        property_id,
        client_id,
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
        property_name,
        property_location,
        property_price_per_night,
        property_max_guests,
        property_images
      `)
      .in('property_id', propertyIds);

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Add ordering and limit
    query = query.order('created_at', { ascending: false }).limit(limit);

    const { data: bookings, error: bookingsError } = await query;

    if (bookingsError) {
      console.error('❌ Error fetching bookings:', bookingsError);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    console.log('📋 RAW BOOKINGS COUNT:', bookings?.length || 0);
    console.log('📋 RAW BOOKINGS DATA:', JSON.stringify(bookings, null, 2));

    // STEP 3: Get client profiles for all bookings
    const clientIds = [...new Set(bookings?.map(b => b.client_id).filter(Boolean))];
    let clientProfiles = {};
    
    if (clientIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', clientIds);

      if (!profilesError && profiles) {
        clientProfiles = profiles.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {});
      }
      console.log('👥 CLIENT PROFILES:', clientProfiles);
    }

    // STEP 4: Transform the data with proper property information
    const transformedBookings = bookings?.map((booking, index) => {
      console.log(`\n🔍 PROCESSING BOOKING ${index + 1}:`, booking.id);
      console.log(`📌 Property ID:`, booking.property_id);
      
      // Find the property data for this booking
      const propertyData = ownedProperties?.find(p => p.id === booking.property_id);
      console.log(`🏠 Found Property Data:`, propertyData);
      
      const clientData = clientProfiles[booking.client_id] || {};
      console.log(`👤 Client Data:`, clientData);

      // Log stored property data from booking
      console.log(`💾 STORED PROPERTY DATA FROM BOOKING:`);
      console.log(`   - property_name:`, booking.property_name);
      console.log(`   - property_location:`, booking.property_location);
      console.log(`   - property_images:`, booking.property_images);
      console.log(`   - property_price_per_night:`, booking.property_price_per_night);
      console.log(`   - property_max_guests:`, booking.property_max_guests);

      // Build the property object with priority logic
      const property = {
        id: booking.property_id,
        name: booking.property_name || propertyData?.name || 'Propriété inconnue',
        location: booking.property_location || propertyData?.location || 'Localisation inconnue',
        images: booking.property_images || propertyData?.images || [],
        price_per_night: booking.property_price_per_night || propertyData?.price_per_night || 0,
        max_guests: booking.property_max_guests || propertyData?.max_guests || 0
      };

      console.log(`✅ FINAL PROPERTY OBJECT:`, property);
      console.log(`🎯 FINAL PROPERTY NAME:`, property.name);

      const transformedBooking = {
        id: booking.id,
        property_id: booking.property_id,
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
        property: property,
        client: {
          id: clientData.id || booking.client_id,
          full_name: clientData.full_name || 'Client inconnu',
          email: clientData.email || 'Email inconnu'
        }
      };

      console.log(`🎉 TRANSFORMED BOOKING:`, JSON.stringify(transformedBooking, null, 2));
      return transformedBooking;
    }) || [];

    console.log('✅ FINAL TRANSFORMED BOOKINGS:', transformedBookings.length);
    console.log('🎯 ALL PROPERTY NAMES:', transformedBookings.map(b => b.property.name));

    return NextResponse.json({ 
      data: transformedBookings,
      count: transformedBookings.length,
      message: 'Bookings fetched successfully'
    });

  } catch (error) {
    console.error('❌ Exception in owner bookings API:', error);
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Deleting booking:', bookingId);

    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (deleteError) {
      console.error('❌ Error deleting booking:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete booking: ' + deleteError.message },
        { status: 500 }
      );
    }

    console.log('✅ Booking deleted successfully');

    return NextResponse.json({ 
      message: 'Booking deleted successfully' 
    });

  } catch (error) {
    console.error('❌ Exception in booking delete API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 