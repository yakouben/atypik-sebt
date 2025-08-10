import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    console.log('Checking storage permissions...');
    
    // Test 1: Check if we can list buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      return NextResponse.json({ 
        error: 'Cannot list buckets',
        details: bucketError.message,
        solution: 'This might be due to RLS policies or permissions'
      }, { status: 500 });
    }

    // Test 2: Try to access images bucket directly
    const { data: files, error: filesError } = await supabase.storage
      .from('images')
      .list('', { limit: 1 });

    if (filesError) {
      return NextResponse.json({ 
        error: 'Cannot access images bucket',
        details: filesError.message,
        solution: 'Check RLS policies for the images bucket',
        bucketsFound: buckets?.length || 0,
        availableBuckets: buckets?.map(b => b.name) || []
      }, { status: 500 });
    }

    // Test 3: Check if we can upload a test file (simulate)
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = 'This is a test file to check upload permissions';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFile = new File([testBlob], testFileName, { type: 'text/plain' });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(`test/${testFileName}`, testFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json({ 
        error: 'Cannot upload to images bucket',
        details: uploadError.message,
        solution: 'Check INSERT policy for the images bucket',
        bucketAccessible: true,
        filesCount: files?.length || 0
      }, { status: 500 });
    }

    // Clean up test file
    if (uploadData) {
      await supabase.storage
        .from('images')
        .remove([`test/${testFileName}`]);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Storage permissions working correctly',
      bucketsFound: buckets?.length || 0,
      availableBuckets: buckets?.map(b => b.name) || [],
      imagesBucketAccessible: true,
      imagesBucketWritable: true,
      filesCount: files?.length || 0,
      testUploadSuccessful: true
    });

  } catch (error) {
    console.error('Exception in fix-storage-permissions:', error);
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 