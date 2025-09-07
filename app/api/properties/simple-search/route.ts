import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const location = searchParams.get('location') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const category = searchParams.get('category') || '';

    console.log('🔍 Simple Search API - Query:', { query, location, minPrice, maxPrice, category });

    // Start with base query
    let supabaseQuery = supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters step by step (AND logic)
    
    // Text search for name OR location (if query provided)
    if (query.trim()) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,location.ilike.%${query}%`);
    }

    // Location filter (if different from query)
    if (location && location !== query.trim()) {
      supabaseQuery = supabaseQuery.ilike('location', `%${location}%`);
    }

    // Category filter
    if (category && category !== 'all') {
      supabaseQuery = supabaseQuery.eq('category', category);
    }

    // Price range filters
    if (minPrice) {
      supabaseQuery = supabaseQuery.gte('price_per_night', parseInt(minPrice));
    }

    if (maxPrice) {
      supabaseQuery = supabaseQuery.lte('price_per_night', parseInt(maxPrice));
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      console.error('❌ Simple Search API - Database error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la recherche', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Simple Search API - Results found:', data?.length || 0);
    console.log('🔍 Simple Search API - Sample result:', data?.[0]);

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      method: 'database_query'
    });

  } catch (error) {
    console.error('❌ Simple Search API - Unexpected error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
