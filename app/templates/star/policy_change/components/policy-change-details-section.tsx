import type { PolicyChangePayload } from "../types";
import {
  getAmountStatusLabel,
  getEvidenceStage,
  getImplementingOrganizations,
  getInnovationDevelopment,
  getInnovationUse,
  getPolicyStageLabel,
  getPolicyTypeLabel,
  getUsdAmountLabel,
  shouldRenderSection,
} from "../rules";
import { POLICY_CHANGE_LABELS as L } from "../catalogs";
import { SectionTitle, SubSectionLabel } from "../../shared/components/section-title";
import { LabelValueRow } from "../../shared/components/label-value";
import { StatusBadge } from "../../shared/components/status-badge";
import { STAR_COLORS } from "../../shared/tokens";
import {
  PARTNER_CARD_WIDTH_CLASS,
  PartnerInstitutionCard,
} from "../../shared/components/partner-institution-card";
import { PolicyLinkedResultField } from "./policy-linked-result-card";

function pairs<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return rows;
}

interface PolicyChangeDetailsSectionProps {
  data: PolicyChangePayload | null | undefined;
}

/** "Label: value" rows, same as General Information / Innovation Details. Status sits as a pill after the amount. */
function PolicyDetailRows({ data }: Readonly<{ data: PolicyChangePayload }>) {
  const policyType = getPolicyTypeLabel(data);
  const stage = getPolicyStageLabel(data);
  const usdAmount = getUsdAmountLabel(data);
  const amountStatus = getAmountStatusLabel(data);
  const evidenceStage = getEvidenceStage(data);

  if (!policyType && !stage && !usdAmount && !amountStatus && !evidenceStage) return null;

  return (
    <div className="flex flex-col gap-2.5" data-paginator-block>
      <SubSectionLabel>{L.policyDetails}</SubSectionLabel>
      <div className="flex flex-col gap-2">
        {policyType && <LabelValueRow label={L.policyType} value={policyType} />}
        {stage && <LabelValueRow label={L.policyStage} value={stage} />}
        {usdAmount && (
          <p className="text-[11px] leading-[1.25] w-full m-0">
            <span className="font-bold" style={{ color: STAR_COLORS.primaryBlue500 }}>
              {L.usdAmount}:
            </span>{" "}
            <span style={{ color: STAR_COLORS.bodyText }}>{usdAmount}</span>
            {amountStatus && (
              <span className="inline-flex align-middle ml-2 -mt-px">
                <StatusBadge name={amountStatus} />
              </span>
            )}
          </p>
        )}
        {/* Status without an amount still shows as its own row */}
        {!usdAmount && amountStatus && <LabelValueRow label={L.amountStatus} value={amountStatus} />}
        {evidenceStage && (
          <p className="text-[11px] leading-[1.25] w-full m-0 whitespace-pre-line break-words">
            <span className="font-bold" style={{ color: STAR_COLORS.primaryBlue500 }}>
              {L.evidenceStage}:
            </span>{" "}
            <span style={{ color: STAR_COLORS.bodyText }}>{evidenceStage}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export function PolicyChangeDetailsSection({ data }: Readonly<PolicyChangeDetailsSectionProps>) {
  if (!shouldRenderSection(data) || !data) return null;

  const organizations = getImplementingOrganizations(data);
  const innovationDevelopment = getInnovationDevelopment(data);
  const innovationUse = getInnovationUse(data);

  return (
    <section className="flex flex-col gap-4 w-full">
      <SectionTitle>{L.sectionTitle}</SectionTitle>

      <PolicyDetailRows data={data} />

      {organizations.length > 0 && (
        <div className={`flex flex-col gap-[10px] ${PARTNER_CARD_WIDTH_CLASS}`}>
          <SubSectionLabel>{L.implementingOrganizations}</SubSectionLabel>
          {/* Two compact cards per row; each row is one paginator block */}
          {pairs(organizations).map((row, r) => (
            <div
              key={row.map((org, i) => `${org.institution_id ?? "org"}-${r}-${i}`).join("|")}
              data-paginator-block
              className="grid grid-cols-2 gap-[8px]"
            >
              {row.map((institution, i) => (
                <PartnerInstitutionCard
                  key={`${institution.institution_id ?? "org"}-${r}-${i}`}
                  institution={institution}
                  className="w-full h-full"
                  compact
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {(innovationDevelopment || innovationUse) && (
        <div className={`flex flex-col gap-[10px] ${PARTNER_CARD_WIDTH_CLASS}`} data-paginator-block>
          <SubSectionLabel>{L.linkedResults}</SubSectionLabel>
          {/* Two fields side by side, like the STAR form */}
          <div className="grid grid-cols-2 gap-[10px]">
            <PolicyLinkedResultField
              label={L.innovationDevelopment}
              result={innovationDevelopment}
              emptyText={L.noLinkedResult}
              showPdfLink
            />
            <PolicyLinkedResultField
              label={L.innovationUse}
              result={innovationUse}
              emptyText={L.noLinkedResult}
            />
          </div>
        </div>
      )}
    </section>
  );
}
