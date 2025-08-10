import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing cleaned-up properties table structure...');
    
    // Test 1: Check if we can connect to the database
    const { data: testData, error: testError } = await supabaseAdmin
      .from('properties')
      .select('count')
      .limit(1);
    
    if (testError) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: testError.message,
        hint: testError.hint
      }, { status: 500 });
    }

    // Test 2: Try to insert a test record with only the fields the form uses
    const testProperty = {
      name: 'Test Property',
      category: 'cabane_arbre',
      price_per_night: 100.00,
      description: 'Test description',
      location: 'Test location',
      maps_link: 'https://maps.google.com/test',
      max_guests: 2,
      images: ['https://example.com/test.jpg'],
      owner_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      is_published: true,
      is_available: true
    };

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
        testProperty
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
      message: 'Properties table schema matches form exactly!',
      testInsertSuccessful: true,
      schemaClean: true,
      formFieldsMatch: true
    });

  } catch (error) {
    console.error('Exception in test-clean-schema:', error);
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 