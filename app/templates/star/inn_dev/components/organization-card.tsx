import type { InnovationDetailsPayload, InstitutionType } from "../types";
import {
  getKnownOrganizationName,
  getOrganizationCustomName,
  getOrganizationNumberLabel,
  getOrganizationSubtypeDisplay,
  getOrganizationTypeDisplay,
  isOrganizationKnown,
} from "../rules";
import { InfoCard } from "../../shared/components/info-card";
import { STAR_COLORS } from "../../shared/tokens";

const CONTENT_WIDTH_CLASS = "w-full max-w-[521px]";

function CardNumberLabel({ label }: Readonly<{ label: string }>) {
  return (
    <p
      className="text-[9px] font-[450] leading-[1.15] uppercase m-0"
      style={{ color: STAR_COLORS.primaryBlue600 }}
    >
      {label}
    </p>
  );
}

interface InlineFieldProps {
  label: string;
  value: string;
}

function InlineField({ label, value }: Readonly<InlineFieldProps>) {
  return (
    <span className="text-[10px] break-words leading-[1.15] whitespace-nowrap">
      <span className="font-bold" style={{ color: STAR_COLORS.primaryBlue500 }}>
        {label}:
      </span>{" "}
      <span className="font-normal" style={{ color: STAR_COLORS.bodyText }}>
        {value}
      </span>
    </span>
  );
}

interface OrganizationCardProps {
  payload: InnovationDetailsPayload;
  entry: InstitutionType;
  index: number;
}

export function OrganizationCard({
  payload,
  entry,
  index,
}: Readonly<OrganizationCardProps>) {
  const known = isOrganizationKnown(entry);
  const institutionName = getKnownOrganizationName(payload, entry);
  const customName = getOrganizationCustomName(entry);
  const organizationType = getOrganizationTypeDisplay(payload, entry);
  const subtype = getOrganizationSubtypeDisplay(payload, entry);

  if (!institutionName && !customName && !organizationType && !subtype) {
    return null;
  }

  const fields: { label: string; value: string }[] = [];

  if (known && institutionName) {
    fields.push({ label: "Organization", value: institutionName });
  } else {
    if (customName) {
      fields.push({ label: "Name", value: customName });
    }
    if (organizationType) {
      fields.push({ label: "Organization type", value: organizationType });
    }
    if (subtype) {
      fields.push({ label: "Organization subtype", value: subtype });
    }
  }

  return (
    <InfoCard className={CONTENT_WIDTH_CLASS}>
      <div className="flex flex-col gap-[11px]">
        <CardNumberLabel label={getOrganizationNumberLabel(index)} />
        <div className="flex flex-row flex-wrap items-baseline gap-x-6 gap-y-1">
          {fields.map((field) => (
            <InlineField
              key={field.label}
              label={field.label}
              value={field.value}
            />
          ))}
        </div>
      </div>
    </InfoCard>
  );
}

export { CONTENT_WIDTH_CLASS as ORGANIZATION_CARD_WIDTH_CLASS };
