import { getLeverIconUrl, hasArrayItems, hasText, shouldRenderLeverIcon } from "../../utils";
import type {
  AlignmentCatalogItem,
  AllianceAlignmentPayload,
  AllianceAlignmentView,
  CatalogItemDisplay,
  Contract,
  ContractDisplayRow,
  ContractLeverDisplay,
  GetSdgs,
  Lever,
  LeverDisplay,
  LeverStrategicOutcome,
  PortfolioVariant,
  ResultLeverSdgTargetPayload,
  SdgDisplay,
  SdgTargetGroupDisplay,
  SdgTargetLineDisplay,
} from "./types";

/*
 * ─────────────────────────────────────────────────────────────────────────────
 *  Visibility matrix (mirrors STAR `alliance-alignment` + `report_alliance_alignment`)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  | Block                         | Portfolio 1                 | Portfolio 2           |
 *  |-------------------------------|-----------------------------|-----------------------|
 *  | Contributing projects         | always                      | always                |
 *  | Primary Levers                | always                      | —                     |
 *  | (Other) Contributing Levers   | always ("Other …" in OICR)  | —                     |
 *  |   ↳ Strategic Outcome(s)      | OICR, primary, not "Other"  | —                     |
 *  |   ↳ SDG target(s)             | OICR                        | —                     |
 *  | Research Areas                | —                           | always                |
 *  | Strategic Objectives          | —                           | always                |
 *  | Impact Outcomes               | —                           | indicators 4, 5, 6    |
 *  | SDG Targets (result level)    | —                           | OICR                  |
 *  | Contribution to SDG           | all except OICR             | all except OICR       |
 *
 *  Portfolio is resolved by STAR from the report year against the `portfolios`
 *  table and sent as `portfolio.id` (or `portfolio_id` / `portfolioId`).
 *  Years are NEVER hardcoded here. Same rule as the STAR client: id 2 → P2,
 *  anything else (or missing) → P1.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const INDICATOR_IDS = {
  CAPACITY_SHARING: 1,
  INNOVATION_DEV: 2,
  POLICY_CHANGE: 4,
  OICR: 5,
  INNOVATION_USE: 6,
} as const;

export const PORTFOLIO_IDS = { PORTFOLIO_1: 1, PORTFOLIO_2: 2 } as const;

/** `lever_id` of the "Other" option per portfolio */
export const OTHER_LEVER_IDS: Record<PortfolioVariant, number> = { P1: 9, P2: 18 };

/** Icon STAR uses for the "Other" lever when the payload has none */
export const OTHER_LEVER_ICON =
  "https://alliance-files-storage.s3.us-east-1.amazonaws.com/images/levers/other.png";

/** `lever_role_id` used by each portfolio in `result_levers` */
export const LEVER_ROLE_IDS = { ALIGNMENT: 1, RESEARCH_AREAS_ALIGNMENT: 3 } as const;

const IMPACT_OUTCOME_INDICATORS: readonly number[] = [
  INDICATOR_IDS.POLICY_CHANGE,
  INDICATOR_IDS.OICR,
  INDICATOR_IDS.INNOVATION_USE,
];

const LEVER_NOT_AVAILABLE = "Not available";

/** Example lever icon URLs from STAR / alliance-files-storage (for demos) */
export const STAR_LEVER_ICON_EXAMPLES = {
  L2_MULTIFUNCTIONAL_LANDSCAPES:
    "https://alliance-files-storage.s3.us-east-1.amazonaws.com/images/levers/L2-Multifuntional-Landscapes_COLOR.png",
  L3_CLIMATE_ACTION:
    "https://alliance-files-storage.s3.us-east-1.amazonaws.com/images/levers/L3-Climate-Action_COLOR.png",
  L4_AGROBIODIVERSITY:
    "https://alliance-files-storage.s3.us-east-1.amazonaws.com/images/levers/L4-Agrobiodiversity_COLOR.png",
} as const;

export { getLeverIconUrl, shouldRenderLeverIcon };

// ── Low-level helpers ──

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function text(value: unknown): string | null {
  return hasText(value) ? value.trim() : null;
}

function firstText(...values: unknown[]): string | null {
  for (const v of values) {
    const t = text(v);
    if (t) return t;
  }
  return null;
}

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value.filter((v) => v != null && typeof v === "object") : [];
}

/** Merges a nested catalog row (e.g. `{ strategic_objective: {...} }`) under the item's own fields. */
function unwrap<T extends object>(item: T, keys: string[]): T {
  const record = item as Record<string, unknown>;
  for (const key of keys) {
    const nested = record[key];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      const merged: Record<string, unknown> = { ...(nested as Record<string, unknown>) };
      for (const [k, v] of Object.entries(record)) {
        if (k !== key && v != null && v !== "") merged[k] = v;
      }
      return merged as T;
    }
  }
  return item;
}

function dedupe<T>(items: T[], keyOf: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyOf(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Portfolio & indicator ──

export function getPortfolioId(
  data: AllianceAlignmentPayload | null | undefined,
): number | null {
  if (!data) return null;
  return (
    toNumber(data.portfolio?.id) ?? toNumber(data.portfolio_id) ?? toNumber(data.portfolioId)
  );
}

export function getPortfolioVariant(
  data: AllianceAlignmentPayload | null | undefined,
): PortfolioVariant {
  return getPortfolioId(data) === PORTFOLIO_IDS.PORTFOLIO_2 ? "P2" : "P1";
}

export function getIndicatorId(
  data: AllianceAlignmentPayload | null | undefined,
): number | null {
  return toNumber(data?.indicator_id);
}

export function isOicr(data: AllianceAlignmentPayload | null | undefined): boolean {
  return getIndicatorId(data) === INDICATOR_IDS.OICR;
}

/** e.g. "Portfolio 2 · 2026–2030" — built only from what STAR sends. */
export function getPortfolioLabel(
  data: AllianceAlignmentPayload | null | undefined,
): string | null {
  const portfolio = data?.portfolio;
  const name = text(portfolio?.name);
  const start = toNumber(portfolio?.start_year);
  const end = toNumber(portfolio?.end_year);
  const years = start != null && end != null ? `${start}–${end}` : null;

  if (name && years && !name.includes(years)) return `${name} · ${years}`;
  if (name) return name;
  if (years) {
    const id = getPortfolioId(data);
    return id != null ? `Portfolio ${id} · ${years}` : years;
  }
  return null;
}

// ── Applicability (portfolio × indicator) ──

export function appliesContributionToSdg(data: AllianceAlignmentPayload): boolean {
  return !isOicr(data);
}

export function appliesLeverOutcomesAndTargets(data: AllianceAlignmentPayload): boolean {
  return getPortfolioVariant(data) === "P1" && isOicr(data);
}

export function appliesImpactOutcomes(data: AllianceAlignmentPayload): boolean {
  const indicator = getIndicatorId(data);
  return (
    getPortfolioVariant(data) === "P2" &&
    indicator != null &&
    IMPACT_OUTCOME_INDICATORS.includes(indicator)
  );
}

export function appliesResultSdgTargets(data: AllianceAlignmentPayload): boolean {
  return getPortfolioVariant(data) === "P2" && isOicr(data);
}

// ── Contracts ──

function isActiveContract(contract: Contract): boolean {
  return contract.is_active !== false;
}

/** STAR may nest the Agresso data under `agresso_contract` — own fields win when present. */
function flattenContract(contract: Contract): Contract {
  const nested = contract.agresso_contract;
  if (!nested || typeof nested !== "object") return contract;
  const merged: Record<string, unknown> = { ...nested };
  for (const [k, v] of Object.entries(contract)) {
    if (k !== "agresso_contract" && v != null && v !== "") merged[k] = v;
  }
  return merged as unknown as Contract;
}

export function getContractsForPdf(
  payload: AllianceAlignmentPayload | null | undefined,
): Contract[] {
  return asArray(payload?.contracts)
    .map(flattenContract)
    .filter(isActiveContract)
    .filter((c) => hasText(c.contract_id) || hasText(c.agreement_id) || hasText(c.description))
    .sort((a, b) => Number(b.is_primary === true) - Number(a.is_primary === true));
}

export function getPrimaryContracts(contracts: Contract[]): Contract[] {
  return contracts.filter((c) => c.is_primary === true);
}

/** Same text STAR shows on the pool-funding tag of Contributing projects. */
export const POOL_FUNDING_TAG_LABEL = "Contributing to CGIAR Portfolio";

/** STAR flag `is_pool_funding_contributor` (boolean, or 1/"true" from SQL rows). */
export function isPoolFundingContributor(contract: Contract): boolean {
  const flag: unknown = contract.is_pool_funding_contributor;
  return flag === true || flag === 1 || flag === "1" || flag === "true";
}

export function getContractEndDate(contract: Contract): string | null {
  return firstText(contract.end_date, contract.endDateGlobal);
}

export function getContractLeverDisplay(contract: Contract): ContractLeverDisplay {
  const lever = contract.levers;
  const full = text(lever?.full_name);
  if (!lever || !full || full === LEVER_NOT_AVAILABLE) {
    return { label: "Lever - Not available", icon: null };
  }
  return {
    label: text(lever.short_name) ?? full,
    icon: getLeverIconUrl(lever.icon) ?? getLeverIconUrl(lever.lever_url),
  };
}

export function getContractTitle(
  payload: AllianceAlignmentPayload,
  contract: Contract,
): string {
  const mapped = text(payload.contract_labels?.[contract.contract_id]);
  if (mapped) return mapped;

  const parts = [text(contract.agreement_id), text(contract.description)].filter(
    (p): p is string => p != null,
  );
  if (parts.length > 0) return parts.join(" - ");
  return text(contract.contract_id) ?? "Project";
}

export function getContractDisplayRows(
  payload: AllianceAlignmentPayload,
  contract: Contract,
): ContractDisplayRow[] {
  const rows: ContractDisplayRow[] = [];
  const legacyDates = payload.contract_dates?.[contract.contract_id];

  const pi = firstText(contract.project_lead_description, payload.contract_pi?.[contract.contract_id]);
  if (pi) rows.push({ label: "Principal investigator", value: pi });

  const start = firstText(contract.start_date, legacyDates?.start_date);
  if (start) rows.push({ label: "Start date", value: start });

  const end = firstText(getContractEndDate(contract), legacyDates?.end_date);
  if (end) rows.push({ label: "End date", value: end });

  const status = text(contract.contract_status);
  if (status) rows.push({ label: "Contract status", value: status });

  return rows;
}

// ── SDGs (Contribution to SDG) ──

function normalizeSdg(raw: GetSdgs): GetSdgs {
  return unwrap(raw, ["sdg", "clarisa_sdg"]);
}

function getSdgNumber(sdg: GetSdgs | null | undefined): number | null {
  if (!sdg) return null;
  const s = normalizeSdg(sdg);
  return toNumber(s.smo_code) ?? toNumber(s.usnd_code);
}

/** CLARISA short names look like "Goal 2: Zero Hunger" → { num: 2, name: "Zero Hunger" } */
function splitGoalName(value: string | null): { num: number | null; name: string | null } {
  if (!value) return { num: null, name: null };
  const match = value.match(/^\s*(?:goal|sdg)\s*(\d+)\s*[:.\-–]\s*(.+)$/i);
  if (match) return { num: toNumber(match[1]), name: match[2].trim() };
  return { num: null, name: value };
}

export function formatSdg(raw: GetSdgs): SdgDisplay | null {
  const sdg = normalizeSdg(raw);
  const short = splitGoalName(text(sdg.short_name));
  const num = getSdgNumber(sdg) ?? short.num;
  const code = num != null ? `SDG ${num}` : null;
  const fullName = text(sdg.full_name);
  const title = short.name ?? fullName ?? code;
  if (!title) return null;

  // Official goal statement (full_name) reads best in a PDF; fall back to the long description
  const descCandidate = firstText(fullName !== title ? fullName : null, sdg.description);
  const description = descCandidate && descCandidate !== title ? descCandidate : null;

  return {
    key: String(num ?? sdg.id ?? sdg.clarisa_sdg_id ?? title),
    code,
    title,
    description,
    icon: getLeverIconUrl(sdg.icon),
    color: text(sdg.color),
  };
}

export function getContributionSdgs(data: AllianceAlignmentPayload): SdgDisplay[] {
  if (!appliesContributionToSdg(data)) return [];
  const items = asArray(data.result_sdgs)
    .map(formatSdg)
    .filter((s): s is SdgDisplay => s != null);
  return dedupe(items, (s) => s.key).sort((a, b) => sdgSortKey(a.key) - sdgSortKey(b.key));
}

function sdgSortKey(key: string): number {
  const n = Number(key);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}

// ── SDG targets ──

function normalizeTarget(raw: ResultLeverSdgTargetPayload): ResultLeverSdgTargetPayload {
  const target = unwrap(raw, ["clarisa_sdg_target"]);
  // STAR sends the parent SDG as `clarisa_sdg`; treat it as `sdg`
  if (!target.sdg && target.clarisa_sdg && typeof target.clarisa_sdg === "object") {
    return { ...target, sdg: target.clarisa_sdg };
  }
  return target;
}

function getTargetCode(target: ResultLeverSdgTargetPayload): string | null {
  return firstText(target.sdg_target_code, target.code);
}

function formatPrefix(value: string): string {
  return value.endsWith(":") ? value : `${value}:`;
}

export function formatSdgTargetLine(
  raw: ResultLeverSdgTargetPayload,
  sdgCatalog: GetSdgs[] = [],
): SdgTargetLineDisplay | null {
  const target = normalizeTarget(raw);
  const code = getTargetCode(target);
  const legacyTarget = text(target.target);
  const body = firstText(target.sdg_target, target.description);

  const prefixSource = code ?? legacyTarget;
  const description = body ?? (code ? legacyTarget : null);
  const icon = getTargetIcon(target, sdgCatalog);

  if (description) {
    return { prefix: prefixSource ? formatPrefix(prefixSource) : null, description, icon };
  }
  if (prefixSource) return { prefix: null, description: prefixSource, icon };
  return null;
}

/** SDG number owning a target: from `sdg`, else from the code prefix ("2.5" → 2). */
function getTargetSdgNumber(target: ResultLeverSdgTargetPayload): number | null {
  const code = getTargetCode(target) ?? text(target.target);
  const match = code?.match(/(\d+)\.[\da-z]+/i);
  const fromCode = match ? toNumber(match[1]) : null;
  return fromCode ?? getSdgNumber(target.sdg ?? null);
}

function findSdgInCatalog(num: number | null, catalog: GetSdgs[]): GetSdgs | null {
  if (num == null) return null;
  return catalog.find((s) => getSdgNumber(s) === num) ?? null;
}

function getTargetIcon(target: ResultLeverSdgTargetPayload, catalog: GetSdgs[]): string | null {
  const own = getLeverIconUrl(target.icon);
  if (own) return own;
  const parent = target.sdg ? normalizeSdg(target.sdg) : null;
  const parentIcon = getLeverIconUrl(parent?.icon);
  if (parentIcon) return parentIcon;
  const fromCatalog = findSdgInCatalog(getTargetSdgNumber(target), catalog);
  return getLeverIconUrl(fromCatalog ? normalizeSdg(fromCatalog).icon : null);
}

function getSdgTargetLines(
  targets: ResultLeverSdgTargetPayload[] | null | undefined,
  catalog: GetSdgs[],
): SdgTargetLineDisplay[] {
  const lines = asArray(targets)
    .map((t) => formatSdgTargetLine(t, catalog))
    .filter((l): l is SdgTargetLineDisplay => l != null);
  return dedupe(lines, (l) => `${l.prefix ?? ""}|${l.description}`);
}

/** Portfolio 2 OICR: result-level SDG targets grouped by their parent SDG. */
export function getResultSdgTargetGroups(data: AllianceAlignmentPayload): SdgTargetGroupDisplay[] {
  if (!appliesResultSdgTargets(data)) return [];
  const catalog = asArray(data.result_sdgs);
  const raw = asArray(data.sdg_targets).length
    ? asArray(data.sdg_targets)
    : asArray(data.result_sdg_targets);

  const groups = new Map<string, SdgTargetGroupDisplay & { order: number }>();

  for (const item of raw) {
    const target = normalizeTarget(item);
    const line = formatSdgTargetLine(target, catalog);
    if (!line) continue;

    const num = getTargetSdgNumber(target);
    const sdg = target.sdg ? normalizeSdg(target.sdg) : findSdgInCatalog(num, catalog);
    const key = num != null ? String(num) : "other";

    if (!groups.has(key)) {
      const name = splitGoalName(firstText(sdg?.short_name, sdg?.full_name)).name;
      const title = num != null ? (name ? `SDG ${num} · ${name}` : `SDG ${num}`) : name;
      groups.set(key, {
        key,
        title,
        icon: getLeverIconUrl(sdg?.icon) ?? line.icon ?? null,
        color: text(sdg?.color),
        lines: [],
        order: num ?? Number.MAX_SAFE_INTEGER,
      });
    }
    const group = groups.get(key)!;
    const lineKey = `${line.prefix ?? ""}|${line.description}`;
    if (!group.lines.some((l) => `${l.prefix ?? ""}|${l.description}` === lineKey)) {
      // Icon already shown in the group header
      group.lines.push({ ...line, icon: null });
    }
  }

  return [...groups.values()]
    .sort((a, b) => a.order - b.order)
    .map((group) => ({
      key: group.key,
      title: group.title,
      icon: group.icon,
      color: group.color,
      lines: group.lines,
    }));
}

// ── Levers / Research Areas ──

function leverIdentity(lever: Lever): string {
  return String(lever.lever_id ?? lever.id ?? lever.result_lever_id ?? getLeverTitle(lever));
}

export function isOtherLever(lever: Lever, variant: PortfolioVariant): boolean {
  return toNumber(lever.lever_id) === OTHER_LEVER_IDS[variant];
}

/** Same as STAR: `short_name - other_names` (when other_names adds information). */
export function getLeverTitle(lever: Lever): string {
  const short = firstText(lever.short_name, lever.name);
  const other = text(lever.other_names);
  if (short && other && !short.toLowerCase().includes(other.toLowerCase())) {
    return `${short} - ${other}`;
  }
  return (
    short ??
    firstText(lever.full_name, other) ??
    (lever.lever_id != null ? `Lever ${lever.lever_id}` : "Lever")
  );
}

function getLeverDescription(lever: Lever, title: string): string | null {
  const candidate = firstText(lever.description, lever.full_name);
  if (!candidate) return null;
  const lowerTitle = title.toLowerCase();
  const lowerCandidate = candidate.toLowerCase();
  if (lowerTitle === lowerCandidate || lowerTitle.includes(lowerCandidate)) return null;
  return candidate;
}

function getLeverIcon(lever: Lever): string | null {
  return getLeverIconUrl(lever.icon) ?? getLeverIconUrl(lever.lever_url);
}

/**
 * Strategic Outcome(s). STAR sends `strategic_outcome` as "SO1: description"
 * (split on the first ":" like the STAR client); legacy `name` + `description` also work.
 */
export function getStrategicOutcomeLines(lever: Lever): SdgTargetLineDisplay[] {
  const lines = asArray(lever.result_lever_strategic_outcomes)
    .map((raw: LeverStrategicOutcome): SdgTargetLineDisplay | null => {
      const o = unwrap(raw, ["lever_strategic_outcome"]);
      const nestedText =
        typeof o.strategic_outcome === "string" ? text(o.strategic_outcome) : null;

      if (nestedText) {
        const idx = nestedText.indexOf(":");
        if (idx > 0 && idx < nestedText.length - 1) {
          return {
            prefix: formatPrefix(nestedText.slice(0, idx).trim()),
            description: nestedText.slice(idx + 1).trim(),
          };
        }
        return { prefix: null, description: nestedText };
      }

      const label = firstText(o.code, o.name);
      const desc = text(o.description);
      if (label && desc && label !== desc) return { prefix: formatPrefix(label), description: desc };
      const only = desc ?? label;
      return only ? { prefix: null, description: only } : null;
    })
    .filter((line): line is SdgTargetLineDisplay => line != null);
  return dedupe(lines, (l) => `${l.prefix ?? ""}|${l.description}`);
}

export function getContributorLeversExcludingPrimary(
  primaryLevers: Lever[],
  contributorLevers: Lever[],
): Lever[] {
  const primaryIds = new Set(primaryLevers.map(leverIdentity));
  return contributorLevers.filter((lever) => !primaryIds.has(leverIdentity(lever)));
}

function toLeverDisplay(
  lever: Lever,
  options: {
    variant: PortfolioVariant;
    isPrimary: boolean;
    withOicrDetails: boolean;
    sdgCatalog: GetSdgs[];
  },
): LeverDisplay {
  const { variant, isPrimary, withOicrDetails, sdgCatalog } = options;
  const isOther = isOtherLever(lever, variant);
  const customName = text(lever.custom_lever_name);
  // "Other" lever (same as STAR): team/area name + "(Other)" and the STAR "other" icon
  let title = getLeverTitle(lever);
  if (isOther) title = customName ? `${customName} (Other)` : "Other";
  const showStrategicOutcomes = withOicrDetails && isPrimary && !isOther;

  return {
    key: leverIdentity(lever),
    title,
    description: isOther ? null : getLeverDescription(lever, title),
    icon: getLeverIcon(lever) ?? (isOther ? OTHER_LEVER_ICON : null),
    customName: isOther ? null : customName,
    isOther,
    strategicOutcomes: showStrategicOutcomes ? getStrategicOutcomeLines(lever) : [],
    sdgTargets: withOicrDetails ? getSdgTargetLines(lever.result_lever_sdg_targets, sdgCatalog) : [],
    showStrategicOutcomes,
    showSdgTargets: withOicrDetails,
  };
}

/** Skips empty objects: a lever needs an id or a name to be shown. */
function isDisplayableLever(lever: Lever): boolean {
  return (
    lever.lever_id != null ||
    lever.id != null ||
    firstText(lever.short_name, lever.name, lever.full_name, lever.other_names, lever.custom_lever_name) != null
  );
}

function getP1Levers(data: AllianceAlignmentPayload): { primary: Lever[]; contributor: Lever[] } {
  const isP1Lever = (l: Lever) =>
    l.lever_role_id == null || toNumber(l.lever_role_id) !== LEVER_ROLE_IDS.RESEARCH_AREAS_ALIGNMENT;
  const primary = dedupe(asArray(data.primary_levers).filter(isP1Lever).filter(isDisplayableLever), leverIdentity);
  const contributor = dedupe(
    getContributorLeversExcludingPrimary(
      primary,
      asArray(data.contributor_levers).filter(isP1Lever).filter(isDisplayableLever),
    ),
    leverIdentity,
  );
  return { primary, contributor };
}

/**
 * Research Areas: `research_areas` when STAR sends it; otherwise the levers with
 * role 3 (the report view exposes Research Areas as `primary_lever` in P2).
 */
function getP2ResearchAreas(data: AllianceAlignmentPayload): Lever[] {
  const explicit = asArray(data.research_areas).filter(isDisplayableLever);
  if (explicit.length) return dedupe(explicit, leverIdentity);

  const all = [...asArray(data.primary_levers), ...asArray(data.contributor_levers)].filter(
    isDisplayableLever,
  );
  const withRole = all.filter(
    (l) => toNumber(l.lever_role_id) === LEVER_ROLE_IDS.RESEARCH_AREAS_ALIGNMENT,
  );
  const hasRoleInfo = all.some((l) => l.lever_role_id != null);
  return dedupe(hasRoleInfo ? withRole : all, leverIdentity);
}

// ── Portfolio 2 catalogs ──

function toCatalogDisplay(raw: AlignmentCatalogItem, nestedKeys: string[]): CatalogItemDisplay | null {
  const item = unwrap(raw, nestedKeys);
  const code = text(item.code);
  const name = firstText(item.name, item.short_name, item.full_name);
  const title = name ?? text(item.description) ?? code;
  if (!title) return null;
  const description = text(item.description);

  return {
    key: String(item.strategic_objective_id ?? item.impact_outcome_id ?? item.id ?? code ?? title),
    code: code && code !== title ? code : null,
    title,
    description: description && description !== title ? description : null,
    icon: getLeverIconUrl(item.icon),
  };
}

function getCatalog(
  primary: AlignmentCatalogItem[] | null | undefined,
  fallback: AlignmentCatalogItem[] | null | undefined,
  nestedKeys: string[],
): CatalogItemDisplay[] {
  const source = asArray(primary).length ? asArray(primary) : asArray(fallback);
  const items = source
    .map((i) => toCatalogDisplay(i, nestedKeys))
    .filter((i): i is CatalogItemDisplay => i != null);
  return dedupe(items, (i) => i.key);
}

export function getStrategicObjectives(data: AllianceAlignmentPayload): CatalogItemDisplay[] {
  if (getPortfolioVariant(data) !== "P2") return [];
  return getCatalog(data.strategic_objectives, data.result_strategic_objectives, ["strategic_objective"]);
}

export function getImpactOutcomes(data: AllianceAlignmentPayload): CatalogItemDisplay[] {
  if (!appliesImpactOutcomes(data)) return [];
  return getCatalog(data.impact_outcomes, data.result_impact_outcomes, ["impact_outcome"]);
}

// ── View model ──

export function getAllianceAlignmentView(
  data: AllianceAlignmentPayload | null | undefined,
): AllianceAlignmentView | null {
  if (!data || typeof data !== "object") return null;

  const variant = getPortfolioVariant(data);
  const oicr = isOicr(data);
  const sdgCatalog = asArray(data.result_sdgs);

  let primaryLevers: LeverDisplay[] = [];
  let contributorLevers: LeverDisplay[] = [];
  let researchAreas: LeverDisplay[] = [];

  if (variant === "P1") {
    const withOicrDetails = appliesLeverOutcomesAndTargets(data);
    const { primary, contributor } = getP1Levers(data);
    primaryLevers = primary.map((l) =>
      toLeverDisplay(l, { variant, isPrimary: true, withOicrDetails, sdgCatalog }),
    );
    contributorLevers = contributor.map((l) =>
      toLeverDisplay(l, { variant, isPrimary: false, withOicrDetails, sdgCatalog }),
    );
  } else {
    researchAreas = getP2ResearchAreas(data).map((l) =>
      toLeverDisplay(l, { variant, isPrimary: true, withOicrDetails: false, sdgCatalog }),
    );
  }

  return {
    variant,
    indicatorId: getIndicatorId(data),
    isOicr: oicr,
    portfolioLabel: getPortfolioLabel(data),
    contracts: getContractsForPdf(data),
    primaryLevers,
    contributorLevers,
    primaryLeversTitle: "Primary Levers",
    contributorLeversTitle: oicr ? "Other Contributing Levers" : "Contributing Levers",
    researchAreas,
    strategicObjectives: getStrategicObjectives(data),
    impactOutcomes: getImpactOutcomes(data),
    sdgTargetGroups: getResultSdgTargetGroups(data),
    sdgs: getContributionSdgs(data),
  };
}

export function hasAllianceAlignmentContent(view: AllianceAlignmentView | null): boolean {
  if (!view) return false;
  return (
    view.contracts.length > 0 ||
    view.primaryLevers.length > 0 ||
    view.contributorLevers.length > 0 ||
    view.researchAreas.length > 0 ||
    view.strategicObjectives.length > 0 ||
    view.impactOutcomes.length > 0 ||
    view.sdgTargetGroups.length > 0 ||
    view.sdgs.length > 0
  );
}

export function shouldRenderAllianceAlignment(
  data: AllianceAlignmentPayload | null | undefined,
): boolean {
  return hasAllianceAlignmentContent(getAllianceAlignmentView(data));
}

/** @alias shouldRenderAllianceAlignment */
export const shouldRenderSection = shouldRenderAllianceAlignment;

export function shouldRenderContracts(data: AllianceAlignmentPayload | null | undefined): boolean {
  return hasArrayItems(getContractsForPdf(data));
}
