import type { GeoScopeVariant } from "./types";
import globalScopeIcon from "./assets/global-scope.svg";
import regionalScopeIcon from "./assets/regional-scope.svg";
import nationalScopeIcon from "./assets/national-scope.svg";
import subnationalScopeIcon from "./assets/subnational-scope.svg";
import toBeDeterminedIcon from "./assets/to-be-determined-icon.svg";

/** Figma Geographic Location left-panel icons (geo_scope_id 1, 2, 4, 5) */
export const GEO_SCOPE_ICON_SRC: Record<
  Exclude<GeoScopeVariant, "to_be_determined">,
  string
> = {
  global: globalScopeIcon.src,
  regional: regionalScopeIcon.src,
  national: nationalScopeIcon.src,
  subnational: subnationalScopeIcon.src,
};

/** Yet-to-be-determined card — magnifying glass (Figma Mask group) */
export const GEO_SCOPE_TO_BE_DETERMINED_ICON_SRC = toBeDeterminedIcon.src;
