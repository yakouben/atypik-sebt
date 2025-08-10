-- Fix bookings table - Add missing columns
-- Run this in your Supabase SQL editor

-- Add missing columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email_or_phone TEXT,
ADD COLUMN IF NOT EXISTS travel_type TEXT CHECK (travel_type IN ('friends', 'family')) DEFAULT 'family';

-- Update existing bookings to have default values for new columns
UPDATE public.bookings 
SET 
  full_name = COALESCE(full_name, 'Guest'),
  email_or_phone = COALESCE(email_or_phone, 'Not provided'),
  travel_type = COALESCE(travel_type, 'family')
WHERE full_name IS NULL OR email_or_phone IS NULL OR travel_type IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_full_name ON public.bookings(full_name);
CREATE INDEX IF NOT EXISTS idx_bookings_email_or_phone ON public.bookings(email_or_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_travel_type ON public.bookings(travel_type);

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND table_schema = 'public'
ORDER BY ordinal_position; 