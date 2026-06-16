interface CodeBlockProps {
  /** Raw code text. Passed as a string child (no syntax highlighting). */
  children: string;
  /** Optional title bar label. */
  title?: string;
  /** Optional language tag shown on the right of the title bar. */
  lang?: string;
}

/**
 * Bordered code block. No highlighting library — plain mono <pre>.
 */
export default function CodeBlock({ children, title, lang }: CodeBlockProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 overflow-hidden my-4">
      {(title || lang) && (
        <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-1.5">
          <span className="text-neutral-500 text-[11px] font-medium">
            {title}
          </span>
          {lang && (
            <span className="text-neutral-400 text-[10px] uppercase tracking-wider font-mono">
              {lang}
            </span>
          )}
        </div>
      )}
      <pre className="font-mono text-xs text-neutral-700 whitespace-pre-wrap overflow-x-auto px-3 py-3 leading-relaxed">
        {children}
      </pre>
    </div>
  );
}
