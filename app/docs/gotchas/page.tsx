import type { ReactNode } from "react";
import DocPage from "../components/DocPage";
import Callout from "../components/Callout";

type CalloutType = "info" | "warn" | "danger" | "success";

interface Gotcha {
  type: CalloutType;
  title: string;
  body: ReactNode;
}

const GOTCHAS: Gotcha[] = [
  {
    type: "danger",
    title: "Next.js reserved filenames",
    body: (
      <>
        Never name a component file <code>layout.tsx</code>,{" "}
        <code>page.tsx</code>, or <code>loading.tsx</code> inside{" "}
        <code>app/</code> &mdash; Next.js App Router will treat it as a route
        file. The template layout wrapper is named <code>page-shell.tsx</code>{" "}
        for exactly this reason.
      </>
    ),
  },
  {
    type: "warn",
    title: "Entry-point discipline",
    body: (
      <>
        Folder-based templates use <code>template.tsx</code> only &mdash; other{" "}
        <code>.tsx</code> siblings in that folder are not discovered.{" "}
        <code>index.tsx</code> and <code>components.tsx</code> are excluded, and{" "}
        <code>shared/</code> is never discovered as a template (it is only
        imported as a dependency).
      </>
    ),
  },
  {
    type: "warn",
    title: "Single-use UUID",
    body: (
      <>
        The render deletes the stored record after the first read unless{" "}
        <code>?test=true</code> is on the URL. A backend that needs to re-render
        must <code>POST /api/data</code> again for a fresh UUID.
      </>
    ),
  },
  {
    type: "warn",
    title: "Flow layout only",
    body: (
      <>
        Never absolute-position content. The paginator measures{" "}
        <code>getBoundingClientRect()</code> and inserts spacers; absolute
        positioning locks content to a fixed height and breaks that measurement.
      </>
    ),
  },
  {
    type: "success",
    title: "data-paginator-block — USE",
    body: (
      <>
        Add <code>data-paginator-block</code> for 2D layouts (grid / flex-row),
        heading + table pairs, and any group that must stay together as one
        indivisible unit on a page.
      </>
    ),
  },
  {
    type: "danger",
    title: "data-paginator-block — DON'T USE",
    body: (
      <>
        Don&rsquo;t put <code>data-paginator-block</code> on a block containing a
        very long table. Atomic blocks are never split &mdash; only a bare{" "}
        <code>&lt;table&gt;</code> gets row-level splitting. Wrapping a long
        table makes it overflow the page instead of breaking across pages.
      </>
    ),
  },
  {
    type: "danger",
    title: "Double pagination risk",
    body: (
      <>
        The client Paginator already cuts, pads, and footers the document. Keep
        Gotenberg margins at <code>0</code> and pick ONE footer mechanism (the
        client Paginator OR the <code>/&#123;template&#125;/footer</code> route)
        &mdash; otherwise you get double pagination.
      </>
    ),
  },
  {
    type: "danger",
    title: "Defensive coding (non-negotiable)",
    body: (
      <>
        <code>data</code> is typed <code>unknown</code>: cast it to{" "}
        <code>| null</code>, sanitize in <code>transform.ts</code>, and still use{" "}
        <code>?.</code> / <code>?? []</code> inside components. Never non-null
        assert. Test with partial data, not just the full demo JSON.
      </>
    ),
  },
  {
    type: "warn",
    title: "No TTL on DynamoDB",
    body: (
      <>
        The table grows indefinitely. The only cleanup is the one-shot render
        delete plus the admin <code>/api/delete</code> route. The admin{" "}
        <code>Scan</code> reads every item, so cost grows with table size.
      </>
    ),
  },
  {
    type: "info",
    title: "Doc drift",
    body: (
      <>
        The paginator, transform, and types live under{" "}
        <code>app/templates/reportingtool/shared/</code>. PDF generation
        (Gotenberg) is <strong>external</strong> &mdash; this repo only emits
        HTML and stores JSON. Keep that boundary in mind when docs and code
        disagree.
      </>
    ),
  },
];

export default function GotchasPage() {
  return (
    <DocPage
      title="Gotchas & rules"
      lead="The ten rules that keep templates discoverable, the paginator happy, and the data layer safe. Most production bugs in this repo trace back to one of these."
    >
      <ol className="list-none pl-0 space-y-3">
        {GOTCHAS.map((g, i) => (
          <li key={g.title} className="flex gap-3">
            <span className="mt-4 shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#033529] text-xs font-semibold text-white">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <Callout type={g.type} title={g.title}>
                {g.body}
              </Callout>
            </div>
          </li>
        ))}
      </ol>
    </DocPage>
  );
}
