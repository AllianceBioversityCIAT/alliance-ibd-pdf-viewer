import TemplateBadges from "./template-badges";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-neutral-900 text-2xl font-semibold tracking-tight">
                API Documentation
              </h1>
              <p className="text-neutral-400 text-sm mt-0.5">
                CGIAR PDF Generator
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/admin"
                className="text-neutral-400 hover:text-neutral-900 text-sm transition-colors"
              >
                Upload
              </a>
              <a
                href="/list"
                className="text-neutral-400 hover:text-neutral-900 text-sm transition-colors"
              >
                Records
              </a>
            </div>
          </div>
          <div className="h-px bg-neutral-100 mt-6" />
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-14">
          <a
            href="/admin"
            className="border border-neutral-200 hover:border-neutral-900 rounded-xl px-4 py-3 transition-colors group"
          >
            <p className="text-neutral-900 text-sm font-medium group-hover:underline">
              /admin
            </p>
            <p className="text-neutral-400 text-xs mt-0.5">Upload JSON</p>
          </a>
          <a
            href="/list"
            className="border border-neutral-200 hover:border-neutral-900 rounded-xl px-4 py-3 transition-colors group"
          >
            <p className="text-neutral-900 text-sm font-medium group-hover:underline">
              /list
            </p>
            <p className="text-neutral-400 text-xs mt-0.5">View records</p>
          </a>
          <a
            href="/docs"
            className="border border-neutral-200 hover:border-neutral-900 rounded-xl px-4 py-3 transition-colors group"
          >
            <p className="text-neutral-900 text-sm font-medium group-hover:underline">
              /docs
            </p>
            <p className="text-neutral-400 text-xs mt-0.5">This page</p>
          </a>
          <div className="border border-neutral-100 rounded-xl px-4 py-3">
            <p className="text-neutral-500 text-sm font-medium">
              /&#123;template&#125;
            </p>
            <p className="text-neutral-400 text-xs mt-0.5">Render PDF</p>
          </div>
        </div>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-neutral-900 text-lg font-semibold mb-3">
            Overview
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed">
            This service renders PDF-ready HTML templates from JSON data stored
            in DynamoDB. The typical flow is: an external system sends JSON data
            via the API, receives a UUID, then navigates a headless browser to
            the template URL with that UUID to capture the rendered HTML as a
            PDF. Records are automatically deleted after being read (one-time
            use), unless test mode is enabled.
          </p>
        </section>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="text-neutral-900 text-lg font-semibold mb-3">
            Authentication
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed mb-4">
            Two separate secrets are used:
          </p>
          <div className="space-y-3">
            <div className="border border-neutral-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-neutral-900 text-xs font-mono bg-neutral-100 px-2 py-0.5 rounded">
                  x-api-secret
                </code>
                <span className="text-neutral-400 text-xs">API_SECRET</span>
              </div>
              <p className="text-neutral-500 text-xs">
                For external consumers. Used to POST JSON data via the API
                endpoint.
              </p>
            </div>
            <div className="border border-neutral-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-neutral-900 text-xs font-mono bg-neutral-100 px-2 py-0.5 rounded">
                  x-admin-secret
                </code>
                <span className="text-neutral-400 text-xs">ADMIN_SECRET</span>
              </div>
              <p className="text-neutral-500 text-xs">
                For the admin interface. Used to upload JSON, list records, and
                delete records.
              </p>
            </div>
          </div>
        </section>

        {/* Endpoints */}
        <section className="mb-12">
          <h2 className="text-neutral-900 text-lg font-semibold mb-5">
            API Endpoints
          </h2>

          {/* POST /api/data */}
          <div className="border border-neutral-200 rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-white bg-neutral-900 px-2 py-0.5 rounded">
                POST
              </span>
              <code className="text-neutral-900 text-sm font-mono">
                /api/data
              </code>
            </div>
            <p className="text-neutral-500 text-xs mb-4">
              Store a JSON payload in DynamoDB. Returns a UUID to retrieve it.
            </p>

            <div className="mb-3">
              <p className="text-neutral-400 text-[10px] uppercase tracking-wider font-medium mb-2">
                Headers
              </p>
              <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                <pre className="text-neutral-600 text-xs font-mono">{`Content-Type: application/json
x-api-secret: <API_SECRET>    # external consumers
x-admin-secret: <ADMIN_SECRET> # admin UI (either works)`}</pre>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-neutral-400 text-[10px] uppercase tracking-wider font-medium mb-2">
                Body
              </p>
              <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                <pre className="text-neutral-600 text-xs font-mono">{`{ "title": "My Report", "result_code": 123, ... }`}</pre>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-neutral-400 text-[10px] uppercase tracking-wider font-medium mb-2">
                Response 201
              </p>
              <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                <pre className="text-neutral-600 text-xs font-mono">{`{ "uuid": "mlqomlb6-1f3d11cc" }`}</pre>
              </div>
            </div>

            <div>
              <p className="text-neutral-400 text-[10px] uppercase tracking-wider font-medium mb-2">
                Example (curl)
              </p>
              <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                <pre className="text-neutral-600 text-xs font-mono whitespace-pre-wrap">{`curl -X POST https://your-domain.com/api/data \\
  -H "Content-Type: application/json" \\
  -H "x-api-secret: YOUR_SECRET" \\
  -d '{"title": "My Report"}'`}</pre>
              </div>
            </div>
          </div>

          {/* GET /api/list */}
          <div className="border border-neutral-200 rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-white bg-neutral-500 px-2 py-0.5 rounded">
                GET
              </span>
              <code className="text-neutral-900 text-sm font-mono">
                /api/list
              </code>
            </div>
            <p className="text-neutral-500 text-xs mb-3">
              List all records in the DynamoDB table. Admin only.
            </p>
            <div className="mb-3">
              <p className="text-neutral-400 text-[10px] uppercase tracking-wider font-medium mb-2">
                Headers
              </p>
              <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                <pre className="text-neutral-600 text-xs font-mono">
                  x-admin-secret: &lt;ADMIN_SECRET&gt;
                </pre>
              </div>
            </div>
            <div>
              <p className="text-neutral-400 text-[10px] uppercase tracking-wider font-medium mb-2">
                Response 200
              </p>
              <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                <pre className="text-neutral-600 text-xs font-mono">{`{ "items": [{ "id": "...", "json": "..." }], "count": 1 }`}</pre>
              </div>
            </div>
          </div>

          {/* POST /api/delete */}
          <div className="border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded">
                POST
              </span>
              <code className="text-neutral-900 text-sm font-mono">
                /api/delete
              </code>
            </div>
            <p className="text-neutral-500 text-xs mb-3">
              Delete a record by ID. Admin only.
            </p>
            <div className="mb-3">
              <p className="text-neutral-400 text-[10px] uppercase tracking-wider font-medium mb-2">
                Headers
              </p>
              <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                <pre className="text-neutral-600 text-xs font-mono">{`Content-Type: application/json
x-admin-secret: <ADMIN_SECRET>`}</pre>
              </div>
            </div>
            <div>
              <p className="text-neutral-400 text-[10px] uppercase tracking-wider font-medium mb-2">
                Body
              </p>
              <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                <pre className="text-neutral-600 text-xs font-mono">{`{ "id": "mlqomlb6-1f3d11cc" }`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Pages */}
        <section className="mb-12">
          <h2 className="text-neutral-900 text-lg font-semibold mb-5">
            Pages
          </h2>

          <div className="space-y-4">
            <div className="border border-neutral-200 rounded-xl p-5">
              <code className="text-neutral-900 text-sm font-mono font-semibold">
                GET /&#123;template&#125;?uuid=X
              </code>
              <p className="text-neutral-500 text-xs mt-2 mb-3">
                Renders a PDF template with the data stored under the given
                UUID. The record is{" "}
                <strong className="text-neutral-700">
                  deleted after reading
                </strong>{" "}
                unless
                <code className="text-neutral-600 text-[10px] mx-1 bg-neutral-100 px-1 py-0.5 rounded">
                  ?test=true
                </code>{" "}
                is appended.
              </p>
              <div>
                <p className="text-neutral-400 text-[10px] uppercase tracking-wider font-medium mb-2">
                  Query Parameters
                </p>
                <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                  <table className="w-full text-xs">
                    <tbody className="text-neutral-600 font-mono">
                      <tr>
                        <td className="text-neutral-900 pr-4 py-0.5 font-medium">
                          uuid
                        </td>
                        <td className="text-neutral-400 pr-4">required</td>
                        <td>The UUID returned by POST /api/data</td>
                      </tr>
                      <tr>
                        <td className="text-neutral-900 pr-4 py-0.5 font-medium">
                          paperWidth
                        </td>
                        <td className="text-neutral-400 pr-4">optional</td>
                        <td>Container width in px (default: 600)</td>
                      </tr>
                      <tr>
                        <td className="text-neutral-900 pr-4 py-0.5 font-medium">
                          paperHeight
                        </td>
                        <td className="text-neutral-400 pr-4">optional</td>
                        <td>Container height in px (default: 1000)</td>
                      </tr>
                      <tr>
                        <td className="text-neutral-900 pr-4 py-0.5 font-medium">
                          test
                        </td>
                        <td className="text-neutral-400 pr-4">optional</td>
                        <td>
                          Set to &quot;true&quot; to keep the record after
                          reading
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-neutral-400 text-[10px] uppercase tracking-wider font-medium mb-2">
                  Available Templates
                </p>
                <TemplateBadges />
              </div>
            </div>

            <div className="border border-neutral-200 rounded-xl p-5">
              <code className="text-neutral-900 text-sm font-mono font-semibold">
                /admin
              </code>
              <p className="text-neutral-500 text-xs mt-2">
                Admin interface to upload JSON, select a template, and open the
                rendered result. Requires{" "}
                <code className="text-neutral-600 text-[10px] bg-neutral-100 px-1 py-0.5 rounded">
                  ADMIN_SECRET
                </code>
                .
              </p>
            </div>

            <div className="border border-neutral-200 rounded-xl p-5">
              <code className="text-neutral-900 text-sm font-mono font-semibold">
                /list
              </code>
              <p className="text-neutral-500 text-xs mt-2">
                View and delete all records stored in DynamoDB. Requires{" "}
                <code className="text-neutral-600 text-[10px] bg-neutral-100 px-1 py-0.5 rounded">
                  ADMIN_SECRET
                </code>
                .
              </p>
            </div>

            <div className="border border-neutral-200 rounded-xl p-5">
              <code className="text-neutral-900 text-sm font-mono font-semibold">
                /docs
              </code>
              <p className="text-neutral-500 text-xs mt-2">
                This page. No authentication required.
              </p>
            </div>
          </div>
        </section>

        {/* Typical flow */}
        <section className="mb-12">
          <h2 className="text-neutral-900 text-lg font-semibold mb-5">
            Typical Flow
          </h2>
          <div className="space-y-0">
            {[
              {
                step: "1",
                text: "External system sends JSON to",
                code: "POST /api/data",
                desc: "with x-api-secret header",
              },
              {
                step: "2",
                text: "API returns",
                code: '{ "uuid": "..." }',
                desc: "",
              },
              {
                step: "3",
                text: "System navigates headless browser to",
                code: "/{template}?uuid=...",
                desc: "to capture PDF",
              },
              {
                step: "4",
                text: "Template renders HTML, record is",
                code: "deleted from DB",
                desc: "(one-time use)",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start py-3">
                <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-neutral-500 text-[10px] font-bold">
                    {item.step}
                  </span>
                </div>
                <p className="text-neutral-500 text-sm">
                  {item.text}{" "}
                  <code className="text-neutral-900 text-xs font-mono font-medium">
                    {item.code}
                  </code>
                  {item.desc && (
                    <span className="text-neutral-400"> {item.desc}</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Environment variables */}
        <section className="mb-12">
          <h2 className="text-neutral-900 text-lg font-semibold mb-5">
            Environment Variables
          </h2>
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
            <pre className="text-xs font-mono leading-relaxed">
              <span className="text-neutral-400"># AWS DynamoDB</span>
              {"\n"}
              <span className="text-neutral-900">AWS_ACCESS_KEY_ID</span>
              <span className="text-neutral-400">=...</span>
              {"\n"}
              <span className="text-neutral-900">AWS_SECRET_ACCESS_KEY</span>
              <span className="text-neutral-400">=...</span>
              {"\n"}
              <span className="text-neutral-900">AWS_REGION</span>
              <span className="text-neutral-400">=us-east-1</span>
              {"\n"}
              <span className="text-neutral-900">DYNAMODB_TABLE_NAME</span>
              <span className="text-neutral-400">
                =pdf-remaining-information
              </span>
              {"\n\n"}
              <span className="text-neutral-400"># Secrets</span>
              {"\n"}
              <span className="text-neutral-900">API_SECRET</span>
              <span className="text-neutral-400">
                =... # for external POST consumers
              </span>
              {"\n"}
              <span className="text-neutral-900">ADMIN_SECRET</span>
              <span className="text-neutral-400">
                =... # for admin UI (upload, list, delete)
              </span>
            </pre>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-neutral-100 pt-4">
          <p className="text-neutral-300 text-xs text-center">
            CGIAR PDF Generator Service
          </p>
        </div>
      </div>
    </div>
  );
}
