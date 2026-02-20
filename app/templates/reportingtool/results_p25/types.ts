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
  is_primary_center: boolean;
}

export interface TocPrimaryEntry {
  toc_level_name: string;
  toc_work_package_acronym: string;
  toc_result_title: string;
  toc_indicator: string;
  toc_result_description: string;
}

export interface PrimarySubmitterData {
  toc_url: string;
  toc_internal_id: string;
  contributor_name: string;
  contributor_can_match_result: boolean;
}

export interface ContributingInitiative {
  initiative_short_name: string;
}

export interface BilateralProject {
  project_title: string;
  is_lead_project: boolean;
}

export interface PartnerEntry {
  partner_name: string;
  partner_country_hq: string;
  partner_type: string;
  partner_delivery_type: string;
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
  budget: string;
  is_not_determined: boolean;
}

export interface InnovationActor {
  actor_name: string;
  women: boolean;
  women_youth: boolean;
  men: boolean;
  men_youth: boolean;
}

export interface InnovationOrganization {
  organization_name: string;
  other_type: string;
  organization_sub_type: string;
}

export interface InnovationDeveloper {
  name: string;
  email?: string;
  institution?: string;
}

export interface InnovationCollaborator {
  name: string;
  email: string;
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
  countries: { name: string; code: string }[];
}

export interface TheoryOfChange extends PrimarySubmitterData {
  toc_primary: TocPrimaryEntry[];
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
  short_title: string;

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
  countries: { name: string; code: string }[] | null;
  subnational: string | null;

  // Theory of Change
  toc_primary: TocPrimaryEntry[] | null;
  primary_submitter_data: PrimarySubmitterData | null;

  // Contributors
  contributing_centers: ContributingCenter[];
  contributing_initiatives: ContributingInitiative[] | null;
  bilateral_projects: BilateralProject[] | null;

  // Evidence
  linked_evidences: LinkedEvidence[];
  materials_evidence: LinkedEvidence[] | null;

  // Partners
  partners_applicable: string;
  non_kp_partner_data: PartnerEntry[] | null;

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

  // Knowledge Product (rt_id=6)
  kp_handle?: string;
  kp_cgspace_metadata?: {
    isi?: boolean;
    issue_date?: number;
    open_access?: string;
    peer_reviewed?: boolean;
    online_date?: number;
    doi?: string;
  };
  kp_wos_metadata?: {
    issue_date?: number;
    doi?: string;
  };
  kp_authors?: string;
  kp_knowledge_product_type?: string;
  kp_licence?: string;
  kp_keywords?: string;
  kp_agrovocs?: string;
  kp_comodity?: string;
  kp_sponsors?: string;
  kp_altmetrics_score?: number;
  kp_references?: string;
  kp_fair_score?: {
    findable?: string;
    accessible?: string;
    interoperable?: string;
    reusable?: string;
  };

  // Capacity Sharing for Development (rt_id=5)
  capdev_female_using?: string;
  capdev_male_using?: string;
  capdev_term?: string;
  capdev_delivery_method_name?: string;
  capdev_organizations?: string[];

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
