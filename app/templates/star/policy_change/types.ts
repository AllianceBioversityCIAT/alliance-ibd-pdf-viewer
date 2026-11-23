import type { StarCommonPayload } from "../shared/types/star-common-payload.types";
import type { Institution } from "../shared/sections/results_partners/types";

/** Catalog option sent as full data, e.g. `{ id: 3, name: "Program, Budget, or Investment" }`. */
export interface PolicyCatalogOption {
  id?: number | string | null;
  name?: string | null;
  description?: string | null;
}

/**
 * Implementing organization. STAR's GET returns the junction row
 * (`result_institution_id`, `institution_id`, `institution_role_id`). For the PDF the backend sends
 * the institution data too: flat on the row (same fields as Results Partners) or nested in `institution`.
 */
export interface ImplementingOrganization extends Partial<Institution> {
  result_institution_id?: number | null;
  result_id?: number | null;
  is_active?: boolean;
  institution?: Partial<Institution> | null;
}

/** STAR `result_status` row. Colors come from `config.color` (same as the STAR status tag). */
export interface LinkedResultStatus {
  result_status_id?: number | null;
  name?: string | null;
  config?: {
    color?: { border?: string | null; text?: string | null; background?: string | null } | null;
  } | null;
  /** Flat alternative, same names as general_information.status */
  status_border_color?: string | null;
  status_text_color?: string | null;
}

/**
 * Linked Innovation Development / Innovation Use result. STAR's GET returns only the result id;
 * the PDF needs the full result (same data the STAR picker shows: code, title and status).
 */
export interface PolicyLinkedResult {
  result_id?: number | null;
  result_official_code?: number | string | null;
  platform_code?: string | null;
  title?: string | null;
  result_status?: LinkedResultStatus | null;
  /** Optional enrichments, shown when present */
  report_year?: number | string | null;
  result_type?: string | null;
}

/** STAR backend interface (`GET /api/results/policy-change/by-result-id/:id`), enriched with full data. */
export interface GetPolicyChange {
  /** Kept for the "Program, Budget, or Investment" rule when `policy_type` is not sent. */
  policy_type_id?: number | null;
  policy_type?: PolicyCatalogOption | null;
  policy_stage_id?: number | null;
  policy_stage?: PolicyCatalogOption | null;
  /** Only shown when the policy type is 3 (Program, Budget, or Investment). 0 is a valid value. */
  usd_amount?: number | string | null;
  /** Confirmed / Estimated / Unknown — object or plain label. */
  amount_status?: PolicyCatalogOption | string | null;
  evidence_stage?: string | null;
  implementing_organization?: ImplementingOrganization[] | null;
  /** Full linked result. A bare id (as STAR's GET returns it) is ignored. */
  innovation_development?: PolicyLinkedResult | number | null;
  innovation_use?: PolicyLinkedResult | number | null;
}

export type PolicyChangePayload = GetPolicyChange;

export interface PolicyChangePdfPayload extends Omit<StarCommonPayload, "ip_rights"> {
  policy_change: PolicyChangePayload;
}

export type { StarCommonPayload, Institution };
