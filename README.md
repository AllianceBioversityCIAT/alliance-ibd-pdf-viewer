# CGIAR PDF Generator — Tutorial

Next.js (App Router) service that **renders HTML templates** so **Gotenberg** (headless Chromium) can capture them as PDFs. Templates are React `.tsx` components that receive a `data` prop.

This README is a hands-on tutorial in two parts:

1. **How and where to create templates** (in this repo).
2. **How a backend generates a PDF using Gotenberg** — with the **reporting** backend (`onecgiar-pr-server`) as the live example, and a step-by-step guide for the **START** backend (`alliance-research-indicators`) to do the same.

> For advanced authoring rules (pagination engine, defensive coding, brand tokens) see [`CLAUDE.md`](./CLAUDE.md). This README covers the public contract and the end-to-end flow.

---

## 0. Big picture in one diagram

```
┌────────────────────┐  1. RabbitMQ msg                ┌──────────────────────┐
│  Consumer backend  │  pdf.generateUrl                │  reports-microservice│
│  (reporting,       │ ──────────────────────────────► │   (orchestrator)     │
│   START, ...)      │ ◄────── { data: { url } } ───── │                      │
└────────────────────┘                                 │  - validates CLARISA │
                                                       │  - calls the viewer  │
                                                       │  - calls Gotenberg   │
                                                       │  - uploads to S3     │
                                                       └──────────────────────┘
                                                          │              │
                                              2. POST     │              │ 3. POST URL
                                              /api/data   ▼              ▼
                                                   ┌──────────┐   ┌────────────┐
                                                   │ PDF Viewer│  │  Gotenberg │
                                                   │ (Next.js) │◄─│ (headless  │
                                                   │           │  │  Chromium) │
                                                   │ - stores  │  │            │
                                                   │   data    │  │ - navigates│
                                                   │   by uuid │  │   viewer   │
                                                   │ - renders │  │ - captures │
                                                   │   /{tpl}  │  │   as PDF   │
                                                   └──────────┘   └────────────┘
                                                                       │ 4. PDF binary
                                                                       ▼
                                                                  ┌──────────┐
                                                                  │   S3     │
                                                                  └──────────┘
```

**The consumer backend never talks directly to the viewer or to Gotenberg.** It just sends a message to `reports-microservice` saying *which template* to use and *what data* to render. Everything else is transparent.

---

# Part 1 — Tutorial: how to create a template

Every template is a folder or a single `.tsx` file inside `app/templates/{project}/...`. The viewer discovers them automatically — **there is no manual registry**.

## 1.1 Pick the template type

| Type | When to use it | Structure |
|---|---|---|
| **File-based** | Simple templates, single-page, no shared components. | `app/templates/{project}/{name}.tsx` |
| **Folder-based** | Complex templates with shared components, types, and data transforms. | `app/templates/{project}/{name}/template.tsx` + `types.ts`, `transform.ts`, `components/` |

> **Tip:** when in doubt, go folder-based. It's easier to add pieces later.

## 1.2 Step by step — **file-based** template

### Step 1. Create the file

`app/templates/start/result-summary.tsx`

```tsx
import type { TemplateProps } from "@/app/templates";

// 1. Define the JSON shape your backend will send
interface ResultSummaryData {
  result_name: string;
  phase_name: string;
  indicators: Array<{ id: number; name: string; value: number }>;
}

// 2. Export the component as default
export default function ResultSummary({ data }: TemplateProps) {
  const d = data as ResultSummaryData;

  return (
    <div style={{ fontFamily: "'Noto Sans', Arial, sans-serif", padding: 24 }}>
      <h1>{d.result_name ?? "Untitled result"}</h1>
      <p>Phase: {d.phase_name ?? "—"}</p>

      {/* Defensive: never assume an array exists */}
      {!!d.indicators?.length && (
        <table>
          <thead>
            <tr><th>Indicator</th><th>Value</th></tr>
          </thead>
          <tbody>
            {d.indicators.map(i => (
              <tr key={i.id}>
                <td>{i.name ?? "—"}</td>
                <td>{i.value ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

### Step 2. (Optional) Create a demo JSON

`app/templates/start/result-summary.demo.json`

```json
{
  "result_name": "Demo result for START",
  "phase_name": "Phase 1",
  "indicators": [
    { "id": 1, "name": "Adoption rate", "value": 42 },
    { "id": 2, "name": "Coverage",      "value": 71 }
  ]
}
```

### Step 3. Verify in the browser

```bash
npm run dev
# Open: http://localhost:3000/result-summary?demo=true
```

If it renders correctly, the template is **already available** as `result-summary` for any consumer backend. It will show up automatically in `GET /api/templates`.

## 1.3 Step by step — **folder-based** template

### Step 1. Create the template folder

```
app/templates/start/results_summary_v2/
├── template.tsx              ← entry point (discovered as "results_summary_v2")
├── types.ts                  ← TypeScript interfaces
├── transform.ts              ← parsers / sanitizers for raw data
├── template.demo.json        ← test data for ?demo=true
└── components/
    ├── header.tsx
    └── indicator-table.tsx
```

### Step 2. Define types in `types.ts`

```ts
export interface RawResultData {
  result_name?: string;
  phase_name?: string;
  indicators?: unknown;       // may arrive in unexpected shapes from the backend
}

export interface DisplayResult {
  resultName: string;
  phaseName: string;
  indicators: Array<{ id: number; name: string; value: number }>;
}
```

### Step 3. Sanitize in `transform.ts`

```ts
import type { RawResultData, DisplayResult } from "./types";

function toArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (val == null) return [];
  return [val as T];
}

export function transformResult(raw: RawResultData): DisplayResult {
  return {
    resultName: raw.result_name ?? "Untitled",
    phaseName: raw.phase_name ?? "—",
    indicators: toArray<any>(raw.indicators).map((i, idx) => ({
      id: typeof i?.id === "number" ? i.id : idx,
      name: String(i?.name ?? "—"),
      value: Number(i?.value ?? 0),
    })),
  };
}
```

### Step 4. Compose in `template.tsx`

```tsx
import type { TemplateProps } from "@/app/templates";
import { transformResult } from "./transform";
import type { RawResultData } from "./types";
import { Header } from "./components/header";
import { IndicatorTable } from "./components/indicator-table";

export default function ResultsSummaryV2({ data }: TemplateProps) {
  const view = transformResult(data as RawResultData);

  return (
    <div style={{ fontFamily: "'Noto Sans', Arial, sans-serif" }}>
      <Header title={view.resultName} subtitle={view.phaseName} />

      {/* data-paginator-block: this block must stay together when pages are cut */}
      <div data-paginator-block>
        <h2>Indicators</h2>
        <IndicatorTable rows={view.indicators} />
      </div>
    </div>
  );
}
```

### Step 5. Demo JSON

`template.demo.json`

```json
{
  "result_name": "START — Q1 results",
  "phase_name": "2026 Phase 1",
  "indicators": [
    { "id": 1, "name": "Reach",    "value": 120 },
    { "id": 2, "name": "Coverage", "value": 80 }
  ]
}
```

### Step 6. Verify

```
http://localhost:3000/results_summary_v2?demo=true
http://localhost:3000/results_summary_v2?demo=true&paperHeight=1000&debug=true
```

## 1.4 Mandatory template rules

| Rule | Why |
|---|---|
| **Flow layout** (flexbox / block). Never `position: absolute` that locks content to a fixed height. | Content must be free to grow across pages. |
| **All text and URLs must come from the `data` prop.** | Templates are data-driven; never hardcode copy. |
| **Use `?.` and `?? []` everywhere. Never `!` (non-null assertion).** | Real JSON can have `null`, missing, or wrongly typed fields. The template must not crash. |
| **`transform.ts` is the first defense.** | Sanitize inputs there; components use defensive coding as the second defense. |
| **`data-paginator-block`** on indivisible groups (grids, heading + table pairs, cards). | The paginator will not split these blocks across pages. |
| **No Next.js reserved names** (`layout.tsx`, `page.tsx`, `loading.tsx`) inside `app/`. | Next will treat them as route files. |

## 1.5 How a new template becomes "published"

1. Merge and deploy the viewer.
2. Confirm it appears in `GET /api/templates`.
3. **Done.** Any consumer backend can now reference it by `templateName`. Nothing else to touch.

---

# Part 2 — Tutorial: how a backend generates a PDF

The backend never touches the viewer or Gotenberg directly. It talks to a microservice called **`reports-microservice`** (`one-cgiar-microservices/reports-microservice`, branch `001-gotenberg-url-pdf`) that orchestrates the whole pipeline.

## 2.1 What does `reports-microservice` do?

It exposes a RabbitMQ message pattern called **`pdf.generateUrl`**. When it receives one:

1. Takes the `data` from the payload and POSTs it to `{viewer}/api/data` with the `x-api-secret` header. The viewer stores the data in DynamoDB and returns an object (typically `{ uuid: "..." }`).
2. Builds the viewer URL: `{viewer}/{templateName}?{viewer-response-as-query-params}` → e.g. `https://viewer-host/results_p25?uuid=8f0b5a72-...`
3. Calls Gotenberg (`{gotenberg}/forms/chromium/convert/url`) with that URL + `paperWidth` + `paperHeight` + margins.
4. Gotenberg navigates the URL, waits for the render to settle, and captures the PDF.
5. The microservice uploads the PDF to **S3** and answers back to the consumer with `{ data: { url: "https://bucket.s3.amazonaws.com/file.pdf" } }`.
6. Notifies success or failure via Slack.

## 2.2 Real example: how the **reporting** backend uses it

File: `onecgiar-pr-server/src/api/platform-report/`.

### A. Register the RabbitMQ client in the module

```ts
// platform-report.module.ts
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'REPORT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [env.RABBITMQ_URL],
          queue: env.REPORT_QUEUE,         // queue shared with the microservice
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [PlatformReportController],
  providers: [PlatformReportService /* ... */],
})
export class PlatformReportModule {}
```

### B. Connect on bootstrap and send the message

```ts
// platform-report.service.ts (P25 flow excerpt)
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PlatformReportService implements OnModuleInit {

  // Consumer backend credentials issued by CLARISA
  private readonly credentials = JSON.stringify({
    username: env.MS_REPORTS_USER,
    password: env.MS_REPORTS_PASSWORD,
  });

  constructor(@Inject('REPORT_SERVICE') private client: ClientProxy) {}

  async onModuleInit() {
    await this.client.connect();
  }

  async generateP25Pdf(resultData: Record<string, unknown>) {
    const payload = {
      data: resultData,                 // what the template will render
      templateName: 'results_p25',      // ← one of the templates in THIS viewer
      paperWidth: '600px',
      paperHeight: '1000px',
      bucketName: env.AWS_BUCKET_NAME,
      fileName: 'PRMS-Result-1234_P25.pdf',
      credentials: this.credentials,    // CLARISA validates this in the microservice
    };

    // Request/response pattern: the microservice replies with the S3 URL of the PDF
    const response = await firstValueFrom(
      this.client.send<{ data: { url: string } }>('pdf.generateUrl', payload),
    );

    if (!response?.data?.url) {
      throw new Error('PDF generation failed');
    }
    return { pdf: response.data.url, fileName: payload.fileName };
  }
}
```

### C. That's it

The reporting backend **knows nothing about Gotenberg, DynamoDB, or the viewer**. It just sends the `pdf.generateUrl` message with `data` + `templateName` + bucket / filename. It receives the ready-to-use URL of the generated PDF.

## 2.3 How the **START** backend (`alliance-research-indicators`) would do it

The procedure is **identical** to reporting. Concrete steps:

### Step 1. Register the consumer in CLARISA

Before anything else, START needs valid CLARISA credentials so the microservice accepts its messages. This is done **once**:

```http
POST {reports-microservice-url}/pdf/subscribe-application
Content-Type: application/json

{
  "acronym": "ARI",      // alliance-research-indicators acronym in CLARISA
  "environment": "TEST"  // TEST | PROD
}
```

This returns a `username` / `password`. Store them as `MS_REPORTS_USER` and `MS_REPORTS_PASSWORD` in the START backend `.env`.

### Step 2. Install packages

```bash
npm install @nestjs/microservices amqplib amqp-connection-manager
```

### Step 3. Register the RMQ client

Same as reporting:

```ts
// reports.module.ts (in alliance-research-indicators)
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'REPORT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [env.RABBITMQ_URL],
          queue: env.REPORT_QUEUE,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
})
export class ReportsModule {}
```

### Step 4. Inject the client and send the message

```ts
// reports.service.ts (in alliance-research-indicators)
@Injectable()
export class ReportsService implements OnModuleInit {

  private readonly credentials = JSON.stringify({
    username: env.MS_REPORTS_USER,
    password: env.MS_REPORTS_PASSWORD,
  });

  constructor(@Inject('REPORT_SERVICE') private client: ClientProxy) {}

  async onModuleInit() {
    await this.client.connect();
  }

  async generatePdfForResult(resultId: number) {
    // 1. Gather the data the template needs
    const data = await this.buildResultData(resultId);

    // 2. Trigger generation
    const response = await firstValueFrom(
      this.client.send<{ data: { url: string } }>('pdf.generateUrl', {
        data,
        templateName: 'results_summary_v2',    // ← the template you created in the viewer
        paperWidth: '600px',
        paperHeight: '1000px',
        bucketName: env.AWS_BUCKET_NAME,
        fileName: `ARI-Result-${resultId}.pdf`,
        credentials: this.credentials,
      }),
    );

    return response.data.url;
  }
}
```

### Step 5. Environment variables needed in START

```env
RABBITMQ_URL=
REPORT_QUEUE=               # must match the microservice queue
MS_REPORTS_USER=            # returned by subscribe-application
MS_REPORTS_PASSWORD=        # returned by subscribe-application
AWS_BUCKET_NAME=            # S3 bucket where the PDF will be uploaded
```

> 🔒 Never log or commit these values.

### Step 6. If START needs a new template

1. Create the template in this repo (`alliance-ibd-pdf-viewer`) following **Part 1**.
2. Merge and deploy.
3. Reference it by name in the payload (`templateName: 'my-new-template'`).

You don't need to touch the microservice to add templates — the viewer and the microservice are decoupled.

## 2.4 Responsibilities summary

| Component | Responsibility |
|---|---|
| **Consumer backend** (reporting, START, …) | Build the `data` and emit the `pdf.generateUrl` message with `templateName`, paper size, bucket, fileName, credentials. |
| **`reports-microservice`** | Validate CLARISA, call the viewer's `/api/data`, build the URL, call Gotenberg, upload to S3, notify via Slack. |
| **PDF Viewer** (this repo) | Store the data in DynamoDB (`POST /api/data`), render the template (`GET /{template}`). |
| **Gotenberg** | Navigate the viewer URL, wait for the render, return the PDF binary. |
| **S3** | Store the final PDF. |

---

# Appendix — Viewer API reference

The backend **should not** call the viewer directly (everything goes through the microservice), but here is the contract for completeness.

## Endpoints

| Method | Path | Auth header | Purpose |
|---|---|---|---|
| `POST` | `/api/data` | `x-api-secret` or `x-admin-secret` | Stores a JSON payload in DynamoDB. Returns `{ uuid }`. |
| `GET` | `/{template}` | (public; carries `uuid` in the query) | Renders the template HTML for Gotenberg. |
| `GET` | `/api/templates` | (public) | Lists discovered templates. |
| `GET` | `/api/list` | `x-admin-secret` | Lists items currently in DynamoDB (debug). |
| `POST` | `/api/delete` | `x-admin-secret` | Deletes an item by `id`. |

## Query params of `/{template}`

| Param | Effect |
|---|---|
| `uuid` | UUID returned by `/api/data`. **One-shot**: the item is deleted after a successful render. |
| `demo=true` | Loads the local `template.demo.json` (ignores `uuid`). |
| `test=true` | Renders but does NOT delete the DynamoDB item. Useful for debugging. |
| `paperWidth` | Container width (px). Default `600`. Clamped to `[100, 5000]`. |
| `paperHeight` | Container height (px). **Required to enable pagination**. |
| `noPaginate=true` | Disables the paginator even when `paperHeight` is set. |
| `debug=true` | Draws cut lines, footer zone, content start markers (red/orange/green). |

## Viewer environment variables

```env
# Authentication
API_SECRET=             # consumed by the microservice (header x-api-secret)
ADMIN_SECRET=           # consumed by this repo's admin UI

# DynamoDB
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
DYNAMODB_TABLE_NAME=
```

## Microservice environment variables (`reports-microservice`)

Gotenberg flow vars (see `gotenberg.service.ts`):

```env
GOTENBERG_URL=                 # Gotenberg base URL
PDF_TEMPLATE_BASE_URL=         # base URL of THIS viewer
GOTENBERG_PAPER_WIDTH=600px    # default when the backend does not send one
GOTENBERG_PAPER_HEIGHT=1000px
GOTENBERG_MARGIN_TOP=0
GOTENBERG_MARGIN_BOTTOM=0
GOTENBERG_MARGIN_LEFT=0
GOTENBERG_MARGIN_RIGHT=0
GOTENBERG_PRINT_BACKGROUND=true
API_SECRET=                    # must match the viewer's
```

---

## Local development of the viewer

```bash
npm install
cp .env.example .env   # fill with real values
npm run dev            # http://localhost:3000
```

Handy URLs while developing a template:

| URL | What it shows |
|---|---|
| `/` | Template gallery. |
| `/list` | Admin: items in DynamoDB. |
| `/admin` | Admin UI (inspect/delete). |
| `/{template}?demo=true` | Renders with the local demo JSON. |
| `/{template}?uuid=...&test=true&debug=true` | Renders with real data + paginator overlays. |
| `/api/templates` | JSON list of discovered templates. |

---

## Project structure

```
alliance-ibd-pdf-viewer/
├── app/
│   ├── [template]/page.tsx       ← GET /{template}?uuid=...
│   ├── api/
│   │   ├── data/route.ts         ← POST /api/data       (x-api-secret)
│   │   ├── templates/route.ts    ← GET  /api/templates
│   │   ├── list/route.ts         ← GET  /api/list       (x-admin-secret)
│   │   └── delete/route.ts       ← POST /api/delete     (x-admin-secret)
│   ├── admin/                    ← admin UI
│   ├── list/                     ← admin list UI
│   └── templates/                ← ★ ALL templates live here (auto-discovered)
│       ├── index.ts              ← exports TemplateProps
│       ├── reportingtool/
│       │   ├── results_p25/                ← folder-based
│       │   ├── results_bilaterals_p25/
│       │   ├── ipsr_p25/
│       │   └── demo/
│       ├── aiccra/
│       └── starter/
├── lib/dynamo.ts                 ← putItem / getItem / deleteItem / scanAll
├── docs/dev/                     ← per-feature dev logs (persistent context)
├── CLAUDE.md                     ← template authoring rules (read this if writing a complex template)
├── Dockerfile
└── package.json
```

---

## Quick reference

| You want to… | Do this |
|---|---|
| Create a new template | Part 1 — file-based or folder-based under `app/templates/{project}/`. |
| Preview a template in the browser | `/{template}?demo=true` (or `&debug=true` for paginator overlays). |
| Have a backend generate a PDF | Part 2 — `client.send('pdf.generateUrl', { data, templateName, ... })`. |
| Onboard START for the first time | Part 2 — step 1 (subscribe-application in CLARISA). |
| See available templates | `GET /api/templates`. |
| Clean up stale DynamoDB items | `/admin` or `POST /api/delete` with `x-admin-secret`. |
| Rotate the consumer secret | Update `API_SECRET` on the viewer **and** the microservice at the same time. |
