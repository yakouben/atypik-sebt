-- =====================================================
-- COMPLETE BOOKING SYSTEM FOR PROPERTY OWNERS
-- =====================================================

-- 1. ENSURE BOOKINGS TABLE HAS ALL REQUIRED COLUMNS
-- =====================================================

-- Add missing columns if they don't exist
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email_or_phone TEXT,
ADD COLUMN IF NOT EXISTS travel_type TEXT CHECK (travel_type IN ('friends', 'family')) DEFAULT 'family',
ADD COLUMN IF NOT EXISTS special_requests TEXT,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending';

-- Update existing bookings to have default values for new columns
UPDATE public.bookings 
SET 
  full_name = COALESCE(full_name, 'Guest'),
  email_or_phone = COALESCE(email_or_phone, 'Not provided'),
  travel_type = COALESCE(travel_type, 'family'),
  status = COALESCE(status, 'pending')
WHERE full_name IS NULL OR email_or_phone IS NULL OR travel_type IS NULL OR status IS NULL;

-- 2. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Indexes for booking queries
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON public.bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON public.bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_full_name ON public.bookings(full_name);
CREATE INDEX IF NOT EXISTS idx_bookings_email_or_phone ON public.bookings(email_or_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_travel_type ON public.bookings(travel_type);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bookings_property_status ON public.bookings(property_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_client_status ON public.bookings(client_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates_status ON public.bookings(check_in_date, check_out_date, status);

-- 3. CREATE VIEWS FOR EASY QUERYING
-- =====================================================

-- View for property owners to see all bookings for their properties
CREATE OR REPLACE VIEW owner_bookings_view AS
SELECT 
    b.id as booking_id,
    b.check_in_date,
    b.check_out_date,
    b.total_price,
    b.status,
    b.guest_count,
    b.special_requests,
    b.full_name as client_name,
    b.email_or_phone as client_contact,
    b.travel_type,
    b.created_at as booking_created_at,
    b.updated_at as booking_updated_at,
    p.id as property_id,
    p.name as property_name,
    p.location as property_location,
    p.images as property_images,
    p.price_per_night,
    c.id as client_id,
    c.full_name as client_full_name,
    c.email as client_email,
    o.id as owner_id,
    o.full_name as owner_name,
    o.email as owner_email
FROM public.bookings b
JOIN public.properties p ON b.property_id = p.id
JOIN public.profiles c ON b.client_id = c.id
JOIN public.profiles o ON p.owner_id = o.id
ORDER BY b.created_at DESC;

-- View for clients to see their own bookings
CREATE OR REPLACE VIEW client_bookings_view AS
SELECT 
    b.id as booking_id,
    b.check_in_date,
    b.check_out_date,
    b.total_price,
    b.status,
    b.guest_count,
    b.special_requests,
    b.full_name,
    b.email_or_phone,
    b.travel_type,
    b.created_at as booking_created_at,
    b.updated_at as booking_updated_at,
    p.id as property_id,
    p.name as property_name,
    p.location as property_location,
    p.images as property_images,
    p.price_per_night,
    o.id as owner_id,
    o.full_name as owner_name,
    o.email as owner_email
FROM public.bookings b
JOIN public.properties p ON b.property_id = p.id
JOIN public.profiles o ON p.owner_id = o.id
ORDER BY b.created_at DESC;

-- 4. CREATE FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function to get all bookings for a property owner
CREATE OR REPLACE FUNCTION get_owner_bookings(owner_uuid UUID)
RETURNS TABLE (
    booking_id UUID,
    check_in_date DATE,
    check_out_date DATE,
    total_price DECIMAL(10,2),
    status TEXT,
    guest_count INTEGER,
    special_requests TEXT,
    client_name TEXT,
    client_contact TEXT,
    travel_type TEXT,
    booking_created_at TIMESTAMP WITH TIME ZONE,
    property_id UUID,
    property_name TEXT,
    property_location TEXT,
    property_images TEXT[],
    price_per_night DECIMAL(10,2),
    client_id UUID,
    client_full_name TEXT,
    client_email TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
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
        p.id,
        p.name,
        p.location,
        p.images,
        p.price_per_night,
        c.id,
        c.full_name,
        c.email
    FROM public.bookings b
    JOIN public.properties p ON b.property_id = p.id
    JOIN public.profiles c ON b.client_id = c.id
    WHERE p.owner_id = owner_uuid
    ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get booking statistics for a property owner
CREATE OR REPLACE FUNCTION get_owner_booking_stats(owner_uuid UUID)
RETURNS TABLE (
    total_bookings BIGINT,
    pending_bookings BIGINT,
    confirmed_bookings BIGINT,
    completed_bookings BIGINT,
    cancelled_bookings BIGINT,
    total_revenue DECIMAL(10,2),
    average_booking_value DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE b.status = 'pending') as pending_bookings,
        COUNT(*) FILTER (WHERE b.status = 'confirmed') as confirmed_bookings,
        COUNT(*) FILTER (WHERE b.status = 'completed') as completed_bookings,
        COUNT(*) FILTER (WHERE b.status = 'cancelled') as cancelled_bookings,
        COALESCE(SUM(b.total_price) FILTER (WHERE b.status IN ('confirmed', 'completed')), 0) as total_revenue,
        COALESCE(AVG(b.total_price) FILTER (WHERE b.status IN ('confirmed', 'completed')), 0) as average_booking_value
    FROM public.bookings b
    JOIN public.properties p ON b.property_id = p.id
    WHERE p.owner_id = owner_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update booking status
CREATE OR REPLACE FUNCTION update_booking_status(booking_uuid UUID, new_status TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    booking_exists BOOLEAN;
BEGIN
    -- Check if booking exists and user has permission
    SELECT EXISTS(
        SELECT 1 FROM public.bookings b
        JOIN public.properties p ON b.property_id = p.id
        WHERE b.id = booking_uuid 
        AND (b.client_id = auth.uid() OR p.owner_id = auth.uid())
    ) INTO booking_exists;
    
    IF NOT booking_exists THEN
        RETURN FALSE;
    END IF;
    
    -- Update the booking status
    UPDATE public.bookings 
    SET status = new_status, updated_at = NOW()
    WHERE id = booking_uuid;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. ENHANCE RLS POLICIES FOR BOOKINGS
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON public.bookings;

-- Enhanced RLS policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
    FOR SELECT USING (
        auth.uid() = client_id OR 
        auth.uid() IN (
            SELECT owner_id FROM public.properties WHERE id = property_id
        )
    );

CREATE POLICY "Users can insert their own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
    FOR UPDATE USING (
        auth.uid() = client_id OR 
        auth.uid() IN (
            SELECT owner_id FROM public.properties WHERE id = property_id
        )
    );

CREATE POLICY "Users can delete their own bookings" ON public.bookings
    FOR DELETE USING (
        auth.uid() = client_id OR 
        auth.uid() IN (
            SELECT owner_id FROM public.properties WHERE id = property_id
        )
    );

-- 7. CREATE HELPER FUNCTIONS FOR DASHBOARD
-- =====================================================

-- Function to get recent bookings for dashboard
CREATE OR REPLACE FUNCTION get_recent_bookings(owner_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    booking_id UUID,
    check_in_date DATE,
    check_out_date DATE,
    total_price DECIMAL(10,2),
    status TEXT,
    guest_count INTEGER,
    client_name TEXT,
    property_name TEXT,
    property_location TEXT,
    booking_created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.check_in_date,
        b.check_out_date,
        b.total_price,
        b.status,
        b.guest_count,
        b.full_name,
        p.name,
        p.location,
        b.created_at
    FROM public.bookings b
    JOIN public.properties p ON b.property_id = p.id
    WHERE p.owner_id = owner_uuid
    ORDER BY b.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get bookings by status
CREATE OR REPLACE FUNCTION get_bookings_by_status(owner_uuid UUID, booking_status TEXT)
RETURNS TABLE (
    booking_id UUID,
    check_in_date DATE,
    check_out_date DATE,
    total_price DECIMAL(10,2),
    status TEXT,
    guest_count INTEGER,
    client_name TEXT,
    property_name TEXT,
    property_location TEXT,
    booking_created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.check_in_date,
        b.check_out_date,
        b.total_price,
        b.status,
        b.guest_count,
        b.full_name,
        p.name,
        p.location,
        b.created_at
    FROM public.bookings b
    JOIN public.properties p ON b.property_id = p.id
    WHERE p.owner_id = owner_uuid AND b.status = booking_status
    ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. VERIFICATION QUERIES
-- =====================================================

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if all indexes were created
SELECT 
    indexname, 
    tablename 
FROM pg_indexes 
WHERE tablename = 'bookings' 
AND schemaname = 'public';

-- Test the owner bookings function (replace with actual owner UUID)
-- SELECT * FROM get_owner_bookings('your-owner-uuid-here');

-- Test the booking stats function (replace with actual owner UUID)
-- SELECT * FROM get_owner_booking_stats('your-owner-uuid-here'); 