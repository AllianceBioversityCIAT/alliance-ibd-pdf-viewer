## Why

A separate development team will reuse the `alliance-ibd-pdf-viewer` project to create new templates and wire new backend connections, but the only existing documentation is a single API-reference page (`app/docs/page.tsx`) plus scattered `docs/dev/*.md` files. New developers cannot self-serve how PDFs are generated, how DynamoDB storage works, what the non-changeable template contract is, or how to connect a backend — so onboarding depends on tribal knowledge. We need a polished, public, framework-style documentation site that any developer (or AI agent) can read end to end.

## What Changes

- Add a **public, framework-style documentation site** under `/docs`: persistent left sidebar navigation + a "Getting Started" step-by-step + organized content sections.
- Reorganize the existing single `app/docs/page.tsx` into the new sidebar layout; the current API reference becomes one section within the site (**BREAKING** for the `/docs` route shape — it goes from one page to a multi-route section).
- Author all content as **hand-written TSX** using shared presentational components (`Sidebar`, `CodeBlock`, `Callout`, `VariableTable`, `CopyButton`). **No CDN, no external libraries** (no `react-markdown`/MDX) — 100% Tailwind CSS v4.
- Content sections: Getting Started, Architecture, PDF generation flow, DynamoDB storage, Template system (fixed contract vs free space), Create a template, Wire a new backend connection, Install & deploy, Gotchas & rules.
- Add an **Agent Prompt** section: an installation prompt meant to be copy-pasted into any AI agent, with a "Copy prompt" button (clipboard) and a "Download .md" button (vanilla Blob download, no library). Single source of truth in an `install-prompt.ts` string.
- All real URLs, secrets, table names, and hosts are **masked as `{{variable}}`**, with a "Required variables" reference table. The site exposes no credentials.
- Persist the full technical reference as a master guide at `docs/dev/pdf-viewer-master-guide.md`.

## Capabilities

### New Capabilities
- `docs-site`: A public, in-app documentation experience (sidebar navigation, Getting Started, content sections, agent-prompt copy/download) that documents the PDF viewer's generation flow, DynamoDB storage, template contract, backend integration, and deployment — with all sensitive values masked.

### Modified Capabilities
<!-- None: there are no existing OpenSpec specs; the /docs route is net-new behavior captured under the docs-site capability. -->

## Impact

- **New routes/files** under `app/docs/` (sidebar layout, per-section pages, shared `components/`, `install-prompt.ts`).
- **Replaces** the current `app/docs/page.tsx` single page with the sidebar site (existing API reference content preserved as a section).
- **New doc file** `docs/dev/pdf-viewer-master-guide.md` (master reference, source of the site content).
- **No backend/runtime changes**: no changes to `app/api/*`, `lib/dynamo.ts`, templates, or the Lambda handler. Purely additive UI/docs.
- **No new dependencies**: Tailwind CSS v4 only; clipboard + Blob download via native browser APIs.
- **Public exposure**: the `/docs` route is intentionally unauthenticated; content is masked (`{{variable}}`) so no secrets/URLs leak.
