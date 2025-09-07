import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Quick validation
    if (!params.id || params.id.length < 10) {
      return NextResponse.json(
        { error: 'ID utilisateur invalide' },
        { status: 400 }
      );
    }
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error('Exception in GET /api/profiles/[id]:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 