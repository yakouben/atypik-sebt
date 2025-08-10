import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    console.log('Debugging storage access...');
    
    // Test 1: Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Environment variables not configured',
        supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
        supabaseKey: supabaseKey ? 'Set' : 'Missing'
      }, { status: 500 });
    }

    // Test 2: Check if we can connect to Supabase
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return NextResponse.json({ 
        error: 'Failed to connect to Supabase',
        details: sessionError.message,
        supabaseUrl: supabaseUrl.substring(0, 20) + '...',
        supabaseKey: supabaseKey.substring(0, 10) + '...'
      }, { status: 500 });
    }

    // Test 3: Try to list buckets with detailed error handling
    console.log('Attempting to list storage buckets...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      return NextResponse.json({ 
        error: 'Failed to list storage buckets',
        details: bucketError.message,
        supabaseUrl: supabaseUrl.substring(0, 20) + '...',
        supabaseKey: supabaseKey.substring(0, 10) + '...',
        connection: 'Working',
        sessionExists: !!sessionData.session
      }, { status: 500 });
    }

    // Test 4: Check if buckets exist but are not accessible
    if (!buckets || buckets.length === 0) {
      // Try to access the images bucket directly
      console.log('No buckets found, trying to access images bucket directly...');
      const { data: files, error: filesError } = await supabase.storage
        .from('images')
        .list('', { limit: 1 });

      if (filesError) {
        return NextResponse.json({ 
          error: 'Images bucket exists but not accessible',
          details: filesError.message,
          supabaseUrl: supabaseUrl.substring(0, 20) + '...',
          supabaseKey: supabaseKey.substring(0, 10) + '...',
          connection: 'Working',
          sessionExists: !!sessionData.session,
          bucketsFound: 0,
          message: 'The bucket exists but your client cannot access it due to RLS policies or permissions'
        }, { status: 403 });
      }

      return NextResponse.json({ 
        success: true,
        message: 'Images bucket exists and is accessible',
        supabaseUrl: supabaseUrl.substring(0, 20) + '...',
        totalBuckets: 0,
        availableBuckets: [],
        imagesBucketExists: true,
        imagesBucketAccessible: true,
        filesCount: files?.length || 0,
        connection: 'Working',
        sessionExists: !!sessionData.session
      });
    }

    // Test 5: Check for images bucket in the list
    const imagesBucket = buckets?.find(b => b.name === 'images');
    
    if (!imagesBucket) {
      return NextResponse.json({ 
        error: 'Images bucket not found in accessible buckets',
        availableBuckets: buckets?.map(b => ({ name: b.name, id: b.id, public: b.public })) || [],
        totalBuckets: buckets?.length || 0,
        supabaseUrl: supabaseUrl.substring(0, 20) + '...',
        supabaseKey: supabaseKey.substring(0, 10) + '...',
        connection: 'Working',
        sessionExists: !!sessionData.session,
        message: 'The images bucket does not exist in this project or is not accessible'
      }, { status: 404 });
    }

    // Test 6: Try to access the images bucket
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
        supabaseUrl: supabaseUrl.substring(0, 20) + '...',
        supabaseKey: supabaseKey.substring(0, 10) + '...',
        connection: 'Working',
        sessionExists: !!sessionData.session
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Storage access working perfectly',
      supabaseUrl: supabaseUrl.substring(0, 20) + '...',
      totalBuckets: buckets?.length || 0,
      availableBuckets: buckets?.map(b => ({ name: b.name, id: b.id, public: b.public })) || [],
      imagesBucketExists: true,
      imagesBucketAccessible: true,
      imagesBucketInfo: {
        id: imagesBucket.id,
        name: imagesBucket.name,
        public: imagesBucket.public
      },
      filesCount: files?.length || 0,
      connection: 'Working',
      sessionExists: !!sessionData.session
    });

  } catch (error) {
    console.error('Exception in debug-storage:', error);
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 