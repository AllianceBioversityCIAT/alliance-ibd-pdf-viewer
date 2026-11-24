import type { PolicyLinkedResult } from "../types";
import {
  getLinkedResultCode,
  getLinkedResultPdfUrl,
  getLinkedResultStatus,
  getLinkedResultYear,
} from "../rules";
import { InfoCard } from "../../shared/components/info-card";
import { FieldLabel } from "../../shared/components/label-value";
import { StatusBadge } from "../../shared/components/status-badge";
import { PlatformCodeBadge } from "../../shared/components/platform-code-badge";
import { AccessLink } from "../../shared/components/access-link";
import { STAR_COLORS } from "../../shared/tokens";

interface PolicyLinkedResultFieldProps {
  /** STAR field label, e.g. "Link to a reported Innovation Development output" */
  label: string;
  result: PolicyLinkedResult | null;
  emptyText: string;
  /** Show the "Access link" when the result has `pdf_url` (Innovation Development only for now). */
  showPdfLink?: boolean;
}

/** Reporting year in the same pill shape as the status tag, neutral grey, no label. */
function YearPill({ year }: Readonly<{ year: string }>) {
  return (
    <span
      className="inline-flex w-fit items-center rounded-full border px-2 py-[2px] text-[9px] font-bold leading-none tracking-[0.02em]"
      style={{ borderColor: STAR_COLORS.grey500, color: STAR_COLORS.greyMuted }}
    >
      {year}
    </span>
  );
}

/** One STAR link field: label + card (status tag + year pill, platform code badge, title), or an empty note. */
export function PolicyLinkedResultField({
  label,
  result,
  emptyText,
  showPdfLink = false,
}: Readonly<PolicyLinkedResultFieldProps>) {
  const title = result?.title?.trim();
  const code = result ? getLinkedResultCode(result) : null;
  const status = result ? getLinkedResultStatus(result) : null;
  const year = result ? getLinkedResultYear(result) : null;
  const pdfUrl = showPdfLink && result ? getLinkedResultPdfUrl(result) : null;

  return (
    <div className="flex flex-col gap-[8px] min-w-0">
      <FieldLabel label={label} />
      {title ? (
        <InfoCard className="flex-1">
          <div className="flex flex-col gap-[10px]">
            {/* One top row: [PLATFORM code], status tag, year */}
            {(code || status || year) && (
              <div className="flex flex-wrap items-center gap-[6px]">
                {code && <PlatformCodeBadge platform={code.platform} code={code.code} />}
                {status && (
                  <StatusBadge
                    name={status.name}
                    borderColor={status.borderColor}
                    textColor={status.textColor}
                  />
                )}
                {year && <YearPill year={year} />}
              </div>
            )}
            <p
              className="text-[12px] font-semibold leading-[1.15] break-words m-0"
              style={{ color: STAR_COLORS.cardTitle }}
            >
              {title}
            </p>
            {/* Access link to the linked result's PDF, below the title */}
            {pdfUrl && (
              <div className="-mt-[4px]">
                <AccessLink href={pdfUrl} />
              </div>
            )}
          </div>
        </InfoCard>
      ) : (
        <p className="text-[10px] italic leading-[1.25] m-0" style={{ color: STAR_COLORS.greyMuted }}>
          {emptyText}
        </p>
      )}
    </div>
  );
}
