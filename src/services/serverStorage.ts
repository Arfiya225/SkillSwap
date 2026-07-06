import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client (server-side only)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ynrjvwazanmsuzutnryd.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "missing-service-key";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Uploads a file to Supabase using the service role key and returns the public URL.
 */
export async function uploadFileAdmin(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
