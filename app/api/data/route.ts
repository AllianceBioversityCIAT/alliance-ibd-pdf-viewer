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

/**
 * Robust JSON body parser that handles multiple input types
 * Supports: string, object (already parsed), ReadableStream, base64
 */
async function parseJsonBody(input: unknown): Promise<unknown> {
  // If already an object, return it directly (don't parse again)
  if (input !== null && typeof input === 'object' && !(input instanceof ReadableStream) && !Buffer.isBuffer(input)) {
    // Check if it's a plain object (not an array, Date, etc.)
    if (input.constructor === Object) {
      console.log("[parseJsonBody] Input is already an object, returning as-is");
      return input;
    }
  }

  // If it's a string, parse it
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      console.log("[parseJsonBody] Parsed string successfully, type:", typeof parsed, "keys:", Object.keys(parsed || {}).length);
      return parsed;
    } catch (e) {
      console.error("[parseJsonBody] Failed to parse string:", {
        error: e instanceof Error ? e.message : String(e),
        inputType: typeof input,
        inputLength: input.length,
        inputPreview: input.substring(0, 100),
      });
      throw new Error(`Invalid JSON string: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // If it's a ReadableStream, read it first
  // IMPORTANT: ReadableStream can only be read once, so we need to handle locked streams
  if (input instanceof ReadableStream) {
    try {
      // Check if stream is locked (already being read)
      if (input.locked) {
        console.warn("[parseJsonBody] ReadableStream is locked, cannot read");
        // If stream is locked, we can't read it - this means it was already consumed
        // This shouldn't happen if we're handling the body correctly, but handle gracefully
        throw new Error("ReadableStream is already locked/consumed - body may have been read twice");
      }
      
      // Try to read the stream using Response.text() which handles the stream properly
      // This is the standard way to read a ReadableStream
      const text = await new Response(input).text();
      console.log("[parseJsonBody] Read ReadableStream via Response.text(), length:", text.length);
      return parseJsonBody(text); // Recursively parse the text
    } catch (e) {
      console.error("[parseJsonBody] Failed to read ReadableStream:", {
        error: e instanceof Error ? e.message : String(e),
        streamLocked: input instanceof ReadableStream ? input.locked : 'N/A',
      });
      throw new Error(`Failed to read stream: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // If it's a Buffer, convert to string first
  if (Buffer.isBuffer(input)) {
    try {
      const text = input.toString('utf8');
      console.log("[parseJsonBody] Converted Buffer to string, length:", text.length);
      return parseJsonBody(text); // Recursively parse the text
    } catch (e) {
      console.error("[parseJsonBody] Failed to convert Buffer:", {
        error: e instanceof Error ? e.message : String(e),
      });
      throw new Error(`Failed to convert buffer: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // If it's null or undefined, return as-is
  if (input === null || input === undefined) {
    console.log("[parseJsonBody] Input is null/undefined");
    return input;
  }

  // For any other type, try to stringify and parse
  console.warn("[parseJsonBody] Unexpected input type:", typeof input, "constructor:", input?.constructor?.name);
  try {
    const text = String(input);
    return parseJsonBody(text); // Recursively parse the stringified value
  } catch (e) {
    throw new Error(`Cannot parse input of type ${typeof input}`);
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let data: unknown;
  try {
    // Try to get body using Next.js's req.json() first
    // This is the standard way, but it may fail if body is already parsed
    try {
      data = await req.json();
      console.log("[POST /api/data] Successfully parsed via req.json(), type:", typeof data, "isObject:", typeof data === 'object' && data !== null);
    } catch (jsonError) {
      // If req.json() fails, try to access req.body directly and parse it
      console.log("[POST /api/data] req.json() failed, trying req.body directly");
      console.log("[POST /api/data] req.body type:", typeof req.body, "constructor:", req.body?.constructor?.name);
      
      // Access body directly (may be string, object, or ReadableStream)
      const body = (req as any).body;
      
      if (body === null || body === undefined) {
        throw new Error("Request body is empty");
      }

      // Use robust parser
      data = await parseJsonBody(body);
    }
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
