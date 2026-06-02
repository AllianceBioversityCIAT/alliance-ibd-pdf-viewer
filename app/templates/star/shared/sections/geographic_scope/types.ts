interface SubNational {
  is_active: boolean;
  id: number;
  code: string;
  name: string;
  other_names: null;
  country_iso_alpha_2: string;
  language_iso_2: string;
}

export interface Region {
  region_id: number;
  sub_national_id?: number;
  name?: string;
  sub_national?: SubNational;
}

export interface Country {
  isoAlpha2: string;
  name?: string;
  result_countries_sub_nationals: Region[];
}

/** STAR backend interface */
export interface GetGeoLocation {
  geo_scope_id?: number | string;
  countries?: Country[];
  regions?: Region[];
  comment_geo_scope?: string;
}

export interface GeographicScopePdfContext {
  country_labels?: Record<string, string>;
  region_labels?: Record<number, string>;
}

export type GeographicScopePayload = GetGeoLocation & GeographicScopePdfContext;

export type GeoScopeVariant =
  | "global"
  | "regional"
  | "national"
  | "subnational"
  | "to_be_determined";
