import type { Metadata } from "next";
import DocPage from "../components/DocPage";
import CodeBlock from "../components/CodeBlock";
import Callout from "../components/Callout";
import VariableTable from "../components/VariableTable";

export const metadata: Metadata = {
  title: "PDF generation flow",
  description:
    "Request lifecycle, render query params, the external Gotenberg call, and the client-side pagination engine.",
};

export default function PdfFlowPage() {
  return (
    <DocPage
      title="PDF generation flow"
      lead="How a request travels from PRMS to a captured PDF — and what this repo actually owns versus what happens in the external microservice."
    >
      <h2>Request lifecycle</h2>
      <p>
        This viewer does two things: store JSON by UUID, and render a template
        to continuous HTML. Everything else — the RabbitMQ message, the{" "}
        <code>{"{{GOTENBERG_URL}}"}</code> call, the S3 upload, the Slack
        notification — lives in the external <code>reports-microservice</code>{" "}
        and the PRMS server. The numbered flow:
      </p>
      <ol>
        <li>
          <strong>PRMS server emits</strong> a RabbitMQ{" "}
          <code>pdf.generateUrl</code> message — it never builds viewer URLs or
          calls Gotenberg itself.
        </li>
        <li>
          <strong>Microservice POSTs to <code>/api/data</code></strong> on this
          viewer → stores the JSON in DynamoDB → gets back{" "}
          <code>{"{ uuid }"}</code>.
        </li>
        <li>
          <strong>Microservice builds the render URL</strong>{" "}
          <code>{"{{PDF_VIEWER_BASE_URL}}/{template}?uuid=…"}</code> and hands it
          to Gotenberg.
        </li>
        <li>
          <strong>This viewer renders</strong>{" "}
          <code>GET /&#123;template&#125;?uuid=…</code> → HTML (
          <code>app/[template]/page.tsx</code>).
        </li>
        <li>
          <strong>Gotenberg captures</strong> the settled page — the client
          Paginator runs first — and produces the PDF.
        </li>
        <li>
          <strong>Microservice uploads</strong> to S3 and{" "}
          <strong>notifies Slack</strong>, then replies{" "}
          <code>{"{ data: { url } }"}</code>.
        </li>
      </ol>

      <Callout type="info" title="Split of responsibility">
        Storing JSON by UUID, rendering the React template to HTML, and
        paginating are owned by <strong>this repo</strong>. Building/routing the
        JSON and transporting it over RabbitMQ belongs to the PRMS server;
        POSTing the data, calling Gotenberg, uploading to S3, and Slack live in
        the <code>reports-microservice</code>. Both are external.
      </Callout>

      <h2>
        <code>GET /&#123;template&#125;</code> query params
      </h2>
      <p>
        The render route reads its behavior entirely from the query string. The
        microservice (or the admin UI) builds this URL after it has a UUID.
      </p>
      <VariableTable
        rows={[
          {
            variable: "uuid",
            what: "Key to fetch the stored JSON.",
            where:
              "One-shot — the item is deleted after render unless test=true.",
          },
          {
            variable: "demo",
            what: "=true loads the template's demo JSON.",
            where: "Ignores uuid; renders the bundled demo payload.",
          },
          {
            variable: "test",
            what: "=true skips the post-render delete.",
            where: "Keeps the DynamoDB record alive for debugging / re-renders.",
          },
          {
            variable: "paperWidth",
            what: "Outer container width in px.",
            where: "Default 600, clamped to [100, 5000].",
          },
          {
            variable: "paperHeight",
            what: "Page height in px.",
            where: "Required to activate the paginator.",
          },
          {
            variable: "noPaginate",
            what: "=true disables the paginator.",
            where: "Takes effect even when paperHeight is set.",
          },
          {
            variable: "debug",
            what: "=true draws visual pagination guides.",
            where: "Red CUT lines, orange FOOTER ZONE, green CONTENT START.",
          },
        ]}
      />

      <h2>Gotenberg invocation (external — PRMS example)</h2>
      <p>
        The HTML→PDF capture is <strong>not in this repo</strong>. Gotenberg is
        simply the engine the <strong>first project (PRMS)</strong> uses; any
        headless-Chrome capture (Puppeteer, Playwright, a print service) works the
        same way. In the PRMS example the microservice points headless Chrome at
        the render URL and lets the client Paginator do the page math:
      </p>
      <ul>
        <li>
          <strong>Endpoint:</strong>{" "}
          <code>{"POST {{GOTENBERG_URL}}/forms/chromium/convert/url"}</code> —
          render URL plus <code>paperWidth</code>/<code>paperHeight</code> and
          four margins.
        </li>
        <li>
          <strong>Microservice defaults:</strong> <code>paperWidth=600px</code>,{" "}
          <code>paperHeight=1000px</code>, all margins <code>0</code>, print
          background <code>true</code>.
        </li>
        <li>
          Margins <code>0</code> means the{" "}
          <strong>client Paginator is the intended page engine</strong> —
          Gotenberg does not paginate or draw footers itself.
        </li>
        <li>
          Verified: <strong>zero</strong> Gotenberg / <code>convert/url</code> /{" "}
          <code>chromium</code> calls exist anywhere in this repo.
        </li>
      </ul>
      <CodeBlock title="render URL handed to Gotenberg" lang="text">
        {"{{PDF_VIEWER_BASE_URL}}/{template}?uuid=…&paperWidth=600&paperHeight=1000"}
      </CodeBlock>

      <h2>
        Pagination engine (<code>paginator.tsx</code>)
      </h2>
      <p>
        The Paginator is a <code>&quot;use client&quot;</code> component living
        at{" "}
        <code>
          app/templates/reportingtool/shared/components/paginator.tsx
        </code>
        . It runs inside headless Chrome <strong>after render</strong> with a
        500ms delay, and only when <code>paperHeight</code> is set and{" "}
        <code>noPaginate !== true</code>. It manipulates the DOM so no content
        block ever crosses a page boundary.
      </p>

      <h3>collectBlocks</h3>
      <p>
        Walks the DOM and classifies &quot;content blocks&quot;:{" "}
        <code>data-paginator-block</code> → atomic; a leaf element → atomic; a
        plain wrapper (<code>div</code>/<code>section</code>/<code>article</code>{" "}
        with no background/border/shadow) → recurse into its children;
        styled/semantic blocks (bg/border/shadow/table/heading) → atomic.
      </p>

      <h3>processPass</h3>
      <p>
        For each block crossing the safe zone (page bottom −{" "}
        <code>footerHeight</code> − <code>marginBottom</code>):{" "}
        <strong>tables</strong> split at the first overflowing row (the
        continuation has no repeated <code>thead</code>);{" "}
        <strong>other blocks</strong> get a spacer that pushes them to the next
        page; <strong>orphan detection</strong> drags a small preceding heading
        along so it never strands at the bottom of a page.
      </p>

      <h3>Multi-pass &amp; footers</h3>
      <ul>
        <li>
          <strong>Multi-pass:</strong> up to <strong>10 passes</strong> until the
          DOM stops changing (cascading shifts settle).
        </li>
        <li>
          <strong>Footer + final padding:</strong> absolute footers reading
          &quot;CGIAR Results Framework&quot; + &quot;Page X of Y&quot;; the
          document is padded to an exact multiple of <code>paperHeight</code>.
        </li>
      </ul>

      <h3>DEFAULT_CONFIG</h3>
      <p>
        Overridable per template via the <code>config</code> prop:
      </p>
      <CodeBlock title="DEFAULT_CONFIG" lang="ts">
        {`{
  footerHeight: 40,    // space reserved at the bottom for the footer
  marginTop: 30,       // breathing room after each page cut (pages 2+)
  marginBottom: 10,    // gap between content and the footer zone
  firstPage: { marginTop: 0 },  // page 1 needs no extra top margin
}`}
      </CodeBlock>

      <Callout type="warn" title="Double-pagination risk">
        The client Paginator already cuts, pads, and draws footers. If Gotenberg{" "}
        <em>also</em> injects margins and a native footer, you get double
        pagination. Keep Gotenberg margins at <code>0</code> and pick{" "}
        <strong>one</strong> footer mechanism: the client Paginator{" "}
        <em>or</em> the <code>/&#123;template&#125;/footer</code> route — never
        both.
      </Callout>
    </DocPage>
  );
}
