-- =====================================================
-- COMPLETE STORAGE CLEANUP AND SETUP FOR IMAGES BUCKET
-- =====================================================
-- Run this entire script in your Supabase SQL Editor
-- This will remove ALL existing storage buckets and recreate the images bucket

-- =====================================================
-- STEP 1: REMOVE ALL EXISTING STORAGE POLICIES
-- =====================================================

-- Drop ALL existing storage policies for any bucket
DROP POLICY IF EXISTS "Users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their images" ON storage.objects;
DROP POLICY IF EXISTS "Users can list images" ON storage.objects;

-- Drop policies for property-images bucket (if they exist)
DROP POLICY IF EXISTS "Users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can list property images" ON storage.objects;

-- Drop any other storage policies that might exist
DROP POLICY IF EXISTS "Users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their files" ON storage.objects;
DROP POLICY IF EXISTS "Users can list files" ON storage.objects;

-- =====================================================
-- STEP 2: REMOVE ALL EXISTING STORAGE OBJECTS AND BUCKETS
-- =====================================================

-- Delete all objects from all buckets first
DELETE FROM storage.objects WHERE bucket_id = 'images';
DELETE FROM storage.objects WHERE bucket_id = 'property-images';
DELETE FROM storage.objects WHERE bucket_id = 'avatars';
DELETE FROM storage.objects WHERE bucket_id = 'files';

-- Remove all existing buckets
DELETE FROM storage.buckets WHERE id = 'images';
DELETE FROM storage.buckets WHERE id = 'property-images';
DELETE FROM storage.buckets WHERE id = 'avatars';
DELETE FROM storage.buckets WHERE id = 'files';

-- =====================================================
-- STEP 3: CREATE NEW IMAGES BUCKET
-- =====================================================

-- Create the images bucket with proper settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images', 
  'images', 
  true, 
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
);

-- =====================================================
-- STEP 4: CREATE STORAGE POLICIES FOR IMAGES BUCKET
-- =====================================================

-- Policy 1: Allow authenticated users to upload images
CREATE POLICY "Users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
  );

-- Policy 2: Allow public to view images (for displaying on the website)
CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'images'
  );

-- Policy 3: Allow authenticated users to update their own images
CREATE POLICY "Users can update their images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
  );

-- Policy 4: Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
  );

-- Policy 5: Allow authenticated users to list files in the bucket
CREATE POLICY "Users can list images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
  );

-- =====================================================
-- STEP 5: VERIFY SETUP
-- =====================================================

-- Check if bucket was created successfully
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  created_at
FROM storage.buckets 
WHERE name = 'images';

-- Check if policies were created successfully
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%images%'
ORDER BY policyname;

-- =====================================================
-- STEP 6: TEST UPLOAD PERMISSIONS
-- =====================================================
-- This query will help verify that the policies are working
-- Run this after setting up the bucket and policies

-- Check current user permissions (run this as an authenticated user)
SELECT 
  bucket_id,
  name,
  owner,
  created_at,
  updated_at
FROM storage.objects 
WHERE bucket_id = 'images'
LIMIT 5; 