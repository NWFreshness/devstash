import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { b2, B2_BUCKET } from "@/lib/b2";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "application/x-yaml",
  "text/yaml",
  "application/xml",
  "text/xml",
  "text/csv",
  "application/toml",
]);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const isImage = ALLOWED_IMAGE_TYPES.has(file.type);
  const isFile = ALLOWED_FILE_TYPES.has(file.type);

  if (!isImage && !isFile) {
    return NextResponse.json(
      { error: "File type not supported" },
      { status: 400 },
    );
  }

  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_FILE_BYTES;
  if (file.size > maxBytes) {
    const maxMb = isImage ? 5 : 10;
    return NextResponse.json(
      { error: `File too large (max ${maxMb} MB)` },
      { status: 400 },
    );
  }

  const key = `uploads/${Date.now()}-${sanitizeFileName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await b2.send(
      new PutObjectCommand({
        Bucket: B2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ContentLength: file.size,
      }),
    );
  } catch (err) {
    console.error("B2 upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({
    key,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  });
}
