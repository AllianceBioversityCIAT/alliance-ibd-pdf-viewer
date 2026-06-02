import type { Institution } from "../sections/results_partners/types";
import {
  getInstitutionHeadquarter,
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
}

function PartnerFieldRow({
  label,
  value,
  leading = "1.15",
}: Readonly<PartnerFieldRowProps>) {
  return (
    <p
      className="text-[10px] break-words m-0"
      style={{ lineHeight: leading }}
    >
      <span className="font-bold" style={{ color: STAR_COLORS.primaryBlue500 }}>
        {label}:
      </span>{" "}
      <span className="font-normal" style={{ color: STAR_COLORS.bodyText }}>
        {value}
      </span>
    </p>
  );
}

interface PartnerInstitutionCardProps {
  institution: Institution;
  className?: string;
}

export function PartnerInstitutionCard({
  institution,
  className = CONTENT_WIDTH_CLASS,
}: Readonly<PartnerInstitutionCardProps>) {
  const institutionType = getInstitutionType(institution);
  const headquarter = getInstitutionHeadquarter(institution);
  const displayName = getPartnerDisplayName(institution);

  if (!displayName) return null;

  return (
    <InfoCard className={className}>
      <div className="flex flex-col gap-[10px]">
        <p
          className="text-[12px] font-semibold leading-[1.15] break-words"
          style={{ color: STAR_COLORS.cardTitle }}
        >
          {displayName}
        </p>
        {(institutionType || headquarter) && (
          <div className="flex flex-col gap-[8px]">
            {institutionType && (
              <PartnerFieldRow
                label="Institution type"
                value={institutionType}
              />
            )}
            {headquarter && (
              <PartnerFieldRow
                label="Headquarter"
                value={headquarter}
                leading="1.25"
              />
            )}
          </div>
        )}
      </div>
    </InfoCard>
  );
}

export { CONTENT_WIDTH_CLASS as PARTNER_CARD_WIDTH_CLASS };
