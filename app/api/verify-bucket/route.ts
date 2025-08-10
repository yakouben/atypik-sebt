import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    console.log('Verifying bucket setup...');
    
    // Test 1: List all buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      return NextResponse.json({ 
        error: 'Failed to list buckets',
        details: bucketError.message
      }, { status: 500 });
    }

    // Test 2: Check if images bucket exists
    const imagesBucket = buckets?.find(b => b.name === 'images');
    
    if (!imagesBucket) {
      return NextResponse.json({ 
        error: 'Images bucket not found',
        availableBuckets: buckets?.map(b => ({ name: b.name, id: b.id, public: b.public })) || [],
        message: 'Please run the storage_cleanup_and_setup.sql script in your Supabase SQL editor'
      }, { status: 404 });
    }

    // Test 3: Try to access the bucket
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
        }
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Images bucket is properly configured',
      bucketInfo: {
        id: imagesBucket.id,
        name: imagesBucket.name,
        public: imagesBucket.public
      },
      filesCount: files?.length || 0,
      availableBuckets: buckets?.map(b => b.name) || []
    });

  } catch (error) {
    console.error('Exception in verify-bucket:', error);
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 