import type { ReactNode } from "react";
import { STAR_COLORS } from "../tokens";

interface SectionTitleProps {
  children: ReactNode;
}

export function SectionTitle({ children }: Readonly<SectionTitleProps>) {
  return (
    <h2
      className="text-[15px] font-[600] leading-[1.15] w-full"
      style={{ color: STAR_COLORS.lightBlue300 }}
    >
      {children}
    </h2>
  );
}

interface SubSectionLabelProps {
  children: ReactNode;
}

export function SubSectionLabel({ children }: Readonly<SubSectionLabelProps>) {
  return (
    <p
      className="text-[11px] font-normal leading-[1.15] uppercase"
      style={{ color: STAR_COLORS.greySubheading }}
    >
      {children}
    </p>
  );
}

interface SubSectionBlockProps {
  title: string;
  children: ReactNode;
  className?: string;
  /** When true, marks the block atomic for PDF pagination. */
  paginatorBlock?: boolean;
}

/**
 * Alliance Alignment subsection layout: SubSectionLabel + content with gap-[10px].
 * Use gap-[15px] between multiple SubSectionBlocks (e.g. Primary vs Contributing levers).
 */
export function SubSectionBlock({
  title,
  children,
  className = "",
  paginatorBlock = false,
}: Readonly<SubSectionBlockProps>) {
  return (
    <div
      className={`flex flex-col gap-[10px] w-full max-w-[521px] pt-2 ${className}`.trim()}
      {...(paginatorBlock ? { "data-paginator-block": true } : {})}
    >
      <SubSectionLabel>{title}</SubSectionLabel>
      <div className="flex flex-col gap-[10px]">{children}</div>
    </div>
  );
}
