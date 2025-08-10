import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Environment variables not configured',
        supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
        supabaseKey: supabaseKey ? 'Set' : 'Missing'
      }, { status: 500 });
    }

    // List buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      return NextResponse.json({ 
        error: 'Failed to list buckets',
        details: bucketError.message,
        supabaseUrl: supabaseUrl.substring(0, 20) + '...',
        supabaseKey: supabaseKey.substring(0, 10) + '...'
      }, { status: 500 });
    }

    // Check for images bucket
    const imagesBucket = buckets?.find(b => b.name === 'images');
    
    return NextResponse.json({ 
      success: true,
      supabaseUrl: supabaseUrl.substring(0, 20) + '...',
      totalBuckets: buckets?.length || 0,
      availableBuckets: buckets?.map(b => ({ name: b.name, id: b.id, public: b.public })) || [],
      imagesBucketExists: !!imagesBucket,
      imagesBucketInfo: imagesBucket ? {
        id: imagesBucket.id,
        name: imagesBucket.name,
        public: imagesBucket.public
      } : null
    });

  } catch (error) {
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 