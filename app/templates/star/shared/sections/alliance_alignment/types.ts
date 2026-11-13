/**
 * Alliance Alignment — STAR payload contract.
 *
 * The section depends on two inputs sent by STAR:
 *   1. The result's **portfolio** (resolved by STAR from the report year against the
 *      `portfolios` table — years are NEVER hardcoded here).
 *   2. The result's **indicator** (`indicator_id`).
 *
 * Every field is optional: the backend may send null, wrong types or nothing at all.
 * See `rules.ts` for the visibility matrix (portfolio × indicator).
 */

// ── Shared primitives ──

/** Portfolio row from STAR (`metadata.portfolio`). Years come from the DB, not from code. */
export interface PortfolioInfo {
  id?: number | string | null;
  name?: string | null;
  description?: string | null;
  start_year?: number | string | null;
  end_year?: number | string | null;
}

export interface ContractLever {
  full_name?: string;
  short_name?: string;
  /** Absolute URL to lever artwork (e.g. S3) returned by STAR API */
  icon?: string;
  lever_url?: string;
  lever_id?: string | number;
}

export interface Contract {
  is_active?: boolean;
  result_contract_id?: number;
  result_id?: number;
  contract_id: string;
  contract_role_id?: number;
  is_primary?: boolean;
  agreement_id?: string;
  description?: string;
  contract_status?: string;
  project_lead_description?: string;
  start_date?: string;
  end_date?: string;
  endDateGlobal?: string;
  levers?: ContractLever;
  /** True when the contract contributes to the CGIAR Portfolio (pool funding). Shows the "Contributing to CGIAR Portfolio" tag. */
  is_pool_funding_contributor?: boolean | number | string | null;
  /** STAR may nest the Agresso row (TypeORM relation) — flattened in rules.ts */
  agresso_contract?: Partial<Contract> | null;
}

/** CLARISA SDG (Contribution to SDG). `icon` is an absolute S3 URL when available. */
export interface GetSdgs {
  id?: number;
  result_sdg_id?: number;
  clarisa_sdg_id?: number;
  smo_code?: number | string;
  usnd_code?: number | string;
  financial_code?: string;
  short_name?: string;
  full_name?: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
  /** Some STAR responses nest the catalog row */
  sdg?: GetSdgs | null;
  clarisa_sdg?: GetSdgs | null;
}

/**
 * SDG target. Supports both the CLARISA shape (`sdg_target_code` + `sdg_target`)
 * and the legacy PDF shape (`target` + `description`).
 */
export interface ResultLeverSdgTargetPayload {
  id?: number;
  sdg_target_id?: number;
  clarisa_sdg_target_id?: number;
  /** e.g. "2.5" */
  sdg_target_code?: string;
  code?: string;
  /** Legacy: e.g. "SDG target 2.5" */
  target?: string;
  /** CLARISA target text */
  sdg_target?: string;
  description?: string;
  /** Optional SDG artwork for the target */
  icon?: string;
  /** Parent SDG (used for grouping + icon) */
  sdg?: GetSdgs | null;
  /** STAR shape: parent CLARISA SDG with `icon` */
  clarisa_sdg?: GetSdgs | null;
  select_label?: string;
  /** Some STAR responses nest the catalog row */
  clarisa_sdg_target?: ResultLeverSdgTargetPayload | null;
}

export type SdgTargetPayload = ResultLeverSdgTargetPayload;

export interface LeverStrategicOutcome {
  id?: number;
  lever_strategic_outcome_id?: number;
  /** STAR catalog text, usually "SO1: description" */
  strategic_outcome?: string;
  code?: string;
  name?: string;
  description?: string;
  /** Some STAR responses nest the catalog row */
  lever_strategic_outcome?: LeverStrategicOutcome | null;
}

/**
 * Lever (Portfolio 1) or Research Area (Portfolio 2). Both live in `result_levers`;
 * `lever_role_id` 1 = ALIGNMENT (P1 levers), 3 = RESEARCH_AREAS_ALIGNMENT (P2).
 */
export interface Lever {
  result_lever_id?: number;
  result_id?: number;
  lever_id?: string | number;
  lever_role_id?: number;
  is_primary?: boolean;
  portfolio_id?: number | string;
  id?: number;
  /** Absolute URL to lever artwork (e.g. S3) returned by STAR API */
  icon?: string;
  /** Alias of `icon` used by some STAR catalogs */
  lever_url?: string;
  name?: string;
  short_name?: string;
  full_name?: string;
  other_names?: string;
  description?: string;
  /** Lever "Other" → "Name of the team or area creating the result" */
  custom_lever_name?: string;
  /** OICR Portfolio 1 only */
  result_lever_strategic_outcomes?: LeverStrategicOutcome[];
  /** OICR Portfolio 1 only */
  result_lever_sdg_targets?: ResultLeverSdgTargetPayload[];
  /** @deprecated legacy — SDGs attached to a lever */
  result_lever_sdgs?: GetSdgs[];
}

/** Portfolio 2 catalog item (Strategic Objective / Impact Outcome). */
export interface AlignmentCatalogItem {
  id?: number;
  strategic_objective_id?: number;
  impact_outcome_id?: number;
  portfolio_id?: number;
  code?: string;
  short_name?: string;
  name?: string;
  full_name?: string;
  description?: string;
  /** Optional artwork (absolute S3 URL) */
  icon?: string;
  /** Some STAR responses nest the catalog row */
  strategic_objective?: AlignmentCatalogItem | null;
  impact_outcome?: AlignmentCatalogItem | null;
}

// ── Payload ──

/** STAR backend interface (`GET /api/results/:id/alignments`). */
export interface GetAllianceAlignment {
  contracts?: Contract[];

  /** Contribution to SDG — every indicator except OICR (5) */
  result_sdgs?: GetSdgs[];

  /** Portfolio 1 */
  primary_levers?: Lever[];
  contributor_levers?: Lever[];

  /** Portfolio 2 — Research Areas (result_levers role 3). */
  research_areas?: Lever[];
  /** Portfolio 2 */
  strategic_objectives?: AlignmentCatalogItem[];
  result_strategic_objectives?: AlignmentCatalogItem[];
  /** Portfolio 2 — indicators 4, 5, 6 */
  impact_outcomes?: AlignmentCatalogItem[];
  result_impact_outcomes?: AlignmentCatalogItem[];
  /** Portfolio 2 — OICR (5) only, result-level (not per lever) */
  sdg_targets?: SdgTargetPayload[];
  result_sdg_targets?: SdgTargetPayload[];
}

/** PDF context — portfolio + indicator drive which blocks render. */
export interface AllianceAlignmentPdfContext {
  /** 1 Capacity Sharing, 2 Innovation Dev, 4 Policy Change, 5 OICR, 6 Innovation Use */
  indicator_id?: number | string | null;
  /** Preferred: `metadata.portfolio` from STAR */
  portfolio?: PortfolioInfo | null;
  /** Accepted aliases (same as the STAR client) */
  portfolio_id?: number | string | null;
  portfolioId?: number | string | null;
  /** @deprecated Prefer contract.agreement_id + description */
  contract_labels?: Record<string, string>;
  /** @deprecated Prefer contract.project_lead_description */
  contract_pi?: Record<string, string>;
  /** @deprecated Prefer contract.start_date / end_date */
  contract_dates?: Record<string, { start_date?: string; end_date?: string }>;
}

export type AllianceAlignmentPayload = GetAllianceAlignment &
  AllianceAlignmentPdfContext;

// ── Display models (output of rules.ts) ──

export type PortfolioVariant = "P1" | "P2";

export interface ContractLeverDisplay {
  label: string;
  icon: string | null;
}

export interface ContractDisplayRow {
  label: string;
  value: string;
}

/** SDG target row — bold blue prefix + body description */
export interface SdgTargetLineDisplay {
  prefix: string | null;
  description: string;
  icon?: string | null;
}

/** SDG targets grouped under their parent SDG (P2 OICR) */
export interface SdgTargetGroupDisplay {
  key: string;
  title: string | null;
  icon: string | null;
  color: string | null;
  lines: SdgTargetLineDisplay[];
}

export interface SdgDisplay {
  key: string;
  /** e.g. "SDG 2" */
  code: string | null;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
}

export interface CatalogItemDisplay {
  key: string;
  code: string | null;
  title: string;
  description: string | null;
  icon: string | null;
}

export interface LeverDisplay {
  key: string;
  title: string;
  description: string | null;
  icon: string | null;
  /** "Name of the team or area creating the result" (lever "Other") */
  customName: string | null;
  isOther: boolean;
  strategicOutcomes: SdgTargetLineDisplay[];
  sdgTargets: SdgTargetLineDisplay[];
  /** Whether Strategic Outcome(s) applies to this card (OICR P1 primary, not "Other") */
  showStrategicOutcomes: boolean;
  /** Whether SDG target(s) applies to this card (OICR P1) */
  showSdgTargets: boolean;
}

/** Everything the component needs, already resolved by the visibility matrix. */
export interface AllianceAlignmentView {
  variant: PortfolioVariant;
  indicatorId: number | null;
  isOicr: boolean;
  portfolioLabel: string | null;
  contracts: Contract[];
  /** P1 */
  primaryLevers: LeverDisplay[];
  contributorLevers: LeverDisplay[];
  primaryLeversTitle: string;
  contributorLeversTitle: string;
  /** P2 */
  researchAreas: LeverDisplay[];
  strategicObjectives: CatalogItemDisplay[];
  impactOutcomes: CatalogItemDisplay[];
  sdgTargetGroups: SdgTargetGroupDisplay[];
  /** Both portfolios, non-OICR */
  sdgs: SdgDisplay[];
}
