-- First, drop ALL existing policies to start fresh
-- This will remove any conflicting policies

-- Drop policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;

-- Drop policies for properties table
DROP POLICY IF EXISTS "Anyone can view published properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can view own properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can update own properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can delete own properties" ON public.properties;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.properties;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.properties;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.properties;

-- Drop policies for bookings table
DROP POLICY IF EXISTS "Clients can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Owners can view property bookings" ON public.bookings;
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Clients can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Owners can update property bookings" ON public.bookings;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.bookings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.bookings;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.bookings;

-- Drop policies for views
DROP POLICY IF EXISTS "Clients can view own bookings from view" ON public.client_bookings_view;
DROP POLICY IF EXISTS "Owners can view property bookings from view" ON public.owner_bookings_view;
DROP POLICY IF EXISTS "Owners can view own properties from view" ON public.owner_properties_view;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.client_bookings_view;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.owner_bookings_view;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.owner_properties_view;

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Now create the policies fresh
-- Profiles table policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Properties table policies
CREATE POLICY "Anyone can view published properties" ON public.properties
    FOR SELECT USING (is_published = true);

CREATE POLICY "Owners can view own properties" ON public.properties
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert properties" ON public.properties
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own properties" ON public.properties
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own properties" ON public.properties
    FOR DELETE USING (auth.uid() = owner_id);

-- Bookings table policies
CREATE POLICY "Clients can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Owners can view property bookings" ON public.bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.properties 
            WHERE properties.id = bookings.property_id 
            AND properties.owner_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = client_id
    );

CREATE POLICY "Clients can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Owners can update property bookings" ON public.bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.properties 
            WHERE properties.id = bookings.property_id 
            AND properties.owner_id = auth.uid()
        )
    );

-- Drop the problematic views (simplest solution)
DROP VIEW IF EXISTS public.client_bookings_view;
DROP VIEW IF EXISTS public.owner_bookings_view;
DROP VIEW IF EXISTS public.owner_properties_view;

-- Verify everything is set up correctly
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname; 