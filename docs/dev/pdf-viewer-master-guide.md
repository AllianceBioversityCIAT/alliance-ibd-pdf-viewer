# CGIAR PDF Generator — Master Guide & Onboarding

> **Scope of this repo (`alliance-ibd-pdf-viewer`):** it is the **PDF *Viewer***, not a full PDF *generator*. It only (a) stores arbitrary JSON in DynamoDB keyed by a UUID, and (b) renders React `.tsx` templates to **continuous HTML**. It does **NOT** call Gotenberg, Puppeteer, or any HTML→PDF engine. The actual PDF capture, S3 upload, and Slack notification happen in a **separate external service** (`reports-microservice`).

> This file is the single source of truth for the in-app docs site (`/docs`). All real URLs/secrets are masked as `{{variable}}`.

> **PRMS / reports-microservice / Gotenberg = reference example, not a requirement.** PRMS is the external backend of the **first project** that consumed this viewer. The pipeline below (PRMS server → RabbitMQ → reports-microservice → Gotenberg → S3) is one working integration you can learn from — not the canonical implementation. A new project replaces that downstream with its own backend, transport, and PDF engine (Gotenberg, Puppeteer, Playwright, any print service — or just consuming the HTML). The **only** thing this viewer requires is the `POST /api/data → uuid → render URL` contract.

---

## Required variables

| Variable | What it is | Where it lives |
|---|---|---|
| `{{API_SECRET}}` | Shared secret external consumers / the microservice send to `POST /api/data` (header `x-api-secret`). | This viewer (env `API_SECRET`) **and** the microservice. Must match. |
| `{{ADMIN_SECRET}}` | Secret for the admin UI / `list` / `delete` (header `x-admin-secret`). Also accepted on `POST /api/data`. | This viewer (env `ADMIN_SECRET`). |
| `{{DYNAMO_TABLE}}` | DynamoDB table name. Read from env `DYNAMODB_TABLE_NAME`; **throws if missing**. | This viewer (`lib/dynamo.ts`). |
| `{{AWS_REGION}}` | AWS region. `AWS_REGION` → `AWS_DEFAULT_REGION` → fallback `us-east-1`. Auto-injected in Lambda. | This viewer. |
| `{{AWS_ACCESS_KEY_ID}}` | Static AWS key — **local dev only**, never in Lambda (IAM role used instead). | Local `.env` only. |
| `{{AWS_SECRET_ACCESS_KEY}}` | Static AWS secret — **local dev only**. | Local `.env` only. |
| `{{PDF_VIEWER_BASE_URL}}` | Base URL of this viewer deployment. | Configured in the microservice. |
| `{{GOTENBERG_URL}}` | Gotenberg (headless Chrome) base URL. Endpoint: `POST {{GOTENBERG_URL}}/forms/chromium/convert/url`. | **External** microservice only. |
| `{{RABBITMQ_URL}}` | RabbitMQ broker URL (transport between PRMS server and microservice). | PRMS server + microservice. |
| `{{REPORT_QUEUE}}` | RabbitMQ queue name (durable). | PRMS server + microservice. |
| `{{MICROSERVICE_API_KEY}}` | API key PRMS puts in the RMQ payload (`apiKey`); equals `{{API_SECRET}}` on the viewer side. | PRMS server. |
| `{{AWS_BUCKET_NAME}}` | S3 bucket the microservice uploads the final PDF to. | PRMS server + microservice. |
| `{{FRONT_END_PDF_ENDPOINT}}` | Front-end PDF endpoint baked into the JSON by the stored DB procedure. | PRMS server. |

---

## 1. Overview & architecture

```
[PRMS client]
   │  GET /result/:code?phase=…  (or /ipsr/:code)
   ▼
[PRMS server]  (onecgiar-pr-server/src/api/platform-report/)
   │  • builds JSON via stored DB procedure (bakes {{FRONT_END_PDF_ENDPOINT}})
   │  • decides legacy vs P25 by portfolio acronym (P25 → new viewer engine)
   │  • picks templateName + paper size
   │  RabbitMQ  client.send('pdf.generateUrl', {data, templateName, paperWidth, paperHeight, bucketName, fileName, apiKey})
   ▼
[reports-microservice]  (EXTERNAL — the 'pdf.generateUrl' handler)
   │  (a) POST {{PDF_VIEWER_BASE_URL}}/api/data   (x-api-secret: {{API_SECRET}})  → { uuid }
   │  (b) build render URL: {{PDF_VIEWER_BASE_URL}}/{templateName}?uuid=…&paperWidth=…&paperHeight=…
   │  (c) POST {{GOTENBERG_URL}}/forms/chromium/convert/url  with that render URL
   ▼
[Gotenberg / headless Chrome]  navigates render URL ▼
   ▼
[alliance-ibd-pdf-viewer]  (THIS REPO)
   │  • GET /{template}?uuid=…  →  getItem(uuid) from DynamoDB  (one-shot: deleted after read)
   │  • renders <TemplateComponent data={json}/> as continuous HTML
   │  • client-side Paginator inserts page breaks + footers
   │  ▲ Gotenberg captures the settled page → PDF binary
   ▼
[reports-microservice]  • upload PDF → S3 {{AWS_BUCKET_NAME}}/{fileName}  • reply { data: { url } }  • Slack notify
   ▼
[PRMS server] → returns { pdf: url, fileName } → [PRMS client]
```

**Split of responsibility:**

| Concern | Owner |
|---|---|
| Build/route JSON, choose template, transport over RMQ | PRMS server (external) |
| POST data, build render URL, call Gotenberg, upload S3, Slack | `reports-microservice` (external) |
| Store JSON by UUID, render React template → HTML, paginate | **This repo** |

**Tech stack (this repo):** Next.js App Router (standalone output), React templates, Tailwind CSS v4, DynamoDB (AWS SDK v3), deployed as a Next.js standalone server on **AWS Lambda** (or Docker/ECR fallback).

> **Note:** the live `pdf.generateUrl` / Gotenberg handler was not on disk during the review (the microservice checkout was on a legacy branch). Steps (a)–(c) are reconstructed from the **producer contract** (what PRMS sends) + the **viewer contract** (what this repo accepts). Pull `reports-microservice` `main`/production for the live handler.

---

## 2. PDF generation flow

### 2.1 Request lifecycle

1. **PRMS server emits** a RabbitMQ `pdf.generateUrl` message — never builds viewer URLs or calls Gotenberg itself.
2. **Microservice POSTs to `/api/data`** on this viewer → stores JSON in DynamoDB → gets `{ uuid }`.
3. **Microservice builds the render URL** `{{PDF_VIEWER_BASE_URL}}/{templateName}?uuid=…` and calls Gotenberg with it.
4. **This viewer renders** `GET /{template}?uuid=…` → HTML (`app/[template]/page.tsx`).
5. **Gotenberg captures** the settled page (client Paginator runs first) → PDF.
6. **Microservice uploads** to S3 and **notifies Slack**; replies `{ data: { url } }`.

### 2.2 `GET /{template}` query params

| Param | Effect |
|---|---|
| `uuid` | Key to fetch stored JSON. **One-shot** — item deleted after render unless `test=true`. |
| `demo` | `=true` loads the template's demo JSON, ignores `uuid`. |
| `test` | `=true` skips the post-render delete (keeps the record for debugging). |
| `paperWidth` | Outer container width in px. Default `600`, clamped `[100, 5000]`. |
| `paperHeight` | Page height in px. **Required to activate pagination.** |
| `noPaginate` | `=true` disables the paginator even when `paperHeight` is set. |
| `debug` | `=true` draws red CUT lines, orange FOOTER ZONE, green CONTENT START markers. |

### 2.3 Gotenberg invocation (EXTERNAL — not in this repo)

- **Endpoint:** `POST {{GOTENBERG_URL}}/forms/chromium/convert/url` (render URL + `paperWidth`/`paperHeight` + four margins).
- **Microservice defaults:** `paperWidth=600px`, `paperHeight=1000px`, all margins `0`, print background `true`.
- Margins `0` means the **client Paginator is the intended page engine**; Gotenberg does not paginate/footer itself.
- Verified: **zero** Gotenberg/`convert/url`/`chromium` calls anywhere in this repo.

### 2.4 Pagination engine (`app/templates/reportingtool/shared/components/paginator.tsx`)

`"use client"` component; runs in headless Chrome **after render, 500ms delay**, only if `paperHeight` is set and `noPaginate !== true`.

- **`collectBlocks`** — walks the DOM classifying "content blocks": `data-paginator-block` → atomic; leaf → atomic; plain wrapper (div/section/article, no bg/border/shadow) → recurse; styled/semantic (bg/border/shadow/table/heading) → atomic.
- **`processPass`** — for each block crossing the safe zone (page bottom − footerHeight − marginBottom): **tables** split at the first overflowing row (continuation has no repeated thead); **other blocks** get a spacer pushing them to the next page; **orphan detection** pushes a small preceding heading along.
- **Multi-pass** — up to **10 passes** until no DOM changes.
- **Footer + final padding** — absolute footers ("CGIAR Results Framework" + "Page X of Y"); pads document to an exact multiple of `paperHeight`.
- **`DEFAULT_CONFIG`**: `footerHeight: 40`, `marginTop: 30`, `marginBottom: 10`, `firstPage.marginTop: 0`. Override per template via the `config` prop.

> ⚠️ **Double-pagination risk:** the client Paginator already cuts/pads/footers. If Gotenberg ALSO injects margins + a native footer, you get double pagination. Keep Gotenberg margins `0` and pick ONE footer mechanism (client Paginator OR the `/{template}/footer` route).

---

## 3. DynamoDB storage

All DB code lives in **`lib/dynamo.ts`**, consumed by three API routes (`data`, `list`, `delete`) plus the render page (`getItem`).

### 3.1 Schema (the app never creates the table)

| Attribute | Type | Role |
|---|---|---|
| `id` | String | **Partition key** = the generated UUID. No sort key. |
| `json` | String | The original POSTed payload, `JSON.stringify`'d into a single attribute. |

- The whole payload is stringified into `json` (not nested attributes) — avoids marshalling issues with arbitrary/deep JSON; reads are a trivial `JSON.parse`.
- **No TTL / expiry.** Items persist until explicitly deleted. The only cleanup is the **one-shot delete on render** and the admin `/api/delete` route.
- **UUID format:** `{base36-timestamp}-{8 hex}` (not a standard RFC v4 UUID).

### 3.2 Client, region, credentials

- **Singleton client** persists across HMR; cached on global only in non-production.
- **`removeUndefinedValues: true`** on marshalling — DynamoDB rejects `undefined`; lets arbitrary JSON store safely.
- **Region:** `AWS_REGION` → `AWS_DEFAULT_REGION` → `us-east-1`.
- **Credentials:** Lambda (any of `AWS_LAMBDA_FUNCTION_NAME`/`LAMBDA_TASK_ROOT`/`_HANDLER`) → IAM role, no explicit creds. Local only → `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` (both required).
- **Table name:** `DYNAMODB_TABLE_NAME`, **throws `Missing env: DYNAMODB_TABLE_NAME`** if absent.

### 3.3 Save / read logic

| Op | Function | Command | Notes |
|---|---|---|---|
| **Save** | `putItem(uuid, data)` | `PutCommand` `{ id, json: JSON.stringify(data) }` | Overwrites if `id` exists. |
| **Read** | `getItem(uuid)` | `GetCommand` `Key: { id }` | Returns `null` if missing; else `JSON.parse`. Called by the render page. |
| **Scan** | `scanAll()` | `ScanCommand` paginated | ⚠️ Full-table scan; cost grows with size. Admin only. |
| **Delete** | `deleteItem(uuid)` | `DeleteCommand` `Key: { id }` | Idempotent. |

### 3.4 API routes & auth

| Route | Auth header | Behavior |
|---|---|---|
| `POST /api/data` | `x-api-secret`=`{{API_SECRET}}` **OR** `x-admin-secret`=`{{ADMIN_SECRET}}`, constant-time (`timingSafeEqual`) | Parse JSON (400 on bad), generate UUID + put, returns `{ uuid }` **201**. Missing/invalid secret → **401**. |
| `GET /api/list` | `x-admin-secret` only | `scanAll()` → `{ items, count }`. |
| `POST /api/delete` | `x-admin-secret` only | Requires `body.id`, deletes, returns `{ deleted: id }`. |

> **Read is unauthenticated:** `GET /{template}?uuid=…` requires no secret. What protects it is the **single-use UUID** (deleted after first render unless `?test=true`). This is why the public docs site is safe — it never exposes `{{API_SECRET}}`.
>
> **IAM:** the Lambda execution role must grant `dynamodb:PutItem`, `GetItem`, `Scan`, `DeleteItem` on `{{DYNAMO_TABLE}}`.

---

## 4. Template system — fixed contract vs what you can change

> Two independent walkers must agree on naming: the discovery walker (`app/api/templates/route.ts`) and the route loader (`app/[template]/page.tsx`).

### 4.1 ✅ NON-CHANGEABLE base structure (fixed contract)

- **`TemplateProps` shape** — exactly `{ data: unknown }` (`app/templates/index.ts`). The loader passes exactly one `data` prop.
- **Default-export a React component** — the loader reads `mod.default` ONLY. A named export is invisible; an undefined default crashes on render.
- **`data` is `unknown` on purpose** — cast it (`const d = data as MyData | null`) and treat every field as untrusted.
- **Entry-point naming** — folder-based MUST be `template.tsx` (name = folder name); file-based MUST be a bare `.tsx` (name = filename). Excluded: `index.tsx`, `components.tsx`.
- **`shared/` is reserved** — never discovered as a template; only imported as a dependency.
- **Next.js reserved names forbidden in `app/`** — never name a file `layout.tsx`, `page.tsx`, `loading.tsx`, etc. (the layout wrapper is `page-shell.tsx` for this reason).
- **Demo filename convention** — `{name}.demo.json` (file) / `template.demo.json` (folder).
- **Flow layout only** — no absolute positioning of content; the paginator measures `getBoundingClientRect()` and inserts spacers.
- **`paperWidth`/`paperHeight` semantics** — width set by the route, height read by the Paginator. Don't reinterpret.
- **Reserved paginator attributes** — don't repurpose `data-paginator-block`, `data-paginator-spacer`, `data-paginator-footer`, `data-sidebar-strip`.
- **Defensive-coding mandate** — tolerate null/missing/wrong-typed fields; no non-null assertions.
- **Single-use UUID side effect** — record deleted on read unless `?test=true`.

### 4.2 🟢 What you CAN change

- All visual markup, Tailwind classes, brand styling, fonts.
- The TypeScript interface for your own `data` shape.
- Whether to paginate — single-page templates can skip `<Paginator>` and hard-code a footer.
- Folder-based internal structure — `types.ts`, `transform.ts`, `components/`: names/organization are yours. Only `template.tsx` is fixed.
- Paginator config overrides per template (`footerHeight`, `marginTop`, `marginBottom`, `firstPage.marginTop`).
- Where you place `data-paginator-block`.
- Variant logic (e.g. switching on `rt_id` is a `results_p25` choice, not a system requirement).
- Shared helpers and static assets (`public/assets/{project}/`).

### 4.3 Auto-discovery rules

- Folder-based = directory containing `template.tsx`; name = folder name. Other `.tsx` siblings in that folder are NOT discovered.
- File-based = bare `*.tsx`; name = filename.
- `shared/` dir skipped entirely; `index.tsx`/`components.tsx` excluded.
- Output sorted alphabetically.

### 4.4 Demo mode

Activated by `?demo=true`. Resolution: file-based `{name}.demo.json` next to the `.tsx`; folder-based `{folder}/template.demo.json`. No JSON → "No demo data available" card.

---

## 5. How to create a new template

### 5.1 Simple (file-based)

1. Create `app/templates/{project}/{name}.tsx`.
2. Import `TemplateProps` from the templates index (adjust `../` depth).
3. Define a TypeScript interface for your JSON; cast `data` to `YourType | null` at entry.
4. **Default-export** a React component that renders the data defensively.
5. Optionally create `{name}.demo.json`; test at `/{name}?demo=true`.

Examples: `app/templates/starter/initial.tsx`, `app/templates/aiccra/keko/summary.tsx`.

### 5.2 Complex (folder-based)

1. Create `app/templates/{project}/{name}/template.tsx` (discovered as `{name}`).
2. Add `types.ts` (interfaces) and `transform.ts` (sanitize/parse — the safety gate).
3. Add a `components/` folder (a layout wrapper named `page-shell.tsx`, **never** `layout.tsx`).
4. To get auto page-breaks + footers, render your body inside `<Paginator>`; optionally override `config`.
5. Optionally create `template.demo.json`; test at `/{name}?demo=true`.

Reference: `app/templates/reportingtool/results_p25/`.

### 5.3 Verify

- `GET /api/templates` lists your template.
- `/{name}?demo=true` renders the demo.
- For multi-page, add `?paperHeight=1000&debug=true` to inspect cut lines, then refine `data-paginator-block` placement.

---

## 6. How to wire a new backend connection

### 6.1 `POST /api/data` contract

- **Method/URL:** `POST {{PDF_VIEWER_BASE_URL}}/api/data`
- **Auth header:** `x-api-secret: {{API_SECRET}}` (external) **or** `x-admin-secret: {{ADMIN_SECRET}}` (admin). Constant-time compared.
- **Body:** arbitrary JSON (your template's `data` shape).
- **Response:** `201 { uuid }`. Bad JSON → 400; missing/invalid secret → 401; server error → 500.
- **Next step (caller's job):** build `{{PDF_VIEWER_BASE_URL}}/{templateName}?uuid={uuid}&paperWidth=…&paperHeight=…` and hand it to Gotenberg (or open it for HTML preview).

> The UUID is **single-use**: the render deletes it after first read unless `?test=true`. A backend that needs to re-render must POST again for a fresh UUID.

### 6.2 How the PRMS backend produces the payload

`onecgiar-pr-server/src/api/platform-report/`:

1. **HTTP entry:** `GET /result/:code?phase=…` and `GET /ipsr/:code?phase=…`.
2. **Payload built by a stored DB procedure** — bakes `{{FRONT_END_PDF_ENDPOINT}}` into the JSON.
3. **Legacy vs P25 routing** — portfolio acronym `P25` → new React/Gotenberg viewer; older → legacy Handlebars path.
4. **Template selection (P25):** IPSR types → `ipsr_p25`; bilateral source (acronym ≠ `SGP-02`) → `results_bilaterals_p25`; else → `results_p25`. All use `paperWidth: '600px'`, `paperHeight: '1000px'`.

### 6.3 Transport = RabbitMQ

PRMS does NOT call `/api/data` itself. It registers an RMQ client (`urls: [{{RABBITMQ_URL}}]`, `queue: {{REPORT_QUEUE}}`, `durable: true`).

- **P25 — request/response:** `client.send('pdf.generateUrl', payload)` awaited. Payload: `{ data, paperWidth, paperHeight, templateName, bucketName, fileName, apiKey }` where `apiKey = {{MICROSERVICE_API_KEY}}` (= `{{API_SECRET}}`), `bucketName = {{AWS_BUCKET_NAME}}`. Response `{ data: { url } }` → returns `{ pdf: url, fileName }`.
- **Legacy — fire-and-forget + poll:** `client.emit('pdf.generate', …)` then polls S3.

### 6.4 To wire a brand-new backend (minimal recipe)

1. Build your JSON to match a template's expected `data` shape.
2. `POST {{PDF_VIEWER_BASE_URL}}/api/data` with `x-api-secret: {{API_SECRET}}` → grab `uuid`.
3. Build `{{PDF_VIEWER_BASE_URL}}/{template}?uuid=…&paperWidth=…&paperHeight=…`.
4. Either open it (HTML preview) or feed it to your own Gotenberg call.
5. Add `?test=true` while developing so the record survives re-renders.

---

## 7. Install & deploy

### 7.1 Env vars

| Variable | Required? | Notes |
|---|---|---|
| `DYNAMODB_TABLE_NAME` (`{{DYNAMO_TABLE}}`) | **Always** | Throws if missing. |
| `API_SECRET` (`{{API_SECRET}}`) | **Always** | External `POST /api/data`. Must match the microservice. |
| `ADMIN_SECRET` (`{{ADMIN_SECRET}}`) | **Always** | Admin UI / list / delete. |
| `AWS_REGION` (`{{AWS_REGION}}`) | Recommended | Or `AWS_DEFAULT_REGION`; falls back to `us-east-1`. Auto-set in Lambda. |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | **Local dev only** | Omit in Lambda — IAM role is used. Both required together. |

> Gotenberg/microservice vars (`{{GOTENBERG_URL}}`, `{{PDF_VIEWER_BASE_URL}}`, `{{RABBITMQ_URL}}`, `{{REPORT_QUEUE}}`, `{{AWS_BUCKET_NAME}}`) live in the **external** `reports-microservice`, NOT here.

### 7.2 AWS / DynamoDB

- Create a DynamoDB table with partition key **`id` (String)**, no sort key. Name it whatever you set in `{{DYNAMO_TABLE}}`.
- No TTL required by the code; add one yourself if you want ephemeral cleanup.
- Lambda execution role must grant `dynamodb:PutItem`, `GetItem`, `Scan`, `DeleteItem`.

### 7.3 Gotenberg dependency

- **Not part of this repo.** Stand up Gotenberg separately (or use the `reports-microservice` deployment).
- Configure the microservice with `{{PDF_VIEWER_BASE_URL}}`, `{{GOTENBERG_URL}}`, and a matching `{{API_SECRET}}`.

### 7.4 Lambda deploy (primary)

- `next.config.ts` → `output: 'standalone'` (minimal Lambda bundle).
- `lambda/handler.mjs` is a hand-rolled adapter that intercepts Next.js's internal HTTP server and drives it from a Lambda Function URL / API Gateway event.
- Binary responses (`application/pdf`, `image/*`, `font/*`, `application/octet-stream`) are base64-encoded.
- Static files (`/_next/static/*`, `/public/*`) served directly before Next.js. 29-second internal request timeout.
- `scripts/package-lambda.mjs` builds `lambda-package/`, warns at >50MB / >250MB limits.

### 7.5 Docker / ECR (fallback)

- `Dockerfile` uses `public.ecr.aws/lambda/nodejs:20`, copies standalone + static + public + handler, `CMD ["handler.handler"]`.

### 7.6 Local dev

- `lambda/local-server.mjs` feeds fake Lambda events to the handler on port 3000.
- Set `AWS_REGION` + `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` + `DYNAMODB_TABLE_NAME` + `API_SECRET` + `ADMIN_SECRET` locally.
- **Admin/debug surface:** `app/admin/page.tsx` POSTs to `/api/data` with `x-admin-secret`, then opens `/{template}?uuid=…` — the manual equivalent of the microservice flow, minus Gotenberg.

---

## 8. Gotchas & rules

1. **Next.js reserved filenames** — never name a component file `layout.tsx`/`page.tsx`/`loading.tsx` inside `app/`. The template layout wrapper is `page-shell.tsx`.
2. **Entry-point discipline** — folder-based templates use `template.tsx` only; other `.tsx` siblings are not discovered. `index.tsx`/`components.tsx` excluded; `shared/` is never a template.
3. **Single-use UUID** — the render deletes the record after first read unless `?test=true`.
4. **Flow layout only** — never absolute-position content; it breaks paginator measurement.
5. **`data-paginator-block` — USE** for 2D layouts (grid/flex-row), heading+table pairs, any group that must stay together.
6. **`data-paginator-block` — DON'T USE** on a block containing a very long table (atomic blocks are never split; only bare `<table>` gets row-level splitting).
7. **Double pagination risk** — keep Gotenberg margins `0` and pick ONE footer mechanism.
8. **Defensive coding (non-negotiable)** — `data` is `unknown`; cast to `| null`, sanitize in `transform.ts`, still use `?.`/`?? []` in components. Never non-null assert. Test with partial data.
9. **No TTL on DynamoDB** — the table grows indefinitely; only the one-shot render delete + `/api/delete` clean up. The admin `Scan` reads every item.
10. **Doc drift** — the paginator/transform/types live under `app/templates/reportingtool/shared/`. PDF generation (Gotenberg) is **external**; this repo only emits HTML and stores JSON.

---

## Key file map

- `app/api/data/route.ts` — store JSON, return uuid (auth-gated)
- `app/api/list/route.ts` — admin scan · `app/api/delete/route.ts` — admin delete
- `app/api/templates/route.ts` — auto-discovery list
- `app/[template]/page.tsx` — render HTML, fetch + one-shot delete
- `app/[template]/footer/route.tsx` — Gotenberg-native HTML footer (alternative)
- `app/templates/index.ts` — `TemplateProps` contract
- `app/templates/reportingtool/shared/components/paginator.tsx` — client pagination engine
- `app/templates/reportingtool/shared/transform.ts` — data safety gate
- `app/templates/reportingtool/results_p25/template.tsx` — folder-based example
- `app/templates/starter/initial.tsx` — file-based example
- `app/templates/aiccra/keko/summary.tsx` — single-page (no paginator) example
- `lib/dynamo.ts` — DynamoDB CRUD + UUID gen
- `lambda/handler.mjs` — Lambda↔Next.js adapter · `lambda/local-server.mjs` — local runner
- `scripts/package-lambda.mjs` — ZIP packager · `next.config.ts` — standalone output · `Dockerfile` — ECR deploy

**External (not in this repo):** `reports-microservice` (the `pdf.generateUrl` Gotenberg handler) + PRMS server `platform-report.*`.
