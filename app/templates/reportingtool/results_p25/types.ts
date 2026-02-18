// ── Real PRMS API types ──

export interface LinkedEvidence {
  details: string | null;
  evidence: string;
  gender_related: boolean;
  climate_related: boolean;
  poverty_related: boolean;
  nutrition_related: boolean;
  environmental_biodiversity_related: boolean;
}

export interface ContributingCenter {
  center_name: string;
  is_primary_center: number;
}

export interface TocPrimaryEntry {
  initiative_short_name: string;
  action_area: string;
  toc_result_title: string;
  indicator?: string;
}

export interface PrimarySubmitterData {
  toc_url?: string;
}

export interface ContributingInitiative {
  initiative_short_name: string;
}

export interface NonPooledProject {
  project_title: string;
}

export interface PartnerEntry {
  partner_name: string;
  country_hq_name: string;
  institution_type: string;
}

export interface KPField {
  label: string;
  value: string;
}

export interface QAAdjustment {
  label: string;
  from_value: string;
  to_value: string;
}

export interface BundledInnovation {
  portfolio: string;
  phase: string;
  code: string;
  indicator: string;
  title: string;
}

export interface InnovationInvestment {
  entity: string;
  name: string;
  usd_investment: string;
}

export interface InnovationActor {
  type: string;
  actors: string;
}

export interface InnovationOrganization {
  type: string;
  subtype: string;
}

export interface InnovationDeveloper {
  name: string;
  email?: string;
  institution?: string;
}

export interface InnovationCollaborator {
  name: string;
  email?: string;
}

// Policy Change (rt_id=1)
export interface PolicyChangeField {
  label: string;
  value: string;
}

// Innovation Use (rt_id=2)
export interface InnovationUseActor {
  actor_type: string;
  subtype: string;
  women_total: number | null;
  women_youth: number | null;
  women_non_youth: number | null;
  men_total: number | null;
  men_youth: number | null;
  men_non_youth: number | null;
  total: number;
}

export interface InnovationUseOrganization {
  type: string;
  subtype: string;
  how_many: string;
}

export interface InnovationUseMeasure {
  unit_of_measure: string;
  value: string;
}

// ── Display types (output of transform functions) ──

export interface ImpactArea {
  name: string;
  icon_url?: string;
  score: number;
  score_label: string;
}

export interface GeoLocation {
  geo_focus: string;
  regions: string[];
  countries: string[];
}

export interface TheoryOfChange {
  program_name: string;
  area_of_work: string;
  toc_url?: string;
  high_level_output?: string;
  indicator?: string;
}

export interface Evidence {
  label: string;
  link: string;
  description?: string;
  tags?: string[];
}

// ── Main API response ──

export interface PRMSResultData {
  // Core identification
  rt_id: number;
  result_code: number;
  result_name: string;
  result_type: string;
  result_level: string;
  result_description: string;
  title: string;

  // Phase & dates
  phase_name: string;
  generation_date_footer: string;
  submission_status: string;
  submission_data: string;

  // People
  primary_submitter_name: string;
  lead_contact_person: string;
  result_lead: string;

  // Impact tags (format: "(1) Significant")
  nutrition_tag: string;
  climate_tag: string;
  poverty_tag: string;
  gender_tag: string;
  environmental_tag: string;

  // Portfolio
  portfolio_acronym: string;
  is_krs: string;
  krs_link: string | null;

  // Geographic
  geo_focus: string;
  regions: string[] | null;
  countries: string[] | null;
  subnational: string | null;

  // Theory of Change
  toc_primary: TocPrimaryEntry[] | null;
  primary_submitter_data: PrimarySubmitterData | null;

  // Contributors
  contributing_centers: ContributingCenter[];
  contributing_initiatives: ContributingInitiative[] | null;
  non_pooled_projects: NonPooledProject[] | null;

  // Evidence
  linked_evidences: LinkedEvidence[];
  materials_evidence: LinkedEvidence[] | null;

  // Partners
  partners_applicable: string;
  non_kp_partner_data: PartnerEntry[] | null;
  kp_partner_data: KPField[] | null;

  // QA
  qa_adjustments?: QAAdjustment[];

  // Bundled innovations
  bundled_innovations?: BundledInnovation[];

  // Innovation Development (rt_id=7)
  readiness_level?: string;
  readiness_details?: string;
  readiness_justification?: string;
  innovation_nature?: string;
  innovation_type?: string;
  url_readiness?: string;
  innovation_developers?: InnovationDeveloper[];
  innovation_collaborators?: InnovationCollaborator[];
  innovation_investments?: InnovationInvestment[];
  innovation_actors?: InnovationActor[];
  innovation_organizations?: InnovationOrganization[];

  // Policy Change (rt_id=1)
  policy_type_name?: string;
  policy_amount?: string;
  policy_stage?: string;
  policy_implementing_organizations?: string;

  // Innovation Use (rt_id=2)
  innovation_use_actors?: InnovationUseActor[];
  innovation_use_organizations?: InnovationUseOrganization[];
  innovation_use_measures?: InnovationUseMeasure[];
  innovation_readiness_from?: string;
  innovation_readiness_to?: string;

  // Other
  linked_results: unknown[];
  previous_portfolio: unknown[];
  has_actor_data: string;
  actor_data: unknown;
}
