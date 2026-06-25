import type { CapSharingPayload } from "../types";
import {
  getOrganizationInstitutions,
  shouldRenderGroupBlock,
  shouldRenderIndividualBlock,
  shouldRenderOrganizations,
  shouldRenderSection,
  shouldRenderTrainingDetails,
  shouldRenderTrainingType,
} from "../rules";
import { SectionTitle, SubSectionLabel } from "../../shared/components/section-title";
import {
  PARTNER_CARD_WIDTH_CLASS,
  PartnerInstitutionCard,
} from "../../shared/components/partner-institution-card";
import { DataTable } from "../../shared/components/data-table";
import { getTrainingDetailRows } from "./training-details-rows";
import { getTrainingTypeTableRows } from "./training-type-rows";
import { getGroupTrainingTableRows } from "./group-training-rows";
import { getIndividualTrainingTableRows } from "./individual-training-rows";

interface CapSharingDetailsSectionProps {
  data: CapSharingPayload | null | undefined;
}

export function CapSharingDetailsSection({
  data,
}: Readonly<CapSharingDetailsSectionProps>) {
  if (!shouldRenderSection(data) || !data) return null;

  const trainingTypeRows = getTrainingTypeTableRows(data);
  const groupRows = getGroupTrainingTableRows(data);
  const individualRows = getIndividualTrainingTableRows(data);
  const organizationInstitutions = getOrganizationInstitutions(data);
  const trainingDetailRows = getTrainingDetailRows(data);
  const hasVisibleContent =
    trainingTypeRows.length > 0 ||
    groupRows.length > 0 ||
    individualRows.length > 0 ||
    organizationInstitutions.length > 0 ||
    trainingDetailRows.length > 0;

  if (!hasVisibleContent) return null;

  return (
    <section className="flex flex-col gap-4 w-full">
      <SectionTitle>CapSharing Details</SectionTitle>

      {shouldRenderTrainingType(data) && trainingTypeRows.length > 0 && (
        <div className="flex flex-col gap-2.5" data-paginator-block>
          <SubSectionLabel>Training Type</SubSectionLabel>
          <DataTable rows={trainingTypeRows} />
        </div>
      )}

      {shouldRenderGroupBlock(data) && groupRows.length > 0 && (
        <div className="flex flex-col gap-2.5" data-paginator-block>
          <SubSectionLabel>Group Training</SubSectionLabel>
          <DataTable rows={groupRows} />
        </div>
      )}

      {shouldRenderIndividualBlock(data) && individualRows.length > 0 && (
        <div className="flex flex-col gap-2.5" data-paginator-block>
          <SubSectionLabel>Individual Training</SubSectionLabel>
          <DataTable rows={individualRows} />
        </div>
      )}

      {shouldRenderOrganizations(data) && (
        <div className={`flex flex-col gap-[10px] ${PARTNER_CARD_WIDTH_CLASS}`}>
          <SubSectionLabel>Organizations</SubSectionLabel>
          <div className="flex flex-col gap-[8px]">
            {organizationInstitutions.map((institution) => (
              <PartnerInstitutionCard
                key={String(institution.institution_id)}
                institution={institution}
              />
            ))}
          </div>
        </div>
      )}

      {shouldRenderTrainingDetails(data) && trainingDetailRows.length > 0 && (
        <div className="flex flex-col gap-2.5" data-paginator-block>
          <SubSectionLabel>Training Details</SubSectionLabel>
          <DataTable rows={trainingDetailRows} />
        </div>
      )}
    </section>
  );
}
