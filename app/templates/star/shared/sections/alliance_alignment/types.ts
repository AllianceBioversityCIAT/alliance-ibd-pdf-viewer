export interface ContractLever {
  full_name?: string;
  short_name?: string;
  /** Absolute URL to lever artwork (e.g. S3) returned by STAR API */
  icon?: string;
  lever_id?: string | number;
}

export interface Contract {
  is_active: boolean;
  result_contract_id: number;
  result_id: number;
  contract_id: string;
  contract_role_id: number;
  is_primary: boolean;
  agreement_id?: string;
  description?: string;
  contract_status?: string;
  project_lead_description?: string;
  start_date?: string;
  end_date?: string;
  endDateGlobal?: string;
  levers?: ContractLever;
}

export interface GetSdgs {
  created_at: string;
  updated_at: string;
  is_active: boolean;
  id: number;
  smo_code: number;
  financial_code: string;
  short_name: string;
  full_name: string;
  icon: string;
  result_sdg_id: number;
  color: string;
  clarisa_sdg_id: number;
  description: string;
}

export interface ResultLeverSdgTargetPayload {
  id?: number;
  target?: string;
  description?: string;
}

export interface LeverStrategicOutcome {
  id?: number;
  name?: string;
  description?: string;
}

export interface Lever {
  result_lever_id: number;
  result_id: number;
  lever_id: string | number;
  lever_role_id: number;
  is_primary: boolean;
  result_lever_strategic_outcomes?: LeverStrategicOutcome[];
  result_lever_sdgs?: GetSdgs[];
  result_lever_sdg_targets?: ResultLeverSdgTargetPayload[];
  /** Absolute URL to lever artwork (e.g. S3) returned by STAR API */
  icon?: string;
  short_name?: string;
  other_names?: string;
}

/** STAR backend interface */
export interface GetAllianceAlignment {
  contracts: Contract[];
  result_sdgs: GetSdgs[];
  primary_levers: Lever[];
  contributor_levers: Lever[];
}

/** PDF context — indicator_id drives Strategic Outcomes visibility */
export interface AllianceAlignmentPdfContext {
  indicator_id?: number;
  /** @deprecated Prefer contract.project_lead_description */
  contract_labels?: Record<string, string>;
  /** @deprecated Prefer contract.project_lead_description */
  contract_pi?: Record<string, string>;
  /** @deprecated Prefer contract.start_date / end_date */
  contract_dates?: Record<string, { start_date?: string; end_date?: string }>;
}

export type AllianceAlignmentPayload = GetAllianceAlignment &
  AllianceAlignmentPdfContext;

export interface ContractLeverDisplay {
  label: string;
  icon: string | null;
}

export interface ContractDisplayRow {
  label: string;
  value: string;
}

/** SDG target row for PDF — bold blue prefix + body description (Figma Page 111) */
export interface SdgTargetLineDisplay {
  prefix: string | null;
  description: string;
}
