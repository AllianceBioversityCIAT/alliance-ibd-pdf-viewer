# CGIAR PDF Generator — Tutorial

Next.js (App Router) que **renderiza templates HTML** para que **Gotenberg** (headless Chrome) los capture como PDF. Los templates son componentes React `.tsx` que reciben un `data` prop.

Este README es un tutorial práctico con dos partes:

1. **Cómo y dónde se crean los templates** (en este repo).
2. **Cómo un back consume Gotenberg para generar el PDF** — con el back de **reporting** (`onecgiar-pr-server`) como ejemplo real, y la guía para que el back de **START** (`alliance-research-indicators`) lo replique.

> Para reglas de autoría avanzada (paginación, defensive coding, brand tokens) ver [`CLAUDE.md`](./CLAUDE.md). Este README cubre el contrato público y el flujo end-to-end.

---

## 0. Visión general en una imagen

```
┌────────────────────┐  1. RabbitMQ msg                ┌──────────────────────┐
│  Back consumidor   │  pdf.generateUrl                │  reports-microservice│
│  (reporting,       │ ──────────────────────────────► │   (orquestador)      │
│   START, ...)      │ ◄────── { data: { url } } ───── │                      │
└────────────────────┘                                 │  - valida CLARISA    │
                                                       │  - habla con viewer  │
                                                       │  - habla con Gotenberg│
                                                       │  - sube a S3         │
                                                       └──────────────────────┘
                                                          │              │
                                              2. POST     │              │ 3. POST URL
                                              /api/data   ▼              ▼
                                                   ┌──────────┐   ┌────────────┐
                                                   │ PDF Viewer│  │  Gotenberg │
                                                   │ (Next.js) │◄─│ (headless  │
                                                   │           │  │  Chromium) │
                                                   │ - guarda  │  │            │
                                                   │   data    │  │ - navega   │
                                                   │   con uuid│  │   viewer   │
                                                   │ - render  │  │ - captura  │
                                                   │   /{tpl}  │  │   como PDF │
                                                   └──────────┘   └────────────┘
                                                                       │ 4. PDF binary
                                                                       ▼
                                                                  ┌──────────┐
                                                                  │   S3     │
                                                                  └──────────┘
```

**El back consumidor nunca habla con el viewer ni con Gotenberg directamente.** Solo manda un mensaje al `reports-microservice` indicando *qué template* usar y *qué datos* renderizar. Todo el resto es transparente.

---

# Parte 1 — Tutorial: cómo crear un template

Cada template es una carpeta o un archivo `.tsx` dentro de `app/templates/{proyecto}/...`. El viewer los descubre automáticamente — **no hay registro manual**.

## 1.1 Decidir el tipo de template

| Tipo | Cuándo usarlo | Estructura |
|---|---|---|
| **File-based** | Templates simples, una sola página, sin componentes compartidos. | `app/templates/{proyecto}/{nombre}.tsx` |
| **Folder-based** | Templates complejos con componentes compartidos, tipos, transformaciones. | `app/templates/{proyecto}/{nombre}/template.tsx` + `types.ts`, `transform.ts`, `components/` |

> **Tip:** si dudas, usa folder-based. Es más fácil agregar piezas después.

## 1.2 Paso a paso — template **file-based**

### Paso 1. Crear el archivo

`app/templates/start/result-summary.tsx`

```tsx
import type { TemplateProps } from "@/app/templates";

// 1. Define la forma del JSON que tu back va a enviar
interface ResultSummaryData {
  result_name: string;
  phase_name: string;
  indicators: Array<{ id: number; name: string; value: number }>;
}

// 2. Exporta el componente por default
export default function ResultSummary({ data }: TemplateProps) {
  const d = data as ResultSummaryData;

  return (
    <div style={{ fontFamily: "'Noto Sans', Arial, sans-serif", padding: 24 }}>
      <h1>{d.result_name ?? "Untitled result"}</h1>
      <p>Phase: {d.phase_name ?? "—"}</p>

      {/* Defensive: nunca asumas que un array existe */}
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

### Paso 2. (Opcional) Crear el JSON de demo

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

### Paso 3. Verificar en el browser

```bash
npm run dev
# Abrir: http://localhost:3000/result-summary?demo=true
```

Si se ve bien, el template **ya está disponible** como `result-summary` para cualquier back. Aparecerá automáticamente en `GET /api/templates`.

## 1.3 Paso a paso — template **folder-based**

### Paso 1. Crear la carpeta del template

```
app/templates/start/results_summary_v2/
├── template.tsx              ← entry point (el viewer lo descubre como "results_summary_v2")
├── types.ts                  ← interfaces TypeScript
├── transform.ts              ← parsers / sanitizadores de la data cruda
├── template.demo.json        ← data de prueba para ?demo=true
└── components/
    ├── header.tsx
    └── indicator-table.tsx
```

### Paso 2. Definir tipos en `types.ts`

```ts
export interface RawResultData {
  result_name?: string;
  phase_name?: string;
  indicators?: unknown;       // puede venir raro desde el back
}

export interface DisplayResult {
  resultName: string;
  phaseName: string;
  indicators: Array<{ id: number; name: string; value: number }>;
}
```

### Paso 3. Saneamiento en `transform.ts`

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

### Paso 4. Componer en `template.tsx`

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

      {/* data-paginator-block: el bloque debe permanecer junto al cortar páginas */}
      <div data-paginator-block>
        <h2>Indicators</h2>
        <IndicatorTable rows={view.indicators} />
      </div>
    </div>
  );
}
```

### Paso 5. JSON demo

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

### Paso 6. Verificar

```
http://localhost:3000/results_summary_v2?demo=true
http://localhost:3000/results_summary_v2?demo=true&paperHeight=1000&debug=true
```

## 1.4 Reglas obligatorias de los templates

| Regla | Por qué |
|---|---|
| **Flow layout** (flexbox / block). Nunca `position: absolute` que fije contenido a una altura. | El contenido debe poder crecer en múltiples páginas. |
| **Todo el texto y URLs vienen del `data` prop.** | Los templates son data-driven; no hardcodear copy. |
| **`?.` y `?? []` en todas partes. Nunca `!` (non-null assertion).** | El JSON real puede tener campos `null`, ausentes o de tipo incorrecto. El template no debe crashear. |
| **`transform.ts` es la primera defensa.** | Sanea inputs ahí; los componentes usan defensive coding como segunda defensa. |
| **`data-paginator-block`** en grupos indivisibles (grids, heading + tabla, cards). | El paginador no parte estos bloques al cortar páginas. |
| **No nombres reservados de Next** (`layout.tsx`, `page.tsx`, `loading.tsx`) dentro de `app/`. | Next los toma como rutas. |

## 1.5 Cómo se "publica" un template nuevo

1. Mergear y desplegar el viewer.
2. Verificar que aparece en `GET /api/templates`.
3. **Listo.** El back consumidor ya puede referenciarlo por `templateName`. No hay que tocar nada más en el viewer.

---

# Parte 2 — Tutorial: cómo un back genera un PDF

El back nunca toca al viewer ni a Gotenberg directamente. Habla con un microservicio llamado **`reports-microservice`** (`CIAT/one-cgiar-microservices/reports-microservice`, rama `001-gotenberg-url-pdf`) que orquesta todo.

## 2.1 ¿Qué hace el `reports-microservice`?

El microservicio expone un patrón de mensajes RabbitMQ llamado **`pdf.generateUrl`**. Cuando recibe uno:

1. Toma la `data` del payload y la envía a `POST {viewer}/api/data` con el header `x-api-secret`. El viewer guarda la data en DynamoDB y devuelve un objeto (típicamente `{ uuid: "..." }`).
2. Construye la URL del viewer: `{viewer}/{templateName}?{respuesta-del-viewer-como-query-params}` → ej: `https://viewer-host/results_p25?uuid=8f0b5a72-...`
3. Llama a Gotenberg (`{gotenberg}/forms/chromium/convert/url`) con esa URL + `paperWidth` + `paperHeight` + márgenes.
4. Gotenberg navega la URL, espera a que el render termine, captura el PDF.
5. El microservicio sube el PDF a **S3** y devuelve al back `{ data: { url: "https://bucket.s3.amazonaws.com/file.pdf" } }`.
6. Notifica por Slack éxito o fallo.

## 2.2 Ejemplo real: cómo lo usa el back de **reporting**

Archivo: `onecgiar-pr-server/src/api/platform-report/`.

### A. Registrar el cliente RabbitMQ en el módulo

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
          queue: env.REPORT_QUEUE,         // queue compartida con el microservicio
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

### B. Conectar al arrancar y enviar el mensaje

```ts
// platform-report.service.ts (extracto del flow P25)
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PlatformReportService implements OnModuleInit {

  // Credenciales del back (consumer) emitidas por CLARISA
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
      data: resultData,                 // lo que el template va a renderizar
      templateName: 'results_p25',      // ← uno de los templates de ESTE viewer
      paperWidth: '600px',
      paperHeight: '1000px',
      bucketName: env.AWS_BUCKET_NAME,
      fileName: 'PRMS-Result-1234_P25.pdf',
      credentials: this.credentials,    // CLARISA valida esto en el microservicio
    };

    // Patrón request/response: el microservicio responde con la URL del PDF en S3
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

### C. Eso es todo

El back de reporting **no sabe nada de Gotenberg, DynamoDB, ni del viewer**. Solo manda el mensaje `pdf.generateUrl` con `data` + `templateName` + nombre/bucket. Recibe la URL del PDF lista para usar.

## 2.3 Cómo lo haría el back de **START** (`alliance-research-indicators`)

El procedimiento es **idéntico** al de reporting. Estos son los pasos concretos:

### Paso 1. Registrar el consumer en CLARISA

Antes que nada, START necesita credenciales válidas en CLARISA para que el microservicio acepte sus mensajes. Esto se hace **una sola vez**:

```http
POST {reports-microservice-url}/pdf/subscribe-application
Content-Type: application/json

{
  "acronym": "ARI",      // acrónimo de alliance-research-indicators en CLARISA
  "environment": "TEST"  // TEST | PROD
}
```

Esto devuelve un `username` / `password`. Guardarlos como `MS_REPORTS_USER` y `MS_REPORTS_PASSWORD` en el `.env` de START.

### Paso 2. Instalar paquetes

```bash
npm install @nestjs/microservices amqplib amqp-connection-manager
```

### Paso 3. Registrar el cliente RMQ

Igual que en reporting:

```ts
// reports.module.ts (en alliance-research-indicators)
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

### Paso 4. Inyectar el cliente y enviar el mensaje

```ts
// reports.service.ts (en alliance-research-indicators)
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
    // 1. Recolectar la data que el template necesita
    const data = await this.buildResultData(resultId);

    // 2. Disparar la generación
    const response = await firstValueFrom(
      this.client.send<{ data: { url: string } }>('pdf.generateUrl', {
        data,
        templateName: 'results_summary_v2',    // ← el template que crearon en el viewer
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

### Paso 5. Variables de entorno necesarias en START

```env
RABBITMQ_URL=
REPORT_QUEUE=               # debe coincidir con la del microservicio
MS_REPORTS_USER=            # devuelto por subscribe-application
MS_REPORTS_PASSWORD=        # devuelto por subscribe-application
AWS_BUCKET_NAME=            # bucket S3 donde se subirá el PDF
```

> 🔒 Nunca loguear ni commitear estos valores.

### Paso 6. Si START necesita un template nuevo

1. Crear el template en este repo (`alliance-ibd-pdf-viewer`) siguiendo la **Parte 1**.
2. Mergear y desplegar.
3. Referenciarlo por nombre en el payload (`templateName: 'mi-template-nuevo'`).

No hay que tocar el microservicio para agregar templates — el viewer y el microservicio están desacoplados.

## 2.4 Resumen de responsabilidades

| Componente | Responsabilidad |
|---|---|
| **Back consumidor** (reporting, START, …) | Construir la `data` y mandar el mensaje `pdf.generateUrl` con `templateName`, paper size, bucket, fileName, credentials. |
| **`reports-microservice`** | Validar CLARISA, llamar `/api/data` del viewer, construir la URL, llamar a Gotenberg, subir a S3, notificar por Slack. |
| **PDF Viewer** (este repo) | Guardar la data en DynamoDB (`POST /api/data`), renderizar el template (`GET /{template}`). |
| **Gotenberg** | Navegar la URL del viewer, esperar el render, devolver el PDF binario. |
| **S3** | Almacenar el PDF final. |

---

# Apéndice — Referencia API del viewer

Aunque el back **no debería** llamar al viewer directamente (todo va vía el microservicio), aquí está el contrato por completitud.

## Endpoints

| Método | Path | Auth header | Para qué |
|---|---|---|---|
| `POST` | `/api/data` | `x-api-secret` o `x-admin-secret` | Guarda JSON en DynamoDB. Devuelve `{ uuid }`. |
| `GET` | `/{template}` | (pública; trae `uuid` en query) | Renderiza el template HTML para Gotenberg. |
| `GET` | `/api/templates` | (pública) | Lista templates descubiertos. |
| `GET` | `/api/list` | `x-admin-secret` | Lista items en DynamoDB (debug). |
| `POST` | `/api/delete` | `x-admin-secret` | Borra item por `id`. |

## Query params de `/{template}`

| Param | Efecto |
|---|---|
| `uuid` | UUID devuelto por `/api/data`. **One-shot**: tras renderizar exitosamente se borra. |
| `demo=true` | Carga `template.demo.json` local (ignora `uuid`). |
| `test=true` | Renderiza pero NO borra el item de DynamoDB. Útil para debugging. |
| `paperWidth` | Ancho del contenedor (px). Default `600`. Clamp `[100, 5000]`. |
| `paperHeight` | Alto del contenedor (px). **Requerido para activar paginación**. |
| `noPaginate=true` | Desactiva el paginador aunque haya `paperHeight`. |
| `debug=true` | Dibuja líneas de corte, footer zone, content start (rojo/naranja/verde). |

## Variables de entorno del viewer

```env
# Auth
API_SECRET=             # lo usa el microservicio (header x-api-secret)
ADMIN_SECRET=           # lo usa la UI admin de este repo

# DynamoDB
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
DYNAMODB_TABLE_NAME=
```

## Variables de entorno del microservicio (`reports-microservice`)

Las relevantes para el flow Gotenberg (ver `gotenberg.service.ts`):

```env
GOTENBERG_URL=                 # base de Gotenberg
PDF_TEMPLATE_BASE_URL=         # base de ESTE viewer
GOTENBERG_PAPER_WIDTH=600px    # default si el back no lo manda
GOTENBERG_PAPER_HEIGHT=1000px
GOTENBERG_MARGIN_TOP=0
GOTENBERG_MARGIN_BOTTOM=0
GOTENBERG_MARGIN_LEFT=0
GOTENBERG_MARGIN_RIGHT=0
GOTENBERG_PRINT_BACKGROUND=true
API_SECRET=                    # debe coincidir con el del viewer
```

---

## Local development del viewer

```bash
npm install
cp .env.example .env   # llenar con valores reales
npm run dev            # http://localhost:3000
```

Útiles mientras desarrollas un template:

| URL | Qué muestra |
|---|---|
| `/` | Galería de templates. |
| `/list` | Admin: items en DynamoDB. |
| `/admin` | Admin UI (inspeccionar/borrar). |
| `/{template}?demo=true` | Render con demo JSON local. |
| `/{template}?uuid=...&test=true&debug=true` | Render con data real + overlays de pagination. |
| `/api/templates` | JSON con templates descubiertos. |

---

## Estructura del proyecto

```
alliance-ibd-pdf-viewer/
├── app/
│   ├── [template]/page.tsx       ← GET /{template}?uuid=...
│   ├── api/
│   │   ├── data/route.ts         ← POST /api/data       (x-api-secret)
│   │   ├── templates/route.ts    ← GET  /api/templates
│   │   ├── list/route.ts         ← GET  /api/list       (x-admin-secret)
│   │   └── delete/route.ts       ← POST /api/delete     (x-admin-secret)
│   ├── admin/                    ← UI admin
│   ├── list/                     ← UI list admin
│   └── templates/                ← ★ aquí van TODOS los templates (auto-discovery)
│       ├── index.ts              ← exporta TemplateProps
│       ├── reportingtool/
│       │   ├── results_p25/                ← folder-based
│       │   ├── results_bilaterals_p25/
│       │   ├── ipsr_p25/
│       │   └── demo/
│       ├── aiccra/
│       └── starter/
├── lib/dynamo.ts                 ← putItem / getItem / deleteItem / scanAll
├── docs/dev/                     ← logs por feature (contexto persistente)
├── CLAUDE.md                     ← reglas de autoría de templates (lee esto si vas a crear uno complejo)
├── Dockerfile
└── package.json
```

---

## Referencia rápida

| Quieres… | Hacer esto |
|---|---|
| Crear un template nuevo | Parte 1 — file-based o folder-based en `app/templates/{proyecto}/`. |
| Probar un template en el navegador | `/{template}?demo=true` (o `&debug=true` para overlays). |
| Que un back genere un PDF | Parte 2 — `client.send('pdf.generateUrl', { data, templateName, ... })`. |
| Que START se conecte por primera vez | Parte 2 — paso 1 (subscribe-application en CLARISA). |
| Ver qué templates hay disponibles | `GET /api/templates`. |
| Limpiar items basura en DynamoDB | `/admin` o `POST /api/delete` con `x-admin-secret`. |
| Rotar el secret del consumer | Actualizar `API_SECRET` en viewer **y** microservicio al mismo tiempo. |
