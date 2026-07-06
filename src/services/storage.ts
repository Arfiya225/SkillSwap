import { supabase } from "@/lib/supabase";

/**
 * Helper to upload a file to a specific Supabase Storage bucket and return the public URL.
 */
async function uploadToSupabase(bucket: string, path: string, file: File): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  // Get the public URL
  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrlData.publicUrl;
}

/**
 * Upload an avatar to Supabase and return its public URL.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const uniqueName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
  const path = `${userId}/${uniqueName}`;
  return uploadToSupabase("avatars", path, file);
}

/**
 * Upload a resource to Supabase and return its public URL.
 */
export async function uploadResource(roomId: string, file: File): Promise<string> {
  const uniqueName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
  const path = `${roomId}/${uniqueName}`;
  return uploadToSupabase("resources", path, file);
}

/**
 * Upload a recording to Supabase and return its public URL.
 */
export async function uploadRecording(roomId: string, file: File): Promise<string> {
  const uniqueName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
  const path = `${roomId}/${uniqueName}`;
  return uploadToSupabase("recordings", path, file);
}

/**
 * Delete a file from a specific Supabase bucket.
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    throw error;
  }
}

/**
 * Get the public URL of a file.
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
