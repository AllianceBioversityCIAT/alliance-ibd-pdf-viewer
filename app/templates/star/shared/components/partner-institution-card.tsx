import type { ReactNode } from "react";
import type { Institution } from "../sections/results_partners/types";
import { CountryFlag } from "./country-flag";
import {
  getInstitutionHeadquarter,
  getInstitutionIsoAlpha2,
  getInstitutionType,
  getPartnerDisplayName,
} from "../sections/results_partners/rules";
import { InfoCard } from "./info-card";
import { STAR_COLORS } from "../tokens";

const CONTENT_WIDTH_CLASS = "w-full max-w-[521px]";

interface PartnerFieldRowProps {
  label: string;
  value: string;
  leading?: string;
  /** Optional element before the value, e.g. a country flag. */
  prefix?: ReactNode;
}

export function PartnerFieldRow({
  label,
  value,
  leading = "1.15",
  prefix,
}: Readonly<PartnerFieldRowProps>) {
  return (
    <p
      className="text-[10px] break-words m-0"
      style={{ lineHeight: leading }}
    >
      <span className="font-bold" style={{ color: STAR_COLORS.primaryBlue500 }}>
        {label}:
      </span>{" "}
      {prefix && (
        <span className="inline-flex align-middle mr-1 -mt-px">{prefix}</span>
      )}
      <span className="font-normal" style={{ color: STAR_COLORS.bodyText }}>
        {value}
      </span>
    </p>
  );
}

interface CompactInstitutionCardProps {
  className: string;
  displayName: string;
  institutionType: string | null;
  headquarter: string | null;
  isoAlpha2: string | null;
}

/**
 * Same typography as the Alliance Alignment catalog cards (Strategic Objectives):
 * 12px semibold title, then 10px muted lines with no field labels.
 */
function CompactInstitutionCard({
  className,
  displayName,
  institutionType,
  headquarter,
  isoAlpha2,
}: Readonly<CompactInstitutionCardProps>) {
  const lineClass = "text-[10px] leading-[1.3] break-words m-0";
  return (
    <InfoCard className={`${className} py-[10px]! px-[14px]!`}>
      <div className="flex flex-col gap-[4px] min-w-0">
        <p
          className="text-[12px] font-semibold leading-[1.15] break-words m-0"
          style={{ color: STAR_COLORS.cardTitle }}
        >
          {displayName}
        </p>
        {institutionType && (
          <p className={lineClass} style={{ color: STAR_COLORS.greyMuted }}>
            {institutionType}
          </p>
        )}
        {(headquarter || isoAlpha2) && (
          <p className={`${lineClass} flex items-center gap-1`} style={{ color: STAR_COLORS.greyMuted }}>
            {isoAlpha2 && <CountryFlag isoAlpha2={isoAlpha2} />}
            {headquarter && <span>{headquarter}</span>}
          </p>
        )}
      </div>
    </InfoCard>
  );
}

interface PartnerInstitutionCardProps {
  institution: Institution;
  className?: string;
  /** Tighter padding and smaller title — for two-column grids. */
  compact?: boolean;
}

export function PartnerInstitutionCard({
  institution,
  className = CONTENT_WIDTH_CLASS,
  compact = false,
}: Readonly<PartnerInstitutionCardProps>) {
  const institutionType = getInstitutionType(institution);
  const headquarter = getInstitutionHeadquarter(institution);
  const isoAlpha2 = getInstitutionIsoAlpha2(institution);
  const displayName = getPartnerDisplayName(institution);

  if (!displayName) return null;

  if (compact) {
    return (
      <CompactInstitutionCard
        className={className}
        displayName={displayName}
        institutionType={institutionType}
        headquarter={headquarter}
        isoAlpha2={isoAlpha2}
      />
    );
  }

  return (
    <InfoCard className={className}>
      <div className="flex flex-col gap-[10px]">
        <p
          className="text-[12px] font-semibold leading-[1.15] break-words"
          style={{ color: STAR_COLORS.cardTitle }}
        >
          {displayName}
        </p>
        {(institutionType || headquarter || isoAlpha2) && (
          <div className="flex flex-col gap-[8px]">
            {institutionType && (
              <PartnerFieldRow
                label="Institution type"
                value={institutionType}
              />
            )}
            {(headquarter || isoAlpha2) && (
              <PartnerFieldRow
                label="Headquarter"
                value={headquarter ?? ""}
                leading="1.25"
                prefix={isoAlpha2 ? <CountryFlag isoAlpha2={isoAlpha2} /> : undefined}
              />
            )}
          </div>
        )}
      </div>
    </InfoCard>
  );
}

export { CONTENT_WIDTH_CLASS as PARTNER_CARD_WIDTH_CLASS };
