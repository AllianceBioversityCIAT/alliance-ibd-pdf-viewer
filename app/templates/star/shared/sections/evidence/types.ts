export interface Evidence {
  created_at?: string;
  updated_at?: string;
  is_active: boolean;
  result_evidence_id: number | null;
  result_id: number | null;
  evidence_description: string;
  evidence_url: string;
  evidence_role_id: number | null;
  is_private: boolean;
}

export interface NotableReference {
  notable_reference_type_id: number | null;
  link: string;
}

/** STAR backend interface */
export interface PatchResultEvidences {
  evidence: Evidence[];
  notable_references: NotableReference[];
}

export type EvidencePayload = PatchResultEvidences;
