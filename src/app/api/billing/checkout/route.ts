import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Billing temporarily unavailable" },
    { status: 503 }
  );
}
