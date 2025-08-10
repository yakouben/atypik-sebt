-- Comprehensive booking fix - Run this in your Supabase SQL editor

-- 1. First, let's check the current state
SELECT 'Current state check' as step;

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'bookings' AND schemaname = 'public';

-- 2. Drop ALL existing policies for bookings table
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.bookings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.bookings;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.bookings;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.bookings;

-- 3. Add missing columns if they don't exist
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email_or_phone TEXT,
ADD COLUMN IF NOT EXISTS travel_type TEXT CHECK (travel_type IN ('friends', 'family')) DEFAULT 'family';

-- 4. Update existing bookings to have default values for new columns
UPDATE public.bookings 
SET 
  full_name = COALESCE(full_name, 'Guest'),
  email_or_phone = COALESCE(email_or_phone, 'Not provided'),
  travel_type = COALESCE(travel_type, 'family')
WHERE full_name IS NULL OR email_or_phone IS NULL OR travel_type IS NULL;

-- 5. Create new, more permissive RLS policies for bookings

-- Policy for viewing bookings (users can view their own bookings or bookings for properties they own)
CREATE POLICY "Users can view their own bookings" ON public.bookings
    FOR SELECT USING (
        auth.uid() = client_id OR 
        auth.uid() IN (
            SELECT owner_id FROM public.properties WHERE id = property_id
        )
    );

-- Policy for inserting bookings (users can insert bookings where they are the client)
-- This is the key fix - we need to allow authenticated users to insert bookings
-- The client_id should be the same as auth.uid() since profiles.id = auth.users.id
CREATE POLICY "Users can insert their own bookings" ON public.bookings
    FOR INSERT WITH CHECK (
        auth.uid() = client_id
    );

-- Policy for updating bookings (users can update bookings they created or bookings for properties they own)
CREATE POLICY "Users can update their own bookings" ON public.bookings
    FOR UPDATE USING (
        auth.uid() = client_id OR 
        auth.uid() IN (
            SELECT owner_id FROM public.properties WHERE id = property_id
        )
    );

-- Policy for deleting bookings (users can delete bookings they created or bookings for properties they own)
CREATE POLICY "Users can delete their own bookings" ON public.bookings
    FOR DELETE USING (
        auth.uid() = client_id OR 
        auth.uid() IN (
            SELECT owner_id FROM public.properties WHERE id = property_id
        )
    );

-- 6. Verify the table structure
SELECT 'Table structure verification' as step;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Verify the policies were created
SELECT 'Policy verification' as step;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'bookings' AND schemaname = 'public';

-- 8. Test the RLS policies
SELECT 'RLS test' as step;
SELECT 
    'RLS is enabled' as status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'bookings' AND schemaname = 'public'
        ) THEN 'Policies exist'
        ELSE 'No policies found'
    END as policy_status
FROM information_schema.tables 
WHERE table_name = 'bookings' AND table_schema = 'public';

-- 9. Check if there are any existing bookings
SELECT 'Existing bookings check' as step;
SELECT COUNT(*) as total_bookings FROM public.bookings;

-- 10. Check profiles table structure
SELECT 'Profiles table check' as step;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position; 