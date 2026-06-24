import type { Evidence, EvidencePayload } from "./types";
import {
  getEvidenceNumberLabel,
  getNormalizedEvidenceUrl,
  getPublicEvidence,
  hasPrivateEvidence,
  PRIVATE_EVIDENCE_NOTICE,
  PRIVATE_EVIDENCE_TITLE,
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
      className="inline-flex items-center gap-[3px] hover:underline  text-[10px] font-medium leading-normal"
      style={{ color: STAR_COLORS.lightBlue300 }}
    >
      <LinkIcon />
      <span className="pb-0.5"> Access link</span>
    </a>
  );
}

function LockIcon() {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <rect
        x="5"
        y="10"
        width="12"
        height="8.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M8 10V7.25a3 3 0 016 0V10"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="11" cy="14" r="1" fill="currentColor" />
    </svg>
  );
}

function PrivateEvidenceNotice() {
  return (
    <div
      data-paginator-block
      className={`flex items-stretch overflow-hidden rounded-[12px] ${CONTENT_WIDTH_CLASS}`}
    >
      <div
        className="flex flex-col items-center justify-center shrink-0 self-stretch"
        style={{
          width: 70,
          padding: "14px 12px",
          backgroundColor: STAR_COLORS.primaryBlue500,
          color: STAR_COLORS.white,
        }}
      >
        <LockIcon />
      </div>

      <div
        className="flex flex-col gap-[6px] py-[15px] px-[19px] flex-1 min-w-0 justify-center"
        style={{ backgroundColor: STAR_COLORS.cardBg }}
      >
        <p
          className="text-[11px] font-bold leading-[1.15] m-0"
          style={{ color: STAR_COLORS.primaryBlue500 }}
        >
          {PRIVATE_EVIDENCE_TITLE}
        </p>
        <p
          className="text-[11px] leading-[1.35] m-0 break-words"
          style={{ color: STAR_COLORS.bodyText }}
        >
          {PRIVATE_EVIDENCE_NOTICE}
        </p>
      </div>
    </div>
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
            className="text-[9px] font-[450] leading-[1.15] uppercase m-0"
            style={{ color: STAR_COLORS.primaryBlue600 }}
          >
            {getEvidenceNumberLabel(index)}
          </p>

          {shouldShowAccessLink(evidence) && accessUrl && (
            <AccessLink href={accessUrl} />
          )}
        </div>

        {shouldShowEvidenceDescription(evidence) && (
          <p className="text-[11px] leading-[1.25] m-0 break-words">
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

  const publicEvidence = getPublicEvidence(data);
  const showPrivateNotice = hasPrivateEvidence(data);

  return (
    <section className={`flex flex-col gap-[10px] ${CONTENT_WIDTH_CLASS}`}>
      <SectionTitle>Evidence</SectionTitle>

      <div className="flex flex-col gap-[10px]">
        {publicEvidence.map((item, index) => (
          <EvidenceCard
            key={item.result_evidence_id ?? index}
            evidence={item}
            index={index}
          />
        ))}
        {showPrivateNotice && <PrivateEvidenceNotice />}
      </div>
    </section>
  );
}

export type { EvidencePayload };
