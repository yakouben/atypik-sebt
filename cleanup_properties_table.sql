-- Clean up properties table to match the form exactly
-- This script removes unnecessary columns and keeps only what the form uses

-- First, let's see what columns currently exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Remove unnecessary columns that don't match the form
ALTER TABLE properties 
DROP COLUMN IF EXISTS rating,
DROP COLUMN IF EXISTS min_nights,
DROP COLUMN IF EXISTS amenities,
DROP COLUMN IF EXISTS type;

-- Keep only the columns that the form actually uses:
-- id (primary key - keep)
-- owner_id (foreign key - keep)
-- name (form field - keep)
-- category (form field - keep)
-- price_per_night (form field - keep)
-- description (form field - keep)
-- location (form field - keep)
-- maps_link (form field - keep)
-- max_guests (form field - keep)
-- images (form field - keep)
-- is_published (form sets this - keep)
-- is_available (form sets this - keep)
-- created_at (timestamp - keep)
-- updated_at (timestamp - keep)

-- Make sure all required columns exist with correct types
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS maps_link TEXT,
ADD COLUMN IF NOT EXISTS max_guests INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Update existing properties to have default values for new columns
UPDATE properties 
SET 
  category = COALESCE(category, 'autre'),
  description = COALESCE(description, 'Description à venir...'),
  max_guests = COALESCE(max_guests, 2),
  is_published = COALESCE(is_published, true),
  is_available = COALESCE(is_available, true)
WHERE category IS NULL OR description IS NULL OR max_guests IS NULL OR is_published IS NULL OR is_available IS NULL;

-- Create indexes for better performance (only for columns we're keeping)
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_published ON properties(is_published);
CREATE INDEX IF NOT EXISTS idx_properties_available ON properties(is_available);
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(category);

-- Verify the final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND table_schema = 'public'
ORDER BY ordinal_position; 