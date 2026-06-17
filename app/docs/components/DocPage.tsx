import type { ReactNode } from "react";

interface DocPageProps {
  /** Page H1. */
  title: string;
  /** Optional intro paragraph under the title. */
  lead?: string;
  children: ReactNode;
}

/**
 * Layout helper for a single doc page.
 *
 * Wraps content in a max-w-3xl article column. Section pages render plain
 * <h2>/<h3>/<p> inside `children`; the `prose-like` group styles them
 * consistently (headings get spacing + neutral-900, paragraphs neutral-600).
 */
export default function DocPage({ title, lead, children }: DocPageProps) {
  return (
    <article className="prose-like max-w-3xl">
      <h1 className="text-neutral-900 text-3xl font-semibold tracking-tight">
        {title}
      </h1>
      {lead && (
        <p className="mt-3 text-neutral-500 text-base leading-relaxed">{lead}</p>
      )}

      {/*
        Section-level typography. Pages use bare h2/h3/p — these styles apply
        via the prose-like wrapper so individual pages stay markup-light.
      */}
      <div
        className="
          mt-8 space-y-4
          [&_h2]:text-neutral-900 [&_h2]:text-xl [&_h2]:font-semibold
          [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-3
          [&_h3]:text-neutral-900 [&_h3]:text-base [&_h3]:font-semibold
          [&_h3]:mt-6 [&_h3]:mb-2
          [&_p]:text-neutral-600 [&_p]:text-sm [&_p]:leading-relaxed
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:text-sm [&_ul]:text-neutral-600
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:text-sm [&_ol]:text-neutral-600
          [&_li]:leading-relaxed
          [&_a]:text-[#065f4a] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-[#11d4b3]
          [&_code]:font-mono [&_code]:text-xs [&_code]:text-[#065f4a]
          [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded
          [&_strong]:text-neutral-900 [&_strong]:font-semibold
        "
      >
        {children}
      </div>
    </article>
  );
}
