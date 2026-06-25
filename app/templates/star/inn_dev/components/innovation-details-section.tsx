import type { InnovationDetailsPayload } from "../types";
import {
  getInnovationDetailsPlainRows,
  getInnovationDetailsPlainRowsAfterReadiness,
  getReadinessLevel,
  getReadinessLevelCaption,
  getReadinessLevelDescription,
  shouldRenderAnticipatedUsers,
  shouldRenderInnovationDetails,
  shouldRenderKnowledgeSharing,
  shouldRenderReadinessScale,
  shouldRenderScalingPotential,
} from "../rules";
import { SectionTitle } from "../../shared/components/section-title";
import { LabelValueRow } from "../../shared/components/label-value";
import { AnticipatedUsersSection } from "./anticipated-users-section";
import { KnowledgeSharingSection } from "./knowledge-sharing-section";
import { ScalingPotentialSection } from "./scaling-potential-section";
import { ReadinessLevelScale } from "./readiness-level-scale";

const CONTENT_WIDTH_CLASS = "w-full max-w-[521px]";

interface InnovationDetailsSectionProps {
  data: InnovationDetailsPayload | null | undefined;
}

export function InnovationDetailsSection({
  data,
}: Readonly<InnovationDetailsSectionProps>) {
  if (!shouldRenderInnovationDetails(data) || !data) return null;

  const plainRows = getInnovationDetailsPlainRows(data);
  const plainRowsAfterReadiness = getInnovationDetailsPlainRowsAfterReadiness(data);
  const readinessLevel = getReadinessLevel(data);
  const readinessCaption = getReadinessLevelCaption(data);
  const readinessDescription = getReadinessLevelDescription(data);

  const hasMainContent =
    plainRows.length > 0 ||
    shouldRenderReadinessScale(data) ||
    plainRowsAfterReadiness.length > 0;

  const hasSubSections =
    shouldRenderAnticipatedUsers(data) ||
    shouldRenderKnowledgeSharing(data) ||
    shouldRenderScalingPotential(data);

  if (!hasMainContent && !hasSubSections) return null;

  return (
    <section className={`flex flex-col gap-4 ${CONTENT_WIDTH_CLASS}`}>
      <SectionTitle>Innovation Details</SectionTitle>

      {hasMainContent && (
        <div className="flex flex-col gap-[10px]">
          {plainRows.map((row) => (
            <LabelValueRow key={row.label} label={row.label} value={row.value} />
          ))}

          {shouldRenderReadinessScale(data) && readinessLevel != null && (
            <ReadinessLevelScale
              selectedLevel={readinessLevel}
              caption={readinessCaption}
              description={readinessDescription}
            />
          )}

          {plainRowsAfterReadiness.map((row) => (
            <LabelValueRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      )}

      {hasSubSections && (
        <div className="flex flex-col gap-[15px]">
          {shouldRenderAnticipatedUsers(data) && (
            <AnticipatedUsersSection data={data} />
          )}

          {shouldRenderKnowledgeSharing(data) && (
            <KnowledgeSharingSection data={data} />
          )}

          {shouldRenderScalingPotential(data) && (
            <ScalingPotentialSection data={data} />
          )}
        </div>
      )}
    </section>
  );
}
