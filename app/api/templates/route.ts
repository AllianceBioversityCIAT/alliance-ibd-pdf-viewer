import { readdirSync, statSync, existsSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface TemplateInfo {
  name: string;
  hasDemo: boolean;
}

function walk(dir: string): TemplateInfo[] {
  const results: TemplateInfo[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walk(full));
    } else if (entry.endsWith(".tsx") && entry !== "index.tsx") {
      const name = entry.replace(/\.tsx$/, "");
      const demoFile = join(dir, `${name}.demo.json`);
      results.push({ name, hasDemo: existsSync(demoFile) });
    }
  }
  return results;
}

export function GET() {
  const templatesDir = join(process.cwd(), "app", "templates");
  const templates: TemplateInfo[] = [];

  for (const entry of readdirSync(templatesDir)) {
    const entryPath = join(templatesDir, entry);
    if (!statSync(entryPath).isDirectory()) continue;
    templates.push(...walk(entryPath));
  }

  templates.sort((a, b) => a.name.localeCompare(b.name));
  return NextResponse.json({ templates });
}
