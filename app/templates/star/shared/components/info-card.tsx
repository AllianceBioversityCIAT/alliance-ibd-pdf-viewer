import type { ReactNode } from "react";
import { STAR_COLORS } from "../tokens";

interface InfoCardProps {
  children: ReactNode;
  className?: string;
}

export function InfoCard({ children, className = "" }: Readonly<InfoCardProps>) {
  return (
    <div
      data-paginator-block
      className={`rounded-[12px] py-[15px] px-[19px] w-full ${className}`.trim()}
      style={{ backgroundColor: STAR_COLORS.cardBg }}
    >
      {children}
    </div>
  );
}

interface PrimaryBadgeProps {
  label?: string;
}

function PrimaryStarIcon() {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden
      className="shrink-0"
    >
      <path d="M6 1.2 7.4 4.6H11l-2.8 2 1.1 3.4L6 9.1 3.7 10l1.1-3.4-2.8-2h3.6L6 1.2z" />
    </svg>
  );
}

/** Outlined pill with the portfolio years, e.g. "Portfolio 2026–2030" (next to Reporting year). */
export function PortfolioTag({ label }: Readonly<{ label: string }>) {
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full border px-[8px] py-[3px] text-[8px] font-medium leading-none whitespace-nowrap"
      style={{ borderColor: STAR_COLORS.lightBlue300, color: STAR_COLORS.primaryBlue500 }}
    >
      {label}
    </span>
  );
}

/** Outlined pill for projects that contribute to the CGIAR Portfolio (STAR `pool-funding` tag). */
export function PoolFundingBadge({ label }: Readonly<{ label: string }>) {
  return (
    <span
      className="inline-flex w-max items-center rounded-full border px-2 py-[3px] text-[8px] font-medium leading-none whitespace-nowrap"
      style={{
        borderColor: STAR_COLORS.lightBlue300,
        backgroundColor: STAR_COLORS.white,
        color: STAR_COLORS.lightBlue300,
      }}
    >
      {label}
    </span>
  );
}

/** Pill badge for primary contributing projects — matches STAR app primary control (read-only in PDF). */
export function PrimaryBadge({ label = "Primary" }: Readonly<PrimaryBadgeProps>) {
  return (
    <span
      className="inline-flex w-max items-center gap-0.5 rounded-full border px-2 pl-1.5 py-[3px] text-[8px] font-medium leading-none whitespace-nowrap"
      style={{
        borderColor: STAR_COLORS.primaryBadge,
        backgroundColor: STAR_COLORS.primaryBadge,
        color: STAR_COLORS.white,
      }}
    >
      <PrimaryStarIcon />
      {label}
    </span>
  );
}
