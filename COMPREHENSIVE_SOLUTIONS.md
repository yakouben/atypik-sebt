# 🔧 Comprehensive Solutions for Properties API Error

## 🎯 **Current Problem:**
You're getting a 500 Internal Server Error when trying to save properties, even after running the cleanup script.

## 🚀 **Multiple Solutions to Try:**

### **Solution 1: Run the Cleanup Script (If Not Done Yet)**

1. **Go to Supabase Dashboard** → SQL Editor
2. **Run this exact script:**

```sql
-- Clean up properties table to match the form exactly
ALTER TABLE properties 
DROP COLUMN IF EXISTS rating,
DROP COLUMN IF EXISTS min_nights,
DROP COLUMN IF EXISTS amenities,
DROP COLUMN IF EXISTS type;

-- Add missing columns
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS maps_link TEXT,
ADD COLUMN IF NOT EXISTS max_guests INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Update existing data
UPDATE properties 
SET 
  category = COALESCE(category, 'autre'),
  description = COALESCE(description, 'Description à venir...'),
  max_guests = COALESCE(max_guests, 2),
  is_published = COALESCE(is_published, true),
  is_available = COALESCE(is_available, true)
WHERE category IS NULL OR description IS NULL OR max_guests IS NULL OR is_published IS NULL OR is_available IS NULL;
```

### **Solution 2: Check Database Schema**

Run this query in Supabase SQL Editor to see your current table structure:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

**Expected columns:**
- ✅ `id` (uuid)
- ✅ `owner_id` (uuid)
- ✅ `name` (text)
- ✅ `category` (varchar)
- ✅ `price_per_night` (numeric)
- ✅ `description` (text)
- ✅ `location` (text)
- ✅ `maps_link` (text)
- ✅ `max_guests` (integer)
- ✅ `images` (text array)
- ✅ `is_published` (boolean)
- ✅ `is_available` (boolean)
- ✅ `created_at` (timestamp)
- ✅ `updated_at` (timestamp)

### **Solution 3: Test the Debug Endpoint**

1. **Open your browser**
2. **Go to:** `http://localhost:3000/api/debug-properties`
3. **Check the response** - it will tell you exactly what's wrong

### **Solution 4: Check RLS Policies**

Run this in Supabase SQL Editor to ensure proper RLS policies:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Owners can insert their own properties" ON properties;
DROP POLICY IF EXISTS "Owners can manage their own properties" ON properties;

-- Create new policies
CREATE POLICY "Owners can insert their own properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can view their own properties" ON properties
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own properties" ON properties
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own properties" ON properties
  FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Public can view published properties" ON properties
  FOR SELECT USING (is_published = true);
```

### **Solution 5: Check User Profile**

Make sure the user exists in the profiles table:

```sql
-- Check if user profile exists
SELECT * FROM profiles WHERE id = 'your-user-id-here';

-- If not, create it
INSERT INTO profiles (id, email, full_name, user_type)
VALUES ('your-user-id-here', 'user@example.com', 'User Name', 'owner')
ON CONFLICT (id) DO NOTHING;
```

### **Solution 6: Alternative API Approach**

If the main API still fails, try this simplified version. Create `app/api/properties-simple/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const propertyData = await request.json();
    
    const newProperty = {
      name: propertyData.name,
      category: propertyData.category,
      price_per_night: parseFloat(propertyData.price_per_night),
      description: propertyData.description,
      location: propertyData.location,
      maps_link: propertyData.maps_link || null,
      max_guests: parseInt(propertyData.max_guests),
      images: propertyData.images || [],
      owner_id: user.id,
      is_published: true,
      is_available: true
    };

    const { data, error } = await supabase
      .from('properties')
      .insert(newProperty)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, success: true });
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

### **Solution 7: Environment Variables Check**

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Solution 8: Restart Everything**

1. **Stop the dev server**: `Ctrl+C`
2. **Clear Next.js cache**: `rm -rf .next`
3. **Restart**: `npm run dev`

## 🔍 **Debugging Steps:**

### **Step 1: Check the Debug Endpoint**
Visit: `http://localhost:3000/api/debug-properties`

### **Step 2: Check Browser Console**
Open DevTools → Console → Look for detailed error messages

### **Step 3: Check Server Logs**
Look at your terminal where `npm run dev` is running

### **Step 4: Test Database Connection**
Run this in Supabase SQL Editor:
```sql
SELECT COUNT(*) FROM properties;
```

## 🎯 **Most Likely Issues:**

1. **Missing columns** - Run Solution 1
2. **RLS policies** - Run Solution 4
3. **User profile missing** - Run Solution 5
4. **Environment variables** - Check Solution 7

## 🚀 **Quick Fix Sequence:**

1. **Run the cleanup script** (Solution 1)
2. **Check debug endpoint** (Solution 3)
3. **Fix RLS policies** (Solution 4)
4. **Restart server** (Solution 8)
5. **Test property creation**

**Try these solutions in order and let me know what the debug endpoint shows!** 🎯 