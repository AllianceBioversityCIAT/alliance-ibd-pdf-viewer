import { readdirSync, statSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const templatesDir = join(process.cwd(), "app", "templates");
  const entries = readdirSync(templatesDir);

  const templates = entries.filter((name) => {
    if (name === "index.ts") return false;
    const full = join(templatesDir, name);
    return statSync(full).isDirectory();
  });

  return NextResponse.json({ templates: templates.sort() });
}
