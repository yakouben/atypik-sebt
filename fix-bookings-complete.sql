-- Complete fix for bookings table - Run this in your Supabase SQL editor

-- 1. Add missing columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email_or_phone TEXT,
ADD COLUMN IF NOT EXISTS travel_type TEXT CHECK (travel_type IN ('friends', 'family')) DEFAULT 'family';

-- 2. Update existing bookings to have default values for new columns
UPDATE public.bookings 
SET 
  full_name = COALESCE(full_name, 'Guest'),
  email_or_phone = COALESCE(email_or_phone, 'Not provided'),
  travel_type = COALESCE(travel_type, 'family')
WHERE full_name IS NULL OR email_or_phone IS NULL OR travel_type IS NULL;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_full_name ON public.bookings(full_name);
CREATE INDEX IF NOT EXISTS idx_bookings_email_or_phone ON public.bookings(email_or_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_travel_type ON public.bookings(travel_type);

-- 4. Drop existing RLS policies that might be causing issues
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON public.bookings;

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
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'bookings' AND schemaname = 'public'; 