---
name: create-template
description: Create a PDF template from a Figma design. Use when the user provides a Figma URL and wants to build a new template, or when they ask to create/implement a template for the PDF generator.
user-invocable: true
argument-hint: [figma-url]
---

# Create PDF Template from Figma

Build a production-ready PDF template from a Figma design for the CGIAR PDF Generator.

## Workflow

### Step 1: Fetch the Figma design

Use the Figma MCP tools to get the design context and screenshot:

```
get_design_context(fileKey, nodeId)
get_screenshot(fileKey, nodeId)
```

If the response is too large, use `get_metadata` first to get the node structure, then fetch child nodes individually.

### Step 2: Audit existing components before writing ANY code

**This is mandatory.** Before creating anything, scan for reusable components:

1. Read ALL `.tsx` files in `app/templates/` recursively
2. Check if any of these patterns already exist as extracted components:
   - Label-value pairs (`LabelValue`)
   - Impact area cards (`ImpactAreaCard`)
   - QA assessment boxes (`QABox`)
   - Tag badges (`TagBadge`)
   - Section headers, dividers, info grids
3. Check `public/assets/` for existing static assets (icons, logos, patterns)

**Reuse rules:**

- If a component already exists in another template that matches what the Figma design needs, **import and reuse it** — do NOT duplicate it. Extract it to a shared location if needed.
- If a visual pattern repeats 2+ times within the new template, **extract it as a local component** in the same file with props for the varying parts.
- Components should only receive **text strings, numbers, booleans, and URLs** as props. Never pass JSX or complex rendering logic as props.
- Icon/image URLs come from the data JSON — store static assets in `public/assets/{project}/` and reference via data props.

### Step 3: Design the data interface

Define a TypeScript interface for the JSON data the template expects:

- Every dynamic text, URL, number, or image path must be a field in the interface
- Use descriptive field names that match the PRMS/CGIAR domain
- Use arrays for repeating sections (impact areas, partners, evidence links)
- Use optional fields (`?`) for sections that may not always be present
- **Do NOT include pagination fields** (page_number, total_pages) — Gotenberg handles this

### Step 4: Build the template

Create `app/templates/{project}/{template-name}.tsx`:

```tsx
import type { TemplateProps } from ".."; // adjust depth for sub-folders

interface MyData {
  // ... your interface
}

export default function MyTemplate({ data }: TemplateProps) {
  const d = data as MyData | null;
  return (
    <div style={{ fontFamily: "'Noto Sans', sans-serif" }}>
      {/* Google Fonts - include if using Noto Sans/Serif */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;700&family=Noto+Serif:wght@400;500&display=swap');`}</style>
      {/* ... template content ... */}
    </div>
  );
}
```

**Layout rules (CRITICAL):**

- **Flow layout only** — use `flex`, `block`, normal document flow. The content must grow naturally because Gotenberg splits the HTML into PDF pages based on `paperWidth` and `paperHeight` query params.
- **NEVER use absolute positioning** for main content. It locks elements to a fixed viewport and breaks multi-page PDFs.
- **No footers or pagination** in the template. Gotenberg injects headers/footers via its own API.
- **No fixed height on the root container** — let content flow. The outer `<div>` in `[template]/page.tsx` already sets width/height from query params.
- Use `max-width` instead of `width` on content areas so they stay within bounds but don't force horizontal overflow.

**Styling rules:**

- Use Tailwind CSS classes for layout and spacing
- Use inline `style={{ fontFamily: ... }}` for Noto Sans/Serif (since they're loaded via @import)
- Use the CGIAR brand color tokens defined in CLAUDE.md
- Match the Figma design pixel-for-pixel: exact font sizes, colors, gaps, paddings
- All font sizes use `text-[Xpx]` syntax (e.g., `text-[10px]`, `text-[8px]`)

### Step 5: Audit and download static assets

**Before downloading anything**, launch an Explore subagent to scan all existing assets:

```
Task(subagent_type="Explore", prompt="List ALL files in public/assets/ recursively. For each image, report its filename, dimensions if possible, and which template references it. I need to know what assets already exist so I don't download duplicates.")
```

**Asset reuse rules:**

- If the Figma design uses an asset that already exists in `public/assets/` (same logo, icon, pattern, etc.), **reuse it** — do NOT download a duplicate with a different name.
- Compare visually: the CGIAR logo, shield badge, sidebar pattern, and impact area icons likely already exist. Check before downloading.
- Only download assets that are genuinely new (new icons, new illustrations, new patterns not seen before).
- Use descriptive filenames: `cgiar-logo.png`, `icon-nutrition.png`, not `image174.png` or `asset-1.png`.

**When downloading new assets:**

```bash
curl -sL "https://www.figma.com/api/mcp/asset/{id}" -o public/assets/{project}/{name}.png
```

Figma asset URLs expire after 7 days — download immediately. Store in `public/assets/{project}/`.

### Step 6: Create demo data

Create `app/templates/{project}/{template-name}.demo.json` with realistic dummy data matching your interface. This lets you test via:

```
http://localhost:3000/{template-name}?demo=true
```

### Step 7: Validate

1. Run `npx tsc --noEmit` to verify compilation
2. Open `http://localhost:3000/{template-name}?demo=true` in the browser
3. Compare side-by-side with the Figma screenshot
4. Verify content flows naturally and would paginate correctly for longer data

## Component reuse checklist

Before finishing, confirm:

- [ ] No duplicate components — anything that exists elsewhere was imported, not copied
- [ ] Repeating patterns within the template are extracted as local components
- [ ] All dynamic content comes from the `data` prop, not hardcoded
- [ ] No duplicate assets — verified existing `public/assets/` before downloading
- [ ] Static assets are stored in `public/assets/` and referenced correctly
- [ ] No pagination, no fixed-height layouts, no absolute positioning on content
- [ ] Demo JSON created with realistic test data
- [ ] TypeScript compiles cleanly
