import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting booking creation...');
    
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    // Step 1: Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json({ 
        error: 'Authentication error',
        details: authError?.message || 'No user found'
      }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.id);

    // Step 2: Parse request body
    let bookingData: any;
    try {
      bookingData = await request.json();
      console.log('📝 Received booking data:', bookingData);
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json({ 
        error: 'Invalid JSON in request body',
        details: parseError instanceof Error ? parseError.message : 'Unknown error'
      }, { status: 400 });
    }

    const { 
      property_id, 
      check_in_date, 
      check_out_date, 
      guest_count, 
      special_requests,
      total_price,
      full_name,
      email_or_phone,
      travel_type
    } = bookingData;

    // Step 3: Validate required fields
    const requiredFields = ['property_id', 'check_in_date', 'check_out_date', 'guest_count', 'total_price'];
    const missingFields = requiredFields.filter(field => !bookingData[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      }, { status: 400 });
    }

    console.log('✅ All required fields present');

    // Step 4: Validate dates
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return NextResponse.json(
        { error: 'Check-in date cannot be in the past' },
        { status: 400 }
      );
    }

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    // Step 5: Check if property exists and is available
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, name, max_guests, price_per_night, is_available, location, images')
      .eq('id', property_id)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    if (!property.is_available) {
      return NextResponse.json(
        { error: 'Property is not available for booking' },
        { status: 400 }
      );
    }

    if (guest_count > property.max_guests) {
      return NextResponse.json(
        { error: `Maximum ${property.max_guests} guests allowed for this property` },
        { status: 400 }
      );
    }

    // Step 6: Check for existing bookings that overlap with the requested dates
    console.log('🔍 Checking for existing bookings...');
    console.log('Requested dates:', { check_in_date, check_out_date });
    
    const { data: existingBookings, error: existingBookingsError } = await supabase
      .from('bookings')
      .select('id, check_in_date, check_out_date, status')
      .eq('property_id', property_id)
      .in('status', ['pending', 'confirmed']);

    if (existingBookingsError) {
      console.error('Error checking existing bookings:', existingBookingsError);
      return NextResponse.json(
        { error: 'Failed to check availability' },
        { status: 500 }
      );
    }

    console.log('Existing bookings found:', existingBookings?.length || 0);

    // Check for date overlaps manually
    const hasOverlap = existingBookings?.some(booking => {
      const existingCheckIn = new Date(booking.check_in_date);
      const existingCheckOut = new Date(booking.check_out_date);
      const requestedCheckIn = new Date(check_in_date);
      const requestedCheckOut = new Date(check_out_date);

      // Check if the requested dates overlap with existing booking
      // Overlap occurs when:
      // 1. Requested check-in is before existing check-out AND requested check-out is after existing check-in
      const overlaps = requestedCheckIn < existingCheckOut && requestedCheckOut > existingCheckIn;
      
      if (overlaps) {
        console.log('🚫 Overlap detected with booking:', {
          existing: { check_in: booking.check_in_date, check_out: booking.check_out_date },
          requested: { check_in: check_in_date, check_out: check_out_date }
        });
      }
      
      return overlaps;
    });

    if (hasOverlap) {
      console.log('❌ Date conflict detected');
      return NextResponse.json(
        { error: 'Property is not available for the selected dates' },
        { status: 400 }
      );
    }

    console.log('✅ No date conflicts found');

    // Step 7: Prepare the booking data for insertion
    const newBooking = {
      property_id,
      client_id: user.id, // Use the authenticated user's ID
      check_in_date,
      check_out_date,
      total_price,
      guest_count,
      special_requests: special_requests || null,
      status: 'pending',
      full_name: full_name || user.user_metadata?.full_name || 'Guest',
      email_or_phone: email_or_phone || user.email || 'Not provided',
      travel_type: travel_type || 'family'
    };

    console.log('📊 Prepared booking data:', newBooking);

    // Step 8: Insert the booking
    console.log('💾 Attempting to insert booking...');
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert(newBooking)
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Error creating booking:', bookingError);
      console.error('Error details:', {
        message: bookingError.message,
        details: bookingError.details,
        hint: bookingError.hint,
        code: bookingError.code
      });
      
      // Check if the error is due to missing columns
      if (bookingError.message && bookingError.message.includes('column') && bookingError.message.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Database schema needs to be updated. Please run the migration script first.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to create booking: ${bookingError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Booking created successfully:', booking);

    return NextResponse.json({ 
      data: booking,
      message: 'Booking created successfully' 
    });

  } catch (error) {
    console.error('Exception in bookings API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting booking retrieval...');
    
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    // Step 1: Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json({ 
        error: 'Authentication error',
        details: authError?.message || 'No user found'
      }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.id);

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const clientId = searchParams.get('clientId');
    const ownerId = searchParams.get('ownerId');
    const debug = searchParams.get('debug') === 'true';

    let query = supabaseAdmin.from('bookings').select(`
      *,
      properties (
        id,
        name,
        location,
        images,
        price_per_night
      ),
      profiles:client_id (
        id,
        full_name,
        email
      )
    `);

    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    if (clientId && clientId !== 'undefined' && clientId !== 'null') {
      query = query.eq('client_id', clientId);
    }

    if (ownerId && ownerId !== 'undefined' && ownerId !== 'null') {
      query = query.eq('properties.owner_id', ownerId);
    }

    const { data: bookings, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    console.log('✅ Bookings retrieved successfully:', bookings?.length || 0);

    // Add debug information if requested
    if (debug && propertyId) {
      console.log('🔍 Debug info for property:', propertyId);
      console.log('All bookings for this property:', bookings?.filter(b => b.property_id === propertyId));
    }

    return NextResponse.json({ 
      data: bookings || [],
      debug: debug ? {
        propertyId,
        totalBookings: bookings?.length || 0,
        propertyBookings: bookings?.filter(b => b.property_id === propertyId) || []
      } : undefined
    });

  } catch (error) {
    console.error('Exception in bookings GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 