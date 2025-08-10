-- Storage Policies for Property Images
-- Run these commands in your Supabase SQL Editor

-- 1. Create the property-images bucket (if it doesn't exist)
-- Note: You can also create this in the Supabase Dashboard under Storage

-- 2. Allow authenticated users to upload images to the property-images bucket
CREATE POLICY "Users can upload property images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'property-images' 
    AND auth.role() = 'authenticated'
  );

-- 3. Allow public to view property images (for displaying on the website)
CREATE POLICY "Public can view property images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'property-images'
  );

-- 4. Allow authenticated users to update their own images
CREATE POLICY "Users can update their property images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'property-images' 
    AND auth.role() = 'authenticated'
  );

-- 5. Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their property images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'property-images' 
    AND auth.role() = 'authenticated'
  );

-- 6. Optional: Allow users to list files in the bucket (for management)
CREATE POLICY "Users can list property images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'property-images' 
    AND auth.role() = 'authenticated'
  );

-- 7. Set bucket to public (if not already set)
-- Note: This is usually done in the Supabase Dashboard
 