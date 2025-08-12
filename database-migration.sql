-- Migration: Add property details to bookings table for data persistence
-- This ensures property information is preserved even if properties are deleted

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS property_name TEXT,
ADD COLUMN IF NOT EXISTS property_location TEXT,
ADD COLUMN IF NOT EXISTS property_price_per_night DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS property_max_guests INTEGER,
ADD COLUMN IF NOT EXISTS property_images TEXT[];

-- Add comments for documentation
COMMENT ON COLUMN bookings.property_name IS 'Stored property name for persistence when property is deleted';
COMMENT ON COLUMN bookings.property_location IS 'Stored property location for persistence when property is deleted';
COMMENT ON COLUMN bookings.property_price_per_night IS 'Stored property price per night for persistence when property is deleted';
COMMENT ON COLUMN bookings.property_max_guests IS 'Stored property max guests for persistence when property is deleted';
COMMENT ON COLUMN bookings.property_images IS 'Stored property images array for persistence when property is deleted';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_property_name ON bookings(property_name);
CREATE INDEX IF NOT EXISTS idx_bookings_property_location ON bookings(property_location);
CREATE INDEX IF NOT EXISTS idx_bookings_property_price ON bookings(property_price_per_night);

-- Update existing bookings to populate these fields (optional - for data consistency)
-- This will populate the new fields for existing bookings based on current property data
UPDATE bookings 
SET 
  property_name = properties.name,
  property_location = properties.location,
  property_price_per_night = properties.price_per_night,
  property_max_guests = properties.max_guests,
  property_images = properties.images
FROM properties 
WHERE bookings.property_id = properties.id 
  AND (bookings.property_name IS NULL OR bookings.property_location IS NULL);

-- Verify the migration
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
  AND column_name LIKE 'property_%'
ORDER BY column_name; 