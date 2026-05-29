import { getLeverIconUrl, hasArrayItems, hasText, shouldRenderLeverIcon } from "../../utils";
import type {
  AllianceAlignmentPayload,
  Contract,
  ContractDisplayRow,
  ContractLeverDisplay,
  GetSdgs,
  Lever,
  ResultLeverSdgTargetPayload,
  SdgTargetLineDisplay,
} from "./types";

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

export function getLeverIconFromLever(lever: Lever): string | null {
  return getLeverIconUrl(lever.icon);
}

function isActiveContract(contract: Contract): boolean {
  return contract.is_active !== false;
}

function leverIdentity(lever: Lever): string {
  return String(lever.lever_id);
}

// ── Section visibility ──

export function shouldRenderAllianceAlignment(
  data: AllianceAlignmentPayload | null | undefined,
): boolean {
  if (!data) return false;
  return (
    hasArrayItems(data.contracts) ||
    hasArrayItems(data.primary_levers) ||
    hasArrayItems(data.contributor_levers) ||
    hasArrayItems(data.result_sdgs)
  );
}

/** @alias shouldRenderAllianceAlignment */
export const shouldRenderSection = shouldRenderAllianceAlignment;

export function shouldRenderContracts(
  data: AllianceAlignmentPayload | null | undefined,
): boolean {
  return hasArrayItems(getContractsForPdf(data));
}

export function shouldRenderPrimaryLevers(
  data: AllianceAlignmentPayload | null | undefined,
): boolean {
  return hasArrayItems(data?.primary_levers);
}

export function shouldRenderContributorLevers(
  data: AllianceAlignmentPayload | null | undefined,
): boolean {
  if (!data) return false;
  return (
    getContributorLeversExcludingPrimary(
      data.primary_levers ?? [],
      data.contributor_levers ?? [],
    ).length > 0
  );
}

// ── Contracts ──

export function getContractsForPdf(
  payload: AllianceAlignmentPayload | null | undefined,
): Contract[] {
  return (payload?.contracts ?? []).filter(isActiveContract);
}

export function getPrimaryContracts(contracts: Contract[]): Contract[] {
  return contracts.filter((c) => c.is_primary === true);
}

export function shouldRenderContractEndDate(contract: Contract): boolean {
  return hasText(contract.end_date) || hasText(contract.endDateGlobal);
}

export function getContractEndDate(contract: Contract): string | null {
  if (hasText(contract.end_date)) return contract.end_date!.trim();
  if (hasText(contract.endDateGlobal)) return contract.endDateGlobal!.trim();
  return null;
}

export function shouldRenderContractLever(contract: Contract): boolean {
  return true;
}

export function getContractLeverDisplay(contract: Contract): ContractLeverDisplay {
  const lever = contract.levers;
  if (!lever || !hasText(lever.full_name) || lever.full_name!.trim() === LEVER_NOT_AVAILABLE) {
    return { label: "Lever - Not available", icon: null };
  }
  const label =
    (hasText(lever.short_name) ? lever.short_name!.trim() : null) ??
    lever.full_name!.trim();
  return { label, icon: getLeverIconUrl(lever.icon) };
}

export function getRequiredLeverIdsFromContracts(
  contracts: Contract[],
): (string | number)[] {
  const ids: (string | number)[] = [];
  for (const contract of getPrimaryContracts(contracts)) {
    const lever = contract.levers;
    if (!lever) continue;
    if (lever.lever_id == null) continue;
    if (!hasText(lever.full_name) || lever.full_name!.trim() === LEVER_NOT_AVAILABLE) {
      continue;
    }
    ids.push(lever.lever_id);
  }
  return ids;
}

export function isLeverRequiredFromContracts(
  lever: Lever,
  contracts: Contract[],
): boolean {
  const required = getRequiredLeverIdsFromContracts(contracts);
  return required.some((id) => String(id) === leverIdentity(lever));
}

export function getContractTitle(
  payload: AllianceAlignmentPayload,
  contract: Contract,
): string {
  const mapped = payload.contract_labels?.[contract.contract_id];
  if (hasText(mapped)) return mapped!.trim();

  const parts: string[] = [];
  if (hasText(contract.agreement_id)) parts.push(contract.agreement_id!.trim());
  if (hasText(contract.description)) parts.push(contract.description!.trim());
  if (parts.length > 0) return parts.join(" - ");

  return contract.contract_id;
}

export function getContractDisplayRows(
  payload: AllianceAlignmentPayload,
  contract: Contract,
): ContractDisplayRow[] {
  const rows: ContractDisplayRow[] = [];
  const legacyDates = payload.contract_dates?.[contract.contract_id];
  const legacyPi = payload.contract_pi?.[contract.contract_id];

  if (hasText(contract.project_lead_description)) {
    rows.push({
      label: "Principal investigator",
      value: contract.project_lead_description!.trim(),
    });
  } else if (hasText(legacyPi)) {
    rows.push({ label: "Principal investigator", value: legacyPi!.trim() });
  }

  const start = contract.start_date ?? legacyDates?.start_date;
  if (hasText(start)) {
    rows.push({ label: "Start date", value: start!.trim() });
  }

  const end = getContractEndDate(contract) ?? legacyDates?.end_date;
  if (shouldRenderContractEndDate(contract) && hasText(end)) {
    rows.push({ label: "End date", value: end!.trim() });
  }

  if (hasText(contract.contract_status)) {
    rows.push({
      label: "Contract status",
      value: contract.contract_status!.trim(),
    });
  }

  return rows;
}

// ── Levers ──

export function shouldRenderStrategicOutcomes(indicatorId?: number): boolean {
  return indicatorId === 5;
}

export function getContributorLeversExcludingPrimary(
  primaryLevers: Lever[],
  contributorLevers: Lever[],
): Lever[] {
  const primaryIds = new Set(primaryLevers.map(leverIdentity));
  return contributorLevers.filter((lever) => !primaryIds.has(leverIdentity(lever)));
}

export function getLeverTitle(lever: Lever): string {
  if (hasText(lever.short_name)) return lever.short_name!.trim();
  if (hasText(lever.other_names)) return lever.other_names!.trim();
  return `Lever ${lever.lever_id}`;
}

export function getStrategicOutcomeLines(lever: Lever): string[] {
  return (lever.result_lever_strategic_outcomes ?? [])
    .map((o) => {
      if (hasText(o.name) && hasText(o.description)) {
        return `${o.name!.trim()}: ${o.description!.trim()}`;
      }
      return o.description ?? o.name ?? null;
    })
    .filter((line): line is string => hasText(line));
}

function formatSdgTargetPrefix(target: string): string {
  const trimmed = target.trim();
  return trimmed.endsWith(":") ? trimmed : `${trimmed}:`;
}

export function formatSdgTargetLine(
  target: ResultLeverSdgTargetPayload,
): SdgTargetLineDisplay | null {
  if (hasText(target.target) && hasText(target.description)) {
    return {
      prefix: formatSdgTargetPrefix(target.target!),
      description: target.description!.trim(),
    };
  }
  const desc = target.description ?? target.target;
  if (!hasText(desc)) return null;
  if (hasText(target.target)) {
    return {
      prefix: formatSdgTargetPrefix(target.target!),
      description: desc!.trim(),
    };
  }
  return { prefix: null, description: desc!.trim() };
}

function formatSdgTarget(target: ResultLeverSdgTargetPayload): string | null {
  const line = formatSdgTargetLine(target);
  if (!line) return null;
  if (line.prefix) return `${line.prefix} ${line.description}`;
  return line.description;
}

function formatSdg(sdg: GetSdgs): string | null {
  const text = sdg.description ?? sdg.full_name ?? sdg.short_name;
  return hasText(text) ? text!.trim() : null;
}

/**
 * Resolves SDG content for a lever without duplicating root-level legacy SDGs.
 * Legacy `result_sdgs` attach only when there is a single lever in the PDF lever set.
 */
export function getLeverSdgs(
  lever: Lever,
  rootSdgs: GetSdgs[] | undefined,
  totalLeverCount: number,
): string[] {
  const lines: string[] = [];
  const seen = new Set<string>();

  const addLine = (line: string | null | undefined) => {
    if (typeof line !== "string" || line.trim().length === 0) return;
    const text = line.trim();
    if (seen.has(text)) return;
    seen.add(text);
    lines.push(text);
  };

  for (const target of lever.result_lever_sdg_targets ?? []) {
    addLine(formatSdgTarget(target));
  }

  for (const sdg of lever.result_lever_sdgs ?? []) {
    addLine(formatSdg(sdg));
  }

  const hasNested =
    hasArrayItems(lever.result_lever_sdg_targets) ||
    hasArrayItems(lever.result_lever_sdgs);

  if (!hasNested && totalLeverCount === 1 && hasArrayItems(rootSdgs)) {
    for (const sdg of rootSdgs ?? []) {
      addLine(formatSdg(sdg));
    }
  }

  return lines;
}

export function getTotalLeverCount(data: AllianceAlignmentPayload): number {
  const primary = data.primary_levers?.length ?? 0;
  const contributor = getContributorLeversExcludingPrimary(
    data.primary_levers ?? [],
    data.contributor_levers ?? [],
  ).length;
  return primary + contributor;
}

function getLeverSdgTargetDisplays(
  lever: Lever,
  rootSdgs: GetSdgs[] | undefined,
  totalLeverCount: number,
): SdgTargetLineDisplay[] {
  const lines: SdgTargetLineDisplay[] = [];
  const seen = new Set<string>();

  const addLine = (line: SdgTargetLineDisplay | null) => {
    if (!line || !hasText(line.description)) return;
    const key = line.prefix
      ? `${line.prefix}|${line.description}`
      : line.description;
    if (seen.has(key)) return;
    seen.add(key);
    lines.push(line);
  };

  for (const target of lever.result_lever_sdg_targets ?? []) {
    addLine(formatSdgTargetLine(target));
  }

  for (const sdg of lever.result_lever_sdgs ?? []) {
    const text = formatSdg(sdg);
    if (text) addLine({ prefix: null, description: text });
  }

  const hasNested =
    hasArrayItems(lever.result_lever_sdg_targets) ||
    hasArrayItems(lever.result_lever_sdgs);

  if (!hasNested && totalLeverCount === 1 && hasArrayItems(rootSdgs)) {
    for (const sdg of rootSdgs ?? []) {
      const text = formatSdg(sdg);
      if (text) addLine({ prefix: null, description: text });
    }
  }

  return lines;
}

export function getPrimaryLeverSdgTargetLines(
  payload: AllianceAlignmentPayload,
  lever: Lever,
): SdgTargetLineDisplay[] {
  return getLeverSdgTargetDisplays(
    lever,
    payload.result_sdgs,
    getTotalLeverCount(payload),
  );
}

export function getContributorLeverSdgTargetLines(
  payload: AllianceAlignmentPayload,
  lever: Lever,
): SdgTargetLineDisplay[] {
  return getLeverSdgTargetDisplays(lever, undefined, getTotalLeverCount(payload));
}

export function getPrimaryLeverSdgLines(
  payload: AllianceAlignmentPayload,
  lever: Lever,
): string[] {
  return getPrimaryLeverSdgTargetLines(payload, lever).map((line) =>
    line.prefix ? `${line.prefix} ${line.description}` : line.description,
  );
}

export function getContributorLeverSdgLines(
  payload: AllianceAlignmentPayload,
  lever: Lever,
): string[] {
  return getContributorLeverSdgTargetLines(payload, lever).map((line) =>
    line.prefix ? `${line.prefix} ${line.description}` : line.description,
  );
}
