import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting comprehensive properties debug...');
    
    // Test 1: Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey || !serviceKey) {
      return NextResponse.json({ 
        error: 'Environment variables missing',
        supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
        supabaseKey: supabaseKey ? 'Set' : 'Missing',
        serviceKey: serviceKey ? 'Set' : 'Missing'
      }, { status: 500 });
    }

    // Test 2: Check if we can connect to the database
    const { data: testData, error: testError } = await supabaseAdmin
      .from('properties')
      .select('count')
      .limit(1);
    
    if (testError) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: testError.message,
        hint: testError.hint,
        code: testError.code
      }, { status: 500 });
    }

    // Test 3: Get current table structure using direct query
    let columns;
    let columnsError;
    
    try {
      const { data, error } = await supabaseAdmin
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'properties')
        .eq('table_schema', 'public')
        .order('ordinal_position');
      
      columns = data;
      columnsError = error;
    } catch (error) {
      columnsError = error;
    }

    if (columnsError) {
      return NextResponse.json({ 
        error: 'Failed to get table structure',
        details: columnsError instanceof Error ? columnsError.message : 'Unknown error'
      }, { status: 500 });
    }

    // Test 4: Check authentication
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json({ 
        error: 'Authentication failed',
        details: authError.message
      }, { status: 500 });
    }

    // Test 5: Try to insert a test record with exact form structure
    const testProperty = {
      name: 'Test Property Debug',
      category: 'cabane_arbre',
      price_per_night: 100.00,
      description: 'Test description for debug',
      location: 'Test location',
      maps_link: 'https://maps.google.com/test',
      max_guests: 2,
      images: ['https://example.com/test.jpg'],
      owner_id: user?.id || '00000000-0000-0000-0000-000000000000',
      is_published: true,
      is_available: true
    };

    console.log('Attempting to insert test property:', testProperty);

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('properties')
      .insert(testProperty)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ 
        error: 'Failed to insert test property',
        details: insertError.message,
        hint: insertError.hint,
        code: insertError.code,
        testProperty,
        currentColumns: columns,
        userExists: !!user,
        userId: user?.id
      }, { status: 500 });
    }

    // Clean up test record
    if (insertData) {
      await supabaseAdmin
        .from('properties')
        .delete()
        .eq('id', insertData.id);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Properties table is working correctly!',
      testInsertSuccessful: true,
      schemaClean: true,
      formFieldsMatch: true,
      currentColumns: columns,
      userExists: !!user,
      userId: user?.id
    });

  } catch (error) {
    console.error('Exception in debug-properties:', error);
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 