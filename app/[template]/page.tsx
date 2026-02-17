import { notFound } from "next/navigation";
import { readdirSync, statSync, existsSync } from "fs";
import { join, relative } from "path";
import type { ComponentType } from "react";
import type { TemplateProps } from "@/app/templates";
import { getItem, deleteItem } from "@/lib/dynamo";

interface Props {
  params: Promise<{ template: string }>;
  searchParams: Promise<{
    uuid?: string;
    paperWidth?: string;
    paperHeight?: string;
    test?: string;
  }>;
}

function findInDir(dir: string, fileName: string): string | null {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      const found = findInDir(full, fileName);
      if (found) return found;
    } else if (entry === fileName) {
      return full;
    }
  }
  return null;
}

function findTemplate(name: string): string | null {
  const base = join(process.cwd(), "app", "templates");
  for (const project of readdirSync(base)) {
    const projectDir = join(base, project);
    if (!existsSync(projectDir) || !statSync(projectDir).isDirectory()) continue;
    const found = findInDir(projectDir, `${name}.tsx`);
    if (found) return relative(base, found).replace(/\.tsx$/, "");
  }
  return null;
}

export default async function TemplatePage({ params, searchParams }: Props) {
  const { template } = await params;
  const { uuid, paperWidth, paperHeight, test } = await searchParams;

  const templatePath = findTemplate(template);
  if (!templatePath) notFound();

  let TemplateComponent: ComponentType<TemplateProps>;
  try {
    const mod = await import(`@/app/templates/${templatePath}`);
    TemplateComponent = mod.default;
  } catch {
    notFound();
  }

  if (!uuid) notFound();

  const data = await getItem(uuid);
  if (data === null) notFound();

  if (test !== "true") {
    try {
      await deleteItem(uuid);
    } catch {
      // Record may have already been deleted by a concurrent request
    }
  }

  const width = Math.max(100, Math.min(5000, Number(paperWidth) || 600));
  const height = Math.max(100, Math.min(5000, Number(paperHeight) || 1000));

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, overflow: "hidden" }}>
      <TemplateComponent data={data} />
    </div>
  );
}
