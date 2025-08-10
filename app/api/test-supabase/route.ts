import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    console.log('Testing Supabase connection...');
    
    // Test 1: Check environment variables
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configured' : 'Missing',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configured' : 'Missing',
    };

    // Test 2: Check if we can connect to Supabase
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return NextResponse.json({ 
        error: 'Failed to connect to Supabase',
        details: sessionError.message,
        environment: envVars
      }, { status: 500 });
    }

    // Test 3: List storage buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      return NextResponse.json({ 
        error: 'Failed to list storage buckets',
        details: bucketError.message,
        environment: envVars,
        connection: 'Working'
      }, { status: 500 });
    }

    // Test 4: Check if images bucket exists
    const imagesBucket = buckets?.find(b => b.name === 'images');
    
    if (!imagesBucket) {
      return NextResponse.json({ 
        error: 'Images bucket not found',
        availableBuckets: buckets?.map(b => ({ name: b.name, id: b.id, public: b.public })) || [],
        message: 'Please create the images bucket in Supabase',
        environment: envVars,
        connection: 'Working',
        bucketsFound: buckets?.length || 0
      }, { status: 404 });
    }

    // Test 5: Try to access the images bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('images')
      .list('', { limit: 1 });

    if (filesError) {
      return NextResponse.json({ 
        error: 'Failed to access images bucket',
        details: filesError.message,
        bucketExists: true,
        bucketInfo: {
          id: imagesBucket.id,
          name: imagesBucket.name,
          public: imagesBucket.public
        },
        environment: envVars,
        connection: 'Working'
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Supabase connection and storage working perfectly',
      environment: envVars,
      connection: 'Working',
      bucketInfo: {
        id: imagesBucket.id,
        name: imagesBucket.name,
        public: imagesBucket.public
      },
      filesCount: files?.length || 0,
      availableBuckets: buckets?.map(b => b.name) || [],
      totalBuckets: buckets?.length || 0
    });

  } catch (error) {
    console.error('Exception in test-supabase:', error);
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 