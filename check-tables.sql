-- Check what tables exist in your database
SELECT 
    table_name,
    table_type,
    CASE 
        WHEN table_type = 'BASE TABLE' THEN 'Table'
        WHEN table_type = 'VIEW' THEN 'View'
        ELSE table_type
    END as type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check table row counts
SELECT 
    'profiles' as table_name,
    COUNT(*) as row_count
FROM public.profiles
UNION ALL
SELECT 
    'properties' as table_name,
    COUNT(*) as row_count
FROM public.properties
UNION ALL
SELECT 
    'bookings' as table_name,
    COUNT(*) as row_count
FROM public.bookings; 