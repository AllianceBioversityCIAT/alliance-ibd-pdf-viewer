import type { ReactNode } from "react";

type CalloutType = "info" | "warn" | "danger" | "success";

interface CalloutProps {
  /** Visual tone. Defaults to "info". */
  type?: CalloutType;
  /** Optional bold title line. */
  title?: string;
  children: ReactNode;
}

const STYLES: Record<
  CalloutType,
  { box: string; title: string; body: string }
> = {
  info: {
    box: "border-blue-300 bg-blue-50",
    title: "text-blue-900",
    body: "text-blue-800",
  },
  warn: {
    box: "border-amber-300 bg-amber-50",
    title: "text-amber-900",
    body: "text-amber-800",
  },
  danger: {
    box: "border-red-300 bg-red-50",
    title: "text-red-900",
    body: "text-red-800",
  },
  success: {
    box: "border-[#065f4a]/40 bg-[#065f4a]/5",
    title: "text-[#033529]",
    body: "text-[#065f4a]",
  },
};

/**
 * Tinted callout with a colored left border, one per tone.
 */
export default function Callout({ type = "info", title, children }: CalloutProps) {
  const s = STYLES[type];
  return (
    <div className={`rounded-lg border border-l-4 ${s.box} px-4 py-3 my-4`}>
      {title && (
        <p className={`text-xs font-semibold mb-1 ${s.title}`}>{title}</p>
      )}
      <div className={`text-xs leading-relaxed ${s.body}`}>{children}</div>
    </div>
  );
}
