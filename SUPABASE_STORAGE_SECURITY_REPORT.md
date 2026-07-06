# Supabase Storage Security Report

## 1. Current Upload Mechanism Audit
Based on the codebase analysis, file uploads are currently being performed **Directly from the browser with the anon key**. 

- `src/lib/supabase.ts` initializes the Supabase client using `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- The storage methods in `src/services/storage.ts` are invoked directly from client-side React components (`AvatarUploader`, `RecordingUploader`, `collaboration.ts`).
- **Critical Finding**: Because the application uses **Firebase Authentication** instead of Supabase Authentication, Supabase does not recognize the logged-in user. From Supabase's perspective, all requests are completely anonymous (`role = 'anon'`).

## 2. Required Storage Policies (for current client-side approach)
Because `auth.role() = 'authenticated'` will fail in Supabase (due to the lack of Supabase Auth), allowing client-side uploads requires making the buckets fully public to anonymous users. 

If you must proceed with the current client-side architecture, the required Supabase RLS policies are:

```sql
-- Allow public read access to Avatars
CREATE POLICY "Public Read Avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Allow anonymous uploads to Avatars
CREATE POLICY "Anon Insert Avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- Allow public read access to Resources
CREATE POLICY "Public Read Resources" ON storage.objects
FOR SELECT USING (bucket_id = 'resources');

-- Allow anonymous uploads to Resources
CREATE POLICY "Anon Insert Resources" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'resources');

-- Allow public read access to Recordings
CREATE POLICY "Public Read Recordings" ON storage.objects
FOR SELECT USING (bucket_id = 'recordings');

-- Allow anonymous uploads to Recordings
CREATE POLICY "Anon Insert Recordings" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'recordings');
```

## 3. Security Implications
**Using the above policies is highly dangerous and NOT recommended.**
- **Malicious Uploads**: Anyone with your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` can upload arbitrary files to your storage buckets.
- **Cost/Billing Attacks**: Attackers can flood your storage buckets with massive files, incurring massive storage and bandwidth costs.
- **Malware Hosting**: Your domain/storage could be used to host malicious payloads, violating Terms of Service and harming your domain reputation.
- **Lack of Authorization**: Users can overwrite or delete other users' files if you also grant `UPDATE` or `DELETE` permissions anonymously.

## 4. Recommended Production Architecture
To securely bridge Firebase Authentication with Supabase Storage, you should **never** allow anonymous client-side uploads. Instead, implement one of the following two architectures:

### Option A: Backend API Proxy (Recommended for simplicity)
1. **Client**: Uploads the file to a Next.js API Route (e.g., `/api/storage/upload`) along with the user's Firebase Auth ID token.
2. **Next.js API Route**: 
   - Verifies the Firebase token using `firebase-admin`.
   - If authenticated, uses the **Supabase Service Role Key** (`SUPABASE_SERVICE_ROLE_KEY`) to bypass RLS and upload the file to Supabase.
   - Returns the generated public URL back to the client.
3. **Supabase RLS**: Set to `SELECT` for public (if files should be public) and completely disable `INSERT`, `UPDATE`, and `DELETE` for the `anon` role.

### Option B: Custom JWT Integration (Recommended for large files / direct uploads)
1. **Cloud Function / API**: When a user logs in, the backend generates a custom JWT signed with a secret that Supabase trusts.
2. **Client**: Passes this custom JWT to the Supabase JS client (`supabase.auth.setSession(...)` or via headers).
3. **Supabase**: Verifies the custom JWT. At this point, Supabase RLS can safely use `auth.uid()` and `auth.role()` to securely restrict client-side direct uploads. 
