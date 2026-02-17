import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { generateUUID, putItem } from "@/lib/dynamo";

function isAuthorized(secret: string | null): boolean {
  const expected = process.env.API_SECRET;
  if (!secret || !expected) return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req.headers.get("x-api-secret"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let data: unknown;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const uuid = generateUUID();
    await putItem(uuid, data);
    return NextResponse.json({ uuid }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/data]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
