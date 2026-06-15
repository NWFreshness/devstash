import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getItemDetail } from "@/lib/db/items";
import { getDemoUser } from "@/lib/db/user";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cards are rendered from the demo user's seeded data, so fetch detail
  // scoped to the demo user too (matches the rest of the app).
  const demoUser = await getDemoUser();
  const { id } = await params;
  const item = await getItemDetail(demoUser?.id ?? null, id);

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}
