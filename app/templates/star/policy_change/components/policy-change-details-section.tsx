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
import { DataTable, type DataTableRow } from "../../shared/components/data-table";
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

function getPolicyDetailRows(data: PolicyChangePayload): DataTableRow[] {
  const rows: { label: string; value: string | null }[] = [
    { label: L.policyType, value: getPolicyTypeLabel(data) },
    { label: L.policyStage, value: getPolicyStageLabel(data) },
    { label: L.usdAmount, value: getUsdAmountLabel(data) },
    { label: L.amountStatus, value: getAmountStatusLabel(data) },
  ];
  const result: DataTableRow[] = rows.filter(
    (row): row is DataTableRow & { value: string } => !!row.value,
  );

  const evidenceStage = getEvidenceStage(data);
  if (evidenceStage) {
    result.push({
      label: L.evidenceStage,
      value: <span className="whitespace-pre-line break-words py-1">{evidenceStage}</span>,
    });
  }
  return result;
}

export function PolicyChangeDetailsSection({ data }: Readonly<PolicyChangeDetailsSectionProps>) {
  if (!shouldRenderSection(data) || !data) return null;

  const detailRows = getPolicyDetailRows(data);
  const organizations = getImplementingOrganizations(data);
  const innovationDevelopment = getInnovationDevelopment(data);
  const innovationUse = getInnovationUse(data);

  return (
    <section className="flex flex-col gap-4 w-full">
      <SectionTitle>{L.sectionTitle}</SectionTitle>

      {detailRows.length > 0 && (
        <div className="flex flex-col gap-2.5" data-paginator-block>
          <SubSectionLabel>{L.policyDetails}</SubSectionLabel>
          <DataTable rows={detailRows} />
        </div>
      )}

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
