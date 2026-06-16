import DocPage from "../components/DocPage";
import CodeBlock from "../components/CodeBlock";
import Callout from "../components/Callout";

const FIXED_CONTRACT: { rule: string; detail: string }[] = [
  {
    rule: "TemplateProps shape",
    detail:
      "Exactly { data: unknown } (app/templates/index.ts). The loader passes exactly one data prop.",
  },
  {
    rule: "Default-export a React component",
    detail:
      "The loader reads mod.default ONLY. A named export is invisible; an undefined default crashes on render.",
  },
  {
    rule: "data is unknown on purpose",
    detail:
      "Cast it (const d = data as MyData | null) and treat every field as untrusted.",
  },
  {
    rule: "Entry-point naming",
    detail:
      "Folder-based MUST be template.tsx (name = folder name); file-based MUST be a bare .tsx (name = filename). Excluded: index.tsx, components.tsx.",
  },
  {
    rule: "shared/ is reserved",
    detail: "Never discovered as a template; only imported as a dependency.",
  },
  {
    rule: "Next.js reserved names forbidden in app/",
    detail:
      "Never name a file layout.tsx, page.tsx, loading.tsx, etc. (the layout wrapper is page-shell.tsx for this reason).",
  },
  {
    rule: "Demo filename convention",
    detail: "{name}.demo.json (file) / template.demo.json (folder).",
  },
  {
    rule: "Flow layout only",
    detail:
      "No absolute positioning of content; the paginator measures getBoundingClientRect() and inserts spacers.",
  },
  {
    rule: "paperWidth / paperHeight semantics",
    detail:
      "Width set by the route, height read by the Paginator. Don't reinterpret.",
  },
  {
    rule: "Reserved paginator attributes",
    detail:
      "Don't repurpose data-paginator-block, data-paginator-spacer, data-paginator-footer, data-sidebar-strip.",
  },
  {
    rule: "Defensive-coding mandate",
    detail: "Tolerate null/missing/wrong-typed fields; no non-null assertions.",
  },
  {
    rule: "Single-use UUID side effect",
    detail: "Record deleted on read unless ?test=true.",
  },
];

const CHANGEABLE: string[] = [
  "All visual markup, Tailwind classes, brand styling, fonts.",
  "The TypeScript interface for your own data shape.",
  "Whether to paginate — single-page templates can skip <Paginator> and hard-code a footer.",
  "Folder-based internal structure — types.ts, transform.ts, components/: names/organization are yours. Only template.tsx is fixed.",
  "Paginator config overrides per template (footerHeight, marginTop, marginBottom, firstPage.marginTop).",
  "Where you place data-paginator-block.",
  "Variant logic (e.g. switching on rt_id is a results_p25 choice, not a system requirement).",
  "Shared helpers and static assets (public/assets/{project}/).",
];

export default function TemplateSystemPage() {
  return (
    <DocPage
      title="Template system"
      lead="Templates are React .tsx components that receive one data prop and render to continuous HTML. There is a small fixed contract every template must honor — everything else is yours."
    >
      <p>
        Two independent walkers must agree on naming: the discovery walker (
        <code>app/api/templates/route.ts</code>) and the route loader (
        <code>app/[template]/page.tsx</code>). The fixed contract below is what
        keeps those two in sync — break it and a template either won&apos;t be
        discovered or won&apos;t render.
      </p>

      <h2>Fixed contract vs. what you can change</h2>

      <Callout type="danger" title="NON-CHANGEABLE base structure (fixed contract)">
        These rules are enforced by the discovery walker and the route loader.
        Every template must honor all of them.
      </Callout>

      <div className="not-prose mt-4 mb-6 overflow-hidden rounded-xl border border-red-200">
        <ul className="divide-y divide-red-100">
          {FIXED_CONTRACT.map((r) => (
            <li
              key={r.rule}
              className="flex gap-3 bg-red-50/40 px-4 py-3 text-sm"
            >
              <span
                aria-hidden
                className="mt-0.5 shrink-0 font-semibold text-red-600"
              >
                ✕
              </span>
              <span>
                <strong className="font-semibold text-neutral-900">
                  {r.rule}
                </strong>
                <span className="mt-0.5 block text-neutral-600">
                  {r.detail}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Callout type="success" title="What you CAN change">
        Everything visual and structural inside the template is yours — only the
        contract above is frozen.
      </Callout>

      <div
        className="not-prose mt-4 mb-6 overflow-hidden rounded-xl border"
        style={{ borderColor: "#11d4b3" }}
      >
        <ul className="divide-y" style={{ borderColor: "#cdeee7" }}>
          {CHANGEABLE.map((c) => (
            <li
              key={c}
              className="flex gap-3 px-4 py-3 text-sm"
              style={{ backgroundColor: "#f2fbf9" }}
            >
              <span
                aria-hidden
                className="mt-0.5 shrink-0 font-semibold"
                style={{ color: "#065f4a" }}
              >
                ✓
              </span>
              <span className="text-neutral-700">{c}</span>
            </li>
          ))}
        </ul>
      </div>

      <h2>Auto-discovery rules</h2>
      <p>
        <code>GET /api/templates</code> recursively walks the project folders and
        applies four rules. No registry is needed — placing a file is the only
        registration step.
      </p>
      <ul>
        <li>
          <strong>Folder-based</strong> = a directory containing{" "}
          <code>template.tsx</code>; name = folder name. Other{" "}
          <code>.tsx</code> siblings in that folder are NOT discovered.
        </li>
        <li>
          <strong>File-based</strong> = a bare <code>*.tsx</code>; name =
          filename.
        </li>
        <li>
          The <code>shared/</code> dir is skipped entirely;{" "}
          <code>index.tsx</code> and <code>components.tsx</code> are excluded.
        </li>
        <li>Output is sorted alphabetically.</li>
      </ul>

      <CodeBlock title="app/templates/ layout" lang="text">{`app/templates/
  reportingtool/
    results_p25/
      template.tsx        ← discovered as "results_p25"
      types.ts            ← yours (not discovered)
      transform.ts        ← yours (not discovered)
      template.demo.json  ← demo data for ?demo=true
      components/         ← yours (not discovered)
    shared/               ← reserved, never discovered
  starter/
    initial.tsx           ← discovered as "initial"
    initial.demo.json     ← demo data for ?demo=true`}</CodeBlock>

      <Callout type="warn" title="Two walkers, one naming rule">
        Discovery (<code>app/api/templates/route.ts</code>) and rendering (
        <code>app/[template]/page.tsx</code>) walk independently. Keep entry
        points named <code>template.tsx</code> (folder) or a bare{" "}
        <code>.tsx</code> (file) so both agree.
      </Callout>

      <h2>Demo mode</h2>
      <p>
        Demo mode lets you render a template with canned data and no UUID —
        useful for design iteration and the docs site previews.
      </p>
      <ul>
        <li>
          Activate with <code>?demo=true</code> on the template route (e.g.{" "}
          <code>/&#123;name&#125;?demo=true</code>).
        </li>
        <li>
          <strong>File-based</strong> resolution:{" "}
          <code>&#123;name&#125;.demo.json</code> next to the{" "}
          <code>.tsx</code>.
        </li>
        <li>
          <strong>Folder-based</strong> resolution:{" "}
          <code>&#123;folder&#125;/template.demo.json</code>.
        </li>
        <li>
          No matching JSON → the page shows a{" "}
          <strong>&quot;No demo data available&quot;</strong> card.
        </li>
      </ul>

      <CodeBlock title="Preview a template" lang="text">{`/results_p25?demo=true
/initial?demo=true`}</CodeBlock>
    </DocPage>
  );
}
