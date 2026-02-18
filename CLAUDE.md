# CGIAR PDF Generator

## Project overview

Next.js (App Router) service that renders HTML templates server-side and converts them to PDF via **Gotenberg** (headless Chrome). Templates are React `.tsx` components that receive a JSON `data` prop.

## Architecture

```
POST /api/data  →  stores JSON in DynamoDB, returns UUID
GET /{template}?uuid=...&paperWidth=...&paperHeight=...  →  renders HTML page
Gotenberg captures the rendered page  →  PDF (pagination handled by Gotenberg, NOT in templates)
```

## Template system

Templates support two formats: **file-based** (simple) and **folder-based** (complex templates with shared components).

```
app/templates/
  index.ts                          ← exports TemplateProps interface
  reportingtool/
    results_p25/                    ← folder-based: unified PRMS template
      template.tsx                  ← entry point (discovered as "results_p25")
      template.demo.json            ← demo data for ?demo=true
      types.ts                      ← TypeScript interfaces
      transform.ts                  ← data extraction/parsing helpers
      components/                   ← shared components (NOT discovered as templates)
        page-shell.tsx              ← layout wrapper (avoid naming "layout.tsx" in app/)
        common-sections.tsx
        qa-box.tsx
        ...
    demo/                           ← folder-based: relocated example template
      template.tsx                  ← discovered as "demo"
  aiccra/
    keko/
      summary.tsx                   ← file-based, discovered as "summary"
  starter/
    initial.tsx                     ← file-based, discovered as "initial"
```

**Auto-discovery**: `GET /api/templates` recursively walks all project folders. A directory containing `template.tsx` is treated as a folder-based template (name = folder name). Individual `.tsx` files (excluding `index.tsx`, `components.tsx`) are file-based templates. No registry needed.

**Demo mode**: File-based: `{name}.demo.json` next to the template. Folder-based: `template.demo.json` inside the folder. Access via `/{template}?demo=true`.

**Naming restriction**: Never name component files `layout.tsx`, `page.tsx`, `loading.tsx`, or other Next.js App Router conventions inside the `app/` tree — Next.js will treat them as route files.

### Creating a new template

#### Simple (file-based)
1. Create `app/templates/{project}/{name}.tsx`
2. Import `TemplateProps` from the templates index (adjust `../` depth for sub-folders)
3. Define a TypeScript interface for the expected JSON data
4. Export default a React component that renders the data
5. Optionally create `{name}.demo.json` next to it for testing

#### Complex (folder-based)
1. Create `app/templates/{project}/{name}/template.tsx`
2. Add `types.ts` for interfaces, `transform.ts` for data parsing
3. Add `components/` folder for shared sub-components
4. Optionally create `template.demo.json` for testing

### PRMS results template (`results_p25`)

The unified template for all PRMS result types. Uses `rt_id` from the JSON data to switch between variant-specific sections:

| rt_id | Type | QA Box | Variant Sections |
|-------|------|--------|------------------|
| 7 | Innovation Development | Standard QABox | Readiness details, investments, actors |
| 6 | Knowledge Product | KPQABox (circle "KP") | KP metadata table |
| 5 | Capacity Sharing | Standard QABox | Common sections only |
| 1 | Policy Change | Standard QABox | Placeholder |
| 2 | Innovation Use | Standard QABox | Placeholder |

**Data format**: Consumes the real PRMS API JSON (fields like `result_name`, `phase_name`, `primary_submitter_name`, `*_tag` for impact areas). The `transform.ts` layer parses complex fields (impact tags, TOC entries, evidence) into display types.

### Template rules

- **No pagination/footers** — Gotenberg handles page breaks, headers, and footers via its own API parameters
- **Flow layout only** — use flexbox/block layout so content grows naturally for multi-page PDFs. Never use absolute positioning that locks content to a fixed page height
- **`paperWidth` and `paperHeight`** are passed as query params and set the outer container dimensions. Templates render as continuous HTML; Gotenberg splits into pages
- All text and URLs must come from the `data` prop — templates should be data-driven, not hardcoded

## Key conventions

- **Tailwind CSS v4** (`@import "tailwindcss"` in globals.css)
- **Noto Sans / Noto Serif** — CGIAR brand fonts, loaded via Google Fonts `@import` in templates that need them
- Static assets go in `public/assets/{project}/`

### Brand color tokens

| Token | Hex | Usage |
|-------|-----|-------|
| Dark green | `#02211a` | Headers, dark backgrounds |
| Deep green | `#033529` | QA box sidebar, table headers, emphasis |
| Mid green | `#065f4a` | Section titles, links |
| Teal | `#11d4b3` | Accent, highlighted links, badges |
| Off-white | `#e2e0df` | Card backgrounds |
| Dark text | `#1d1d1d` | Labels |
| Body text | `#393939` | Values, descriptions |
| Muted | `#818181` | Secondary info, fine print |

**Figma MCP color warning:** The Figma MCP `get_design_context` sometimes returns incorrect colors in its code output. Always visually verify colors against the `get_screenshot` result and prefer these brand tokens when the screenshot clearly matches a known token.
