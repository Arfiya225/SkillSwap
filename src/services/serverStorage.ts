import { createClient } from "@supabase/supabase-js";

let supabaseAdmin: any = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabaseAdmin;
}

/**
 * Uploads a file to Supabase using the service role key and returns the public URL.
 */
export async function uploadFileAdmin(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const adminClient = getSupabaseAdmin();
  const { error } = await adminClient.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = adminClient.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
