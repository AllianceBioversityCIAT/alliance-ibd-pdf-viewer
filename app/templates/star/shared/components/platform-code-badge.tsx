/** Same map as the STAR client (`shared/constants/platform-colors.ts`). */
export const PLATFORM_COLOR_MAP: Record<string, { text: string; background: string }> = {
  STAR: { text: "#1689CA", background: "#E6F2FF" },
  TIP: { text: "#F58220", background: "#FEF2E6" },
  PRMS: { text: "#7F92FE", background: "#F0F3FF" },
  AICCRA: { text: "#699863", background: "#ADD16B33" },
};

/** Unknown platform, or code with no platform: neutral grey. */
const UNKNOWN_PLATFORM_COLORS = { text: "#555554", background: "#EDEDED" };

export function getPlatformColors(platform: string): { text: string; background: string } {
  return PLATFORM_COLOR_MAP[platform.trim().toUpperCase()] ?? UNKNOWN_PLATFORM_COLORS;
}

interface PlatformCodeBadgeProps {
  /** STAR, TIP, PRMS, AICCRA… (any value; unknown ones render grey) */
  platform?: string | null;
  code: string;
}

/**
 * Outlined pill "STAR 9150", same shape as the status tag (APPROVED / SUBMITTED):
 * border and text in the platform color (STAR client `platform-colors.ts`).
 */
export function PlatformCodeBadge({ platform, code }: Readonly<PlatformCodeBadgeProps>) {
  const label = typeof platform === "string" ? platform.trim() : "";
  const color = (label ? getPlatformColors(label) : UNKNOWN_PLATFORM_COLORS).text;

  return (
    <span
      className="inline-flex w-fit items-center gap-[3px] rounded-full border px-2 py-[2px] text-[9px] font-bold uppercase leading-none tracking-[0.02em] whitespace-nowrap"
      style={{ borderColor: color, color }}
    >
      {label && <span>{label}</span>}
      <span>{code}</span>
    </span>
  );
}
