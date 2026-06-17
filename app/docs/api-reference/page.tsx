import Link from "next/link";
import DocPage from "../components/DocPage";
import Callout from "../components/Callout";
import CodeBlock from "../components/CodeBlock";
import VariableTable from "../components/VariableTable";
import TemplateBadges from "../template-badges";

export default function ApiReferencePage() {
  return (
    <DocPage
      title="API reference"
      lead="The HTTP surface of the viewer: three JSON API routes for storing and managing records, plus the public render route that turns a stored record into continuous HTML."
    >
      <Callout type="info" title="Two kinds of endpoints">
        The <code>/api/*</code> routes are JSON endpoints used by backends and the
        admin UI. The <code>/&#123;template&#125;</code> route is the public render
        page Gotenberg navigates to. Writing data needs a secret; reading
        (rendering) does not — the stored UUID is single-use instead.
      </Callout>

      <h2>POST /api/data</h2>
      <p>
        Stores an arbitrary JSON payload in DynamoDB keyed by a generated UUID and
        returns that UUID. This is the entry point every backend uses before it can
        render a template.
      </p>
      <ul>
        <li>
          <strong>Auth</strong> — header <code>x-api-secret</code> ={" "}
          <code>{`{{API_SECRET}}`}</code> <strong>or</strong>{" "}
          <code>x-admin-secret</code> = <code>{`{{ADMIN_SECRET}}`}</code>. Compared
          in constant time.
        </li>
        <li>
          <strong>Body</strong> — arbitrary JSON matching your template&#39;s{" "}
          <code>data</code> shape.
        </li>
        <li>
          <strong>Response</strong> — <code>201 &#123; uuid &#125;</code>.
        </li>
      </ul>
      <CodeBlock title="POST /api/data" lang="bash">{`curl -X POST {{PDF_VIEWER_BASE_URL}}/api/data \\
  -H "content-type: application/json" \\
  -H "x-api-secret: {{API_SECRET}}" \\
  -d '{ "result_name": "Example", "rt_id": 7 }'

# → 201 { "uuid": "..." }`}</CodeBlock>

      <h3>Status codes</h3>
      <ul>
        <li>
          <code>201</code> — stored; returns <code>&#123; uuid &#125;</code>.
        </li>
        <li>
          <code>400</code> — body is not valid JSON.
        </li>
        <li>
          <code>401</code> — missing or invalid secret.
        </li>
        <li>
          <code>500</code> — server / DynamoDB error.
        </li>
      </ul>
      <Callout type="warn" title="Single-use UUID">
        The record is deleted after the first render unless the render URL appends{" "}
        <code>?test=true</code>. A backend that needs to re-render must{" "}
        <code>POST</code> again for a fresh UUID.
      </Callout>

      <h2>GET /api/list</h2>
      <p>
        Admin-only full-table scan. Returns every stored record. Used by the admin{" "}
        <Link href="/list">Records</Link> view.
      </p>
      <ul>
        <li>
          <strong>Auth</strong> — header <code>x-admin-secret</code> ={" "}
          <code>{`{{ADMIN_SECRET}}`}</code> only.
        </li>
        <li>
          <strong>Response</strong> — <code>&#123; items, count &#125;</code>.
        </li>
      </ul>
      <CodeBlock title="GET /api/list" lang="bash">{`curl {{PDF_VIEWER_BASE_URL}}/api/list \\
  -H "x-admin-secret: {{ADMIN_SECRET}}"

# → { "items": [ ... ], "count": 12 }`}</CodeBlock>
      <Callout type="danger" title="Full-table scan">
        <code>scanAll()</code> reads every item in <code>{`{{DYNAMO_TABLE}}`}</code>
        . There is no TTL on the table, so cost grows with size. Admin use only.
      </Callout>

      <h2>POST /api/delete</h2>
      <p>
        Admin-only delete of a single record by id. Idempotent — deleting a missing
        id still succeeds.
      </p>
      <ul>
        <li>
          <strong>Auth</strong> — header <code>x-admin-secret</code> ={" "}
          <code>{`{{ADMIN_SECRET}}`}</code> only.
        </li>
        <li>
          <strong>Body</strong> — requires <code>&#123; id &#125;</code>.
        </li>
        <li>
          <strong>Response</strong> — <code>&#123; deleted: id &#125;</code>.
        </li>
      </ul>
      <CodeBlock title="POST /api/delete" lang="bash">{`curl -X POST {{PDF_VIEWER_BASE_URL}}/api/delete \\
  -H "content-type: application/json" \\
  -H "x-admin-secret: {{ADMIN_SECRET}}" \\
  -d '{ "id": "..." }'

# → { "deleted": "..." }`}</CodeBlock>

      <h2>GET /api/templates</h2>
      <p>
        Auto-discovery list of every available template. No auth required. The
        admin <Link href="/admin">Upload</Link> UI uses it to populate the template
        picker.
      </p>
      <CodeBlock title="GET /api/templates" lang="bash">{`curl {{PDF_VIEWER_BASE_URL}}/api/templates

# → { "templates": [ { "name": "results_p25", "hasDemo": true }, ... ] }`}</CodeBlock>
      <p>Templates discovered in this deployment:</p>
      <div className="not-prose my-4">
        <TemplateBadges />
      </div>

      <h2>GET /&#123;template&#125;</h2>
      <p>
        The public render route (<code>app/[template]/page.tsx</code>). Fetches the
        stored JSON, renders the matching React template to continuous HTML, and
        runs the client-side paginator. This is the URL the external microservice
        hands to Gotenberg.
      </p>
      <CodeBlock title="render URL" lang="text">{`{{PDF_VIEWER_BASE_URL}}/{template}?uuid=...&paperWidth=600&paperHeight=1000`}</CodeBlock>

      <h3>Query parameters</h3>
      <p>These control which record is rendered and how the paginator behaves:</p>
      <div className="not-prose overflow-x-auto rounded-xl border border-neutral-200 my-4">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">Param</th>
              <th className="px-4 py-2 font-medium">Effect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 text-neutral-600">
            <tr>
              <td className="px-4 py-2 font-mono text-xs text-[#065f4a]">uuid</td>
              <td className="px-4 py-2">
                Key to fetch stored JSON. One-shot — item deleted after render
                unless <code className="font-mono text-xs">test=true</code>.
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-mono text-xs text-[#065f4a]">demo</td>
              <td className="px-4 py-2">
                <code className="font-mono text-xs">=true</code> loads the
                template&#39;s demo JSON and ignores <code className="font-mono text-xs">uuid</code>.
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-mono text-xs text-[#065f4a]">test</td>
              <td className="px-4 py-2">
                <code className="font-mono text-xs">=true</code> skips the
                post-render delete (keeps the record for debugging).
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-mono text-xs text-[#065f4a]">paperWidth</td>
              <td className="px-4 py-2">
                Outer container width in px. Default <strong>600</strong>, clamped
                to <code className="font-mono text-xs">[100, 5000]</code>.
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-mono text-xs text-[#065f4a]">paperHeight</td>
              <td className="px-4 py-2">
                Page height in px. <strong>Required to activate pagination.</strong>
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-mono text-xs text-[#065f4a]">noPaginate</td>
              <td className="px-4 py-2">
                <code className="font-mono text-xs">=true</code> disables the
                paginator even when <code className="font-mono text-xs">paperHeight</code> is set.
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-mono text-xs text-[#065f4a]">debug</td>
              <td className="px-4 py-2">
                <code className="font-mono text-xs">=true</code> draws red CUT
                lines, orange FOOTER ZONE, and green CONTENT START markers.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Callout type="success" title="No backend needed for preview">
        Append <code>?demo=true</code> to any template route to render its demo
        JSON with no UUID and no secret. Add{" "}
        <code>?paperHeight=1000&amp;debug=true</code> to inspect the paginator while
        iterating.
      </Callout>

      <h2>Admin pages</h2>
      <p>
        Two browser pages wrap the API routes for manual use — the in-app
        equivalent of the microservice flow, minus Gotenberg.
      </p>
      <ul>
        <li>
          <Link href="/admin">/admin</Link> — Upload UI. <code>POST</code>s to{" "}
          <code>/api/data</code> with <code>x-admin-secret</code>, then opens{" "}
          <code>/&#123;template&#125;?uuid=…</code>.
        </li>
        <li>
          <Link href="/list">/list</Link> — Records view. Lists and deletes stored
          records via <code>/api/list</code> and <code>/api/delete</code>.
        </li>
      </ul>

      <h2>Typical flow</h2>
      <p>
        End to end, a single PDF is produced by chaining the write route, the
        render route, and an external Gotenberg call:
      </p>
      <ol>
        <li>
          <code>POST /api/data</code> with <code>x-api-secret</code> ={" "}
          <code>{`{{API_SECRET}}`}</code> → grab <code>uuid</code>.
        </li>
        <li>
          Build{" "}
          <code>{`{{PDF_VIEWER_BASE_URL}}`}/&#123;template&#125;?uuid=…&amp;paperWidth=…&amp;paperHeight=…</code>
          .
        </li>
        <li>
          The external microservice <code>POST</code>s that render URL to{" "}
          <code>{`{{GOTENBERG_URL}}`}/forms/chromium/convert/url</code> to capture
          the settled page as PDF.
        </li>
        <li>
          The microservice uploads the PDF to S3 and notifies Slack — none of which
          happens in this repo.
        </li>
      </ol>
      <p>
        For the full producer/consumer contract and the RabbitMQ transport, see{" "}
        <Link href="/docs/backend-connection">Wire a backend</Link> and{" "}
        <Link href="/docs/pdf-flow">PDF generation flow</Link>.
      </p>

      <h2>Auth headers</h2>
      <p>The two shared secrets and where each is accepted:</p>
      <VariableTable
        rows={[
          {
            variable: "{{API_SECRET}}",
            what: "Sent as x-api-secret on POST /api/data. Shared with the external microservice; must match.",
            where: "This viewer + the microservice",
          },
          {
            variable: "{{ADMIN_SECRET}}",
            what: "Sent as x-admin-secret. Required for /api/list and /api/delete; also accepted on POST /api/data.",
            where: "This viewer",
          },
          {
            variable: "{{DYNAMO_TABLE}}",
            what: "DynamoDB table the routes read and write. Set via env DYNAMODB_TABLE_NAME; throws if missing.",
            where: "This viewer",
          },
        ]}
      />
    </DocPage>
  );
}
