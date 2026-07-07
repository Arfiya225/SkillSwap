import { auth } from "@/firebase/config";

/**
 * Upload an avatar to the Next.js API proxy and return its public URL.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (!auth.currentUser) throw new Error("auth.currentUser is null");
  const token = await auth.currentUser.getIdToken();
  if (!token) throw new Error("getIdToken() returned empty");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload/avatar", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Upload failed");
  }

  return data.url;
}

/**
 * Upload a resource to the Next.js API proxy and return its public URL.
 */
export async function uploadResource(roomId: string, file: File): Promise<string> {
  if (!auth.currentUser) throw new Error("auth.currentUser is null");
  const token = await auth.currentUser.getIdToken();
  if (!token) throw new Error("getIdToken() returned empty");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("roomId", roomId);

  const response = await fetch("/api/upload/resource", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Upload failed");
  }

  return data.url;
}

/**
 * Upload a recording to the Next.js API proxy and return its public URL.
 */
export async function uploadRecording(roomId: string, file: File): Promise<string> {
  if (!auth.currentUser) throw new Error("auth.currentUser is null");
  const token = await auth.currentUser.getIdToken();
  if (!token) throw new Error("getIdToken() returned empty");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("roomId", roomId);

  const response = await fetch("/api/upload/recording", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Upload failed");
  }

  return data.url;
}

/**
 * Delete a file from a specific Supabase bucket (Placeholder for future API implementation).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteFile(_bucket: string, _path: string): Promise<void> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("User not authenticated");
  console.warn("Delete file not fully implemented on backend proxy yet. Requires DELETE API route.");
}

/**
 * Get the public URL of a file. (Read is still public on bucket)
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ynrjvwazanmsuzutnryd.supabase.co";
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
