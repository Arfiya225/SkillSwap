import { NextResponse } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebaseAdmin";
import { uploadFileAdmin } from "@/services/serverStorage";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    try {
      const adminAuth = await getFirebaseAdminAuth();
      await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const roomId = formData.get("roomId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    
    if (!roomId) {
      return NextResponse.json({ error: "No roomId provided" }, { status: 400 });
    }

    // Validation: Type (audio/*, video/*)
    if (!file.type.startsWith("audio/") && !file.type.startsWith("video/")) {
      return NextResponse.json({ error: "Invalid file type. Only audio and video allowed." }, { status: 400 });
    }

    // Validation: Size (Max 100 MB)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 100 MB allowed." }, { status: 400 });
    }

    const uniqueName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const path = `${roomId}/${uniqueName}`;
    const publicUrl = await uploadFileAdmin("recordings", path, file);

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Recording upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
