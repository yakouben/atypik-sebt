import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug API - Checking database structure...');

    // Get all properties without any filters first
    const { data: allProperties, error: allError } = await supabase
      .from('properties')
      .select('*')
      .limit(10);

    if (allError) {
      console.error('❌ Debug API - Error fetching all properties:', allError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des propriétés', details: allError.message },
        { status: 500 }
      );
    }

    console.log('✅ Debug API - All properties found:', allProperties?.length || 0);
    console.log('🔍 Debug API - Sample property:', allProperties?.[0]);

    // Check table structure
    const { data: columns, error: columnsError } = await supabase
      .from('properties')
      .select('*')
      .limit(1);

    if (columnsError) {
      console.error('❌ Debug API - Error checking columns:', columnsError);
    } else {
      console.log('🔍 Debug API - Available columns:', Object.keys(columns?.[0] || {}));
    }

    // Test simple search
    const { data: searchResults, error: searchError } = await supabase
      .from('properties')
      .select('*')
      .ilike('name', '%cabane%')
      .limit(5);

    if (searchError) {
      console.error('❌ Debug API - Error in simple search:', searchError);
    } else {
      console.log('✅ Debug API - Simple search results:', searchResults?.length || 0);
    }

    return NextResponse.json({
      success: true,
      debug: {
        totalProperties: allProperties?.length || 0,
        sampleProperty: allProperties?.[0],
        availableColumns: Object.keys(columns?.[0] || {}),
        searchResults: searchResults?.length || 0,
        sampleSearchResult: searchResults?.[0]
      }
    });

  } catch (error) {
    console.error('❌ Debug API - Unexpected error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
