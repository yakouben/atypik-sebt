# 🏠 Complete Booking System for Property Owners

## 📋 Overview

This document describes the complete booking system implementation for property owners, including database schema, API endpoints, and frontend components.

## 🗄️ Database Schema

### Bookings Table Structure

```sql
-- Complete bookings table with all required fields
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
    guest_count INTEGER NOT NULL DEFAULT 1,
    special_requests TEXT,
    full_name TEXT,
    email_or_phone TEXT,
    travel_type TEXT CHECK (travel_type IN ('friends', 'family')) DEFAULT 'family',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Features

- ✅ **Complete booking information storage**
- ✅ **Status management** (pending, confirmed, cancelled, completed)
- ✅ **Client details** (full name, email/phone, travel type)
- ✅ **Special requests support**
- ✅ **Automatic timestamps**
- ✅ **Foreign key relationships**

## 🔗 API Endpoints

### 1. Create Booking
```http
POST /api/bookings
```

**Request Body:**
```json
{
  "property_id": "uuid",
  "client_id": "uuid",
  "check_in_date": "2024-01-15",
  "check_out_date": "2024-01-20",
  "guest_count": 2,
  "total_price": 500.00,
  "full_name": "John Doe",
  "email_or_phone": "john@example.com",
  "travel_type": "family",
  "special_requests": "Early check-in preferred"
}
```

**Response:**
```json
{
  "data": {
    "id": "booking-uuid",
    "property_id": "property-uuid",
    "client_id": "client-uuid",
    "check_in_date": "2024-01-15",
    "check_out_date": "2024-01-20",
    "total_price": 500.00,
    "status": "pending",
    "guest_count": 2,
    "full_name": "John Doe",
    "email_or_phone": "john@example.com",
    "travel_type": "family",
    "special_requests": "Early check-in preferred",
    "created_at": "2024-01-10T10:00:00Z"
  },
  "message": "Booking created successfully"
}
```

### 2. Get Owner Bookings
```http
GET /api/bookings/owner?ownerId={uuid}&status={status}&limit={limit}
```

**Query Parameters:**
- `ownerId` (required): Property owner's UUID
- `status` (optional): Filter by status (pending, confirmed, completed, cancelled, all)
- `limit` (optional): Number of bookings to return (default: 50)

**Response:**
```json
{
  "data": [
    {
      "id": "booking-uuid",
      "check_in_date": "2024-01-15",
      "check_out_date": "2024-01-20",
      "total_price": 500.00,
      "status": "pending",
      "guest_count": 2,
      "special_requests": "Early check-in preferred",
      "full_name": "John Doe",
      "email_or_phone": "john@example.com",
      "travel_type": "family",
      "created_at": "2024-01-10T10:00:00Z",
      "property": {
        "id": "property-uuid",
        "name": "Cozy Cabin",
        "location": "Mountain View",
        "images": ["url1", "url2"],
        "price_per_night": 100.00
      },
      "client": {
        "id": "client-uuid",
        "full_name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "count": 1
}
```

### 3. Update Booking Status
```http
PATCH /api/bookings/owner
```

**Request Body:**
```json
{
  "bookingId": "booking-uuid",
  "status": "confirmed"
}
```

**Response:**
```json
{
  "data": {
    "id": "booking-uuid",
    "status": "confirmed",
    "updated_at": "2024-01-10T11:00:00Z"
  },
  "message": "Booking status updated successfully"
}
```

## 🎨 Frontend Components

### 1. OwnerBookingsDashboard

A comprehensive dashboard component for property owners to manage their bookings.

**Features:**
- 📊 **Statistics cards** (total bookings, pending, confirmed, revenue)
- 🔍 **Advanced filtering** (by status, search)
- 📋 **Booking list** with detailed information
- 👁️ **Booking details modal** with full information
- ✅ **Status management** (confirm/decline bookings)
- 📱 **Responsive design**

**Usage:**
```tsx
import OwnerBookingsDashboard from '@/components/OwnerBookingsDashboard';

// In your owner dashboard
{activeTab === 'bookings' && (
  <div>
    <OwnerBookingsDashboard />
  </div>
)}
```

### 2. BookingForm

Enhanced booking form with modern design and validation.

**Features:**
- 🎨 **Modern calendar design** with dark theme
- 📅 **Custom date picker** with range selection
- 👥 **Travel type selection** (family/friends)
- 💰 **Real-time price calculation**
- ✅ **Form validation**
- 🎯 **Smooth animations**

## 🗃️ Database Functions

### 1. Get Owner Bookings
```sql
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
```

### 2. Get Booking Statistics
```sql
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
```

## 🔐 Security & Permissions

### Row Level Security (RLS)

```sql
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
```

## 🚀 Setup Instructions

### 1. Database Setup

1. **Run the SQL script:**
   ```bash
   # Copy the contents of database-bookings-complete.sql
   # Run it in your Supabase SQL editor
   ```

2. **Verify the setup:**
   ```sql
   -- Check if all columns exist
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns 
   WHERE table_name = 'bookings' 
   AND table_schema = 'public'
   ORDER BY ordinal_position;
   ```

### 2. API Integration

1. **Add the new API routes:**
   - `app/api/bookings/owner/route.ts` (for owner-specific booking operations)

2. **Update existing routes:**
   - Ensure `app/api/bookings/route.ts` supports the new fields

### 3. Frontend Integration

1. **Add the new component:**
   - Copy `components/OwnerBookingsDashboard.tsx` to your project

2. **Update the owner dashboard:**
   - Import and integrate `OwnerBookingsDashboard` in your existing dashboard

3. **Test the functionality:**
   - Create a test booking
   - Verify it appears in the owner dashboard
   - Test status updates

## 📊 Features Summary

### ✅ Implemented Features

- **Complete booking storage** with all required fields
- **Owner dashboard** with booking management
- **Status management** (pending, confirmed, cancelled, completed)
- **Advanced filtering** and search capabilities
- **Real-time statistics** and revenue tracking
- **Modern UI/UX** with responsive design
- **Security** with RLS policies
- **Performance** with optimized indexes
- **Scalability** with database functions and views

### 🎯 Key Benefits

1. **Comprehensive Booking Management**: Owners can view, filter, and manage all bookings for their properties
2. **Real-time Updates**: Booking status can be updated instantly
3. **Detailed Information**: Full booking details including client information and special requests
4. **Modern Interface**: Clean, responsive design with smooth animations
5. **Secure**: Proper authentication and authorization
6. **Scalable**: Optimized database structure for performance

## 🔧 Troubleshooting

### Common Issues

1. **Bookings not appearing:**
   - Check if the owner ID is correct
   - Verify RLS policies are enabled
   - Ensure the booking has the correct property_id

2. **Status update failing:**
   - Verify the booking exists
   - Check if the user has permission to update
   - Ensure the status is valid

3. **Performance issues:**
   - Check if indexes are created
   - Verify query optimization
   - Monitor database performance

### Support

For issues or questions:
1. Check the database logs in Supabase
2. Verify API responses in browser dev tools
3. Test with the provided SQL functions
4. Review the RLS policies

## 📈 Future Enhancements

- **Email notifications** for booking status changes
- **Calendar integration** for availability management
- **Payment processing** integration
- **Review system** for completed bookings
- **Analytics dashboard** with charts and reports
- **Mobile app** for booking management 