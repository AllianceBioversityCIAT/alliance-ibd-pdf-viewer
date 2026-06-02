import { hasArrayItems, hasText } from "../../utils";
import type {
  Country,
  GeoScopeVariant,
  GeographicScopePayload,
  Region,
} from "./types";

const GEO_SCOPE_VARIANT_LABELS: Record<
  Exclude<GeoScopeVariant, "to_be_determined">,
  string
> = {
  global: "Global",
  regional: "Regional",
  national: "National",
  subnational: "Sub-national",
};

/** Figma Geographic Location — node 34412:136364 */
export const GEO_SCOPE_COLORS = {
  /** Left panel background, to-be-determined icon and text */
  panelGreen: "#358540",
  /** Right panel and to-be-determined card background */
  cardBg: "#ededed",
  /** Empty regions/countries placeholder text */
  emptyText: "#655C5E",
} as const;

export const GEO_SCOPE_EMPTY_LABELS = {
  noRegions: "No regions specified",
  noCountries: "No countries specified",
} as const;

export function getGeoScopeVariant(
  geoScopeId?: string | number,
): GeoScopeVariant {
  switch (String(geoScopeId)) {
    case "1":
      return "global";
    case "2":
      return "regional";
    case "4":
      return "national";
    case "5":
      return "subnational";
    case "50":
      return "to_be_determined";
    default:
      return "to_be_determined";
  }
}

export function getGeoScopeLabel(
  geoScopeId?: string | number,
): string {
  const variant = getGeoScopeVariant(geoScopeId);
  if (variant === "to_be_determined") {
    return "This is yet to be determined";
  }
  return GEO_SCOPE_VARIANT_LABELS[variant];
}

export function isYetToBeDetermined(
  payload: GeographicScopePayload | null | undefined,
): boolean {
  return getGeoScopeVariant(payload?.geo_scope_id) === "to_be_determined";
}

export function shouldRenderGeographicScope(
  payload: GeographicScopePayload | null | undefined,
): boolean {
  if (!payload) return false;
  return (
    (payload.geo_scope_id != null &&
      String(payload.geo_scope_id).trim() !== "") ||
    hasArrayItems(payload.regions) ||
    hasArrayItems(payload.countries) ||
    hasText(payload.comment_geo_scope)
  );
}

export function shouldRenderRegions(
  payload: GeographicScopePayload | null | undefined,
): boolean {
  return hasArrayItems(payload?.regions);
}

export function shouldRenderCountries(
  payload: GeographicScopePayload | null | undefined,
): boolean {
  return hasArrayItems(payload?.countries);
}

export function shouldRenderSubnational(
  payload: GeographicScopePayload | null | undefined,
): boolean {
  if (getGeoScopeVariant(payload?.geo_scope_id) !== "subnational") return false;
  return (payload?.countries ?? []).some(hasSelectedSubnationalLevels);
}

export function shouldRenderComments(
  payload: GeographicScopePayload | null | undefined,
): boolean {
  return hasText(payload?.comment_geo_scope);
}

export function getSubnationalDisplayName(
  region: Region | null | undefined,
): string | null {
  if (!region) return null;
  if (hasText(region.name)) return region.name!.trim();
  if (hasText(region.sub_national?.name)) {
    return region.sub_national!.name.trim();
  }
  if (region.sub_national_id != null) {
    return String(region.sub_national_id);
  }
  return String(region.region_id);
}

export function getRegionNames(
  regions: Region[] | null | undefined,
  payload?: GeographicScopePayload | null,
): string[] {
  return (regions ?? [])
    .map((region) => {
      if (hasText(region.name)) return region.name!.trim();
      const mapped = payload?.region_labels?.[region.region_id];
      if (hasText(mapped)) return mapped!.trim();
      return String(region.region_id);
    })
    .filter((name) => name.length > 0);
}

export function getCountryDisplayName(
  country: Country | null | undefined,
  payload?: GeographicScopePayload | null,
): string {
  if (!country) return "";
  if (hasText(country.name)) return country.name!.trim();
  const mapped = payload?.country_labels?.[country.isoAlpha2];
  if (hasText(mapped)) return mapped!.trim();
  return country.isoAlpha2 ?? "";
}

export function getCountrySubnationalNames(
  country: Country | null | undefined,
): string[] {
  return (country?.result_countries_sub_nationals ?? [])
    .map((region) => getSubnationalDisplayName(region))
    .filter((name): name is string => hasText(name));
}

export function hasSelectedSubnationalLevels(
  country: Country | null | undefined,
): boolean {
  return getCountrySubnationalNames(country).length > 0;
}

export function getCountriesWithSubnationals(
  payload: GeographicScopePayload | null | undefined,
): Country[] {
  return (payload?.countries ?? []).filter(hasSelectedSubnationalLevels);
}
