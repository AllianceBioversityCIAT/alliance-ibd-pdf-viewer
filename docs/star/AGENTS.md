# STAR PDF Templates — AI Agent Guide

> **Read this file first** before modifying anything under `app/templates/star/`.
>
> Canonical path: `docs/star/AGENTS.md` (cannot live under `app/templates/` — Next.js bundles all files in `app/`).

This document describes the reusable STAR PDF architecture for the CGIAR PDF Generator (`alliance-ibd-pdf-viewer`). It is the primary knowledge source for AI assistants (Cursor, Claude, ChatGPT, Copilot).

---

## Architecture Overview

STAR PDFs are split into two layers:

1. **Shared sections** (`star/shared/sections/`) — six sections reused by every STAR result-type template.
2. **Result-specific sections** (`star/{template}/components/`) — one section per result type (e.g. Cap Sharing Details).

### Why this split?

- **Most PDF content is identical** across result types (General Information, Alliance Alignment, Partners, Geography, Evidence, IP Rights).
- **Only one section differs** per result type (Cap Sharing, Innovation Development, Policy Change, Knowledge Product, …).
- **Duplication is forbidden.** Shared sections exist exactly once.
- **Business rules are isolated** in per-section `rules.ts` files so Angular/STAR logic changes do not require hunting through JSX.

### How payloads are composed

```
CapSharingPdfPayload
├── general_information   ← GeneralInformation (+ optional PDF context)
├── alliance_alignment    ← GetAllianceAlignment (+ optional labels)
├── cap_sharing           ← GetCapSharing (result-specific)
├── results_partners      ← PatchPartners
├── geographic_scope      ← GetGeoLocation
├── evidence              ← PatchResultEvidences
└── ip_rights             ← PatchIpOwner
```

`StarCommonPayload` contains the six shared keys. Each template extends it with its result-specific key.

### How to add a new result type

Example: `inn_dev/`

1. Create `star/inn_dev/components/innovation-development-section.tsx` (result-specific UI only).
2. Create `star/inn_dev/types.ts` with `InnDevPdfPayload extends StarCommonPayload { inn_dev: GetInnDev }`.
3. Create `star/inn_dev/rules.ts` for result-specific visibility rules.
4. Create `star/inn_dev/template.tsx` — orchestrate shared sections + your new section.
5. Create `star/inn_dev/template.demo.json` and `payload-guide.json`.
6. **Do not copy** shared sections into the new folder.

Templates are auto-discovered: `app/templates/star/inn_dev/template.tsx` → route `/inn_dev?demo=true`.

---

## Folder Structure

```text
star/
  AGENTS.md                          ← this file
  shared/
    components/
      page-shell.tsx                 ← STAR header, hero, paginator wrapper
      section-title.tsx              ← blue section headings
      info-card.tsx                  ← grey rounded cards
      label-value.tsx                ← label + value rows, keyword chips
      data-table.tsx                 ← STAR key-value tables
    sections/
      general_information/
        general-information-section.tsx
        types.ts
        rules.ts
        demo.json
        index.ts
      alliance_alignment/
      results_partners/
      geographic_scope/
      evidence/
      ip_rights/
    types/
      star-common-payload.types.ts
    tokens.ts                        ← STAR colors / fonts (Figma)
    utils.ts
    index.ts
  cap_sharing/
    template.tsx
    template.demo.json
    payload-guide.json
    types.ts
    rules.ts
    catalogs.ts                    ← ID → label maps for Cap Sharing
    components/
      cap-sharing-details-section.tsx
  inn_dev/                           ← future
```

---

## Shared Sections (reused by ALL templates)

| Section | STAR interface | Folder |
|---------|----------------|--------|
| General Information | `GeneralInformation` | `shared/sections/general_information/` |
| Alliance Alignment | `GetAllianceAlignment` | `shared/sections/alliance_alignment/` |
| Results Partners | `PatchPartners` | `shared/sections/results_partners/` |
| Geographic Scope | `GetGeoLocation` | `shared/sections/geographic_scope/` |
| Evidence | `PatchResultEvidences` | `shared/sections/evidence/` |
| IP Rights | `PatchIpOwner` | `shared/sections/ip_rights/` |

Each section folder contains:

| File | Responsibility |
|------|----------------|
| `types.ts` | STAR interfaces + optional `*PdfContext` enrichments |
| `rules.ts` | **All business / visibility logic** (`shouldRender*`) |
| `*-section.tsx` | **Rendering only** — no inline business rules |
| `demo.json` | Isolated section payload for testing |
| `index.ts` | Public exports |

---

## Result-Specific Sections

| Template | Section component | STAR interface |
|----------|-------------------|----------------|
| `cap_sharing` | `cap-sharing-details-section.tsx` | `GetCapSharing` |
| `inn_dev` (future) | `innovation-development-section.tsx` | TBD |
| `policy_change` (future) | `policy-change-section.tsx` | TBD |
| `knowledge_product` (future) | `knowledge-product-section.tsx` | TBD |

Result-specific sections live **only** under their template folder.

---

## Source of Truth (STAR Backend Interfaces)

Preserve field names, nesting, and spelling from `alliance-research-indicators`:

- `GeneralInformation`, `MainContractPerson`
- `GetAllianceAlignment`, `Contract`, `Lever`, `GetSdgs`
- `PatchPartners`, `Institution`
- `GetGeoLocation`, `Country`, `Region`
- `PatchResultEvidences`, `Evidence`, `NotableReference`
- `PatchIpOwner`
- `GetCapSharing`, `GroupTraining`, `Individual`, `Trainingsupervisor`, …

**Do not:**

- Rename fields (including `requires_futher_development` — STAR spelling)
- Flatten nested structures
- Create parallel payload shapes unless strictly necessary

**PDF display enrichments** (optional, sibling fields on payload context types):

- `contract_labels`, `institution_labels`, `main_contact_display`, `session_format_label`, etc.
- These are resolved labels when the backend sends IDs only.

---

## Rules System

Every section owns `rules.ts` with functions like:

```ts
export function shouldRenderSection(payload): boolean
export function shouldRenderDescription(payload): boolean
```

Templates and section components **call rules** — they never embed business logic.

### General Information — critical rules

| Rule | Logic |
|------|-------|
| Section visibility | Render when any of: title, description, year, user_id, main_contact_person.user_id, keywords has data |
| Description | `indicator_id !== 5` AND description has value |
| Main contact | Resolve `main_contact_person.user_id` → fallback `user_id` |
| Keywords | Render when `keywords.length > 0` as chips |

---

## Payload Strategy

| Level | Example | Purpose |
|-------|---------|---------|
| Section payload | `general_information/demo.json` | Test one section in isolation |
| Common payload | `StarCommonPayload` | Shared across all STAR templates |
| Template payload | `CapSharingPdfPayload` | Full PDF data from STAR backend |

Cap Sharing template section order:

1. General Information
2. Alliance Alignment
3. **Cap Sharing Details** (result-specific)
4. Results Partners
5. Geographic Scope
6. Evidence
7. IP Rights

---

## Figma Usage

Figma is the **visual source of truth** for layout, typography, and colors.

| Page | Figma node | Content |
|------|------------|---------|
| Page 1 | `34180:17970` | Header, General Information, Alliance Alignment (projects) |
| Page 2 | `34180:18071` | Levers continuation, Cap Sharing Details (group) |
| Page 2 alt | `34218:14041` | Cap Sharing Details (individual) |
| Page 3 | `34218:13713` | Training details, Organizations, Results Partners |

STAR file: [STAR Figma](https://www.figma.com/design/5a9xZJdb2rZAQm2wdk1CNT/STAR)

### Conflict resolution

| Topic | Wins |
|-------|------|
| Visibility, conditional fields, Angular parity | **STAR backend / rules.ts** |
| Layout, spacing, colors, typography | **Figma** |

Design tokens in code: `shared/tokens.ts` (`#1689CA`, `#173F6F`, `#E2E3E4`, Barlow).

### Static assets (`public/assets/star/`)

| File | Figma node | Size | Usage |
|------|------------|------|--------|
| `header.png` | `34466:20857` | 595×131 | Full-bleed header in `PageShell` |
| `footer.png` | `34247:9623` | 521×14 | Footer bar in paginator (`renderPageFooter`) |

Re-export from Figma MCP (`get_screenshot`, `contentsOnly: true`) when the design changes. The footer PNG includes a sample page label; the paginator (`footerVariant: "star"`) masks it and injects dynamic `Page N of M`.

`PageShell` passes only serializable props to `Paginator` (no functions). Footer HTML is built inside the client `paginator.tsx` when `footerVariant === "star"`.

---

## PDF / Pagination Rules

- Use **flow layout** (flex/block). No fixed page-height locking.
- Wrap indivisible groups with `data-paginator-block` (heading + table, grey cards, 2-column groups).
- Long tables inside sections may split across pages — do not wrap entire long tables in `data-paginator-block`.
- Test with `?demo=true&paperWidth=595&paperHeight=842&debug=true`.

---

## Development Commands

```bash
npm run dev
# Cap Sharing demo:
open "http://localhost:3000/cap_sharing?demo=true&paperWidth=595&paperHeight=842"
```

List templates: `GET /api/templates`

---

## AI Instructions (mandatory)

When working on STAR PDFs, you **must**:

1. Read `star/AGENTS.md` first.
2. Reuse existing shared sections — never duplicate.
3. Preserve STAR interface field names and hierarchy.
4. Put business rules in `rules.ts`, not in templates or JSX.
5. Keep templates data-driven (all text from `data` prop).
6. Use defensive coding (`?.`, `?? []`) — any field can be null/missing.
7. Add/update `demo.json` per section and `template.demo.json` per template.
8. Document new fields in `payload-guide.json`.
9. Match Figma visually; match STAR logically.

When adding a field:

1. Add to `types.ts` (STAR interface if from backend, or `*PdfContext` if display-only).
2. Add visibility rule to `rules.ts`.
3. Render in `*-section.tsx`.
4. Update `demo.json` and `payload-guide.json`.

---

## Related Docs

- Project conventions: `/CLAUDE.md`
- Dev log: `/docs/dev/star-pdf-architecture.md`
- Cap Sharing payload reference: `app/templates/star/cap_sharing/payload-guide.json`
