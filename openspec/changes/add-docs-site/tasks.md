## 1. Master guide & content source

- [ ] 1.1 Create `docs/dev/pdf-viewer-master-guide.md` with the full masked blueprint (architecture, PDF flow, DynamoDB, template contract, create template, wire backend, install/deploy, gotchas, Required variables table)
- [ ] 1.2 Create `app/docs/content.ts` (or per-section content) holding the masked text/data the sections render, with every sensitive value as `{{variable}}`

## 2. Shared presentational components (Tailwind only)

- [ ] 2.1 Create `app/docs/components/Sidebar.tsx` — section list, active-state highlight, links to each section route
- [ ] 2.2 Create `app/docs/components/CodeBlock.tsx` — Tailwind-styled `<pre>` with optional title/language label
- [ ] 2.3 Create `app/docs/components/Callout.tsx` — info / warning / danger variants
- [ ] 2.4 Create `app/docs/components/VariableTable.tsx` — renders the Required variables reference table
- [ ] 2.5 Create `app/docs/components/CopyButton.tsx` — client component using `navigator.clipboard.writeText` with copied state feedback

## 3. Docs shell & layout

- [ ] 3.1 Create `app/docs/layout.tsx` — sidebar + content shell wrapping `{children}`, responsive, brand styling
- [ ] 3.2 Convert `app/docs/page.tsx` into the docs index / Getting Started entry (preserve existing API-reference content as a section), linking into the first section

## 4. Content sections (hand-written TSX)

- [ ] 4.1 Getting Started — what this project is (viewer, not full generator), prerequisites, install, render a first template via `?demo=true`
- [ ] 4.2 Architecture overview — the two-system split (this viewer vs external reports-microservice + PRMS over RabbitMQ), diagram-in-words
- [ ] 4.3 PDF generation flow — request lifecycle, query params, paginator, Gotenberg is external
- [ ] 4.4 DynamoDB storage — schema, `id`/`json`, env vars, `POST /api/data` auth (`x-api-secret`/`x-admin-secret`), unauthenticated render, single-use UUID
- [ ] 4.5 Template system — non-changeable fixed contract vs what you can change, auto-discovery, demo mode
- [ ] 4.6 Create a new template — file-based and folder-based step-by-step + verify
- [ ] 4.7 Wire a new backend connection — `POST /api/data` contract, render URL, how PRMS + microservice consume it (contract-derived)
- [ ] 4.8 Install & deploy — env vars, AWS/Dynamo creds, external Gotenberg, Lambda/Docker
- [ ] 4.9 Gotchas & rules — reserved filenames, entry-point discipline, single-use UUID, flow layout, `data-paginator-block`, double-pagination, defensive coding, no TTL
- [ ] 4.10 Required variables — page/section rendering the `VariableTable`

## 5. Agent prompt section

- [ ] 5.1 Create `app/docs/agent-prompt/install-prompt.ts` exporting the single-source installation prompt string (guides any agent to install + answer questions, masked)
- [ ] 5.2 Create `app/docs/agent-prompt/page.tsx` rendering the prompt with a Copy button and a Download button (vanilla `Blob` → `install-prompt.md`, no library)

## 6. Verification

- [ ] 6.1 `npm run build` passes with no new dependencies and no CDN/external library added
- [ ] 6.2 Manually verify (Playwright screenshots to `.playwright-screenshots/`): sidebar navigation works, sections render, `{{variable}}` masking present, copy + download work, no real URLs/secrets visible
