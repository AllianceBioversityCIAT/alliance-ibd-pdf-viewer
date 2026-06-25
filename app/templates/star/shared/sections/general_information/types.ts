export interface MainContractPerson {
  user_id: string;
}

export interface StatusDisplay {
  status_name?: string | null;
  status_description?: string | null;
  status_border_color?: string | null;
  status_text_color?: string | null;
}

/** STAR backend interface — preserve field names */
export interface GeneralInformation {
  title: string;
  description: string;
  keywords: string[];
  user_id: string;
  year: string;
  main_contact_person: MainContractPerson;
  status?: StatusDisplay | null;
}

/** PDF-specific extensions (not sent by STAR core, optional enrichments) */
export interface GeneralInformationPdfContext {
  indicator_id?: number;
  result_code?: string | number;
  result_type?: string;
  generated_at?: string;
  /** Resolved display name/email when backend enriches the payload */
  main_contact_display?: string;
}

export type GeneralInformationPayload = GeneralInformation &
  GeneralInformationPdfContext;
