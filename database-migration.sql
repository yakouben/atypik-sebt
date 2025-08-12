-- =====================================================
-- COMPREHENSIVE DATABASE MIGRATION FOR BOOKINGS SYSTEM
-- =====================================================
-- This migration fixes all property data fetching issues
-- Run this in your Supabase SQL Editor

-- STEP 1: Add missing columns to bookings table
-- =====================================================
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS property_name TEXT,
ADD COLUMN IF NOT EXISTS property_location TEXT,
ADD COLUMN IF NOT EXISTS property_price_per_night DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS property_max_guests INTEGER,
ADD COLUMN IF NOT EXISTS property_images TEXT[],
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email_or_phone TEXT,
ADD COLUMN IF NOT EXISTS travel_type TEXT;

-- STEP 2: Add comments for documentation
-- =====================================================
COMMENT ON COLUMN bookings.property_name IS 'Stored property name for persistence';
COMMENT ON COLUMN bookings.property_location IS 'Stored property location for persistence';
COMMENT ON COLUMN bookings.property_price_per_night IS 'Stored property price per night for persistence';
COMMENT ON COLUMN bookings.property_max_guests IS 'Stored property max guests for persistence';
COMMENT ON COLUMN bookings.property_images IS 'Stored property images for persistence';
COMMENT ON COLUMN bookings.full_name IS 'Client full name for persistence';
COMMENT ON COLUMN bookings.email_or_phone IS 'Client contact info for persistence';
COMMENT ON COLUMN bookings.travel_type IS 'Type of travel (family/friends)';

-- STEP 3: Create indexes for better performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_bookings_property_name ON bookings(property_name);
CREATE INDEX IF NOT EXISTS idx_bookings_property_location ON bookings(property_location);
CREATE INDEX IF NOT EXISTS idx_bookings_full_name ON bookings(full_name);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- STEP 4: Update existing bookings with property data
-- =====================================================
-- This ensures all existing bookings have property information
UPDATE bookings 
SET 
  property_name = p.name,
  property_location = p.location,
  property_price_per_night = p.price_per_night,
  property_max_guests = p.max_guests,
  property_images = p.images
FROM properties p
WHERE bookings.property_id = p.id 
  AND (bookings.property_name IS NULL OR bookings.property_location IS NULL);

-- STEP 5: Create a view for easier booking queries
-- =====================================================
CREATE OR REPLACE VIEW owner_bookings_view AS
SELECT 
  b.id as booking_id,
  b.property_id,
  b.client_id,
  b.check_in_date,
  b.check_out_date,
  b.total_price,
  b.status,
  b.guest_count,
  b.special_requests,
  b.full_name,
  b.email_or_phone,
  b.travel_type,
  b.created_at,
  b.updated_at,
  -- Property data (prioritize stored over live)
  COALESCE(b.property_name, p.name) as property_name,
  COALESCE(b.property_location, p.location) as property_location,
  COALESCE(b.property_price_per_night, p.price_per_night) as property_price_per_night,
  COALESCE(b.property_max_guests, p.max_guests) as property_max_guests,
  COALESCE(b.property_images, p.images) as property_images,
  -- Client data
  c.full_name as client_full_name,
  c.email as client_email
FROM bookings b
LEFT JOIN properties p ON b.property_id = p.id
LEFT JOIN profiles c ON b.client_id = c.id
ORDER BY b.created_at DESC;

-- STEP 6: Create function for getting owner bookings
-- =====================================================
CREATE OR REPLACE FUNCTION get_owner_bookings(owner_uuid UUID)
RETURNS TABLE (
  booking_id UUID,
  property_id UUID,
  client_id UUID,
  check_in_date DATE,
  check_out_date DATE,
  total_price DECIMAL(10,2),
  status TEXT,
  guest_count INTEGER,
  special_requests TEXT,
  full_name TEXT,
  email_or_phone TEXT,
  travel_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  property_name TEXT,
  property_location TEXT,
  property_price_per_night DECIMAL(10,2),
  property_max_guests INTEGER,
  property_images TEXT[],
  client_full_name TEXT,
  client_email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.property_id,
    b.client_id,
    b.check_in_date,
    b.check_out_date,
    b.total_price,
    b.status,
    b.guest_count,
    b.special_requests,
    b.full_name,
    b.email_or_phone,
    b.travel_type,
    b.created_at,
    COALESCE(b.property_name, p.name) as property_name,
    COALESCE(b.property_location, p.location) as property_location,
    COALESCE(b.property_price_per_night, p.price_per_night) as property_price_per_night,
    COALESCE(b.property_max_guests, p.max_guests) as property_max_guests,
    COALESCE(b.property_images, p.images) as property_images,
    c.full_name as client_full_name,
    c.email as client_email
  FROM bookings b
  LEFT JOIN properties p ON b.property_id = p.id
  LEFT JOIN profiles c ON b.client_id = c.id
  WHERE p.owner_id = owner_uuid
  ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- STEP 7: Grant permissions
-- =====================================================
GRANT SELECT ON owner_bookings_view TO authenticated;
GRANT EXECUTE ON FUNCTION get_owner_bookings(UUID) TO authenticated;

-- STEP 8: Verify the migration
-- =====================================================
-- Check if columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'bookings' 
  AND column_name IN ('property_name', 'property_location', 'property_price_per_night', 'property_max_guests', 'property_images');

-- Check if indexes were created
SELECT 
  indexname, 
  indexdef
FROM pg_indexes 
WHERE tablename = 'bookings' 
  AND indexname LIKE 'idx_bookings_%';

-- Check if view was created
SELECT * FROM owner_bookings_view LIMIT 1;

-- Check if function was created
SELECT proname, prosrc FROM pg_proc WHERE proname = 'get_owner_bookings';

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- Your booking system should now work correctly
-- Property data will be fetched from stored fields first,
-- then fall back to live property data if available 