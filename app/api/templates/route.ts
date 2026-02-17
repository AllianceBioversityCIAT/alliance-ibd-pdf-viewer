import { readdirSync, statSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const templatesDir = join(process.cwd(), "app", "templates");
  const templates: string[] = [];

  for (const entry of readdirSync(templatesDir)) {
    const entryPath = join(templatesDir, entry);
    if (!statSync(entryPath).isDirectory()) continue;

    for (const file of readdirSync(entryPath)) {
      if (file.endsWith(".tsx")) {
        templates.push(file.replace(/\.tsx$/, ""));
      }
    }
  }

  return NextResponse.json({ templates: templates.sort() });
}
