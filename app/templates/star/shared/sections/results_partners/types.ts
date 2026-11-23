export interface Institution {
  institution_id: number;
  institution_role_id: number;
  acronym?: string;
  name?: string;
  full_name?: string;
  html_full_name?: string;
  institution_type?: string;
  institution_type_name?: string;
  headquarters?: string;
  headquarter?: string;
  country_name?: string;
  country?: string;
  type?: string;
  /** Headquarter country ISO alpha-2 (STAR `isoAlpha2`) — shows the flag next to Headquarter. */
  isoAlpha2?: string | null;
  iso_alpha_2?: string | null;
  /** Headquarter country name (STAR `institution_location_name`). */
  institution_location_name?: string | null;
}

/** STAR backend interface */
export interface PatchPartners {
  institutions: Institution[];
  is_partner_not_applicable: boolean;
}

export type ResultsPartnersPayload = PatchPartners;
