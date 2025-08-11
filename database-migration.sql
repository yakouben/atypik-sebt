-- Migration: Add property details to bookings table
-- This ensures property information is preserved even if properties are deleted

-- Add new columns to store property details
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS property_name TEXT,
ADD COLUMN IF NOT EXISTS property_location TEXT,
ADD COLUMN IF NOT EXISTS property_price_per_night DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS property_max_guests INTEGER,
ADD COLUMN IF NOT EXISTS property_images TEXT[];

-- Add comments for documentation
COMMENT ON COLUMN bookings.property_name IS 'Stored property name for persistence';
COMMENT ON COLUMN bookings.property_location IS 'Stored property location for persistence';
COMMENT ON COLUMN bookings.property_price_per_night IS 'Stored property price per night for persistence';
COMMENT ON COLUMN bookings.property_max_guests IS 'Stored property max guests for persistence';
COMMENT ON COLUMN bookings.property_images IS 'Stored property images for persistence';

-- Create index for better performance when searching by stored property data
CREATE INDEX IF NOT EXISTS idx_bookings_property_name ON bookings(property_name);
CREATE INDEX IF NOT EXISTS idx_bookings_property_location ON bookings(property_location); 