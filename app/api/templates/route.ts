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
      // Folder-based template: directory contains template.tsx
      const templateFile = join(full, "template.tsx");
      if (existsSync(templateFile)) {
        const demoFile = join(full, "template.demo.json");
        results.push({ name: entry, hasDemo: existsSync(demoFile) });
      } else {
        results.push(...walk(full));
      }
    } else if (
      entry.endsWith(".tsx") &&
      entry !== "index.tsx" &&
      entry !== "components.tsx"
    ) {
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
