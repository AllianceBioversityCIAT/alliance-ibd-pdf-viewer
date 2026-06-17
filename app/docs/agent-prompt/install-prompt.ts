/**
 * A thorough, copy-paste prompt for ANY AI coding agent (Claude, Codex, Gemini, etc.)
 * to guide a developer through installing and operating THIS project — the CGIAR PDF Viewer.
 *
 * Every secret/URL/table/host is masked as a {{variable}} placeholder. The agent is
 * explicitly instructed to ASK the user for the real value of each placeholder rather than
 * guessing. Keep this file string-only (no JSX, no imports) so it can be embedded, copied,
 * or downloaded as plain text / markdown.
 */
export const INSTALL_PROMPT = `# Agent install & operations prompt — CGIAR PDF Viewer

You are an AI coding agent helping a developer install, run, and operate the
**alliance-ibd-pdf-viewer** project. Follow this prompt exactly. Where you see a
\`{{variable}}\` placeholder, it is a SECRET, URL, table name, or host that you do NOT know.
**Never invent or guess these values.** Before any step that needs one, STOP and ask the
developer for the real value, then substitute it locally. Never print real secrets back to
the developer in plain text beyond confirming a variable was set.

---

## 1. What this project is (and is NOT)

This repo is the **PDF *Viewer*** — not a full PDF *generator*.

It only does two things:
1. **Stores arbitrary JSON** in DynamoDB keyed by a generated UUID (\`POST /api/data\`).
2. **Renders React \`.tsx\` templates to continuous HTML** (\`GET /{template}?uuid=…\`).

It does **NOT** call Gotenberg, Puppeteer, or any HTML→PDF engine. The actual PDF capture,
S3 upload, and Slack notification happen in a **separate external service**
(\`reports-microservice\`). Gotenberg (headless Chrome) lives there, at \`{{GOTENBERG_URL}}\`,
and is reached at \`POST {{GOTENBERG_URL}}/forms/chromium/convert/url\`.

**Tech stack:** Next.js (App Router, \`output: 'standalone'\`), React templates,
Tailwind CSS v4, DynamoDB via AWS SDK v3. Deploys as a Next.js standalone server on
**AWS Lambda** (Docker/ECR fallback).

**Split of responsibility — keep this straight:**
- This repo (fixed): store JSON by UUID, render React template → HTML, paginate client-side.
- Everything downstream is the consuming project's choice. As the first project's (PRMS)
  reference example: a \`reports-microservice\` POSTs data, builds the render URL, calls
  Gotenberg, uploads to S3, and notifies Slack; the PRMS server builds/routes JSON, chooses
  the template, and transports over RabbitMQ. A new project can swap any of that out (any
  PDF engine, any transport) — only the \`POST /api/data → uuid → render URL\` contract is fixed.

---

## 2. Required variables (ask the developer for each)

Ask for and confirm each of these before installing or running. Treat them as untrusted
until the developer supplies them.

This viewer's own env vars:
- \`{{DYNAMO_TABLE}}\` → env \`DYNAMODB_TABLE_NAME\`. **Always required.** The app THROWS
  (\`Missing env: DYNAMODB_TABLE_NAME\`) if absent.
- \`{{API_SECRET}}\` → env \`API_SECRET\`. **Always required.** Shared secret external
  consumers / the microservice send to \`POST /api/data\` (header \`x-api-secret\`). Must
  match the value configured in the microservice.
- \`{{ADMIN_SECRET}}\` → env \`ADMIN_SECRET\`. **Always required.** Secret for the admin UI /
  list / delete (header \`x-admin-secret\`). Also accepted on \`POST /api/data\`.
- \`{{AWS_REGION}}\` → env \`AWS_REGION\` (or \`AWS_DEFAULT_REGION\`). Recommended. Falls back
  to \`us-east-1\`. Auto-injected in Lambda.
- \`{{AWS_ACCESS_KEY_ID}}\` + \`{{AWS_SECRET_ACCESS_KEY}}\` → **local dev only.** Both
  required together locally. OMIT in Lambda — the IAM execution role is used instead.

External (live in the microservice / PRMS, NOT in this repo — only mention if wiring them):
- \`{{PDF_VIEWER_BASE_URL}}\` — base URL of this viewer deployment (configured in the microservice).
- \`{{GOTENBERG_URL}}\`, \`{{RABBITMQ_URL}}\`, \`{{REPORT_QUEUE}}\`, \`{{AWS_BUCKET_NAME}}\`,
  \`{{MICROSERVICE_API_KEY}}\` (equals \`{{API_SECRET}}\` on the viewer side),
  \`{{FRONT_END_PDF_ENDPOINT}}\`.

> Do not assume any of these. For each \`{{variable}}\` you reach, ask the developer for the
> real value. If they don't have one yet (e.g. \`{{DYNAMO_TABLE}}\`), help them create it
> first (see §6).

---

## 3. Install & run

1. Confirm prerequisites: Node.js (LTS), npm, and AWS credentials with access to a
   DynamoDB table for local dev.
2. Install dependencies: \`npm install\`.
3. Create a local \`.env\` and ask the developer for each value:
   - \`DYNAMODB_TABLE_NAME={{DYNAMO_TABLE}}\`
   - \`API_SECRET={{API_SECRET}}\`
   - \`ADMIN_SECRET={{ADMIN_SECRET}}\`
   - \`AWS_REGION={{AWS_REGION}}\`
   - \`AWS_ACCESS_KEY_ID={{AWS_ACCESS_KEY_ID}}\`
   - \`AWS_SECRET_ACCESS_KEY={{AWS_SECRET_ACCESS_KEY}}\`
4. Run locally. The local runner \`lambda/local-server.mjs\` feeds fake Lambda events to the
   handler on port 3000 (the same standalone handler used in production).
5. Verify the app is up: open \`/docs\`, and \`GET /api/templates\` should list templates.
6. **Admin/debug surface:** \`/admin\` POSTs to \`/api/data\` with \`x-admin-secret\`, then
   opens \`/{template}?uuid=…\` — the manual equivalent of the microservice flow, minus
   Gotenberg. Use it to smoke-test rendering.

---

## 4. Creating a new template

Templates are React components that receive a single \`data\` prop. Two formats.

### Fixed contract (NON-changeable — do not break these)
- \`TemplateProps\` is exactly \`{ data: unknown }\` (\`app/templates/index.ts\`). The loader
  passes exactly one \`data\` prop, and \`data\` is \`unknown\` ON PURPOSE — cast it
  (\`const d = data as MyData | null\`) and treat every field as untrusted.
- **Default-export** a React component — the loader reads \`mod.default\` ONLY. A named
  export is invisible; an undefined default crashes on render.
- **Entry-point naming:** folder-based MUST be \`template.tsx\` (template name = folder
  name); file-based MUST be a bare \`.tsx\` (name = filename). Excluded from discovery:
  \`index.tsx\`, \`components.tsx\`. The \`shared/\` directory is reserved and never discovered.
- **Next.js reserved filenames are forbidden** inside \`app/\` for components — never name a
  file \`layout.tsx\`, \`page.tsx\`, or \`loading.tsx\`. The layout wrapper is \`page-shell.tsx\`.
- **Flow layout only** — no absolute positioning of content; the client paginator measures
  bounding rects and inserts spacers.
- **\`paperWidth\`/\`paperHeight\` semantics** — width is set by the route, height is read by
  the Paginator. Don't reinterpret them.
- **Reserved paginator attributes** — don't repurpose \`data-paginator-block\`,
  \`data-paginator-spacer\`, \`data-paginator-footer\`, \`data-sidebar-strip\`.
- **Defensive coding is mandatory** — tolerate null / missing / wrong-typed fields; never
  use non-null assertions. Sanitize inputs in a transform layer; still use \`?.\` / \`?? []\`
  in components. Test with partial data, not just the full demo JSON.

### What you CAN change
All visual markup, Tailwind classes, brand styling, fonts; your own \`data\` interface;
whether to paginate; folder-based internal structure (\`types.ts\`, \`transform.ts\`,
\`components/\`); paginator config overrides; where you place \`data-paginator-block\`;
variant logic; shared helpers and static assets.

### Simple (file-based)
1. Create \`app/templates/{project}/{name}.tsx\`.
2. Import \`TemplateProps\` from the templates index (adjust the \`../\` depth).
3. Define a TypeScript interface for your JSON; cast \`data\` to \`YourType | null\` at entry.
4. **Default-export** a React component that renders the data defensively.
5. Optionally create \`{name}.demo.json\`; test at \`/{name}?demo=true\`.

### Complex (folder-based)
1. Create \`app/templates/{project}/{name}/template.tsx\` (discovered as \`{name}\`).
2. Add \`types.ts\` (interfaces) and \`transform.ts\` (sanitize/parse — the safety gate).
3. Add a \`components/\` folder (layout wrapper named \`page-shell.tsx\`, NEVER \`layout.tsx\`).
4. For auto page-breaks + footers, render your body inside \`<Paginator>\`; optionally
   override its \`config\`.
5. Optionally create \`template.demo.json\`; test at \`/{name}?demo=true\`.

### Verify
- \`GET /api/templates\` lists your template.
- \`/{name}?demo=true\` renders the demo.
- For multi-page, add \`?paperHeight=1000&debug=true\` to inspect cut lines, then refine
  \`data-paginator-block\` placement.

---

## 5. Wiring a backend to this viewer

The viewer's only ingress contract is \`POST /api/data\`.

- **Method/URL:** \`POST {{PDF_VIEWER_BASE_URL}}/api/data\`.
- **Auth header:** \`x-api-secret: {{API_SECRET}}\` (external) OR
  \`x-admin-secret: {{ADMIN_SECRET}}\` (admin). Constant-time compared.
- **Body:** arbitrary JSON matching your template's \`data\` shape.
- **Response:** \`201 { uuid }\`. Bad JSON → 400; missing/invalid secret → 401; server
  error → 500.
- **Next step (caller's job):** build
  \`{{PDF_VIEWER_BASE_URL}}/{templateName}?uuid={uuid}&paperWidth=…&paperHeight=…\` and hand
  it to your PDF engine of choice (Gotenberg, Puppeteer, Playwright, any headless-Chrome /
  print service) — or open it for an HTML preview.

Minimal recipe for a brand-new backend:
1. Build your JSON to match a template's expected \`data\` shape.
2. \`POST {{PDF_VIEWER_BASE_URL}}/api/data\` with \`x-api-secret: {{API_SECRET}}\` → grab \`uuid\`.
3. Build \`{{PDF_VIEWER_BASE_URL}}/{template}?uuid=…&paperWidth=…&paperHeight=…\`.
4. Either open it (HTML preview) or feed it to your PDF engine of choice.
5. Add \`?test=true\` while developing so the record survives re-renders.

> This contract (POST data → uuid → render URL) is the ONLY thing the viewer requires. How
> the JSON is produced and how the HTML becomes a PDF is the consuming project's choice.
>
> As ONE reference example, the first project (PRMS) does not call the viewer directly: PRMS
> emits a RabbitMQ \`pdf.generateUrl\` message (\`urls: [{{RABBITMQ_URL}}]\`,
> \`queue: {{REPORT_QUEUE}}\`); a separate \`reports-microservice\` is what POSTs to
> \`/api/data\` and calls Gotenberg. A new project can replace that whole downstream with its
> own transport and PDF engine.

---

## 6. AWS / DynamoDB setup

- Create a DynamoDB table with partition key **\`id\` (String)**, no sort key. Name it
  whatever you set in \`{{DYNAMO_TABLE}}\`. (Ask the developer for the real name.)
- Schema is just two attributes: \`id\` (String, the UUID) and \`json\` (String, the whole
  payload \`JSON.stringify\`'d). The app NEVER creates the table.
- **No TTL** is required by the code — the table grows until items are deleted. Cleanup is
  the one-shot delete on render plus the admin \`/api/delete\` route. Add a TTL yourself if
  you want ephemeral cleanup.
- The Lambda execution role must grant \`dynamodb:PutItem\`, \`GetItem\`, \`Scan\`,
  \`DeleteItem\` on \`{{DYNAMO_TABLE}}\`.

---

## 7. Deploy

- **Lambda (primary):** \`next.config.ts\` uses \`output: 'standalone'\`. \`lambda/handler.mjs\`
  is a hand-rolled adapter driving Next.js's internal HTTP server from a Lambda Function URL
  / API Gateway event. Binary responses (pdf, image, font, octet-stream) are base64-encoded;
  static files are served directly; 29-second internal request timeout.
  \`scripts/package-lambda.mjs\` builds \`lambda-package/\` and warns at >50MB / >250MB.
- **Docker / ECR (fallback):** \`Dockerfile\` uses \`public.ecr.aws/lambda/nodejs:20\`, copies
  the standalone build + static + public + handler, \`CMD ["handler.handler"]\`.
- **Gotenberg dependency:** not part of this repo. Stand up Gotenberg separately (or use the
  \`reports-microservice\` deployment) and configure the microservice with
  \`{{PDF_VIEWER_BASE_URL}}\`, \`{{GOTENBERG_URL}}\`, and a matching \`{{API_SECRET}}\`.

---

## 8. Key gotchas (do not skip)

1. **Single-use UUID:** \`GET /{template}?uuid=…\` deletes the record after first read unless
   \`?test=true\`. A backend that re-renders must POST again for a fresh UUID.
2. **Read is unauthenticated** — what protects it is the single-use UUID, not a secret. So
   never print \`{{API_SECRET}}\` into any rendered page or public surface.
3. **Next.js reserved filenames** — never name a component file \`layout.tsx\` /
   \`page.tsx\` / \`loading.tsx\` inside \`app/\`.
4. **Flow layout only** — absolute-positioned content breaks paginator measurement.
5. **\`data-paginator-block\`** — USE it for 2D layouts (grid / flex-row), heading+table
   pairs, and groups that must stay together. DON'T use it on a block containing a very long
   table — atomic blocks are never split; only a bare \`<table>\` gets row-level splitting.
6. **Double-pagination risk** — the client Paginator already cuts/pads/footers. Keep
   Gotenberg margins \`0\` and pick ONE footer mechanism (client Paginator OR the
   \`/{template}/footer\` route).
7. **Defensive coding is non-negotiable** — \`data\` is \`unknown\`; cast to \`| null\`,
   sanitize in \`transform.ts\`, still use \`?.\` / \`?? []\` in components. Never non-null
   assert. Test with partial data.
8. **No TTL on DynamoDB** — the table grows indefinitely; the admin \`Scan\` reads every
   item, so its cost grows with table size.

---

## 9. Your operating rules as the agent

- For every \`{{variable}}\` you encounter, ASK the developer for the real value — never
  guess, never fabricate a URL/secret/table name/host.
- Never echo a real secret back in plain text; confirm it was set without reprinting it.
- Prefer minimal, incremental changes. Investigate existing templates and the fixed contract
  before modifying anything.
- When unsure whether something belongs in this viewer or in the external microservice / PRMS
  server, default to: storage + HTML render = this repo; Gotenberg / S3 / Slack / RabbitMQ =
  external.
`;

export default INSTALL_PROMPT;
