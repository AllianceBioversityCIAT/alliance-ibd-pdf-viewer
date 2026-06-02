import type { Evidence, EvidencePayload } from "./types";
import {
  getActiveEvidence,
  getEvidenceNumberLabel,
  getNormalizedEvidenceUrl,
  shouldRenderEvidenceList,
  shouldRenderSection,
  shouldShowAccessLink,
  shouldShowEvidenceDescription,
} from "./rules";
import { SectionTitle } from "../../components/section-title";
import { InfoCard } from "../../components/info-card";
import { STAR_COLORS } from "../../tokens";

const CONTENT_WIDTH_CLASS = "w-full max-w-[521px]";

interface EvidenceSectionProps {
  data: EvidencePayload | null | undefined;
}

function LinkIcon() {
  return (
    <svg
      width={10}
      height={10}
      viewBox="0 0 11 11"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M4.5 1.5H2.75C2.06 1.5 1.5 2.06 1.5 2.75V8.25C1.5 8.94 2.06 9.5 2.75 9.5H8.25C8.94 9.5 9.5 8.94 9.5 8.25V6.5"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinecap="round"
      />
      <path
        d="M6 1.5H9.5V5M9.5 1.5L5 6"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AccessLink({ href }: Readonly<{ href: string }>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-[3px] text-[10px] font-medium leading-normal"
      style={{ color: STAR_COLORS.lightBlue300 }}
    >
      <LinkIcon />
      Access link
    </a>
  );
}

function EvidenceCard({
  evidence,
  index,
}: Readonly<{ evidence: Evidence; index: number }>) {
  const accessUrl = getNormalizedEvidenceUrl(evidence);

  return (
    <InfoCard className={CONTENT_WIDTH_CLASS}>
      <div className="flex flex-col gap-[10px]">
        <div className="flex items-center justify-between gap-3">
          <p
            className="text-[10px] font-[450] leading-[1.15] uppercase m-0"
            style={{ color: STAR_COLORS.primaryBlue600 }}
          >
            {getEvidenceNumberLabel(index)}
          </p>

          {shouldShowAccessLink(evidence) && accessUrl && (
            <AccessLink href={accessUrl} />
          )}
        </div>

        {shouldShowEvidenceDescription(evidence) && (
          <p className="text-[10px] leading-[1.25] m-0 break-words">
            <span className="font-bold" style={{ color: STAR_COLORS.primaryBlue500 }}>
              Evidence description:
            </span>{" "}
            <span style={{ color: STAR_COLORS.bodyText }}>
              {evidence.evidence_description.trim()}
            </span>
          </p>
        )}
      </div>
    </InfoCard>
  );
}

export function EvidenceSection({ data }: Readonly<EvidenceSectionProps>) {
  if (!shouldRenderSection(data) || !data) return null;

  const evidence = getActiveEvidence(data);

  if (!shouldRenderEvidenceList(data)) return null;

  return (
    <section className={`flex flex-col gap-[10px] ${CONTENT_WIDTH_CLASS}`}>
      <SectionTitle>Evidence</SectionTitle>

      <div className="flex flex-col gap-[10px]">
        {evidence.map((item, index) => (
          <EvidenceCard
            key={item.result_evidence_id ?? index}
            evidence={item}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

export type { EvidencePayload };
