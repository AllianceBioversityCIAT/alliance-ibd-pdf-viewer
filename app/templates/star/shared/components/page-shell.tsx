import Image from "next/image";
import type { ReactNode } from "react";
import { Paginator } from "@/app/templates/reportingtool/shared/components/paginator";
import { STAR_COLORS, STAR_FONT_IMPORT, STAR_FONTS } from "../tokens";
import type { StatusDisplay } from "../sections/general_information/types";
import { StatusBadge } from "./status-badge";

/** Figma node 34466:20857 — full header bar (595×131) */
export const STAR_HEADER_IMAGE = "/assets/star/header.png";
/** Compact footer on pages 1…N-1 (521×14) */
export const STAR_FOOTER_GENERAL_IMAGE = "/assets/star/footer-general.svg";
/** Full footer on the last page only (595×112) */
export const STAR_FOOTER_LAST_IMAGE = "/assets/star/footer.png";

/** Serializable only — Paginator is a Client Component */
const STAR_PAGINATION_CONFIG = {
  footerHeight: 14,
  marginBottom: 12,
  firstPage: { marginTop: 0 },
  footerVariant: "star" as const,
  starFooter: {
    generalHeight: 14,
    generalBottomOffset: 12,
    lastHeight: 112,
  },
};

type HeaderResultCode = string | number | null;

export interface PageShellProps {
  title: string;
  resultCode?: HeaderResultCode;
  indicator?: string | null;
  resultSubtitle?: string | null;
  generatedAt?: string | null;
  status?: StatusDisplay | null;
  children: ReactNode;
}

const STATUS_NOTE_BACKGROUND_COLOR = "#F7F8F9";

function HeaderStatusBadge({ status }: Readonly<{ status?: StatusDisplay | null }>) {
  return (
    <StatusBadge
      name={status?.status_name}
      borderColor={status?.status_border_color}
      textColor={status?.status_text_color}
    />
  );
}

function StatusNote({ status }: Readonly<{ status?: StatusDisplay | null }>) {
  const description = status?.status_description?.trim();
  if (!description) return null;

  return (
    <div
      className="mb-2 flex items-center gap-2.5 px-3 py-2"
      style={{
        backgroundColor: STATUS_NOTE_BACKGROUND_COLOR,
        borderLeft: `4px solid ${STAR_COLORS.primaryBlue500}`,
      }}
    >
      <span
        className="flex h-[13px] w-[13px] shrink-0 rotate-180 items-center justify-center rounded-full border text-[9px] font-semibold leading-none"
        style={{
          borderColor: STAR_COLORS.primaryBlue500,
          color: STAR_COLORS.primaryBlue500,
        }}
        aria-hidden
      >
        i
      </span>
      <p
        className="text-[9px] font-light leading-normal"
        style={{ color: STAR_COLORS.greyMuted }}
      >
        {description}
      </p>
    </div>
  );
}

function getHeaderSubtitle({
  resultCode,
  indicator,
  resultSubtitle,
}: Readonly<{
  resultCode?: HeaderResultCode;
  indicator?: string | null;
  resultSubtitle?: string | null;
}>): string | null | undefined {
  const normalizedIndicator = indicator?.trim();

  if (resultCode != null && normalizedIndicator) {
    return `Result code #${resultCode} - ${normalizedIndicator}`;
  }
  if (resultCode != null) return `Result code #${resultCode}`;
  if (normalizedIndicator) return normalizedIndicator;
  return resultSubtitle;
}

function HeaderMetadata({
  resultCode,
  indicator,
  resultSubtitle,
  status,
}: Readonly<{
  resultCode?: HeaderResultCode;
  indicator?: string | null;
  resultSubtitle?: string | null;
  status?: StatusDisplay | null;
}>) {
  const subtitle = getHeaderSubtitle({ resultCode, indicator, resultSubtitle });

  if (!status?.status_name?.trim() && !subtitle) return null;

  return (
    <div
      className="flex items-center gap-2 text-[12px] font-bold leading-[1.15]"
      style={{ color: STAR_COLORS.bodyText }}
    >
      <HeaderStatusBadge status={status} />
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

export function PageShell({
  title,
  resultCode,
  indicator,
  resultSubtitle,
  generatedAt,
  status,
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
            className="text-[22px] font-[600] leading-none pb-1"
            style={{ color: STAR_COLORS.lightBlue300 }}
          >
            {title}
          </h1>
          <HeaderMetadata
            resultCode={resultCode}
            indicator={indicator}
            resultSubtitle={resultSubtitle}
            status={status}
          />
        </div>
        <p
          className="text-[9px] font-light leading-normal"
          style={{ color: STAR_COLORS.greyMuted }}
        >
          {disclaimer}
        </p>
        <StatusNote status={status} />
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
