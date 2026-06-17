import DocPage from "../components/DocPage";
import CodeBlock from "../components/CodeBlock";
import Callout from "../components/Callout";

export default function CreateTemplatePage() {
  return (
    <DocPage
      title="Create a template"
      lead="Templates are React .tsx components that receive a single data prop and render to continuous HTML. Two formats are supported: file-based (simple) and folder-based (complex)."
    >
      <Callout type="info" title="The fixed contract">
        Every template <strong>default-exports</strong> a React component and
        receives exactly one prop, <code>{`{ data: unknown }`}</code> (the{" "}
        <code>TemplateProps</code> shape). The loader reads{" "}
        <code>mod.default</code> only — a named export is invisible and an
        undefined default crashes on render. Cast <code>data</code> to your own
        type and treat every field as untrusted.
      </Callout>

      <h2>Simple (file-based)</h2>
      <p>
        A single bare <code>.tsx</code> file becomes a template; its name is the
        filename (minus the extension). Files named <code>index.tsx</code> and{" "}
        <code>components.tsx</code> are excluded.
      </p>
      <ol>
        <li>
          Create <code>app/templates/&#123;project&#125;/&#123;name&#125;.tsx</code>.
        </li>
        <li>
          Import <code>TemplateProps</code> from the templates index (adjust the{" "}
          <code>../</code> depth for your sub-folder).
        </li>
        <li>
          Define a TypeScript interface for your JSON; cast <code>data</code> to{" "}
          <code>YourType | null</code> at entry.
        </li>
        <li>
          <strong>Default-export</strong> a React component that renders the data
          defensively.
        </li>
        <li>
          Optionally create <code>&#123;name&#125;.demo.json</code>; test at{" "}
          <code>/&#123;name&#125;?demo=true</code>.
        </li>
      </ol>

      <p>A minimal file-based template:</p>
      <CodeBlock title="app/templates/starter/initial.tsx" lang="tsx">{`import type { TemplateProps } from "../index";

interface InitialData {
  title?: string;
  body?: string;
}

export default function Initial({ data }: TemplateProps) {
  const d = data as InitialData | null;

  return (
    <div>
      <h1>{d?.title ?? "Untitled"}</h1>
      <p>{d?.body ?? ""}</p>
    </div>
  );
}`}</CodeBlock>

      <p>
        Reference examples: <code>app/templates/starter/initial.tsx</code> and{" "}
        <code>app/templates/aiccra/keko/summary.tsx</code> (single-page, no
        paginator).
      </p>

      <h2>Complex (folder-based)</h2>
      <p>
        A directory containing <code>template.tsx</code> becomes a template; its
        name is the <strong>folder name</strong>. Other <code>.tsx</code>{" "}
        siblings in that folder are NOT discovered, so you can freely organize
        helpers, types, and sub-components alongside it.
      </p>
      <ol>
        <li>
          Create{" "}
          <code>
            app/templates/&#123;project&#125;/&#123;name&#125;/template.tsx
          </code>{" "}
          (discovered as <code>&#123;name&#125;</code>).
        </li>
        <li>
          Add <code>types.ts</code> (interfaces) and <code>transform.ts</code>{" "}
          (sanitize/parse — the safety gate).
        </li>
        <li>
          Add a <code>components/</code> folder. A layout wrapper must be named{" "}
          <code>page-shell.tsx</code>, <strong>never</strong>{" "}
          <code>layout.tsx</code> (Next.js reserves that name inside{" "}
          <code>app/</code>).
        </li>
        <li>
          To get auto page-breaks + footers, render your body inside{" "}
          <code>&lt;Paginator&gt;</code>; optionally override its{" "}
          <code>config</code>.
        </li>
        <li>
          Optionally create <code>template.demo.json</code>; test at{" "}
          <code>/&#123;name&#125;?demo=true</code>.
        </li>
      </ol>

      <p>A typical folder layout:</p>
      <CodeBlock title="app/templates/{project}/{name}/" lang="text">{`{name}/
  template.tsx          ← entry point (discovered as "{name}")
  template.demo.json    ← demo data for ?demo=true
  types.ts              ← TypeScript interfaces
  transform.ts          ← data sanitize/parse — the safety gate
  components/           ← shared sub-components (NOT discovered)
    page-shell.tsx      ← layout wrapper (never name it "layout.tsx")
    ...`}</CodeBlock>

      <Callout type="warn" title="Naming discipline">
        Never name a component file <code>layout.tsx</code>,{" "}
        <code>page.tsx</code>, or <code>loading.tsx</code> inside{" "}
        <code>app/</code> — Next.js treats them as route files. The folder named{" "}
        <code>shared/</code> is reserved and is never discovered as a template;
        it is only imported as a dependency.
      </Callout>

      <p>
        Reference example:{" "}
        <code>app/templates/reportingtool/results_p25/</code>.
      </p>

      <h2>Verify</h2>
      <p>
        Three checks confirm a new template is wired up and rendering correctly:
      </p>
      <ul>
        <li>
          <strong>Discovery:</strong> <code>GET /api/templates</code> lists your
          template by name.
        </li>
        <li>
          <strong>Demo render:</strong> <code>/&#123;name&#125;?demo=true</code>{" "}
          renders the demo JSON.
        </li>
        <li>
          <strong>Pagination:</strong> for multi-page output, add{" "}
          <code>?paperHeight=1000&amp;debug=true</code> to inspect the cut lines,
          then refine <code>data-paginator-block</code> placement.
        </li>
      </ul>

      <CodeBlock title="check discovery" lang="bash">{`curl {{PDF_VIEWER_BASE_URL}}/api/templates`}</CodeBlock>

      <p>Then open the render routes in a browser:</p>
      <CodeBlock title="render checks" lang="text">{`{{PDF_VIEWER_BASE_URL}}/{name}?demo=true
{{PDF_VIEWER_BASE_URL}}/{name}?demo=true&paperHeight=1000&debug=true`}</CodeBlock>

      <Callout type="success" title="Demo mode resolution">
        With <code>?demo=true</code>, file-based templates load{" "}
        <code>&#123;name&#125;.demo.json</code> next to the <code>.tsx</code>;
        folder-based templates load{" "}
        <code>&#123;folder&#125;/template.demo.json</code>. If no JSON is found,
        the page shows a &quot;No demo data available&quot; card.
      </Callout>

      <p>
        While developing against a stored UUID instead of demo data, append{" "}
        <code>?test=true</code> to the render URL so the single-use record
        survives re-renders.
      </p>
    </DocPage>
  );
}
