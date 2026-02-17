import { readdirSync, statSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function walk(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walk(full));
    } else if (entry.endsWith(".tsx") && entry !== "index.tsx") {
      results.push(entry.replace(/\.tsx$/, ""));
    }
  }
  return results;
}

export function GET() {
  const templatesDir = join(process.cwd(), "app", "templates");
  const templates: string[] = [];

  for (const entry of readdirSync(templatesDir)) {
    const entryPath = join(templatesDir, entry);
    if (!statSync(entryPath).isDirectory()) continue;
    templates.push(...walk(entryPath));
  }

  return NextResponse.json({ templates: templates.sort() });
}
