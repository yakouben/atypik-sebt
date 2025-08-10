import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const propertyData = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'category', 'price_per_night', 'description', 'location', 'max_guests'];
    for (const field of requiredFields) {
      if (!propertyData[field]) {
        return NextResponse.json({ 
          error: `Field ${field} is required` 
        }, { status: 400 });
      }
    }

    // Check if user owns this property
    const { data: existingProperty } = await supabase
      .from('properties')
      .select('owner_id')
      .eq('id', params.id)
      .single();

    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (existingProperty.owner_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update property
    const updatedProperty = {
      ...propertyData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('properties')
      .update(updatedProperty)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating property:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error('Exception in PUT /api/properties/[id]:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user owns this property
    const { data: existingProperty } = await supabase
      .from('properties')
      .select('owner_id')
      .eq('id', params.id)
      .single();

    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (existingProperty.owner_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete property
    const { error } = await supabaseAdmin
      .from('properties')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting property:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      data: { message: 'Property deleted successfully' }, 
      error: null 
    });
  } catch (error) {
    console.error('Exception in DELETE /api/properties/[id]:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);

    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        profiles!properties_owner_id_fkey(full_name, email)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching property:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error('Exception in GET /api/properties/[id]:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 