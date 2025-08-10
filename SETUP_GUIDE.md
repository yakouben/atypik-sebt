# 🔧 Setup Guide - Fix Signup Issue

## 🚨 **IMMEDIATE ACTION REQUIRED**

Your signup is failing because the Supabase environment variables are not configured. Follow these steps to fix it:

### **Step 1: Create Environment File**

Create a file named `.env.local` in your project root (same folder as `package.json`) with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Optional: Site URL for email redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### **Step 2: Get Your Supabase Credentials**

1. Go to [supabase.com](https://supabase.com)
2. Create a new project or use an existing one
3. Go to **Settings > API** in your Supabase dashboard
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### **Step 3: Configure Supabase Authentication**

In your Supabase dashboard:

1. Go to **Authentication > Settings**
2. Enable **Email confirmations**
3. Add these redirect URLs:
   - `http://localhost:3000/auth/confirm`
   - `http://localhost:3002/auth/confirm`

### **Step 4: Restart Development Server**

After creating the `.env.local` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

### **Step 5: Test the Configuration**

Visit this URL in your browser to test if Supabase is configured correctly:
```
http://localhost:3000/api/auth/test
```

You should see a JSON response indicating success.

### **Step 6: Test Signup**

Now try creating an account again. The form should work properly.

## 🔍 **Troubleshooting**

### **If you still see "Création du compte..." loading:**

1. **Check browser console** (F12) for error messages
2. **Verify environment variables** are correctly set
3. **Check Supabase project** is active and accessible
4. **Ensure email confirmations** are enabled in Supabase

### **Common Error Messages:**

- **"Configuration error"** → Environment variables not set
- **"Network error"** → Check internet connection
- **"Invalid credentials"** → Wrong Supabase keys
- **"Email already exists"** → Try different email

### **Need Help?**

1. Check the browser console (F12) for detailed error messages
2. Verify your Supabase project is active
3. Make sure all environment variables are correctly copied

## ✅ **Expected Result**

After following these steps:
- ✅ Signup form should work without getting stuck
- ✅ Account creation should succeed
- ✅ Email confirmation should be sent
- ✅ User should be redirected to appropriate dashboard

Let me know if you need help with any of these steps! 