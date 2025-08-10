import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting property creation...');
    
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
    let propertyData: any;
    try {
      propertyData = await request.json();
      console.log('📝 Received property data:', propertyData);
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json({ 
        error: 'Invalid JSON in request body',
        details: parseError instanceof Error ? parseError.message : 'Unknown error'
      }, { status: 400 });
    }
    
    // Step 3: Validate required fields
    const requiredFields = ['name', 'category', 'price_per_night', 'description', 'location', 'max_guests'];
    const missingFields = requiredFields.filter(field => !propertyData[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      }, { status: 400 });
    }

    console.log('✅ All required fields present');

    // Step 4: Prepare the property data for insertion
    const newProperty = {
      name: String(propertyData.name).trim(),
      category: String(propertyData.category).trim(),
      price_per_night: parseFloat(propertyData.price_per_night) || 0,
      description: String(propertyData.description).trim(),
      location: String(propertyData.location).trim(),
      maps_link: propertyData.maps_link ? String(propertyData.maps_link).trim() : null,
      max_guests: parseInt(propertyData.max_guests) || 1,
      images: Array.isArray(propertyData.images) ? propertyData.images : [],
      owner_id: user.id,
      is_published: propertyData.is_published !== undefined ? Boolean(propertyData.is_published) : true,
      is_available: propertyData.is_available !== undefined ? Boolean(propertyData.is_available) : true
    };

    console.log('📊 Prepared property data:', newProperty);

    // Step 5: Insert the property
    console.log('💾 Attempting to insert property...');
    const { data, error } = await supabaseAdmin
      .from('properties')
      .insert(newProperty)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating property:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Provide specific error messages based on error type
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        return NextResponse.json({ 
          error: 'Database schema issue - column does not exist',
          details: error.message,
          hint: 'Run the cleanup_properties_table.sql script in your Supabase SQL editor'
        }, { status: 500 });
      }
      
      if (error.message.includes('violates not-null constraint')) {
        return NextResponse.json({ 
          error: 'Database constraint violation - required field is null',
          details: error.message,
          hint: 'Check that all required fields are provided'
        }, { status: 500 });
      }
      
      if (error.message.includes('violates foreign key constraint')) {
        return NextResponse.json({ 
          error: 'Database constraint violation - invalid owner_id',
          details: error.message,
          hint: 'User might not exist in profiles table'
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        error: `Failed to save property: ${error.message}`,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 500 });
    }

    console.log('✅ Property created successfully:', data);
    return NextResponse.json({ 
      data, 
      error: null,
      message: 'Property created successfully'
    });
    
  } catch (error) {
    console.error('❌ Exception in POST /api/properties:', error);
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    const { searchParams } = new URL(request.url);
    
    const ownerId = searchParams.get('ownerId');
    const published = searchParams.get('published');
    const available = searchParams.get('available');
    const category = searchParams.get('category');

    let query = supabase
      .from('properties')
      .select(`
        *,
        profiles!properties_owner_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false });

    // Filter by owner if specified and valid
    if (ownerId && ownerId !== 'undefined' && ownerId !== 'null') {
      query = query.eq('owner_id', ownerId);
    }

    // Filter by published status
    if (published === 'true') {
      query = query.eq('is_published', true);
    }

    // Filter by availability
    if (available === 'true') {
      query = query.eq('is_available', true);
    }

    // Filter by category if specified
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching properties:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error('Exception in GET /api/properties:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 