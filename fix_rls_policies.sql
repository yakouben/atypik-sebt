-- Fix RLS Policies for Properties Table
-- This script will drop existing policies and create new ones

-- Step 1: Drop all existing policies for properties table
DROP POLICY IF EXISTS "Owners can insert their own properties" ON properties;
DROP POLICY IF EXISTS "Owners can view their own properties" ON properties;
DROP POLICY IF EXISTS "Owners can update their own properties" ON properties;
DROP POLICY IF EXISTS "Owners can delete their own properties" ON properties;
DROP POLICY IF EXISTS "Public can view published properties" ON properties;
DROP POLICY IF EXISTS "Owners can manage their own properties" ON properties;
DROP POLICY IF EXISTS "Anyone can view published properties" ON properties;
DROP POLICY IF EXISTS "Authenticated users can view properties" ON properties;

-- Step 2: Create new policies
CREATE POLICY "Owners can insert their own properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can view their own properties" ON properties
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own properties" ON properties
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own properties" ON properties
  FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Public can view published properties" ON properties
  FOR SELECT USING (is_published = true);

-- Step 3: Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'properties'; 