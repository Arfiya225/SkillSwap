import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { uploadFileAdmin } from "@/services/serverStorage";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[Avatar Upload Error] Missing Authorization header");
      return NextResponse.json({ error: "Unauthorized", reason: "Missing Authorization header" }, { status: 401 });
    }
    
    if (!authHeader.startsWith("Bearer ")) {
      console.error("[Avatar Upload Error] Authorization header missing Bearer prefix");
      return NextResponse.json({ error: "Unauthorized", reason: "Missing Bearer token" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1]?.trim();
    if (!token) {
      console.error("[Avatar Upload Error] Empty Firebase token provided");
      return NextResponse.json({ error: "Unauthorized", reason: "getIdToken() returned empty" }, { status: 401 });
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
      
      if (!decodedToken.uid) {
        console.error("[Avatar Upload Error] decoded uid missing");
        return NextResponse.json({ error: "Unauthorized", reason: "decoded uid missing" }, { status: 401 });
      }
    } catch (err: any) {
      console.error("[Avatar Upload Error] Auth failure:", err.message);
      
      let reason = "verifyIdToken() failed";
      if (err.message === "Firebase project ID mismatch") reason = err.message;
      else if (err.message === "Firebase service account invalid") reason = err.message;
      else if (err.message.startsWith("Firebase Admin initialization failed")) reason = "Firebase Admin initialization failed";
      
      return NextResponse.json(
        { 
          error: "Unauthorized",
          reason: reason,
          details: err.message
        },
        { status: 401 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[Avatar Upload Error] Missing SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const userId = decodedToken.uid;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validation: Type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, WEBP allowed." }, { status: 400 });
    }

    // Validation: Size (Max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 5 MB allowed." }, { status: 400 });
    }

    const uniqueName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const path = `${userId}/${uniqueName}`;
    const publicUrl = await uploadFileAdmin("avatars", path, file);

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("[Avatar Upload Error] Supabase upload error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
