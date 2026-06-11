import { hasArrayItems, hasText } from "../shared/utils";
import {
  ACTOR_TYPE_OTHER,
  ANTICIPATED_USERS_EXPANDED,
  DISSEMINATION_QUALIFICATION_EXPANDED,
  EXPANSION_POTENTIAL_OPTIONS,
  EXPANSION_POTENTIAL_WITH_ADAPTATIONS,
  INNOVATION_TYPE_NEW_VARIETY,
  INSTITUTION_TYPE_OTHER,
  READINESS_LEVEL_KNOWLEDGE_SHARING_MIN,
} from "./catalogs";
import type {
  Actor,
  InnovationDetailsPayload,
  InstitutionType,
  KnowledgeSharingForm,
  LinkToResult,
  ScalingPotentialForm,
} from "./types";

function resolvePayloadLabel(label: string | null | undefined): string | null {
  return hasText(label) ? label!.trim() : null;
}

function isTruthy(value: boolean | number | null | undefined): boolean {
  return value === true || value === 1;
}

export function getReadinessLevel(
  payload: InnovationDetailsPayload | null | undefined,
): number | null {
  const level = payload?.innovation_readiness?.level;
  return level != null && !Number.isNaN(Number(level)) ? Number(level) : null;
}

export function isReadinessAtKnowledgeSharingLevel(
  payload: InnovationDetailsPayload | null | undefined,
): boolean {
  const level = getReadinessLevel(payload);
  return level != null && level >= READINESS_LEVEL_KNOWLEDGE_SHARING_MIN;
}

export function shouldRenderInnovationDetails(
  payload: InnovationDetailsPayload | null | undefined,
): boolean {
  if (!payload) return false;

  return (
    hasText(payload.short_title) ||
    hasText(getInnovationNatureDisplay(payload)) ||
    hasText(getInnovationTypeDisplay(payload)) ||
    hasText(getNewOrImprovedVarietyLabel(payload)) ||
    payload.new_or_improved_varieties_count != null ||
    getReadinessLevel(payload) != null ||
    hasText(payload.innovation_readiness_explanation) ||
    payload.anticipated_users_id != null ||
    shouldRenderAnticipatedUsersExpanded(payload) ||
    shouldRenderKnowledgeSharing(payload) ||
    shouldRenderScalingPotential(payload)
  );
}

export function getInnovationNatureDisplay(
  payload: InnovationDetailsPayload,
): string | null {
  const fromObject = payload.innovation_nature?.name?.trim();
  if (fromObject) {
    const definition = payload.innovation_nature?.definition?.trim();
    return definition ? `${fromObject} — ${definition}` : fromObject;
  }
  return resolvePayloadLabel(payload.innovation_nature_label);
}

export function getInnovationTypeDisplay(
  payload: InnovationDetailsPayload,
): string | null {
  const fromObject = payload.innovation_type?.name?.trim();
  if (fromObject) {
    const definition = payload.innovation_type?.definition?.trim();
    return definition ? `${fromObject} — ${definition}` : fromObject;
  }
  return resolvePayloadLabel(payload.innovation_type_label);
}

export function shouldRenderNewOrImprovedVariety(
  payload: InnovationDetailsPayload | null | undefined,
): boolean {
  return payload?.innovation_type_id === INNOVATION_TYPE_NEW_VARIETY;
}

export function getNewOrImprovedVarietyLabel(
  payload: InnovationDetailsPayload,
): string | null {
  if (!shouldRenderNewOrImprovedVariety(payload)) return null;
  return resolvePayloadLabel(payload.is_new_or_improved_variety_label);
}

export function shouldRenderNewOrImprovedVarietiesCount(
  payload: InnovationDetailsPayload | null | undefined,
): boolean {
  if (!shouldRenderNewOrImprovedVariety(payload)) return false;
  return isTruthy(payload?.is_new_or_improved_variety);
}

export function getReadinessLevelDisplay(
  payload: InnovationDetailsPayload,
): string | null {
  const readiness = payload.innovation_readiness;
  if (!readiness) return null;

  const parts: string[] = [];
  if (readiness.level != null) {
    parts.push(`Level ${readiness.level}`);
  }
  if (hasText(readiness.name)) {
    parts.push(readiness.name!.trim());
  }
  if (hasText(readiness.definition)) {
    parts.push(readiness.definition!.trim());
  }
  if (hasText(readiness.additional_guidance)) {
    parts.push(readiness.additional_guidance!.trim());
  }

  return parts.length > 0 ? parts.join(" — ") : null;
}

export function getReadinessLevelCaption(
  payload: InnovationDetailsPayload,
): string | null {
  const level = getReadinessLevel(payload);
  if (level == null) return null;

  const name = payload.innovation_readiness?.name?.trim();
  return name ? `Level ${level} - ${name}` : `Level ${level}`;
}

export function getReadinessLevelDescription(
  payload: InnovationDetailsPayload,
): string | null {
  const readiness = payload.innovation_readiness;
  if (!readiness) return null;

  const parts: string[] = [];
  if (hasText(readiness.definition)) {
    parts.push(readiness.definition!.trim());
  }
  if (hasText(readiness.additional_guidance)) {
    parts.push(readiness.additional_guidance!.trim());
  }

  return parts.length > 0 ? parts.join(" ") : null;
}

export function shouldRenderReadinessScale(
  payload: InnovationDetailsPayload | null | undefined,
): boolean {
  return getReadinessLevel(payload) != null;
}

export function shouldRenderAnticipatedUsers(
  payload: InnovationDetailsPayload | null | undefined,
): boolean {
  return payload?.anticipated_users_id != null;
}

export function getAnticipatedUsersLabel(
  payload: InnovationDetailsPayload,
): string | null {
  return resolvePayloadLabel(payload.anticipated_users_label);
}

export function shouldRenderAnticipatedUsersExpanded(
  payload: InnovationDetailsPayload | null | undefined,
): boolean {
  return payload?.anticipated_users_id === ANTICIPATED_USERS_EXPANDED;
}

export function shouldRenderActors(
  payload: InnovationDetailsPayload | null | undefined,
): boolean {
  return (
    shouldRenderAnticipatedUsersExpanded(payload) &&
    hasArrayItems(payload?.actors)
  );
}

export function getActorNumberLabel(index: number): string {
  return `ACTOR #${index + 1}`;
}

export function getOrganizationNumberLabel(index: number): string {
  return `ORGANIZATION #${index + 1}`;
}

export function getActorTypeDisplay(
  payload: InnovationDetailsPayload,
  actor: Actor,
): string | null {
  if (actor.actor_type_id == null) return null;
  const mapped = payload.actor_type_labels?.[actor.actor_type_id];
  return hasText(mapped) ? mapped!.trim() : null;
}

export function shouldRenderActorCustomName(actor: Actor): boolean {
  return actor.actor_type_id === ACTOR_TYPE_OTHER;
}

export function getActorCustomName(actor: Actor): string | null {
  if (!shouldRenderActorCustomName(actor)) return null;
  return resolvePayloadLabel(actor.actor_type_custom_name);
}

export function shouldRenderActorDisaggregation(actor: Actor): boolean {
  return !isTruthy(actor.sex_age_disaggregation_not_apply);
}

function joinDisaggregationParts(parts: string[]): string | null {
  return parts.length > 0 ? parts.join(" | ") : null;
}

export function getActorDisaggregationFields(
  actor: Actor,
): { label: string; value: string }[] {
  if (!shouldRenderActorDisaggregation(actor)) return [];

  const womenValue = joinDisaggregationParts([
    ...(isTruthy(actor.women_youth) ? ["Youth"] : []),
    ...(isTruthy(actor.women_not_youth) ? ["Non-youth"] : []),
  ]);
  const menValue = joinDisaggregationParts([
    ...(isTruthy(actor.men_youth) ? ["Youth"] : []),
    ...(isTruthy(actor.men_not_youth) ? ["Non-youth"] : []),
  ]);

  const fields: { label: string; value: string | null }[] = [
    { label: "Women", value: womenValue },
    { label: "Men", value: menValue },
  ];

  return fields.filter((field): field is { label: string; value: string } =>
    hasText(field.value),
  );
}

export function shouldRenderOrganizations(
  payload: InnovationDetailsPayload | null | undefined,
): boolean {
  return (
    shouldRenderAnticipatedUsersExpanded(payload) &&
    hasArrayItems(payload?.institution_types)
  );
}

export function isOrganizationKnown(entry: InstitutionType): boolean {
  return isTruthy(entry.is_organization_known);
}

export function getKnownOrganizationName(
  payload: InnovationDetailsPayload,
  entry: InstitutionType,
): string | null {
  if (!isOrganizationKnown(entry)) return null;
  if (entry.institution_id != null) {
    const mapped = payload.institution_labels?.[entry.institution_id];
    if (hasText(mapped)) return mapped!.trim();
  }
  return null;
}

export function getOrganizationCustomName(
  entry: InstitutionType,
): string | null {
  if (isOrganizationKnown(entry)) return null;
  return resolvePayloadLabel(entry.institution_type_custom_name);
}

export function getOrganizationTypeDisplay(
  payload: InnovationDetailsPayload,
  entry: InstitutionType,
): string | null {
  if (isOrganizationKnown(entry)) return null;
  if (getOrganizationCustomName(entry)) return null;

  if (entry.institution_type_id != null) {
    const mapped = payload.institution_type_labels?.[entry.institution_type_id];
    if (hasText(mapped)) return mapped!.trim();
  }

  return null;
}

export function getOrganizationSubtypeDisplay(
  payload: InnovationDetailsPayload,
  entry: InstitutionType,
): string | null {
  if (isOrganizationKnown(entry)) return null;
  if (entry.institution_type_id === INSTITUTION_TYPE_OTHER) return null;
  if (entry.sub_institution_type_id == null) return null;

  const mapped =
    payload.sub_institution_type_labels?.[entry.sub_institution_type_id];
  return resolvePayloadLabel(mapped);
}

export function shouldRenderKnowledgeSharing(
  payload: InnovationDetailsPayload | null | undefined,
): boolean {
  return isReadinessAtKnowledgeSharingLevel(payload);
}

export function getKnowledgeSharingLabel(
  payload: InnovationDetailsPayload,
): string | null {
  return resolvePayloadLabel(payload.is_knowledge_sharing_label);
}

export function shouldRenderDisseminationQualification(
  payload: InnovationDetailsPayload,
): boolean {
  return isTruthy(payload.knowledge_sharing_form?.is_knowledge_sharing);
}

export function getDisseminationQualificationLabel(
  payload: InnovationDetailsPayload,
): string | null {
  return resolvePayloadLabel(payload.dissemination_qualification_label);
}

export function shouldRenderKnowledgeSharingExpanded(
  payload: InnovationDetailsPayload,
): boolean {
  return (
    shouldRenderDisseminationQualification(payload) &&
    payload.knowledge_sharing_form?.dissemination_qualification_id ===
      DISSEMINATION_QUALIFICATION_EXPANDED
  );
}

export function getIsUsedBeyondOriginalContextLabel(
  payload: InnovationDetailsPayload,
): string | null {
  return resolvePayloadLabel(payload.is_used_beyond_original_context_label);
}

export function getLinkedResultReportingProjectName(
  entry: LinkToResult,
): string | null {
  return (
    resolvePayloadLabel(entry.reporting_project_name) ??
    resolvePayloadLabel(entry.reporting_project_label)
  );
}

/** Adoption narrative — only when is_used_beyond_original_context is Yes. */
export function shouldRenderAdoptionAdaptationContext(
  form: KnowledgeSharingForm,
): boolean {
  return isTruthy(form.is_used_beyond_original_context);
}

/** Yes/No answer; when Yes, appends adoption_adaptation_context after "Yes. " */
export function getIsUsedBeyondOriginalContextAnswerDisplay(
  payload: InnovationDetailsPayload,
  form: KnowledgeSharingForm,
): string | null {
  const yesNo = getIsUsedBeyondOriginalContextLabel(payload);
  if (!yesNo) return null;

  if (!shouldRenderAdoptionAdaptationContext(form)) {
    return yesNo;
  }

  const adoptionContext = resolvePayloadLabel(form.adoption_adaptation_context);
  if (adoptionContext) {
    return `${yesNo}. ${adoptionContext}`;
  }

  return yesNo;
}

export function getToolFunctionLabels(
  payload: InnovationDetailsPayload,
  form: KnowledgeSharingForm,
): string[] {
  if (payload.tool_function_labels?.length) {
    return payload.tool_function_labels.filter(hasText);
  }

  return (form.tool_function_id ?? [])
    .map((entry) => resolvePayloadLabel(entry.tool_function_name))
    .filter((name): name is string => hasText(name));
}

export function getLinkedResultDisplayTitle(entry: LinkToResult): string | null {
  const title = resolvePayloadLabel(entry.linked_result_title);
  const code = entry.other_result_id ?? entry.result_code;

  if (title && code != null) {
    const codePrefix = `${code} - `;
    if (title.startsWith(codePrefix) || title.startsWith(`${code}-`)) {
      return title;
    }
    return `${code} - ${title}`;
  }

  if (title) return title;
  if (code == null) return null;
  return String(code);
}

export function getRenderableLinkedResults(
  form: KnowledgeSharingForm,
): LinkToResult[] {
  return (form.link_to_result ?? []).filter(
    (entry) => getLinkedResultDisplayTitle(entry) != null,
  );
}

export interface KnowledgeSharingTextBlock {
  question: string;
  answer: string;
}

function addKnowledgeSharingTextBlock(
  blocks: KnowledgeSharingTextBlock[],
  question: string | null,
  answer: string | null,
): void {
  if (question && answer) {
    blocks.push({ question, answer });
  }
}

export function getKnowledgeSharingExpandedBlocks(
  payload: InnovationDetailsPayload,
  form: KnowledgeSharingForm,
): KnowledgeSharingTextBlock[] {
  if (!shouldRenderKnowledgeSharingExpanded(payload)) return [];

  const blocks: KnowledgeSharingTextBlock[] = [];

  const toolContext = resolvePayloadLabel(form.tool_useful_context);
  if (toolContext) {
    addKnowledgeSharingTextBlock(
      blocks,
      "In what context is this tool useful?",
      toolContext,
    );
  }

  const resultsExpected = resolvePayloadLabel(form.results_achieved_expected);
  if (resultsExpected) {
    addKnowledgeSharingTextBlock(
      blocks,
      "Results (achieved or expected): identify and detail selected examples of relevance, adding numbers, facts, figures, names, and locations",
      resultsExpected,
    );
  }

  const toolFunctions = getToolFunctionLabels(payload, form);
  if (toolFunctions.length > 0) {
    addKnowledgeSharingTextBlock(
      blocks,
      "What is the function of this tool?",
      toolFunctions.join(", "),
    );
  }

  addKnowledgeSharingTextBlock(
    blocks,
    "Has this innovation been used beyond its original development context (for other crops, or in other geographies for example)?",
    getIsUsedBeyondOriginalContextAnswerDisplay(payload, form),
  );

  return blocks;
}

export function getKnowledgeSharingOtherToolsBlocks(
  payload: InnovationDetailsPayload,
  form: KnowledgeSharingForm,
): KnowledgeSharingTextBlock[] {
  if (!shouldRenderKnowledgeSharingExpanded(payload)) return [];

  const blocks: KnowledgeSharingTextBlock[] = [];

  const otherTools = resolvePayloadLabel(form.other_tools);
  if (otherTools) {
    addKnowledgeSharingTextBlock(blocks, "Other tools", otherTools);
  }

  const otherToolsIntegration = resolvePayloadLabel(
    form.other_tools_integration,
  );
  if (otherToolsIntegration) {
    addKnowledgeSharingTextBlock(
      blocks,
      "Please provide a short description of how other tools are used with this one.",
      otherToolsIntegration,
    );
  }

  return blocks;
}

export function shouldRenderScalingPotential(
  payload: InnovationDetailsPayload | null | undefined,
): boolean {
  if (!isReadinessAtKnowledgeSharingLevel(payload)) return false;
  return hasScalingPotentialContent(payload);
}

export type ScalingScaleField = keyof Pick<
  ScalingPotentialForm,
  | "is_cheaper_than_alternatives"
  | "is_simpler_to_use"
  | "does_perform_better"
  | "is_desirable_to_users"
  | "has_commercial_viability"
  | "has_suitable_enabling_environment"
  | "has_evidence_of_uptake"
>;

export interface ScalingQuestionConfig {
  field: ScalingScaleField;
  label: string;
}

export const SCALING_FORMULATION_QUESTIONS: ScalingQuestionConfig[] = [
  {
    field: "is_cheaper_than_alternatives",
    label: "Is it cheaper compared to alternatives?",
  },
  { field: "is_simpler_to_use", label: "Is it simpler to use?" },
  { field: "does_perform_better", label: "Does it perform better?" },
];

export const SCALING_DEMAND_QUESTIONS: ScalingQuestionConfig[] = [
  {
    field: "is_desirable_to_users",
    label: "Is the innovation desirable to intended users?",
  },
  {
    field: "has_commercial_viability",
    label:
      "Is the innovation commercially viable/is there investment potential?",
  },
];

export const SCALING_SUSTAINED_QUESTIONS: ScalingQuestionConfig[] = [
  {
    field: "has_suitable_enabling_environment",
    label:
      "Is the innovation supported by a suitable enabling environment?",
  },
  {
    field: "has_evidence_of_uptake",
    label: "Is there already evidence of uptake?",
  },
];

export function getScalingScaleValue(
  value: number | null | undefined,
): number | null {
  if (value == null || Number.isNaN(Number(value))) return null;
  const n = Math.round(Number(value));
  return n >= 1 && n <= 5 ? n : null;
}

export function shouldRenderScalingScaleQuestion(
  value: number | null | undefined,
): boolean {
  return getScalingScaleValue(value) != null;
}

function hasScalingPotentialContent(
  payload: InnovationDetailsPayload | null | undefined,
): boolean {
  const form = payload?.scaling_potential_form;
  if (!form) return false;

  const scaleFields: ScalingScaleField[] = [
    "is_cheaper_than_alternatives",
    "is_simpler_to_use",
    "does_perform_better",
    "is_desirable_to_users",
    "has_commercial_viability",
    "has_suitable_enabling_environment",
    "has_evidence_of_uptake",
  ];

  if (scaleFields.some((field) => shouldRenderScalingScaleQuestion(form[field]))) {
    return true;
  }

  if (form.expansion_potential_id != null) return true;
  return hasText(form.expansion_adaptation_details);
}

export function getExpansionPotentialSelectedId(
  payload: InnovationDetailsPayload,
): number | null {
  const id = payload.scaling_potential_form?.expansion_potential_id;
  if (id == null || Number.isNaN(Number(id))) return null;
  return Number(id);
}

export function shouldRenderExpansionPotentialQuestion(
  payload: InnovationDetailsPayload,
): boolean {
  return getExpansionPotentialSelectedId(payload) != null;
}

export function getExpansionPotentialAnswerLabel(
  payload: InnovationDetailsPayload,
): string | null {
  const selectedId = getExpansionPotentialSelectedId(payload);
  if (selectedId == null) return null;

  const fromPayload = resolvePayloadLabel(payload.expansion_potential_label);
  if (
    fromPayload &&
    payload.scaling_potential_form?.expansion_potential_id === selectedId
  ) {
    return fromPayload;
  }

  return (
    EXPANSION_POTENTIAL_OPTIONS.find((option) => option.id === selectedId)
      ?.label ?? null
  );
}

/** Full answer line for PDF (IP Rights style): option label + details when id === 2. */
export function getExpansionPotentialAnswerDisplay(
  payload: InnovationDetailsPayload,
): string | null {
  const label = getExpansionPotentialAnswerLabel(payload);
  if (!label) return null;

  const details = payload.scaling_potential_form?.expansion_adaptation_details?.trim();
  if (shouldRenderExpansionAdaptationDetails(payload) && hasText(details)) {
    return `${label}. ${details}`;
  }

  return label;
}

export function getScalingAnswerLabel(
  payload: InnovationDetailsPayload,
  key:
    | "is_cheaper_than_alternatives_label"
    | "is_simpler_to_use_label"
    | "does_perform_better_label"
    | "is_desirable_to_users_label"
    | "has_commercial_viability_label"
    | "has_suitable_enabling_environment_label"
    | "has_evidence_of_uptake_label",
): string | null {
  return resolvePayloadLabel(payload[key]);
}

export function getExpansionPotentialLabel(
  payload: InnovationDetailsPayload,
): string | null {
  return resolvePayloadLabel(payload.expansion_potential_label);
}

export function shouldRenderExpansionAdaptationDetails(
  payload: InnovationDetailsPayload,
): boolean {
  return (
    payload.scaling_potential_form?.expansion_potential_id ===
    EXPANSION_POTENTIAL_WITH_ADAPTATIONS
  );
}

export function getInnovationDetailsPlainRows(
  payload: InnovationDetailsPayload,
): { label: string; value: string }[] {
  const rows: { label: string; value: string | null }[] = [
    { label: "Short title", value: resolvePayloadLabel(payload.short_title) },
    {
      label: "Innovation nature",
      value: getInnovationNatureDisplay(payload),
    },
    {
      label: "Innovation type",
      value: getInnovationTypeDisplay(payload),
    },
  ];

  if (shouldRenderNewOrImprovedVariety(payload)) {
    rows.push({
      label: "Is this a new or improved variety?",
      value: getNewOrImprovedVarietyLabel(payload),
    });
  }

  if (shouldRenderNewOrImprovedVarietiesCount(payload)) {
    rows.push({
      label: "Number of new or improved varieties",
      value:
        payload.new_or_improved_varieties_count != null
          ? String(payload.new_or_improved_varieties_count)
          : null,
    });
  }

  return rows.filter((row): row is { label: string; value: string } =>
    hasText(row.value),
  );
}

export function getInnovationDetailsPlainRowsAfterReadiness(
  payload: InnovationDetailsPayload,
): { label: string; value: string }[] {
  const rows: { label: string; value: string | null }[] = [];

  if (hasText(payload.innovation_readiness_explanation)) {
    rows.push({
      label: "Innovation readiness explanation",
      value: payload.innovation_readiness_explanation!.trim(),
    });
  }

  return rows.filter((row): row is { label: string; value: string } =>
    hasText(row.value),
  );
}
