# 🔧 Database Schema Fix Instructions

## 🎯 **The Problem:**
Your `properties` table is missing the `category` field (and possibly other fields) that the API is trying to insert. This is causing the 500 Internal Server Error when trying to save properties.

## 🚀 **Solution:**

### **Step 1: Run the Database Migration Script**

1. **Go to your Supabase Dashboard**
   - Open [supabase.com](https://supabase.com)
   - Sign in and select your project

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and paste this SQL script:**

```sql
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
```

4. **Execute the script**
   - Click the "Run" button or press Ctrl+Enter
   - Wait for the script to complete

### **Step 2: Verify the Fix**

1. **Check the results** - You should see a list of all columns in the properties table
2. **Look for these columns:**
   - ✅ `category` (VARCHAR)
   - ✅ `description` (TEXT)
   - ✅ `maps_link` (TEXT)
   - ✅ `max_guests` (INTEGER)
   - ✅ `is_published` (BOOLEAN)
   - ✅ `is_available` (BOOLEAN)

### **Step 3: Test the Fix**

1. **Go back to your application**
2. **Try to add a new property** - it should work now!
3. **Check the console** - no more 500 errors

## 🎉 **Expected Result:**

After running this script, your property form should work perfectly:
- ✅ Image uploads work (already fixed)
- ✅ Property creation works
- ✅ All fields save correctly
- ✅ No more database errors

## 🔍 **If You Still Have Issues:**

If you still get errors after running the script, check:

1. **Are you in the right Supabase project?**
   - Make sure your `.env.local` points to the correct project
   - Verify the project URL in your Supabase dashboard

2. **Did the script run successfully?**
   - Check for any error messages in the SQL editor
   - Make sure all columns were added

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

## 📞 **Need Help?**

If you're still having issues after following these steps, the problem might be:
- Wrong Supabase project
- RLS policies blocking the insert
- Environment variables not configured correctly

Let me know what happens after you run the SQL script! 