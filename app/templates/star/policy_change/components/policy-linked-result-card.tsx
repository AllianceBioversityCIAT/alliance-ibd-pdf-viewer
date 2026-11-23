import type { PolicyLinkedResult } from "../types";
import {
  getLinkedResultCode,
  getLinkedResultStatus,
  getLinkedResultYear,
} from "../rules";
import { InfoCard } from "../../shared/components/info-card";
import { PartnerFieldRow } from "../../shared/components/partner-institution-card";
import { FieldLabel } from "../../shared/components/label-value";
import { STAR_COLORS } from "../../shared/tokens";

interface PolicyLinkedResultFieldProps {
  /** STAR field label, e.g. "Link to a reported Innovation Development output" */
  label: string;
  result: PolicyLinkedResult | null;
  emptyText: string;
}

/** One STAR link field: label + result card ("STAR 90146 - title", Status, Reporting year), or an empty note. */
export function PolicyLinkedResultField({
  label,
  result,
  emptyText,
}: Readonly<PolicyLinkedResultFieldProps>) {
  const title = result?.title?.trim();
  const code = result ? getLinkedResultCode(result) : null;
  const status = result ? getLinkedResultStatus(result) : null;
  const year = result ? getLinkedResultYear(result) : null;

  return (
    <div className="flex flex-col gap-[8px] min-w-0">
      <FieldLabel label={label} />
      {title ? (
        <InfoCard className="flex-1">
          <div className="flex flex-col gap-[10px]">
            <p
              className="text-[12px] font-semibold leading-[1.15] break-words m-0"
              style={{ color: STAR_COLORS.cardTitle }}
            >
              {code && <span style={{ color: STAR_COLORS.primaryBlue500 }}>{code} - </span>}
              {title}
            </p>
            {(status || year) && (
              <div className="flex flex-col gap-[8px]">
                {status && <PartnerFieldRow label="Status" value={status} />}
                {year && <PartnerFieldRow label="Reporting year" value={year} />}
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
