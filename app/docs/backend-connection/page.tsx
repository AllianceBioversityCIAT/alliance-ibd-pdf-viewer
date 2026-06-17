import DocPage from "../components/DocPage";
import CodeBlock from "../components/CodeBlock";
import Callout from "../components/Callout";
import VariableTable from "../components/VariableTable";

export default function BackendConnectionPage() {
  return (
    <DocPage
      title="Wire a backend"
      lead="How to send JSON into the viewer, get a UUID back, and turn it into a render URL. The PRMS + reports-microservice flow at the bottom is one reference example — your backend and PDF engine can be anything."
    >
      <h2>The one endpoint that matters</h2>
      <p>
        A backend connects to this viewer through a single endpoint:{" "}
        <code>POST /api/data</code>. You send arbitrary JSON (shaped to a
        template&apos;s <code>data</code>), it stores the payload in DynamoDB and
        returns a UUID. You then build a render URL from that UUID and hand it to
        your PDF engine of choice — Gotenberg, Puppeteer, Playwright, any
        headless-Chrome or print service — or just open it as an HTML preview.
      </p>

      <Callout type="success" title="This contract is the only requirement">
        Everything on this page above the &ldquo;reference example&rdquo; section
        is all you need to integrate: <code>POST /api/data</code> → get a{" "}
        <code>uuid</code> → build a render URL. How you produce the JSON and how
        you turn the rendered HTML into a PDF is entirely your project&apos;s
        choice. The PRMS / RabbitMQ / Gotenberg section below is just how the
        first project happened to do it.
      </Callout>

      <h2>POST /api/data contract</h2>

      <VariableTable
        rows={[
          {
            variable: "Method / URL",
            what: "POST {{PDF_VIEWER_BASE_URL}}/api/data",
            where: "This viewer",
          },
          {
            variable: "{{API_SECRET}}",
            what: "Header x-api-secret (external consumers). Constant-time compared.",
            where: "This viewer + the caller",
          },
          {
            variable: "{{ADMIN_SECRET}}",
            what: "Header x-admin-secret — also accepted on POST /api/data (admin path).",
            where: "This viewer",
          },
        ]}
      />

      <h3>Request</h3>
      <ul>
        <li>
          <strong>Method / URL:</strong> <code>POST</code>{" "}
          <code>&#123;&#123;PDF_VIEWER_BASE_URL&#125;&#125;/api/data</code>
        </li>
        <li>
          <strong>Auth header:</strong>{" "}
          <code>x-api-secret: &#123;&#123;API_SECRET&#125;&#125;</code>{" "}
          (external) or{" "}
          <code>x-admin-secret: &#123;&#123;ADMIN_SECRET&#125;&#125;</code>{" "}
          (admin). Both are compared in constant time.
        </li>
        <li>
          <strong>Body:</strong> arbitrary JSON — your template&apos;s expected{" "}
          <code>data</code> shape.
        </li>
      </ul>

      <CodeBlock title="POST /api/data" lang="bash">
        {`curl -X POST {{PDF_VIEWER_BASE_URL}}/api/data \\
  -H "x-api-secret: {{API_SECRET}}" \\
  -H "Content-Type: application/json" \\
  -d '{ "result_name": "Example", "rt_id": 7 }'`}
      </CodeBlock>

      <h3>Response &amp; error codes</h3>
      <ul>
        <li>
          <strong>201</strong> — <code>&#123; uuid &#125;</code> on success.
        </li>
        <li>
          <strong>400</strong> — body is not valid JSON.
        </li>
        <li>
          <strong>401</strong> — missing or invalid secret.
        </li>
        <li>
          <strong>500</strong> — server error.
        </li>
      </ul>

      <CodeBlock title="201 Created" lang="json">
        {`{ "uuid": "lq8x2v0z-1a2b3c4d" }`}
      </CodeBlock>

      <Callout type="warn" title="Single-use UUID">
        The render route deletes the stored record after the first read. A
        backend that needs to re-render must <strong>POST again</strong> for a
        fresh UUID. While developing, append <code>?test=true</code> to the
        render URL so the record survives repeated renders.
      </Callout>

      <h2>Minimal recipe to wire a brand-new backend</h2>
      <ol>
        <li>
          Build your JSON to match a template&apos;s expected <code>data</code>{" "}
          shape.
        </li>
        <li>
          <code>POST &#123;&#123;PDF_VIEWER_BASE_URL&#125;&#125;/api/data</code>{" "}
          with{" "}
          <code>x-api-secret: &#123;&#123;API_SECRET&#125;&#125;</code> → grab
          the <code>uuid</code>.
        </li>
        <li>
          Build{" "}
          <code>
            &#123;&#123;PDF_VIEWER_BASE_URL&#125;&#125;/&#123;template&#125;?uuid=…&amp;paperWidth=…&amp;paperHeight=…
          </code>
          .
        </li>
        <li>
          Either open it (HTML preview) or feed it to your PDF engine of choice
          (Gotenberg, Puppeteer, Playwright, any headless-Chrome / print service).
        </li>
        <li>
          Add <code>?test=true</code> while developing so the record survives
          re-renders.
        </li>
      </ol>

      <CodeBlock title="Build the render URL" lang="bash">
        {`# After POST /api/data returned { "uuid": "..." }
{{PDF_VIEWER_BASE_URL}}/{template}?uuid={uuid}&paperWidth=600&paperHeight=1000

# While developing — keep the record alive across renders:
{{PDF_VIEWER_BASE_URL}}/{template}?uuid={uuid}&paperWidth=600&paperHeight=1000&test=true`}
      </CodeBlock>

      <h2>Reference example: how the first project (PRMS) wires it</h2>

      <Callout type="info" title="One example — not the canonical implementation">
        PRMS is the external backend of the <strong>first project</strong> that
        consumed this viewer. Treat the flow below as a worked example you can
        learn from, not as the implementation you must copy. Your project may use
        a different transport (HTTP instead of RabbitMQ), a different PDF engine,
        and a different storage/notification step. Also note: the live{" "}
        <code>pdf.generateUrl</code> / Gotenberg handler was not on disk during
        the review (the microservice checkout was on a legacy branch), so the
        steps below are reconstructed from the <strong>producer contract</strong>{" "}
        (what PRMS sends) and the <strong>viewer contract</strong> (what this repo
        accepts). Pull the microservice production branch for the live handler.
      </Callout>

      <h3>Transport = RabbitMQ</h3>
      <p>
        PRMS never calls <code>/api/data</code> itself. It registers a RabbitMQ
        client (<code>urls: [&#123;&#123;RABBITMQ_URL&#125;&#125;]</code>,{" "}
        <code>queue: &#123;&#123;REPORT_QUEUE&#125;&#125;</code>,{" "}
        <code>durable: true</code>) and sends a message; the external{" "}
        <code>reports-microservice</code> is what actually POSTs to this viewer.
      </p>

      <ul>
        <li>
          <strong>P25 — request/response:</strong>{" "}
          <code>client.send(&apos;pdf.generateUrl&apos;, payload)</code> is
          awaited. The payload carries{" "}
          <code>
            &#123; data, paperWidth, paperHeight, templateName, bucketName,
            fileName, apiKey &#125;
          </code>{" "}
          where{" "}
          <code>apiKey = &#123;&#123;MICROSERVICE_API_KEY&#125;&#125;</code>{" "}
          (equals <code>&#123;&#123;API_SECRET&#125;&#125;</code> on the viewer
          side) and{" "}
          <code>bucketName = &#123;&#123;AWS_BUCKET_NAME&#125;&#125;</code>. The
          response is <code>&#123; data: &#123; url &#125; &#125;</code> and PRMS
          returns <code>&#123; pdf: url, fileName &#125;</code>.
        </li>
        <li>
          <strong>Legacy — fire-and-forget + poll:</strong>{" "}
          <code>client.emit(&apos;pdf.generate&apos;, …)</code>, then PRMS polls
          S3 for the finished file.
        </li>
      </ul>

      <h3>What the microservice does with the message</h3>
      <ol>
        <li>
          <code>POST &#123;&#123;PDF_VIEWER_BASE_URL&#125;&#125;/api/data</code>{" "}
          with{" "}
          <code>x-api-secret: &#123;&#123;API_SECRET&#125;&#125;</code> → gets{" "}
          <code>&#123; uuid &#125;</code>.
        </li>
        <li>
          Builds the render URL{" "}
          <code>
            &#123;&#123;PDF_VIEWER_BASE_URL&#125;&#125;/&#123;templateName&#125;?uuid=…&amp;paperWidth=…&amp;paperHeight=…
          </code>
          .
        </li>
        <li>
          <code>
            POST
            &#123;&#123;GOTENBERG_URL&#125;&#125;/forms/chromium/convert/url
          </code>{" "}
          with that render URL → PDF binary.
        </li>
        <li>
          Uploads the PDF to S3{" "}
          <code>&#123;&#123;AWS_BUCKET_NAME&#125;&#125;</code>, replies{" "}
          <code>&#123; data: &#123; url &#125; &#125;</code>, and notifies Slack.
        </li>
      </ol>

      <Callout type="info" title="Where the boundary is">
        This repo only stores JSON and renders templates to HTML. Gotenberg, the
        S3 upload, and the Slack notification all live in the <strong>external</strong>{" "}
        <code>reports-microservice</code> — never in this viewer.
      </Callout>
    </DocPage>
  );
}
