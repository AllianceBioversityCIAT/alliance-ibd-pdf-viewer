import type { InnovationDetailsPayload } from "../types";
import { ANTICIPATED_USERS_QUESTION_LABEL } from "../catalogs";
import {
  getAnticipatedUsersLabel,
  shouldRenderActors,
  shouldRenderAnticipatedUsers,
  shouldRenderAnticipatedUsersExpanded,
  shouldRenderOrganizations,
} from "../rules";
import { hasText } from "../../shared/utils";
import { SubSectionBlock } from "../../shared/components/section-title";
import { FieldLabel, LabelValueRow } from "../../shared/components/label-value";
import { ActorCard } from "./actor-card";
import { OrganizationCard } from "./organization-card";

interface AnticipatedUsersSectionProps {
  data: InnovationDetailsPayload;
}

export function AnticipatedUsersSection({
  data,
}: Readonly<AnticipatedUsersSectionProps>) {
  if (!shouldRenderAnticipatedUsers(data)) return null;

  const anticipatedUsersLabel = getAnticipatedUsersLabel(data);
  const expanded = shouldRenderAnticipatedUsersExpanded(data);
  const intendedBeneficiaries = data.intended_beneficiaries_description?.trim() ?? "";
  const expectedOutcome = data.expected_outcome?.trim() ?? "";

  return (
    <SubSectionBlock title="Anticipated Users">
      {anticipatedUsersLabel && (
        <LabelValueRow
          label={ANTICIPATED_USERS_QUESTION_LABEL}
          value={anticipatedUsersLabel}
        />
      )}

      {expanded && hasText(intendedBeneficiaries) && (
        <LabelValueRow
          label="Intended beneficiaries"
          value={intendedBeneficiaries}
        />
      )}

      {expanded && hasText(expectedOutcome) && (
        <LabelValueRow
          label="Expected outcome"
          value={expectedOutcome}
        />
      )}

      {expanded && shouldRenderActors(data) && (
        <div className="flex flex-col gap-[8px]">
          <FieldLabel label="Actors" />
          {(data.actors ?? []).map((actor, index) => (
            <ActorCard
              key={actor.result_actors_id ?? `actor-${index}`}
              payload={data}
              actor={actor}
              index={index}
            />
          ))}
        </div>
      )}

      {expanded && shouldRenderOrganizations(data) && (
        <div className="flex flex-col gap-[8px]">
          <FieldLabel label="Organizations" />
          {(data.institution_types ?? []).map((entry, index) => (
            <OrganizationCard
              key={
                entry.result_institution_type_id ??
                `${entry.institution_id}-${index}`
              }
              payload={data}
              entry={entry}
              index={index}
            />
          ))}
        </div>
      )}
    </SubSectionBlock>
  );
}
