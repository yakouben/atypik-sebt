-- Update properties table with new fields for property management
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS maps_link TEXT,
ADD COLUMN IF NOT EXISTS max_guests INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Create storage bucket for property images
-- Note: This needs to be done in Supabase dashboard or via API
-- Bucket name: property-images

-- Update existing properties to have default values
UPDATE properties 
SET 
  category = 'autre',
  description = 'Description à venir...',
  max_guests = 2,
  is_published = true,
  is_available = true
WHERE category IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_published ON properties(is_published);
CREATE INDEX IF NOT EXISTS idx_properties_available ON properties(is_available);
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(category);

-- Add RLS policies for properties
-- Allow owners to manage their own properties
CREATE POLICY "Owners can manage their own properties" ON properties
  FOR ALL USING (auth.uid() = owner_id);

-- Allow public to view published properties
CREATE POLICY "Public can view published properties" ON properties
  FOR SELECT USING (is_published = true);

-- Allow authenticated users to view all properties (for browsing)
CREATE POLICY "Authenticated users can view properties" ON properties
  FOR SELECT USING (auth.role() = 'authenticated'); 