import { formatDate, hasArrayItems, hasText } from "../shared/utils";
import { getPartnerDisplayName } from "../shared/sections/results_partners/rules";
import type { Institution } from "../shared/sections/results_partners/types";
import type { CapSharingPayload, GroupTraining, Individual } from "./types";
import {
  ATTENDING_ORGANIZATION,
  SESSION_LENGTH_IDS,
  SESSION_PURPOSE_IDS,
} from "./catalogs";

function resolvePayloadLabel(label: string | null | undefined): string | null {
  return hasText(label) ? label!.trim() : null;
}

export function isGroupTraining(
  payload: CapSharingPayload | null | undefined,
): boolean {
  return !!payload?.group && !payload.individual;
}

export function isIndividualTraining(
  payload: CapSharingPayload | null | undefined,
): boolean {
  return !!payload?.individual && !payload.group;
}

function isAttendingOrganizationYes(
  group: GroupTraining | null | undefined,
): boolean {
  return (
    group?.is_attending_organization === true ||
    group?.is_attending_organization === ATTENDING_ORGANIZATION.YES
  );
}

function hasGroupData(group: GroupTraining): boolean {
  return (
    group.session_participants_total != null ||
    group.session_participants_female != null ||
    group.session_participants_male != null ||
    group.session_participants_non_binary != null ||
    group.session_purpose_id != null ||
    hasText(group.session_purpose_description) ||
    group.is_attending_organization != null ||
    !!group.trainee_organization_representative?.length
  );
}

function hasIndividualData(individual: Individual): boolean {
  return (
    hasText(individual.trainee_name) ||
    individual.gender_id != null ||
    !!individual.affiliation ||
    !!individual.nationality
  );
}

export function shouldRenderTrainingType(
  payload: CapSharingPayload | null | undefined,
): boolean {
  if (!payload) return false;
  return (
    hasText(payload.session_format_label) ||
    hasText(payload.session_type_label) ||
    hasText(payload.session_length_label) ||
    (shouldRenderDegree(payload) && hasText(payload.degree_label))
  );
}

export function shouldRenderDegree(
  payload: CapSharingPayload | null | undefined,
): boolean {
  return payload?.session_length_id === SESSION_LENGTH_IDS.LONG_TERM;
}

export function shouldRenderGroupBlock(
  payload: CapSharingPayload | null | undefined,
): boolean {
  return isGroupTraining(payload) && hasGroupData(payload!.group!);
}

export function shouldRenderIndividualBlock(
  payload: CapSharingPayload | null | undefined,
): boolean {
  return isIndividualTraining(payload) && hasIndividualData(payload!.individual!);
}

export function shouldRenderOtherPurposeDescription(
  payload: CapSharingPayload | null | undefined,
): boolean {
  return payload?.group?.session_purpose_id === SESSION_PURPOSE_IDS.OTHER;
}

export function shouldRenderTrainingDetails(
  payload: CapSharingPayload | null | undefined,
): boolean {
  if (!payload) return false;
  return (
    !!payload.training_supervisor?.user ||
    hasText(getLanguageDisplay(payload)) ||
    formatDate(payload.start_date) != null ||
    formatDate(payload.end_date) != null ||
    hasText(payload.delivery_modality_label)
  );
}

export function shouldRenderOrganizations(
  payload: CapSharingPayload | null | undefined,
): boolean {
  if (!isGroupTraining(payload)) return false;
  if (!isAttendingOrganizationYes(payload?.group)) return false;
  if (!hasArrayItems(payload?.group?.trainee_organization_representative)) {
    return false;
  }
  return getOrganizationInstitutions(payload).length > 0;
}

export function shouldRenderSection(
  payload: CapSharingPayload | null | undefined,
): boolean {
  if (!payload) return false;
  return (
    shouldRenderTrainingType(payload) ||
    shouldRenderGroupBlock(payload) ||
    shouldRenderIndividualBlock(payload) ||
    shouldRenderTrainingDetails(payload) ||
    shouldRenderOrganizations(payload)
  );
}

export function getSessionFormatLabel(
  payload: CapSharingPayload,
): string | null {
  return resolvePayloadLabel(payload.session_format_label);
}

export function getSessionTypeLabel(payload: CapSharingPayload): string | null {
  return resolvePayloadLabel(payload.session_type_label);
}

export function getSessionLengthLabel(
  payload: CapSharingPayload,
): string | null {
  return resolvePayloadLabel(payload.session_length_label);
}

export function getDegreeLabel(payload: CapSharingPayload): string | null {
  if (!shouldRenderDegree(payload)) return null;
  return resolvePayloadLabel(payload.degree_label);
}

export function getDeliveryModalityLabel(
  payload: CapSharingPayload,
): string | null {
  return resolvePayloadLabel(payload.delivery_modality_label);
}

export function getSessionPurposeLabel(
  payload: CapSharingPayload,
): string | null {
  return resolvePayloadLabel(payload.session_purpose_label);
}

function formatPersonName(value: string | null | undefined): string | null {
  if (!hasText(value)) return null;

  return value!
    .trim()
    .split(/\s+/)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(" ");
}

export function getSupervisorInitials(
  payload: CapSharingPayload,
): string | null {
  const user = payload.training_supervisor?.user;
  if (!user) return null;

  const firstInitial = user.first_name?.trim().charAt(0) ?? "";
  const lastInitial = user.last_name?.trim().charAt(0) ?? "";
  const initials = `${firstInitial}${lastInitial}`.toUpperCase();

  return initials.length > 0 ? initials : null;
}

export function getSupervisorDisplay(payload: CapSharingPayload): string | null {
  const user = payload.training_supervisor?.user;
  if (!user) return null;

  const firstName = formatPersonName(user.first_name);
  const lastName = formatPersonName(user.last_name);
  const name = [firstName, lastName].filter(hasText).join(" ");

  if (hasText(name) && hasText(user.email)) return `${name} (${user.email})`;
  return name || user.email || null;
}

export function getLanguageDisplay(payload: CapSharingPayload): string | null {
  return resolvePayloadLabel(
    payload.training_supervisor_languages?.language?.name,
  );
}

export function getGenderLabel(payload: CapSharingPayload): string | null {
  return resolvePayloadLabel(payload.gender_label);
}

export function getAttendingOrganizationDisplay(
  payload: CapSharingPayload,
): string | null {
  return resolvePayloadLabel(payload.attending_organization_label);
}

export function getOrganizationInstitutions(
  payload: CapSharingPayload | null | undefined,
): Institution[] {
  if (!payload?.organization_institutions?.length) return [];

  const representativeIds = new Set(
    (payload.group?.trainee_organization_representative ?? [])
      .map((entry) => entry.institution_id)
      .filter((id): id is number => id != null),
  );

  const institutions =
    representativeIds.size > 0
      ? payload.organization_institutions.filter((institution) =>
          representativeIds.has(institution.institution_id),
        )
      : payload.organization_institutions;

  return institutions.filter((institution) =>
    hasText(getPartnerDisplayName(institution)),
  );
}


export function getGroupTrainingRows(
  payload: CapSharingPayload,
): { label: string; value: string }[] {
  const group = payload.group;
  if (!group) return [];

  const rows: { label: string; value: string | null }[] = [
    {
      label: "Total participants",
      value:
        group.session_participants_total != null
          ? String(group.session_participants_total)
          : null,
    },
    {
      label: "Female participants",
      value:
        group.session_participants_female != null
          ? String(group.session_participants_female)
          : null,
    },
    {
      label: "Male participants",
      value:
        group.session_participants_male != null
          ? String(group.session_participants_male)
          : null,
    },
    {
      label: "Non-binary participants",
      value:
        group.session_participants_non_binary != null
          ? String(group.session_participants_non_binary)
          : null,
    },
    {
      label: "What was the purpose of this training/engagement?",
      value: getSessionPurposeLabel(payload),
    },
  ];

  if (shouldRenderOtherPurposeDescription(payload)) {
    rows.push({
      label: "Purpose description",
      value: group.session_purpose_description?.trim() ?? null,
    });
  }

  rows.push({
    label: "Were the trainees attending on behalf of an organization?",
    value: getAttendingOrganizationDisplay(payload),
  });

  return rows.filter((row): row is { label: string; value: string } =>
    hasText(row.value),
  );
}
