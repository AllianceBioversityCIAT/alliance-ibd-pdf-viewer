## Context

The `alliance-ibd-pdf-viewer` is a Next.js (App Router) service that stores arbitrary JSON in DynamoDB (keyed by UUID) and renders React `.tsx` templates to continuous HTML; a client-side `Paginator` inserts page breaks. The actual HTML→PDF capture (Gotenberg), S3 upload, and Slack notification happen in an **external** `reports-microservice`; the PRMS server builds payloads and dispatches them over RabbitMQ. Today, documentation is one API-reference page (`app/docs/page.tsx`) plus `docs/dev/*.md`. A new team needs self-serve docs. A deep multi-agent review produced a master blueprint that this change turns into an in-app site and a `docs/dev/pdf-viewer-master-guide.md`.

Constraints (decided with the user): public route, no exposed secrets/URLs (mask as `{{variable}}`), Tailwind v4 only, no CDN, no external libraries, framework-style sidebar + Getting Started, and an agent-prompt page with copy + download.

## Goals / Non-Goals

**Goals:**
- A polished, public, framework-style docs site under `/docs` with sidebar navigation and a Getting Started flow.
- Faithful, masked documentation of: PDF flow, DynamoDB storage + auth, template fixed contract, creating templates, wiring a backend, install/deploy, gotchas.
- An Agent Prompt section with clipboard copy + client-side `.md` download from a single-source string.
- A persisted master guide at `docs/dev/pdf-viewer-master-guide.md`.

**Non-Goals:**
- No changes to runtime behavior (`app/api/*`, `lib/dynamo.ts`, templates, Lambda handler).
- No new dependencies, no markdown/MDX renderer, no CDN.
- No authentication/gating of the docs route.
- Not documenting the external microservice's internal code beyond the contract it exchanges with this viewer.

## Decisions

**1. Routing: nested route segments under `app/docs/` with a shared `layout.tsx`.**
Each section is its own route (e.g. `app/docs/architecture/page.tsx`), and `app/docs/layout.tsx` renders the sidebar shell around `{children}`. Rationale: real per-section URLs (linkable, like framework docs), server-rendered, no client router library. Alternative considered: a single page with anchor scrolling — rejected because it doesn't give clean per-section URLs and becomes one huge file. Note: `app/docs/layout.tsx` is a legitimate Next.js route layout (the "never name files layout.tsx" rule applies to template component files under `app/templates/`, not to actual route layouts).

**2. Content as hand-written TSX + shared presentational components.**
Build `app/docs/components/`: `Sidebar`, `CodeBlock` (Tailwind-styled `<pre>`), `Callout` (info/warn/danger), `VariableTable`, `CopyButton`. Rationale: satisfies "Tailwind only, no library" — no markdown runtime. Alternative considered: MDX — rejected (adds `@next/mdx` dependency).

**3. Agent prompt single source of truth: `app/docs/agent-prompt/install-prompt.ts`.**
Exports the prompt string. The page renders it in a `CodeBlock`; the Copy button uses `navigator.clipboard.writeText`; the Download button builds a `Blob([...], {type:'text/markdown'})` + object URL + temporary `<a download>`. Rationale: one string drives render, copy, and download — no duplication, no public file, no library.

**4. Masking strategy.**
All sensitive values are written as `{{variable}}` literals in the TSX content and consolidated in a `VariableTable`. Since content is static TSX with no real values, there is no risk of leaking env values at runtime.

**5. Preserve existing API reference as a section.**
The current `app/docs/page.tsx` content becomes the API-reference section (or the `/docs` index/Getting Started). The `/docs` index redirects/links into the first section.

**6. Persist the master guide.**
Write the full blueprint to `docs/dev/pdf-viewer-master-guide.md` as the source of truth (repo convention), which the site content mirrors.

## Risks / Trade-offs

- [Docs drift from code over time] → Keep the master guide in `docs/dev/` as the single source and cite file paths; future code changes should update it. Out of scope to automate.
- [Accidental leak of a real URL/secret in content] → Enforce `{{variable}}` masking; the Required variables table is the allow-list; review content before archive.
- [`app/docs/layout.tsx` naming confusion with the template naming rule] → Documented in Decision 1; it is a valid route layout, not a template file.
- [Clipboard API unavailable in insecure contexts] → Copy button degrades gracefully (still show the prompt text + working download); acceptable since docs are served over HTTPS in deployment.
- [Content accuracy: the external `pdf.generateUrl`/Gotenberg handler was not on disk during review] → Document the backend connection from the verified contract (what PRMS sends + what the viewer accepts) and flag it as contract-derived.

## Migration Plan

Purely additive UI. The only replacement is `app/docs/page.tsx` (single page → site index). No data migration, no env changes. Rollback = revert the change; the rest of the app is untouched.

## Open Questions

- None blocking. The external microservice's live handler can be documented more precisely later if its production branch is pulled; the contract-level description is sufficient for onboarding now.
