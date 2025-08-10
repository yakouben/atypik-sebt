-- Debug booking issue - Run this in your Supabase SQL editor

-- 1. Check if RLS is enabled on bookings table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'bookings' AND schemaname = 'public';

-- 2. Check current RLS policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'bookings' AND schemaname = 'public';

-- 3. Check if there are any existing bookings to understand the structure
SELECT 
    id,
    property_id,
    client_id,
    check_in_date,
    check_out_date,
    total_price,
    status,
    guest_count,
    full_name,
    email_or_phone,
    travel_type,
    created_at
FROM public.bookings 
LIMIT 5;

-- 4. Check the profiles table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check if there are any profiles
SELECT 
    id,
    email,
    full_name,
    user_type,
    created_at
FROM public.profiles 
LIMIT 5;

-- 6. Test the RLS policy manually (this will help identify the issue)
-- This query should return the current authenticated user's ID
SELECT 
    'Current auth.uid()' as test_type,
    auth.uid() as current_user_id;

-- 7. Check if the profiles table has the correct RLS policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'; 