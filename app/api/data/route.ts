import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { generateUUID, putItem } from "@/lib/dynamo";

function matches(secret: string, expected: string): boolean {
  const a = Buffer.from(secret);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function isAuthorized(req: NextRequest): boolean {
  // Accept either API_SECRET (for external consumers) or ADMIN_SECRET (for admin UI)
  const apiSecret = req.headers.get("x-api-secret");
  const adminSecret = req.headers.get("x-admin-secret");

  if (apiSecret && process.env.API_SECRET) {
    if (matches(apiSecret, process.env.API_SECRET)) return true;
  }

  if (adminSecret && process.env.ADMIN_SECRET) {
    if (matches(adminSecret, process.env.ADMIN_SECRET)) return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let data: unknown;
  try {
    // Use Next.js's req.json() - adapter preserves the stream
    data = await req.json();
    console.log("[POST /api/data] Successfully parsed via req.json(), type:", typeof data);
  } catch (error) {
    // Log error details for debugging (without exposing sensitive data)
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[POST /api/data] JSON parse error:", {
      error: errorMessage,
      contentType: req.headers.get("content-type"),
      hasBody: !!(req as any).body,
      bodyType: typeof (req as any).body,
      bodyConstructor: (req as any).body?.constructor?.name,
    });
    return NextResponse.json(
      { error: "Invalid JSON body", message: "The request body could not be parsed as JSON" },
      { status: 400 }
    );
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
