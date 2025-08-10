# Supabase Integration Setup Guide

## 🚀 Quick Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Environment Variables
Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Schema
Run the SQL commands from `database-schema.sql` in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-schema.sql`
4. Execute the script

### 4. Authentication Settings
In your Supabase dashboard:

1. **Authentication > Settings**
   - Enable email confirmations (optional)
   - Set redirect URLs: `http://localhost:3000/auth/callback`
   - Configure email templates

2. **Authentication > Policies**
   - The RLS policies are already included in the schema

## 📊 Database Tables

### Profiles Table
Stores user information and preferences:
- `id` - UUID (references auth.users)
- `email` - User's email
- `full_name` - User's full name
- `user_type` - 'owner' or 'client'
- `address` - Owner's address (optional)
- `what_you_own` - Owner's property types (optional)
- `reservation_type` - Client's reservation preferences (optional)

### Properties Table
Stores property listings:
- `id` - UUID (auto-generated)
- `owner_id` - References profiles.id
- `name` - Property name
- `type` - Property type (cabin, yurt, etc.)
- `description` - Property description
- `price_per_night` - Price per night
- `location` - Property location
- `images` - Array of image URLs
- `amenities` - Array of amenities
- `max_guests` - Maximum number of guests
- `rating` - Average rating
- `is_available` - Availability status

### Bookings Table
Stores booking information:
- `id` - UUID (auto-generated)
- `property_id` - References properties.id
- `client_id` - References profiles.id
- `check_in_date` - Check-in date
- `check_out_date` - Check-out date
- `total_price` - Total booking price
- `status` - Booking status (pending, confirmed, cancelled, completed)
- `guest_count` - Number of guests
- `special_requests` - Special requests (optional)

## 🔐 Security Features

### Row Level Security (RLS)
- Users can only view/edit their own profiles
- Property owners can manage their own properties
- Users can only view their own bookings
- Public can view available properties

### Authentication Flow
1. **Sign Up**: Creates auth user + profile record
2. **Sign In**: Authenticates user and loads profile
3. **Password Reset**: Sends reset email
4. **Session Management**: Automatic session handling

## 🛠️ Features Implemented

### ✅ Authentication
- [x] User registration (owner/client)
- [x] User login
- [x] Password reset
- [x] Session management
- [x] Form validation
- [x] Error handling
- [x] Loading states

### ✅ Database Integration
- [x] Profile creation on signup
- [x] User type selection
- [x] Secure data access
- [x] Automatic timestamps
- [x] Data validation

### ✅ UI/UX
- [x] Responsive design
- [x] Loading indicators
- [x] Error messages
- [x] Success feedback
- [x] Form validation
- [x] Password visibility toggle

## 🔧 Usage Examples

### Sign Up Flow
```typescript
const { signUp } = useAuthContext();

const handleSignUp = async () => {
  const { error } = await signUp(email, password, {
    full_name: 'John Doe',
    user_type: 'owner',
    address: '123 Main St',
    what_you_own: 'cabins, yurts'
  });
  
  if (error) {
    console.error('Signup error:', error);
  }
};
```

### Sign In Flow
```typescript
const { signIn } = useAuthContext();

const handleSignIn = async () => {
  const { error } = await signIn(email, password);
  
  if (error) {
    console.error('Signin error:', error);
  }
};
```

### Get User Profile
```typescript
const { user, getUserProfile } = useAuthContext();

const loadProfile = async () => {
  if (user) {
    const { data, error } = await getUserProfile(user.id);
    if (data) {
      console.log('User profile:', data);
    }
  }
};
```

## 🚨 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env.local` is in project root
   - Restart development server
   - Check variable names match exactly

2. **Database Connection Errors**
   - Verify Supabase URL and key
   - Check network connectivity
   - Ensure database is accessible

3. **RLS Policy Errors**
   - Verify policies are applied correctly
   - Check user authentication status
   - Review policy conditions

4. **Authentication Errors**
   - Check email confirmation settings
   - Verify redirect URLs
   - Review email templates

### Debug Mode
Add to your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_DEBUG=true
```

## 📝 Next Steps

1. **Customize Email Templates** in Supabase dashboard
2. **Add Social Authentication** (Google, Facebook, etc.)
3. **Implement Property Management** for owners
4. **Add Booking System** for clients
5. **Create Admin Dashboard** for property management
6. **Add Payment Integration** (Stripe, etc.)
7. **Implement Search and Filtering**
8. **Add Image Upload** functionality

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security) 