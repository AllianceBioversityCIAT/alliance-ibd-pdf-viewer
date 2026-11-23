import { hasText } from "../shared/utils";
import { getPartnerDisplayName } from "../shared/sections/results_partners/rules";
import {
  POLICY_STAGE_FALLBACK_NAMES,
  POLICY_TYPE_PROGRAM_BUDGET_OR_INVESTMENT,
} from "./catalogs";
import type {
  ImplementingOrganization,
  Institution,
  PolicyCatalogOption,
  PolicyChangePayload,
  PolicyLinkedResult,
} from "./types";

// ── Normalizers (payload fields can be null, wrong type or missing) ──

function text(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return hasText(value) ? value.trim() : null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim().replaceAll(",", ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function isObject<T extends object>(value: unknown): value is T {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionName(option: unknown): string | null {
  if (typeof option === "string") return text(option);
  if (isObject<PolicyCatalogOption>(option)) return text(option.name);
  return null;
}

function optionId(option: unknown): number | null {
  return isObject<PolicyCatalogOption>(option) ? toNumber(option.id) : null;
}

// ── Policy type / stage ──

export function getPolicyTypeId(payload: PolicyChangePayload | null | undefined): number | null {
  if (!payload) return null;
  return optionId(payload.policy_type) ?? toNumber(payload.policy_type_id);
}

export function getPolicyTypeLabel(payload: PolicyChangePayload | null | undefined): string | null {
  return optionName(payload?.policy_type);
}

export function getPolicyStageLabel(payload: PolicyChangePayload | null | undefined): string | null {
  if (!payload) return null;
  const fromPayload = optionName(payload.policy_stage);
  if (fromPayload) return fromPayload;
  const id = optionId(payload.policy_stage) ?? toNumber(payload.policy_stage_id);
  return id == null ? null : (POLICY_STAGE_FALLBACK_NAMES[id] ?? null);
}

/** Same rule as STAR: USD Amount and Status only exist for "Program, Budget, or Investment". */
export function isProgramBudgetOrInvestment(
  payload: PolicyChangePayload | null | undefined,
): boolean {
  return getPolicyTypeId(payload) === POLICY_TYPE_PROGRAM_BUDGET_OR_INVESTMENT;
}

// ── USD amount / status ──

/** "USD 250,000" — 0 is a saved value and is shown; null/empty is hidden. */
export function getUsdAmountLabel(payload: PolicyChangePayload | null | undefined): string | null {
  if (!isProgramBudgetOrInvestment(payload)) return null;
  const amount = toNumber(payload?.usd_amount);
  if (amount == null || amount < 0) return null;
  const formatted = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(amount);
  return `USD ${formatted}`;
}

export function getAmountStatusLabel(payload: PolicyChangePayload | null | undefined): string | null {
  if (!isProgramBudgetOrInvestment(payload)) return null;
  return optionName(payload?.amount_status);
}

export function getEvidenceStage(payload: PolicyChangePayload | null | undefined): string | null {
  return text(payload?.evidence_stage);
}

// ── Implementing organizations ──

/** Merges nested `institution` data onto the junction row; own non-empty fields win. */
function toInstitution(entry: ImplementingOrganization): Institution | null {
  if (!isObject<ImplementingOrganization>(entry)) return null;
  if (entry.is_active === false) return null;
  const nested = isObject<Partial<Institution>>(entry.institution) ? entry.institution : {};
  const merged: Record<string, unknown> = { ...nested };
  for (const [key, value] of Object.entries(entry)) {
    if (key !== "institution" && value != null && value !== "") merged[key] = value;
  }
  const institution = merged as unknown as Institution;
  return hasInstitutionName(institution) ? institution : null;
}

/**
 * Results Partners falls back to printing the institution id. Policy never shows ids:
 * a row without a real name (only `institution_id`, as STAR's GET returns it) is skipped.
 */
function hasInstitutionName(institution: Institution): boolean {
  return [
    institution.html_full_name,
    institution.full_name,
    institution.name,
    institution.acronym,
  ].some((value) => hasText(value));
}

export function getImplementingOrganizations(
  payload: PolicyChangePayload | null | undefined,
): Institution[] {
  const rows = Array.isArray(payload?.implementing_organization)
    ? payload.implementing_organization
    : [];
  const seen = new Set<string>();
  const result: Institution[] = [];
  for (const row of rows) {
    const institution = toInstitution(row);
    if (!institution) continue;
    const key = String(institution.institution_id ?? getPartnerDisplayName(institution));
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(institution);
  }
  return result;
}

// ── Linked results (Innovation Development / Innovation Use) ──

/** A bare id (what STAR's GET returns) can't be displayed — only full result objects count. */
export function getLinkedResult(value: unknown): PolicyLinkedResult | null {
  if (!isObject<PolicyLinkedResult>(value)) return null;
  return text(value.title) ? value : null;
}

/** "STAR 90146" — platform code + official code, same as the STAR picker. */
export function getLinkedResultCode(result: PolicyLinkedResult): string | null {
  const code = text(result.result_official_code);
  if (!code) return null;
  const platform = text(result.platform_code);
  return platform ? `${platform} ${code}` : code;
}

export function getLinkedResultStatus(result: PolicyLinkedResult): string | null {
  return isObject<{ name?: string | null }>(result.result_status)
    ? text(result.result_status.name)
    : null;
}

export function getLinkedResultYear(result: PolicyLinkedResult): string | null {
  return text(result.report_year);
}

export function getInnovationDevelopment(
  payload: PolicyChangePayload | null | undefined,
): PolicyLinkedResult | null {
  return getLinkedResult(payload?.innovation_development);
}

export function getInnovationUse(
  payload: PolicyChangePayload | null | undefined,
): PolicyLinkedResult | null {
  return getLinkedResult(payload?.innovation_use);
}

// ── Section visibility ──

export function shouldRenderPolicyDetails(payload: PolicyChangePayload | null | undefined): boolean {
  return !!(
    getPolicyTypeLabel(payload) ||
    getPolicyStageLabel(payload) ||
    getUsdAmountLabel(payload) ||
    getAmountStatusLabel(payload) ||
    getEvidenceStage(payload)
  );
}

export function shouldRenderImplementingOrganizations(
  payload: PolicyChangePayload | null | undefined,
): boolean {
  return getImplementingOrganizations(payload).length > 0;
}

export function shouldRenderLinkedResults(payload: PolicyChangePayload | null | undefined): boolean {
  return !!(getInnovationDevelopment(payload) || getInnovationUse(payload));
}

export function shouldRenderSection(payload: PolicyChangePayload | null | undefined): boolean {
  if (!payload || !isObject(payload)) return false;
  return (
    shouldRenderPolicyDetails(payload) ||
    shouldRenderImplementingOrganizations(payload) ||
    shouldRenderLinkedResults(payload)
  );
}
