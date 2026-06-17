import type { StarCommonPayload } from "../shared/types/star-common-payload.types";
import type { Institution } from "../shared/sections/results_partners/types";

export interface SessionFormat {
  session_format_id: number;
  name: string;
}

export interface SessionType {
  session_type_id: number;
  name: string;
}

export interface Degree {
  is_active: boolean;
  degree_id: number;
  name: string;
}

export interface Length {
  is_active: boolean;
  length_id: number;
  name: string;
}

export interface IpOwners {
  id: number;
  name: string;
}

export interface Gender {
  is_active: boolean;
  gender_id: number;
  name: string;
}

export interface Language {
  is_active: boolean;
  id: number;
  name: string | null;
  iso_alpha_2: string;
  iso_alpha_3: string;
}

export interface Trainingsupervisorlanguages {
  is_active?: boolean;
  result_language_id?: number;
  result_id?: number;
  language_id: number | string | null | undefined;
  language_role_id?: number;
  language?: Language;
}

export interface User {
  is_active: boolean;
  carnet: string;
  first_name: string;
  last_name: string;
  email: string;
  center?: string;
}

export interface TraineeOrganizationRepresentative {
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  result_institution_id?: number;
  result_id?: number;
  institution_id?: number;
  institution_role_id?: number;
}

export interface Trainingsupervisor {
  is_active?: boolean;
  result_user_id?: number;
  result_id?: number;
  user_id: string | number | null | undefined;
  user_role_id?: number;
  user?: User;
}

export interface Nationality {
  is_active?: boolean;
  result_country_id?: number;
  result_id?: number;
  isoAlpha2?: string;
  country_role_id?: number;
}

export interface Affiliation {
  is_active?: boolean;
  result_institution_id?: number;
  result_id?: number;
  institution_id?: number;
  institution_role_id?: number;
}

export interface Individual {
  gender_id?: number;
  trainee_name?: string;
  affiliation?: Affiliation;
  nationality?: Nationality;
}

export interface GroupTraining {
  is_attending_organization: number | boolean | null | undefined;
  session_participants_female: number | null | undefined;
  session_participants_male: number | null | undefined;
  session_participants_non_binary: number | null | undefined;
  session_participants_total: number | null | undefined;
  session_purpose_description: string | null | undefined;
  session_purpose_id: number | null | undefined;
  trainee_organization_representative?: TraineeOrganizationRepresentative[];
}

/** STAR backend interface */
export interface GetCapSharing {
  degree_id?: number;
  session_length_id?: number;
  delivery_modality_id?: number;
  end_date?: string | Date;
  session_format_id?: number;
  session_type_id?: number;
  start_date?: string | Date;
  individual?: Individual;
  training_supervisor?: Trainingsupervisor;
  training_supervisor_languages?: Trainingsupervisorlanguages;
  group?: GroupTraining;
  test?: string;
  loaded?: boolean;
}

export interface CapSharingPdfContext {
  session_format_label?: string;
  session_type_label?: string;
  session_length_label?: string;
  delivery_modality_label?: string;
  degree_label?: string;
  session_purpose_label?: string;
  gender_label?: string;
  affiliation_label?: string;
  nationality_label?: string;
  attending_organization_label?: string;
  organization_institutions?: Institution[];
}

export type CapSharingPayload = GetCapSharing & CapSharingPdfContext;

export interface CapSharingPdfPayload extends StarCommonPayload {
  cap_sharing: CapSharingPayload;
}

export type { StarCommonPayload };
