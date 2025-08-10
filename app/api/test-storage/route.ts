import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    console.log('Testing Supabase storage connection...');
    
    // Test 1: Check if we can list buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      return NextResponse.json({ 
        error: 'Failed to list buckets',
        details: bucketError.message
      }, { status: 500 });
    }

    console.log('Buckets found:', buckets?.map(b => ({ id: b.id, name: b.name, public: b.public })));

    // Test 2: Check if images bucket exists
    const imagesBucket = buckets?.find(b => b.name === 'images');
    
    if (!imagesBucket) {
      return NextResponse.json({ 
        error: 'Images bucket not found',
        availableBuckets: buckets?.map(b => b.name) || [],
        message: 'Please create the images bucket in Supabase'
      }, { status: 404 });
    }

    // Test 3: Try to list files in the images bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('images')
      .list('', { limit: 10 });

    if (filesError) {
      console.error('Error listing files:', filesError);
      return NextResponse.json({ 
        error: 'Failed to list files in images bucket',
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
      message: 'Storage connection working',
      bucketInfo: {
        id: imagesBucket.id,
        name: imagesBucket.name,
        public: imagesBucket.public
      },
      filesCount: files?.length || 0,
      availableBuckets: buckets?.map(b => b.name) || []
    });

  } catch (error) {
    console.error('Exception in test-storage:', error);
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 