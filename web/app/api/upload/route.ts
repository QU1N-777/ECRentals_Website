import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get("file") as File | null;
    const folder = (data.get("folder") as string) || "equipment/";
    const customName = data.get("name") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename or use custom name
    let filename = customName;
    if (!filename) {
      const cleanName = file.name
        .toLowerCase()
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
      filename = `${cleanName}-${Date.now()}.${ext}`;
    }

    const destination = `${folder.replace(/^\/|\/$/g, "")}/${filename}`;
    const { storage } = getFirebaseAdmin();
    const storageFile = storage.file(destination);

    await storageFile.save(buffer, {
      contentType: file.type || "image/webp",
      public: true,
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
    });

    const publicUrl = storageFile.publicUrl();

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: destination,
      filename,
    });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload image" }, { status: 500 });
  }
}
