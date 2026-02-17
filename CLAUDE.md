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

Templates live in `app/templates/{project}/{template}.tsx` and support **unlimited nesting** for sub-folders:

```
app/templates/
  index.ts                          ← exports TemplateProps interface
  reportingtool/
    example.tsx                     ← discovered as "example"
    result-summary.tsx              ← discovered as "result-summary"
    result-summary.demo.json        ← demo data for ?demo=true
  aiccra/
    keko/
      summary.tsx                   ← sub-folder, discovered as "summary"
  starter/
    initial.tsx                     ← minimal template reference
```

**Auto-discovery**: `GET /api/templates` recursively walks all project folders and returns template names (filenames without `.tsx`). No registry needed — just create the file.

**Demo mode**: Any template can have a `.demo.json` file next to it. Access via `/{template}?demo=true` to render with dummy data without DynamoDB.

### Creating a new template

1. Create `app/templates/{project}/{name}.tsx`
2. Import `TemplateProps` from the templates index (adjust `../` depth for sub-folders)
3. Define a TypeScript interface for the expected JSON data
4. Export default a React component that renders the data
5. Optionally create `{name}.demo.json` next to it for testing

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
| Deep green | `#033529` | QA box sidebar, emphasis |
| Mid green | `#065f4a` | Section titles, links |
| Teal | `#11d4b3` | Accent, highlighted links, badges |
| Off-white | `#e2e0df` | Card backgrounds |
| Dark text | `#1d1d1d` | Labels |
| Body text | `#393939` | Values, descriptions |
| Muted | `#818181` | Secondary info, fine print |
