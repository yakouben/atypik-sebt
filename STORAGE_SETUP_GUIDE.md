# 🗂️ Supabase Storage Setup Guide for Property Images

## ✅ **Step-by-Step Setup:**

### **Step 1: Create Storage Bucket**

1. **Go to Supabase Dashboard**
   - Open your Supabase project
   - Navigate to **Storage** in the left sidebar

2. **Create New Bucket**
   - Click **"New bucket"**
   - **Bucket name:** `images`
   - **Public bucket:** ✅ **Check this box**
   - Click **"Create bucket"**

### **Step 2: Set Bucket to Public**

1. **In the Storage section:**
   - Click on the `images` bucket
   - Go to **Settings** tab
   - **Public bucket:** ✅ **Enable this**
   - Click **"Save"**

### **Step 3: Add Storage Policies**

1. **Go to SQL Editor**
   - In your Supabase dashboard, go to **SQL Editor**
   - Create a new query

2. **Run the Storage Policies SQL**
   ```sql
   -- Copy and paste the contents of storage_policies_images.sql
   ```

### **Step 4: Verify Setup**

1. **Test Upload (Optional)**
   - Try uploading a test image through your app
   - Check if it appears in the Storage bucket
   - Verify the image URL is accessible publicly

## 🔧 **Storage Policies Explained:**

### **Policy 1: Upload Images**
```sql
CREATE POLICY "Users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
  );
```
- ✅ **Who:** Authenticated users only
- ✅ **What:** Upload images to images bucket
- ✅ **Why:** Only logged-in users can add property images

### **Policy 2: View Images**
```sql
CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'images'
  );
```
- ✅ **Who:** Anyone (public)
- ✅ **What:** View/download images
- ✅ **Why:** Property images need to be visible on the website

### **Policy 3: Update Images**
```sql
CREATE POLICY "Users can update their images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
  );
```
- ✅ **Who:** Authenticated users
- ✅ **What:** Update/replace images
- ✅ **Why:** Users can edit their property images

### **Policy 4: Delete Images**
```sql
CREATE POLICY "Users can delete their images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
  );
```
- ✅ **Who:** Authenticated users
- ✅ **What:** Delete images
- ✅ **Why:** Users can remove their property images

## 🚨 **Troubleshooting:**

### **Error: "Bucket not found"**
1. Check if bucket name is exactly `images`
2. Verify bucket was created successfully
3. Check bucket is visible in Storage dashboard

### **Error: "Permission denied"**
1. Verify storage policies are applied
2. Check if user is authenticated
3. Ensure bucket is set to public

### **Error: "Image not displaying"**
1. Check if bucket is public
2. Verify image URL is correct
3. Test direct access to image URL

### **Error: "Upload failed"**
1. Check file type (must be image)
2. Verify user is logged in
3. Check network connection
4. Verify storage policies are correct

## 📋 **Quick Checklist:**

- ✅ [ ] Created `images` bucket
- ✅ [ ] Set bucket to public
- ✅ [ ] Applied all storage policies
- ✅ [ ] Tested image upload
- ✅ [ ] Verified image display
- ✅ [ ] Checked public access

## 🔗 **Useful Links:**

- **Supabase Storage Docs:** https://supabase.com/docs/guides/storage
- **Storage Policies:** https://supabase.com/docs/guides/storage/policies
- **Storage API:** https://supabase.com/docs/reference/javascript/storage-createbucket

## 🎯 **Expected Behavior:**

1. **Authenticated users** can upload images
2. **Anyone** can view property images on the website
3. **Authenticated users** can update/delete their images
4. **Images are automatically compressed** to 100KB when submitted
5. **Public URLs** work for displaying images

Your storage setup is now complete! 🎉 