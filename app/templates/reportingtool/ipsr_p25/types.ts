import type {
  TocPrimaryEntry,
  PrimarySubmitterData,
  ContributingCenter,
  ContributingInitiative,
  BilateralProject,
  PartnerEntry,
  LinkedEvidence,
  QAInfo,
} from "../shared/types";

// Re-export shared types used by components
export type {
  TocPrimaryEntry,
  PrimarySubmitterData,
  ContributingCenter,
  ContributingInitiative,
  BilateralProject,
  PartnerEntry,
  LinkedEvidence,
  QAInfo,
};

// ── IPSR-specific types ──

export interface IpsrCoreInnovation {
  result_code: number;
  title: string;
  link: string;
}

export interface IpsrActorEntry {
  actor_type: string;
  other_actor_type: string | null;
  sex_and_age_disaggregation: boolean;
  women_total: number | null;
  women_youth: number | null;
  women_non_youth: number | null;
  men_total: number | null;
  men_youth: number | null;
  men_non_youth: number | null;
  total: number;
  how_many: number | null;
  evidence_link?: string | null;
}

export interface IpsrOrganizationEntry {
  type: string;
  other_institution: string | null;
  subtype: string;
  has_subtypes: boolean;
  how_many: string;
  evidence_link?: string | null;
}

export interface IpsrMeasureEntry {
  type: string;
  evidence_link?: string | null;
  unit_of_measure: string;
  quantity: string;
}

export interface IpsrFacilitatorEntry {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export interface IpsrInnovationPackagingExperts {
  was_workshop_organized: string;
  facilitators: IpsrFacilitatorEntry[] | null;
  workshop_atendees_list_link: string | null;
}

export interface IpsrAssessmentEntry {
  innovation_data: {
    is_core: boolean;
    innovation_id: number;
    innovation_code: number;
    innovation_title: string;
  };
  current_readiness: string | null;
  current_use: string | null;
  potential_readiness: string | null;
  potential_use: string | null;
}

export interface IpsrEvidenceAssessment {
  short_name: string;
  readiness_level: string | null;
  readiness_evidence: string | null;
  readiness_evidence_details: string | null;
  use_level: string | null;
  use_evidence: string | null;
  use_evidence_details: string | null;
}

export interface IpsrComplementaryAssessment extends IpsrEvidenceAssessment {
  innovation_data: {
    innovation_id: number;
    innovation_code: number;
    innovation_title: string;
    innovation_short_title: string | null;
  };
}

export interface IpsrInvestmentEntry {
  name: string;
  total_usd_value: string | null;
  is_not_determined: boolean;
}

// ── Main IPSR API response ──

export interface IPSRResultData {
  // Core identification
  result_code: number;
  result_name: string;
  result_type: string;
  result_description: string;
  title: string;
  short_title: string;

  // Phase & dates
  phase_name: string;

  // People
  primary_submitter_name: string;
  primary_submitter_acronym: string;
  lead_contact_person: string;

  // Impact tags (format: "(1) Significant")
  nutrition_tag: { name: string; score: number; components: string[] };
  climate_tag: { name: string; score: number; components: string[] };
  poverty_tag: { name: string; score: number; components: string[] };
  gender_tag: { name: string; score: number; components: string[] };
  environmental_tag: { name: string; score: number; components: string[] };

  // KRS (Key Result Story)
  is_krs: string;
  krs_link: string | null;

  // Geographic
  geo_focus: string;
  regions: string[] | null;
  countries: { name: string; code: string }[] | null;
  subnational: { country: string; subnationals: string[] }[] | null;

  // Theory of Change
  toc_primary: TocPrimaryEntry[] | null;
  primary_submitter_data: PrimarySubmitterData | null;

  // Contributors
  contributing_centers: ContributingCenter[];
  contributing_initiatives: ContributingInitiative[] | null;
  bilateral_projects: BilateralProject[] | null;

  // Partners (includes delivery type)
  non_kp_partner_data: PartnerEntry[] | null;

  // Evidence
  linked_evidences: LinkedEvidence[];

  // QA
  qa_info?: QAInfo;

  // ── IPSR-specific fields ──

  // Step 1 — Ambition
  core_innovation: IpsrCoreInnovation | null;
  scaling_ambition_statement: string | null;
  targeted_actors: IpsrActorEntry[] | null;
  targeted_organizations: IpsrOrganizationEntry[] | null;
  targeted_innnovation_partners: PartnerEntry[] | null;
  aspired_outcomes_impact: { eoi_title: string; is_contributor: boolean | number }[] | null;
  innovation_packaging_experts: IpsrInnovationPackagingExperts | null;

  // Steps 2 & 3 — Package and Assess
  current_use_actors: IpsrActorEntry[] | null;
  current_use_organizations: IpsrOrganizationEntry[] | null;
  current_use_measures: IpsrMeasureEntry[] | null;
  assessment_type: string | null;
  assessments: IpsrAssessmentEntry[] | null;
  evidence_based_assessment_core: IpsrEvidenceAssessment | null;
  evidence_based_assessment_complementary: IpsrComplementaryAssessment[];
  evidence_material_links: string[];

  // Step 4 — Additional Information
  investment_programs: IpsrInvestmentEntry[] | null;
  investment_bilateral: IpsrInvestmentEntry[] | null;
  investment_partners: IpsrInvestmentEntry[] | null;
}
