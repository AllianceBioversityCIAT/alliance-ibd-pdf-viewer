import { notFound } from "next/navigation";
import { readdirSync, statSync, existsSync, readFileSync } from "fs";
import { join, relative } from "path";
import type { ComponentType } from "react";
import type { TemplateProps } from "@/app/templates";
import { getItem, deleteItem } from "@/lib/dynamo";

interface Props {
  params: Promise<{ template: string }>;
  searchParams: Promise<{
    uuid?: string;
    paperWidth?: string;
    test?: string;
    demo?: string;
  }>;
}

function findInDir(dir: string, fileName: string): string | null {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      // Folder-based template: {name}/template.tsx
      if (entry === fileName.replace(/\.tsx$/, "")) {
        const templateFile = join(full, "template.tsx");
        if (existsSync(templateFile)) return templateFile;
      }
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

function loadDemoData(templatePath: string): unknown | null {
  const base = join(process.cwd(), "app", "templates");
  // File-based: {name}.demo.json  |  Folder-based: {name}/template.demo.json
  const demoFile = join(base, `${templatePath}.demo.json`);
  if (existsSync(demoFile)) return JSON.parse(readFileSync(demoFile, "utf-8"));
  // For folder-based templates, templatePath ends with "{name}/template"
  const folderDemo = join(base, templatePath.replace(/\/template$/, ""), "template.demo.json");
  if (existsSync(folderDemo)) return JSON.parse(readFileSync(folderDemo, "utf-8"));
  return null;
}

export default async function TemplatePage({ params, searchParams }: Props) {
  const { template } = await params;
  const { uuid, paperWidth, test, demo } = await searchParams;

  const templatePath = findTemplate(template);
  if (!templatePath) notFound();

  let TemplateComponent: ComponentType<TemplateProps>;
  try {
    const mod = await import(`@/app/templates/${templatePath}`);
    TemplateComponent = mod.default;
  } catch {
    notFound();
  }

  let data: unknown;
  let dataError: string | null = null;

  if (demo === "true") {
    data = loadDemoData(templatePath);
    if (data === null) dataError = "No demo data available for this template.";
  } else if (!uuid) {
    dataError = "No UUID was provided. A valid uuid query parameter is required to load result data.";
  } else {
    data = await getItem(uuid);
    if (data === null) {
      dataError = `No data found for UUID "${uuid}". The record may have expired or does not exist.`;
    } else if (test !== "true") {
      try {
        await deleteItem(uuid);
      } catch {
        // Record may have already been deleted by a concurrent request
      }
    }
  }

  const width = Math.max(100, Math.min(5000, Number(paperWidth) || 600));

  if (dataError) {
    return (
      <div style={{ width: `${width}px`, fontFamily: "'Noto Sans', Arial, sans-serif" }}>
        <div style={{
          margin: "60px auto",
          maxWidth: 480,
          padding: "40px 32px",
          textAlign: "center",
        }}>
          <div style={{
            width: 56, height: 56, margin: "0 auto 20px",
            borderRadius: "50%", background: "#fef2f2",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28,
          }}>!</div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#1d1d1d", marginBottom: 8 }}>
            Data not available
          </h1>
          <p style={{ fontSize: 13, color: "#818181", lineHeight: 1.5 }}>
            {dataError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: `${width}px` }}>
      <TemplateComponent data={data} />
    </div>
  );
}
