import Image from "next/image";
import type { ReactNode } from "react";
import { Paginator } from "@/app/templates/reportingtool/shared/components/paginator";
import { STAR_COLORS, STAR_FONT_IMPORT, STAR_FONTS } from "../tokens";

/** Figma node 34466:20857 — full header bar (595×131) */
export const STAR_HEADER_IMAGE = "/assets/star/header.svg";
/** Compact footer on pages 1…N-1 (521×14) */
export const STAR_FOOTER_GENERAL_IMAGE = "/assets/star/footer-general.svg";
/** Full footer on the last page only (595×111) */
export const STAR_FOOTER_LAST_IMAGE = "/assets/star/footer.svg";

/** Serializable only — Paginator is a Client Component */
const STAR_PAGINATION_CONFIG = {
  footerHeight: 14,
  marginBottom: 12,
  firstPage: { marginTop: 0 },
  footerVariant: "star" as const,
  starFooter: {
    generalHeight: 14,
    lastHeight: 111,
  },
};

export interface PageShellProps {
  title: string;
  resultSubtitle?: string | null;
  generatedAt?: string | null;
  children: ReactNode;
}

export function PageShell({
  title,
  resultSubtitle,
  generatedAt,
  children,
}: Readonly<PageShellProps>) {
  const disclaimer = generatedAt
    ? `This report was generated on ${generatedAt}. Please note that the contents of this report may change in the future as it is dependent on the data registered into the STAR platform at a given time during a specific phase.`
    : "Please note that the contents of this report may change in the future as it is dependent on the data registered into the STAR platform at a given time during a specific phase.";

  return (
    <div
      className="bg-white relative w-full"
      style={{ fontFamily: STAR_FONTS }}
    >
      <style>{STAR_FONT_IMPORT}</style>

      <div data-paginator-block className="w-full">
        <Image
          src={STAR_HEADER_IMAGE}
          alt="STAR — Alliance Bioversity & CIAT"
          width={595}
          height={131}
          className="w-full h-[131px] object-cover object-left"
          priority
        />
      </div>

      <div className="px-[37px] pt-5 pb-2.5 flex flex-col gap-2.5" data-paginator-block>
        <div className="flex flex-col gap-1">
          <h1
            className="text-[22px] font-bold leading-none"
            style={{ color: STAR_COLORS.lightBlue300 }}
          >
            {title}
          </h1>
          {resultSubtitle && (
            <p
              className="text-[12px] font-bold leading-[1.15]"
              style={{ color: STAR_COLORS.bodyText }}
            >
              {resultSubtitle}
            </p>
          )}
        </div>
        <p
          className="text-[9px] font-light leading-normal"
          style={{ color: STAR_COLORS.greyMuted }}
        >
          {disclaimer}
        </p>
      </div>

      <div
        className="h-[11px] w-full"
        style={{
          background: `linear-gradient(to right, ${STAR_COLORS.gradientFrom} 44.45%, ${STAR_COLORS.gradientTo})`,
        }}
        aria-hidden
      />

      <Paginator
        className="flex flex-col gap-5 px-[37px] pt-5 pb-10"
        config={STAR_PAGINATION_CONFIG}
      >
        {children}
      </Paginator>
    </div>
  );
}
