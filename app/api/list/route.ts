import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { scanAll } from "@/lib/dynamo";

function isAuthorized(secret: string | null): boolean {
  const expected = process.env.ADMIN_SECRET;
  if (!secret || !expected) return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req.headers.get("x-admin-secret"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await scanAll();
    return NextResponse.json({ items, count: items.length });
  } catch (err) {
    console.error("[GET /api/list]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
