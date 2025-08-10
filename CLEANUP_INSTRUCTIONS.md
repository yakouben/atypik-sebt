# 🧹 Database Schema Cleanup Instructions

## 🎯 **The Problem:**
Your `properties` table has extra columns that your form doesn't use (like `rating`, `min_nights`, `amenities`, `type`), which is causing schema mismatches and errors.

## 🚀 **Solution: Clean Up the Database Schema**

### **Step 1: Run the Cleanup Script**

1. **Go to your Supabase Dashboard**
   - Open [supabase.com](https://supabase.com)
   - Sign in and select your project

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and paste this cleanup script:**

```sql
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
```

4. **Execute the script**
   - Click the "Run" button or press Ctrl+Enter
   - Wait for the script to complete

### **Step 2: Verify the Cleanup**

After running the script, you should see a list of columns that includes **ONLY** these:

✅ **Required Columns (Form Fields):**
- `id` (primary key)
- `owner_id` (foreign key)
- `name` (form field)
- `category` (form field)
- `price_per_night` (form field)
- `description` (form field)
- `location` (form field)
- `maps_link` (form field)
- `max_guests` (form field)
- `images` (form field)
- `is_published` (form sets this)
- `is_available` (form sets this)
- `created_at` (timestamp)
- `updated_at` (timestamp)

❌ **Removed Columns:**
- `rating` (removed)
- `min_nights` (removed)
- `amenities` (removed)
- `type` (removed)

### **Step 3: Test the Clean Schema**

1. **Go back to your application**
2. **Try to add a new property** - it should work perfectly now!
3. **Check the console** - no more schema mismatch errors

## 🎉 **Expected Result:**

After running this script, your property form should work perfectly:
- ✅ **Image uploads**: Already working
- ✅ **Property creation**: Will work with clean schema
- ✅ **All form fields**: Will save correctly
- ✅ **No schema errors**: Clean database structure

## 🔍 **Why This Fixes the Issue:**

The problem was that your database had extra columns (`rating`, `min_nights`, `amenities`, `type`) that your form doesn't use, causing schema mismatches. By removing these unnecessary columns and keeping only what your form actually needs, the database will match your form exactly.

## 📞 **Need Help?**

If you still get errors after running the script:
1. **Check if all unnecessary columns were removed**
2. **Verify the final table structure matches the list above**
3. **Restart your development server**: `npm run dev`

**Run the cleanup script now and your property form will work perfectly!** 🚀 