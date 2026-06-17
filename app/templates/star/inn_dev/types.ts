import type { StarCommonPayload } from "../shared/types/star-common-payload.types";

export interface InnovationLevel {
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  id?: number;
  level?: number;
  name?: string;
  definition?: string;
  additional_guidance?: string;
}

export interface InnovationCharacteristic {
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  id?: number;
  name?: string;
  definition?: string;
  source_id?: number;
}

export interface InnovationType {
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  code?: number;
  name?: string;
  definition?: string;
}

export interface ToolFunction {
  id?: number;
  tool_function_id?: number;
  tool_function_name?: string;
}

export interface LinkToResult {
  link_result_id?: number;
  result_id?: number;
  other_result_id?: number;
  result_code?: number | string;
  link_result_role_id?: number;
  linked_result_title?: string;
  result_type_label?: string;
  qa_status_label?: string;
  reporting_project_name?: string;
  /** @deprecated Use reporting_project_name for the project value */
  reporting_project_label?: string;
}

export interface KnowledgeSharingForm {
  is_knowledge_sharing?: boolean | number;
  dissemination_qualification_id?: number;
  tool_useful_context?: string;
  results_achieved_expected?: string;
  tool_function_id?: ToolFunction[];
  is_used_beyond_original_context?: boolean | number;
  adoption_adaptation_context?: string;
  other_tools?: string;
  other_tools_integration?: string;
  link_to_result?: LinkToResult[];
}

export interface ScalingPotentialForm {
  is_cheaper_than_alternatives?: number;
  is_simpler_to_use?: number;
  does_perform_better?: number;
  is_desirable_to_users?: number;
  has_commercial_viability?: number;
  has_suitable_enabling_environment?: number;
  has_evidence_of_uptake?: number;
  expansion_potential_id?: number;
  expansion_adaptation_details?: string;
}

export interface Actor {
  result_actors_id?: number;
  result_id?: number;
  actor_type_id?: number;
  sex_age_disaggregation_not_apply?: boolean | number;
  women_youth?: boolean | number;
  women_not_youth?: boolean | number;
  men_youth?: boolean | number;
  men_not_youth?: boolean | number;
  actor_role_id?: number;
  actor_type_custom_name?: string;
}

export interface InstitutionType {
  result_institution_type_id?: number | null;
  result_id?: number | null;
  institution_type_id?: number | null;
  sub_institution_type_id?: number | null;
  institution_type_custom_name?: string | null;
  is_organization_known?: boolean | number;
  institution_id?: number | null;
}

/** STAR backend interface */
export interface GetInnovationDetails {
  short_title?: string;
  innovation_nature_id?: number;
  innovation_type_id?: number;
  innovation_readiness_id?: number;
  anticipated_users_id?: number;
  is_new_or_improved_variety?: number | boolean;
  new_or_improved_varieties_count?: number;
  expected_outcome?: string;
  intended_beneficiaries_description?: string;
  innovation_readiness_explanation?: string;
  actors?: Actor[];
  institution_types?: InstitutionType[];
  knowledge_sharing_form?: KnowledgeSharingForm;
  scaling_potential_form?: ScalingPotentialForm;
}

export interface InnovationDetailsPdfContext {
  innovation_nature?: InnovationCharacteristic;
  innovation_type?: InnovationType;
  innovation_readiness?: InnovationLevel;
  innovation_nature_label?: string;
  innovation_type_label?: string;
  anticipated_users_label?: string;
  is_new_or_improved_variety_label?: string;
  actor_type_labels?: Record<number, string>;
  institution_type_labels?: Record<number, string>;
  sub_institution_type_labels?: Record<number, string>;
  institution_labels?: Record<number, string>;
  is_knowledge_sharing_label?: string;
  dissemination_qualification_label?: string;
  tool_function_labels?: string[];
  is_used_beyond_original_context_label?: string;
  is_cheaper_than_alternatives_label?: string;
  is_simpler_to_use_label?: string;
  does_perform_better_label?: string;
  is_desirable_to_users_label?: string;
  has_commercial_viability_label?: string;
  has_suitable_enabling_environment_label?: string;
  has_evidence_of_uptake_label?: string;
  expansion_potential_label?: string;
  women_youth_label?: string;
  women_not_youth_label?: string;
  men_youth_label?: string;
  men_not_youth_label?: string;
}

export type InnovationDetailsPayload = GetInnovationDetails &
  InnovationDetailsPdfContext;

export interface InnDevPdfPayload extends StarCommonPayload {
  innovation_details: InnovationDetailsPayload;
}

export type { StarCommonPayload };
