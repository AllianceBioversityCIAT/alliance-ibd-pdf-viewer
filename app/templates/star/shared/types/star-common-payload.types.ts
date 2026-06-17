import type { GeneralInformationPayload } from "../sections/general_information/types";
import type { AllianceAlignmentPayload } from "../sections/alliance_alignment/types";
import type { ResultsPartnersPayload } from "../sections/results_partners/types";
import type { GeographicScopePayload } from "../sections/geographic_scope/types";
import type { EvidencePayload } from "../sections/evidence/types";
import type { IpRightsPayload } from "../sections/ip_rights/types";

export interface StarCommonPayload {
  general_information: GeneralInformationPayload;
  alliance_alignment: AllianceAlignmentPayload;
  results_partners: ResultsPartnersPayload;
  geographic_scope: GeographicScopePayload;
  evidence: EvidencePayload;
  ip_rights: IpRightsPayload;
}

export type {
  GeneralInformationPayload,
  AllianceAlignmentPayload,
  ResultsPartnersPayload,
  GeographicScopePayload,
  EvidencePayload,
  IpRightsPayload,
};
