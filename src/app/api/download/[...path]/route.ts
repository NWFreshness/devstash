import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { b2, B2_BUCKET } from "@/lib/b2";
import { getDemoUser } from "@/lib/db/user";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { path } = await params;
  const key = path.join("/");

  if (!key.startsWith("uploads/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Verify the authenticated user owns an item with this key.
  const demoUser = await getDemoUser();
  const item = await prisma.item.findFirst({
    where: { userId: demoUser?.id ?? "", fileUrl: key },
    select: { mimeType: true, fileName: true },
  });
  if (!item) {
    return new NextResponse("Not found", { status: 404 });
  }

  const response = await b2.send(
    new GetObjectCommand({ Bucket: B2_BUCKET, Key: key }),
  );
  if (!response.Body) {
    return new NextResponse("Not found", { status: 404 });
  }

  const contentType = item.mimeType ?? "application/octet-stream";
  const isInline = contentType.startsWith("image/");
  const disposition = isInline
    ? `inline; filename="${encodeURIComponent(item.fileName ?? "file")}"`
    : `attachment; filename="${encodeURIComponent(item.fileName ?? "download")}"`;

  return new NextResponse(response.Body.transformToWebStream(), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": disposition,
    },
  });
}
