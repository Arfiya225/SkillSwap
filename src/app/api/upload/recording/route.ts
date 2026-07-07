import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { uploadFileAdmin } from "@/services/serverStorage";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[Recording Upload Error] Missing Authorization header");
      return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
    }
    
    if (!authHeader.startsWith("Bearer ")) {
      console.error("[Recording Upload Error] Authorization header missing Bearer prefix");
      return NextResponse.json({ error: "Authorization header missing Bearer prefix" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1]?.trim();
    if (!token) {
      console.error("[Recording Upload Error] Empty Firebase token provided");
      return NextResponse.json({ error: "Empty Firebase token provided" }, { status: 401 });
    }

    try {
      await adminAuth.verifyIdToken(token);
    } catch (err: any) {
      console.error("[Recording Upload Error] Firebase token verification failure:", err.message);
      return NextResponse.json(
        { 
          error: "Firebase token verification failed",
          details: err.message
        },
        { status: 401 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[Recording Upload Error] Missing SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
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
    console.error("[Recording Upload Error] Supabase upload error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
