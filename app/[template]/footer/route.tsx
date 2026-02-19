import { readdirSync, statSync, existsSync } from "fs";
import { join, relative } from "path";

interface RouteParams {
  params: Promise<{ template: string }>;
}

/**
 * Finds the footer module path for a given template name.
 * Mirrors the template discovery logic from [template]/page.tsx:
 *   - Folder-based: templates/{project}/{name}/footer.ts
 *   - Walks all project directories recursively
 *
 * Returns a path relative to app/templates/ (without extension)
 * for use with dynamic import.
 */
function findFooterInDir(dir: string, templateName: string): string | null {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory()) continue;

    if (entry === templateName) {
      const footerFile = join(full, "footer.ts");
      if (existsSync(footerFile)) return footerFile;
    }

    const found = findFooterInDir(full, templateName);
    if (found) return found;
  }
  return null;
}

function findFooter(templateName: string): string | null {
  const base = join(process.cwd(), "app", "templates");
  for (const project of readdirSync(base)) {
    const projectDir = join(base, project);
    if (!existsSync(projectDir) || !statSync(projectDir).isDirectory()) continue;
    const found = findFooterInDir(projectDir, templateName);
    if (found) return relative(base, found).replace(/\.ts$/, "");
  }
  return null;
}

/**
 * GET /{template}/footer
 *
 * Dynamically discovers and serves a self-contained HTML footer
 * for any template that has a footer.ts in its folder.
 *
 * Convention: each template folder can export footerHtml from footer.ts
 *
 * Example:
 *   app/templates/reportingtool/results_p25/footer.ts
 *   → GET /results_p25/footer
 */
export async function GET(_req: Request, { params }: RouteParams) {
  const { template } = await params;

  const footerPath = findFooter(template);
  if (!footerPath) {
    return new Response("Footer not found for this template", { status: 404 });
  }

  let footerHtml: string;
  try {
    const mod = await import(`@/app/templates/${footerPath}`);
    footerHtml = mod.footerHtml;
  } catch {
    return new Response("Error loading footer module", { status: 500 });
  }

  if (!footerHtml) {
    return new Response("Footer module does not export footerHtml", { status: 500 });
  }

  return new Response(footerHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
