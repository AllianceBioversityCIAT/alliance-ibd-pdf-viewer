import { hasText } from "../../utils";
import {
  ASSET_IP_OWNER_LABELS,
  TRINARY_OPTION_LABELS,
} from "./catalogs";
import type { IpRightsPayload } from "./types";

export const INNOVATION_INDICATOR_ID = 2;

export const ASSET_IP_OWNER_OTHER_ID = 4;

type YesNoInput = boolean | number | string | null | undefined;

function hasYesNoValue(value: YesNoInput): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  return true;
}

export function normalizeYesNo(value: YesNoInput): string | null {
  if (value === true || value === 1 || value === "1") return "Yes";
  if (value === false || value === 0 || value === "0") return "No";
  return null;
}

export function isAffirmative(value: YesNoInput): boolean {
  return value === true || value === 1 || value === "1";
}

function formatWithOptionalDescription(
  baseLabel: string,
  description: string | null | undefined,
  includeDescription: boolean,
): string {
  if (includeDescription && hasText(description)) {
    return `${baseLabel}. ${description!.trim()}`;
  }
  return baseLabel;
}

function getYesNoLabel(
  value: YesNoInput,
  overrideLabel?: string | null,
): string | null {
  if (hasText(overrideLabel)) return overrideLabel!.trim();
  return normalizeYesNo(value);
}

function getTrinaryLabel(
  id: number | null | undefined,
  overrideName?: string | null,
  legacyLabel?: string | null,
): string | null {
  if (id == null) return null;
  if (hasText(overrideName)) return overrideName!.trim();
  if (hasText(legacyLabel)) return legacyLabel!.trim();
  return TRINARY_OPTION_LABELS[id] ?? String(id);
}

function getAssetIpOwnerLabel(payload: IpRightsPayload): string | null {
  if (payload.asset_ip_owner == null) return null;
  if (hasText(payload.asset_ip_owner_name)) {
    return payload.asset_ip_owner_name!.trim();
  }
  if (hasText(payload.asset_ip_owner_label)) {
    return payload.asset_ip_owner_label!.trim();
  }
  return (
    ASSET_IP_OWNER_LABELS[payload.asset_ip_owner] ??
    String(payload.asset_ip_owner)
  );
}

/** IP Rights section renders only for Policy Change (1) and Innovation Development (2). */
export function shouldRenderIpRights(indicatorId?: number | null): boolean {
  return indicatorId === 1 || indicatorId === INNOVATION_INDICATOR_ID;
}

export function shouldRenderIndicatorSpecificFields(
  indicatorId?: number | null,
): boolean {
  return indicatorId === INNOVATION_INDICATOR_ID;
}

export function shouldRenderAssetIpOwner(
  indicatorId?: number | null,
): boolean {
  return shouldRenderIpRights(indicatorId);
}

export function shouldRenderPublicityRestriction(
  indicatorId?: number | null,
): boolean {
  return shouldRenderIpRights(indicatorId);
}

export function shouldRenderPotentialAsset(
  indicatorId?: number | null,
): boolean {
  return shouldRenderIpRights(indicatorId);
}

export function shouldRenderRequiresFurtherDevelopment(
  indicatorId?: number | null,
): boolean {
  return shouldRenderIpRights(indicatorId);
}

export function shouldRenderPrivateSectorEngagement(
  payload: IpRightsPayload | null | undefined,
  indicatorId?: number | null,
): boolean {
  if (!shouldRenderIndicatorSpecificFields(indicatorId) || !payload) return false;
  return payload.private_sector_engagement_id != null;
}

export function shouldRenderFormalIpRightsApplication(
  payload: IpRightsPayload | null | undefined,
  indicatorId?: number | null,
): boolean {
  if (!shouldRenderIndicatorSpecificFields(indicatorId) || !payload) return false;
  return payload.formal_ip_rights_application_id != null;
}

/** @deprecated Use shouldRenderIpRights(indicatorId) */
export const shouldRenderSection = shouldRenderIpRights;

export function getAssetIpOwnerDisplayValue(
  payload: IpRightsPayload | null | undefined,
): string | null {
  if (!payload) return null;
  const label = getAssetIpOwnerLabel(payload);
  if (!label) return null;

  if (
    payload.asset_ip_owner === ASSET_IP_OWNER_OTHER_ID &&
    hasText(payload.asset_ip_owner_description)
  ) {
    return formatWithOptionalDescription(
      label,
      payload.asset_ip_owner_description,
      true,
    );
  }

  return label;
}

export function getPublicityRestrictionDisplayValue(
  payload: IpRightsPayload | null | undefined,
): string | null {
  if (!payload || !hasYesNoValue(payload.publicity_restriction)) return null;
  const label = getYesNoLabel(
    payload.publicity_restriction,
    payload.publicity_restriction_label,
  );
  if (!label) return null;

  return formatWithOptionalDescription(
    label,
    payload.publicity_restriction_description,
    isAffirmative(payload.publicity_restriction),
  );
}

export function getPotentialAssetDisplayValue(
  payload: IpRightsPayload | null | undefined,
): string | null {
  if (!payload || !hasYesNoValue(payload.potential_asset)) return null;
  const label = getYesNoLabel(payload.potential_asset, payload.potential_asset_label);
  if (!label) return null;

  return formatWithOptionalDescription(
    label,
    payload.potential_asset_description,
    isAffirmative(payload.potential_asset),
  );
}

export function getRequiresFurtherDevelopmentDisplayValue(
  payload: IpRightsPayload | null | undefined,
): string | null {
  if (!payload || !hasYesNoValue(payload.requires_futher_development)) return null;
  const label = getYesNoLabel(
    payload.requires_futher_development,
    payload.requires_futher_development_label,
  );
  if (!label) return null;

  return formatWithOptionalDescription(
    label,
    payload.requires_futher_development_description,
    isAffirmative(payload.requires_futher_development),
  );
}

export function getPrivateSectorEngagementDisplayValue(
  payload: IpRightsPayload | null | undefined,
): string | null {
  if (!payload) return null;
  return getTrinaryLabel(
    payload.private_sector_engagement_id,
    payload.private_sector_engagement_name,
    payload.private_sector_engagement_label,
  );
}

export function getFormalIpRightsApplicationDisplayValue(
  payload: IpRightsPayload | null | undefined,
): string | null {
  if (!payload) return null;
  return getTrinaryLabel(
    payload.formal_ip_rights_application_id,
    payload.formal_ip_rights_application_name,
    payload.formal_ip_rights_application_label,
  );
}

/** @deprecated Use normalizeYesNo */
export function getFlagDisplay(value: YesNoInput): string | null {
  return normalizeYesNo(value);
}
