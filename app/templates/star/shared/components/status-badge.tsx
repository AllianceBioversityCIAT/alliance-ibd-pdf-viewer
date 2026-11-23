import { STAR_COLORS } from "../tokens";

/** STAR default status color (same fallback as the STAR custom-tag). */
export const DEFAULT_STATUS_COLOR = STAR_COLORS.lightBlue300;

/** Only accepts #rgb / #rrggbb; anything else falls back. */
export function safeHexColor(value: unknown, fallback: string = DEFAULT_STATUS_COLOR): string {
  if (typeof value !== "string") return fallback;
  const color = value.trim();
  return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(color) ? color : fallback;
}

interface StatusBadgeProps {
  name: string | null | undefined;
  borderColor?: string | null;
  textColor?: string | null;
}

/** Outlined uppercase status pill — same as the PDF header status (e.g. "OICR ACCEPTED"). */
export function StatusBadge({ name, borderColor, textColor }: Readonly<StatusBadgeProps>) {
  const label = typeof name === "string" ? name.trim() : "";
  if (!label) return null;

  return (
    <span
      className="inline-flex w-fit items-center rounded-full border px-2 py-[2px] text-[9px] font-bold uppercase leading-none tracking-[0.02em]"
      style={{
        borderColor: safeHexColor(borderColor),
        color: safeHexColor(textColor),
      }}
    >
      {label}
    </span>
  );
}
