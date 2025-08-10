import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }

    if (!user) {
      console.error('Upload failed: User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting image upload for user:', user.id);

    const formData = await request.formData();
    const imageUrls: string[] = [];
    const errors: string[] = [];

    // Check if bucket exists with more detailed logging
    console.log('Checking for storage buckets...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      console.error('Bucket error details:', {
        message: bucketError.message
      });
      return NextResponse.json({ error: `Storage configuration error: ${bucketError.message}` }, { status: 500 });
    }

    console.log('Available buckets:', buckets?.map(b => ({ id: b.id, name: b.name, public: b.public })));

    // Check if images bucket exists in the list
    let bucketExists = buckets?.some(bucket => bucket.name === 'images');
    
    // If bucket not found in list, try to access it directly (it might exist but not be listed due to permissions)
    if (!bucketExists) {
      console.log('Images bucket not found in list, trying to access it directly...');
      try {
        const { data: files, error: filesError } = await supabase.storage
          .from('images')
          .list('', { limit: 1 });
        
        if (!filesError) {
          console.log('Images bucket exists and is accessible (not listed due to permissions)');
          bucketExists = true;
        } else {
          console.error('Images bucket not accessible:', filesError.message);
        }
      } catch (error) {
        console.error('Error testing images bucket access:', error);
      }
    }

    if (!bucketExists) {
      console.error('Bucket images does not exist or is not accessible');
      return NextResponse.json({ 
        error: 'Storage bucket not found. Please create the images bucket in Supabase.' 
      }, { status: 500 });
    }

    console.log('Bucket exists, processing files...');

    // Process each uploaded file
    const entries = Array.from(formData.entries());
    for (const [key, value] of entries) {
      if (value instanceof File) {
        const file = value;
        
        console.log('Processing file:', file.name, 'Size:', file.size);
        
        try {
          // Validate file type
          if (!file.type.startsWith('image/')) {
            const errorMsg = `Invalid file type: ${file.type}`;
            console.error(errorMsg);
            errors.push(errorMsg);
            continue;
          }

          // Generate unique filename
          const fileExt = file.name.split('.').pop() || 'jpg';
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

          console.log('Uploading to path:', fileName);

          // Upload to Supabase Storage
          const { data, error } = await supabase.storage
            .from('images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            const errorMsg = `Failed to upload ${file.name}: ${error.message}`;
            console.error(errorMsg);
            errors.push(errorMsg);
            continue;
          }

          console.log('File uploaded successfully:', data);

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(fileName);

          console.log('Public URL generated:', publicUrl);
          imageUrls.push(publicUrl);
          
        } catch (fileError) {
          const errorMsg = `Error processing ${file.name}: ${fileError}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }
    }

    // If we have any errors, return them
    if (errors.length > 0) {
      console.error('Upload completed with errors:', errors);
      return NextResponse.json({ 
        error: `Upload completed with errors: ${errors.join(', ')}`,
        imageUrls, // Return any successfully uploaded images
        errors 
      }, { status: 207 }); // 207 Multi-Status
    }

    console.log('All images uploaded successfully:', imageUrls);

    return NextResponse.json({ 
      imageUrls, 
      error: null 
    });
  } catch (error) {
    console.error('Exception in POST /api/properties/upload-images:', error);
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 