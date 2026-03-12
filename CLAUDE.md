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

| rt_id | Type | Variant Sections |
|-------|------|------------------|
| 7 | Innovation Development | Readiness details, investments, actors |
| 6 | Knowledge Product | KP metadata table |
| 5 | Capacity Sharing | Common sections only |
| 1 | Policy Change | Policy-specific fields |
| 2 | Innovation Use | Actors, organizations, measures |

**QA Box**: A single data-driven `QABox` component receives a `qa_info` object from the backend (badge type, title, description, optional QA URL, optional adjustments). The backend decides the QA scenario; the template only renders. See `qa-scenarios.demo.json` for all supported badge types: `kp`, `mqap`, `two-assessors`, `senior`, `in-progress`.

**Data format**: Consumes the real PRMS API JSON (fields like `result_name`, `phase_name`, `primary_submitter_name`, `*_tag` for impact areas). The `transform.ts` layer parses complex fields (impact tags, TOC entries, evidence) into display types.

### Template rules

- **Flow layout only** — use flexbox/block layout so content grows naturally for multi-page PDFs. Never use absolute positioning that locks content to a fixed page height
- **`paperWidth` and `paperHeight`** are passed as query params and set the outer container dimensions. Templates render as continuous HTML; the Paginator component handles page breaks client-side
- All text and URLs must come from the `data` prop — templates should be data-driven, not hardcoded

### Pagination system (`paginator.tsx`)

The `Paginator` component is a **client-side pagination engine** that runs after render (500ms delay). It reads `paperHeight` from query params and manipulates the DOM to ensure content never crosses page boundaries.

**Query params:**

| Param | Effect |
|-------|--------|
| `paperHeight` | Activates pagination (page height in px). Required for pagination to run |
| `noPaginate=true` | Disables pagination even if `paperHeight` is present |
| `debug=true` | Draws visual debug lines: red CUT lines, orange FOOTER ZONE, green CONTENT START |

**Configuration (DEFAULT_CONFIG):**

| Key | Default | Purpose |
|-----|---------|---------|
| `footerHeight` | 40 | Space reserved at bottom for the auto-generated footer |
| `marginTop` | 30 | Breathing room after each page cut (pages 2+) |
| `marginBottom` | 10 | Space between content and footer zone |
| `firstPage.marginTop` | 0 | Page 1 has no extra top margin (header provides spacing) |

**How it works:**

1. **`collectBlocks()`** — walks the DOM tree inside the Paginator container and collects "content blocks":
   - Elements with `data-paginator-block` → treated as **atomic** (indivisible)
   - "Plain wrappers" (div/section/article with no background/border/shadow) → recurses into children
   - Styled blocks (background, border, shadow) → atomic
   - Leaf elements (no children) → atomic
2. **`processPass()`** — iterates blocks, checks if any extend past the "safe zone" (page bottom minus footer/margin). For overflow blocks:
   - **Tables**: split at row boundaries, continuation has no repeated thead
   - **Other blocks**: insert a spacer div to push the block to the next page
   - **Orphan detection**: if the previous sibling is small (<30px, typically a heading), it gets pushed along with the block to avoid orphaned headings
3. **Multi-pass** — runs up to 10 passes until no more DOM changes (cascading shifts)
4. **Footer placement** — absolute-positioned footers with "CGIAR Results Framework" + page numbers
5. **Final padding** — pads document to exact multiple of `paperHeight`

**`data-paginator-block` attribute (CRITICAL):**

Add this HTML attribute to any element that must be treated as an **indivisible unit** by the paginator. The paginator will never recurse into its children — the whole element is pushed to the next page if it overflows.

**When to use it:**

| Scenario | Example |
|----------|---------|
| **2D layouts (grid, flex-row)** | Impact Areas grid (`grid-cols-2`), Innovation Development 2-column flex |
| **Heading + table pairs** | `<div data-paginator-block>` wrapping a `<p>` heading + `<DataTable>` |
| **Any group that must stay together** | A card with title + content that shouldn't be split |

**When NOT to use it:**
- On sections with potentially **very long tables** (many rows) — the paginator can't split tables inside atomic blocks. Only use it when the section fits within a single page height.

**Debugging pagination issues:**

1. Add `?debug=true` to the URL to see CUT lines (red), FOOTER ZONES (orange), and CONTENT START markers (green)
2. Check for **orphaned headings** — a heading at the bottom of a page with its content on the next. Fix: add `data-paginator-block` to the wrapper div containing both
3. Check for **duplicate spacers** — elements in grid/flex-row layouts getting individual spacers. Fix: add `data-paginator-block` to the grid/flex container
4. Check for **content crossing footer zone** — content that overlaps the orange FOOTER ZONE. The paginator should push it, but if the block isn't detected (e.g., inside a plain wrapper), add `data-paginator-block`
5. Use Playwright to evaluate positions: `document.querySelectorAll('[data-paginator-spacer]')` to inspect inserted spacers

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

### Defensive coding (CRITICAL)

Templates receive dynamic data from external APIs where **any field can be null, undefined, a wrong type, or missing entirely**. The template must NEVER crash — it should gracefully skip missing data.

| Pattern | Use | Example |
|---------|-----|---------|
| `!!data.X?.length` | Boolean check for arrays | `const hasActors = !!data.actors?.length` |
| `data.X?.map(...)` | Conditional iteration | `{data.items?.map(i => <Item key={i.id} />)}` |
| `(data.X ?? []).map(...)` | When prop requires concrete array | `rows={(data.rows ?? []).map(r => [r.a, r.b])}` |
| `data.a?.nested?.field` | Nested access | `data.primary_submitter_data?.toc_url` |
| `toArray(val)` | Field might be string instead of array | `toArray(data.regions)` in transform layer |

**Rules:**
- **Never** use non-null assertions (`data.X!.map()`) — always use `?.` or `?? []`
- **Never** call `.map()`, `.filter()`, `.length` without confirming the value is an array
- **Transform layer is the safety gate**: `transform.ts` functions must sanitize all inputs (handle null, undefined, wrong types, empty values)
- **Components are the second defense**: still use `?.` and `?? []` even on transformed data
- **Test with partial data**, not just full demo JSON — fields will be missing in production

### Playwright screenshots

When using Playwright MCP to take validation screenshots, **always** save them to `.playwright-screenshots/` (already in `.gitignore`). Never leave screenshots in the project root or any tracked directory.

### Development logs (`docs/dev/`)

Each feature or significant change **must** have its own `.md` file in `docs/dev/`. This provides persistent context across Claude sessions.

- **One file per feature/task** — e.g., `docs/dev/qa-box-refactor.md`, `docs/dev/pagination-fix.md`
- **Create at the start** of a development task, update as you go
- **Contents**: summary, Figma source links, scope/decisions, what changed, validation results, open items
- This folder is the source of truth for "what was done and why" — read it at the start of a session to recover context
