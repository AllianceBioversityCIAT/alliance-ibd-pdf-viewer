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
}

/** STAR backend interface */
export interface PatchPartners {
  institutions: Institution[];
  is_partner_not_applicable: boolean;
}

export type ResultsPartnersPayload = PatchPartners;
