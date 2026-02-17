export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#02211A] font-sans p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#11D4B3]/10 border border-[#11D4B3]/20 flex items-center justify-center">
              <span className="text-[#11D4B3] text-sm font-bold">/</span>
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold">API Documentation</h1>
              <p className="text-[#E2E0DF]/40 text-xs">
                CGIAR PDF Generator Service
              </p>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-[#11D4B3]/30 to-transparent mt-4" />
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-10">
          <a href="/admin" className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl px-4 py-3 transition-colors group">
            <p className="text-[#11D4B3] text-sm font-bold group-hover:underline">/admin</p>
            <p className="text-[#E2E0DF]/30 text-[10px] mt-0.5">Upload JSON</p>
          </a>
          <a href="/list" className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl px-4 py-3 transition-colors group">
            <p className="text-[#11D4B3] text-sm font-bold group-hover:underline">/list</p>
            <p className="text-[#E2E0DF]/30 text-[10px] mt-0.5">View records</p>
          </a>
          <a href="/docs" className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl px-4 py-3 transition-colors group">
            <p className="text-[#11D4B3] text-sm font-bold group-hover:underline">/docs</p>
            <p className="text-[#E2E0DF]/30 text-[10px] mt-0.5">This page</p>
          </a>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
            <p className="text-[#E2E0DF]/50 text-sm font-bold">/&#123;template&#125;</p>
            <p className="text-[#E2E0DF]/30 text-[10px] mt-0.5">Render PDF</p>
          </div>
        </div>

        {/* Overview */}
        <section className="mb-10">
          <h2 className="text-white text-lg font-bold mb-3">Overview</h2>
          <p className="text-[#E2E0DF]/60 text-sm leading-relaxed">
            This service renders PDF-ready HTML templates from JSON data stored in DynamoDB.
            The typical flow is: an external system sends JSON data via the API, receives a UUID,
            then navigates a headless browser to the template URL with that UUID to capture the rendered HTML as a PDF.
            Records are automatically deleted after being read (one-time use), unless test mode is enabled.
          </p>
        </section>

        {/* Authentication */}
        <section className="mb-10">
          <h2 className="text-white text-lg font-bold mb-3">Authentication</h2>
          <p className="text-[#E2E0DF]/60 text-sm leading-relaxed mb-4">
            Two separate secrets are used:
          </p>
          <div className="space-y-2">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-[#11D4B3] text-xs font-mono bg-[#11D4B3]/10 px-2 py-0.5 rounded">x-api-secret</code>
                <span className="text-[#E2E0DF]/30 text-xs">API_SECRET</span>
              </div>
              <p className="text-[#E2E0DF]/50 text-xs">
                For external consumers. Used to POST JSON data via the API endpoint.
              </p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-[#11D4B3] text-xs font-mono bg-[#11D4B3]/10 px-2 py-0.5 rounded">x-admin-secret</code>
                <span className="text-[#E2E0DF]/30 text-xs">ADMIN_SECRET</span>
              </div>
              <p className="text-[#E2E0DF]/50 text-xs">
                For the admin interface. Used to upload JSON, list records, and delete records.
              </p>
            </div>
          </div>
        </section>

        {/* Endpoints */}
        <section className="mb-10">
          <h2 className="text-white text-lg font-bold mb-4">API Endpoints</h2>

          {/* POST /api/data */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 mb-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-[#02211A] bg-[#11D4B3] px-2 py-0.5 rounded">POST</span>
              <code className="text-white text-sm font-mono">/api/data</code>
            </div>
            <p className="text-[#E2E0DF]/50 text-xs mb-4">
              Store a JSON payload in DynamoDB. Returns a UUID to retrieve it.
            </p>

            <div className="mb-3">
              <p className="text-[#E2E0DF]/40 text-[10px] uppercase tracking-wider mb-2">Headers</p>
              <div className="bg-black/20 rounded-lg p-3 border border-white/[0.04]">
                <pre className="text-[#E2E0DF]/60 text-xs font-mono">{`Content-Type: application/json
x-api-secret: <API_SECRET>    # external consumers
x-admin-secret: <ADMIN_SECRET> # admin UI (either works)`}</pre>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-[#E2E0DF]/40 text-[10px] uppercase tracking-wider mb-2">Body</p>
              <div className="bg-black/20 rounded-lg p-3 border border-white/[0.04]">
                <pre className="text-[#E2E0DF]/60 text-xs font-mono">{`{ "title": "My Report", "result_code": 123, ... }`}</pre>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-[#E2E0DF]/40 text-[10px] uppercase tracking-wider mb-2">Response 201</p>
              <div className="bg-black/20 rounded-lg p-3 border border-white/[0.04]">
                <pre className="text-[#E2E0DF]/60 text-xs font-mono">{`{ "uuid": "mlqomlb6-1f3d11cc" }`}</pre>
              </div>
            </div>

            <div>
              <p className="text-[#E2E0DF]/40 text-[10px] uppercase tracking-wider mb-2">Example (curl)</p>
              <div className="bg-black/20 rounded-lg p-3 border border-white/[0.04]">
                <pre className="text-[#E2E0DF]/60 text-xs font-mono whitespace-pre-wrap">{`curl -X POST https://your-domain.com/api/data \\
  -H "Content-Type: application/json" \\
  -H "x-api-secret: YOUR_SECRET" \\
  -d '{"title": "My Report"}'`}</pre>
              </div>
            </div>
          </div>

          {/* GET /api/list */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 mb-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-[#02211A] bg-[#11D4B3]/60 px-2 py-0.5 rounded">GET</span>
              <code className="text-white text-sm font-mono">/api/list</code>
            </div>
            <p className="text-[#E2E0DF]/50 text-xs mb-3">
              List all records in the DynamoDB table. Admin only.
            </p>
            <div className="mb-3">
              <p className="text-[#E2E0DF]/40 text-[10px] uppercase tracking-wider mb-2">Headers</p>
              <div className="bg-black/20 rounded-lg p-3 border border-white/[0.04]">
                <pre className="text-[#E2E0DF]/60 text-xs font-mono">x-admin-secret: &lt;ADMIN_SECRET&gt;</pre>
              </div>
            </div>
            <div>
              <p className="text-[#E2E0DF]/40 text-[10px] uppercase tracking-wider mb-2">Response 200</p>
              <div className="bg-black/20 rounded-lg p-3 border border-white/[0.04]">
                <pre className="text-[#E2E0DF]/60 text-xs font-mono">{`{ "items": [{ "id": "...", "json": "..." }], "count": 1 }`}</pre>
              </div>
            </div>
          </div>

          {/* POST /api/delete */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-[#02211A] bg-red-400/80 px-2 py-0.5 rounded">POST</span>
              <code className="text-white text-sm font-mono">/api/delete</code>
            </div>
            <p className="text-[#E2E0DF]/50 text-xs mb-3">
              Delete a record by ID. Admin only.
            </p>
            <div className="mb-3">
              <p className="text-[#E2E0DF]/40 text-[10px] uppercase tracking-wider mb-2">Headers</p>
              <div className="bg-black/20 rounded-lg p-3 border border-white/[0.04]">
                <pre className="text-[#E2E0DF]/60 text-xs font-mono">{`Content-Type: application/json
x-admin-secret: <ADMIN_SECRET>`}</pre>
              </div>
            </div>
            <div>
              <p className="text-[#E2E0DF]/40 text-[10px] uppercase tracking-wider mb-2">Body</p>
              <div className="bg-black/20 rounded-lg p-3 border border-white/[0.04]">
                <pre className="text-[#E2E0DF]/60 text-xs font-mono">{`{ "id": "mlqomlb6-1f3d11cc" }`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Pages */}
        <section className="mb-10">
          <h2 className="text-white text-lg font-bold mb-4">Pages</h2>

          <div className="space-y-3">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <code className="text-[#11D4B3] text-sm font-mono font-bold">GET /&#123;template&#125;?uuid=X</code>
              </div>
              <p className="text-[#E2E0DF]/50 text-xs mb-3">
                Renders a PDF template with the data stored under the given UUID.
                The record is <strong className="text-[#E2E0DF]/70">deleted after reading</strong> unless
                <code className="text-[#11D4B3]/70 text-[10px] mx-1">?test=true</code> is appended.
              </p>
              <div>
                <p className="text-[#E2E0DF]/40 text-[10px] uppercase tracking-wider mb-2">Query Parameters</p>
                <div className="bg-black/20 rounded-lg p-3 border border-white/[0.04]">
                  <table className="w-full text-xs">
                    <tbody className="text-[#E2E0DF]/60 font-mono">
                      <tr>
                        <td className="text-[#11D4B3] pr-4 py-0.5">uuid</td>
                        <td className="text-[#E2E0DF]/40 pr-4">required</td>
                        <td>The UUID returned by POST /api/data</td>
                      </tr>
                      <tr>
                        <td className="text-[#11D4B3] pr-4 py-0.5">paperWidth</td>
                        <td className="text-[#E2E0DF]/40 pr-4">optional</td>
                        <td>Container width in px (default: 794)</td>
                      </tr>
                      <tr>
                        <td className="text-[#11D4B3] pr-4 py-0.5">paperHeight</td>
                        <td className="text-[#E2E0DF]/40 pr-4">optional</td>
                        <td>Container height in px (default: 1123)</td>
                      </tr>
                      <tr>
                        <td className="text-[#11D4B3] pr-4 py-0.5">test</td>
                        <td className="text-[#E2E0DF]/40 pr-4">optional</td>
                        <td>Set to &quot;true&quot; to keep the record after reading</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-[#E2E0DF]/40 text-[10px] uppercase tracking-wider mb-2">Available Templates</p>
                <div className="flex gap-2">
                  <span className="text-[10px] font-mono bg-[#11D4B3]/10 text-[#11D4B3] px-2 py-1 rounded">example</span>
                  <span className="text-[10px] font-mono bg-[#11D4B3]/10 text-[#11D4B3] px-2 py-1 rounded">summary</span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <code className="text-[#11D4B3] text-sm font-mono font-bold">/admin</code>
              <p className="text-[#E2E0DF]/50 text-xs mt-2">
                Admin interface to upload JSON, select a template, and open the rendered result.
                Requires <code className="text-[#11D4B3]/70 text-[10px]">ADMIN_SECRET</code>.
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <code className="text-[#11D4B3] text-sm font-mono font-bold">/list</code>
              <p className="text-[#E2E0DF]/50 text-xs mt-2">
                View and delete all records stored in DynamoDB.
                Requires <code className="text-[#11D4B3]/70 text-[10px]">ADMIN_SECRET</code>.
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <code className="text-[#11D4B3] text-sm font-mono font-bold">/docs</code>
              <p className="text-[#E2E0DF]/50 text-xs mt-2">
                This page. No authentication required.
              </p>
            </div>
          </div>
        </section>

        {/* Typical flow */}
        <section className="mb-10">
          <h2 className="text-white text-lg font-bold mb-4">Typical Flow</h2>
          <div className="space-y-0">
            {[
              { step: "1", text: "External system sends JSON to", code: "POST /api/data", desc: "with x-api-secret header" },
              { step: "2", text: "API returns", code: '{ "uuid": "..." }', desc: "" },
              { step: "3", text: "System navigates headless browser to", code: "/{template}?uuid=...", desc: "to capture PDF" },
              { step: "4", text: "Template renders HTML, record is", code: "deleted from DB", desc: "(one-time use)" },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start py-3">
                <div className="w-6 h-6 rounded-full bg-[#11D4B3]/10 border border-[#11D4B3]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[#11D4B3] text-[10px] font-bold">{item.step}</span>
                </div>
                <p className="text-[#E2E0DF]/50 text-sm">
                  {item.text}{" "}
                  <code className="text-[#11D4B3] text-xs font-mono">{item.code}</code>
                  {item.desc && <span className="text-[#E2E0DF]/30"> {item.desc}</span>}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Environment variables */}
        <section className="mb-10">
          <h2 className="text-white text-lg font-bold mb-4">Environment Variables</h2>
          <div className="bg-black/20 rounded-xl p-4 border border-white/[0.04]">
            <pre className="text-xs font-mono leading-relaxed">
              <span className="text-[#E2E0DF]/30"># AWS DynamoDB</span>{"\n"}
              <span className="text-[#11D4B3]">AWS_ACCESS_KEY_ID</span><span className="text-[#E2E0DF]/30">=...</span>{"\n"}
              <span className="text-[#11D4B3]">AWS_SECRET_ACCESS_KEY</span><span className="text-[#E2E0DF]/30">=...</span>{"\n"}
              <span className="text-[#11D4B3]">AWS_REGION</span><span className="text-[#E2E0DF]/30">=us-east-1</span>{"\n"}
              <span className="text-[#11D4B3]">DYNAMODB_TABLE_NAME</span><span className="text-[#E2E0DF]/30">=pdf-remaining-information</span>{"\n\n"}
              <span className="text-[#E2E0DF]/30"># Secrets</span>{"\n"}
              <span className="text-[#11D4B3]">API_SECRET</span><span className="text-[#E2E0DF]/30">=...   # for external POST consumers</span>{"\n"}
              <span className="text-[#11D4B3]">ADMIN_SECRET</span><span className="text-[#E2E0DF]/30">=... # for admin UI (upload, list, delete)</span>
            </pre>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-white/[0.06] pt-4">
          <p className="text-[#E2E0DF]/20 text-xs text-center">
            CGIAR PDF Generator Service
          </p>
        </div>
      </div>
    </div>
  );
}
