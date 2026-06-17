import type { LinkToResult } from "../types";
import {
  getLinkedResultDisplayTitle,
  getLinkedResultReportingProjectName,
} from "../rules";
import { InfoCard } from "../../shared/components/info-card";
import {
  PARTNER_CARD_WIDTH_CLASS,
  PartnerFieldRow,
} from "../../shared/components/partner-institution-card";
import { STAR_COLORS } from "../../shared/tokens";
import { hasText } from "../../shared/utils";

function ResultTypeFlagIcon() {
  return (
    <svg
      width={10}
      height={10}
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M1.5 1.2v7.6l3.2-1.8 3.2 1.8V1.2H1.5z"
        fill="#3D9E63"
        stroke="#3D9E63"
        strokeWidth={0.4}
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface LinkedResultCardProps {
  entry: LinkToResult;
}

export function LinkedResultCard({ entry }: Readonly<LinkedResultCardProps>) {
  const title = getLinkedResultDisplayTitle(entry);
  if (!title) return null;

  const resultType = entry.result_type_label?.trim();
  const statusValue = entry.qa_status_label?.trim();
  const reportingProjectName = getLinkedResultReportingProjectName(entry);

  const showStatus = hasText(statusValue);
  const showReportingProject = !!reportingProjectName;
  const showDetailRows = showStatus || showReportingProject;

  return (
    <InfoCard className={PARTNER_CARD_WIDTH_CLASS}>
      <div className="flex flex-col gap-[10px]">
        {resultType && (
          <div className="flex items-center gap-1.5">
            <ResultTypeFlagIcon />
            <p
              className="text-[8px] font-[450] leading-[1.15] uppercase tracking-wide m-0"
              style={{ color: STAR_COLORS.greyMuted }}
            >
              {resultType}
            </p>
          </div>
        )}

        <p
          className="text-[12px] font-semibold leading-[1.15] break-words m-0"
          style={{ color: STAR_COLORS.cardTitle }}
        >
          {title}
        </p>

        {showDetailRows && (
          <div className="flex flex-col gap-[8px]">
            {showStatus && statusValue && (
              <PartnerFieldRow label="Status" value={statusValue} />
            )}
            {showReportingProject && reportingProjectName && (
              <PartnerFieldRow
                label="Reporting project"
                value={reportingProjectName}
                leading="1.25"
              />
            )}
          </div>
        )}
      </div>
    </InfoCard>
  );
}
