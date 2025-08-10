-- Fix properties table structure
-- This script will check and add missing columns to the properties table

-- First, let's check what columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_published ON properties(is_published);
CREATE INDEX IF NOT EXISTS idx_properties_available ON properties(is_available);
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(category);

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND table_schema = 'public'
ORDER BY ordinal_position; 