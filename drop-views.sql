-- Drop the problematic views that are causing "Unrestricted" security warnings
-- This is the simplest solution if you don't need these views

DROP VIEW IF EXISTS public.client_bookings_view;
DROP VIEW IF EXISTS public.owner_bookings_view;
DROP VIEW IF EXISTS public.owner_properties_view;

-- Verify the views are gone
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'VIEW'; 