/** STAR `policy_types` id for "Program, Budget, or Investment" — shows USD Amount and Status. */
export const POLICY_TYPE_PROGRAM_BUDGET_OR_INVESTMENT = 3;

/**
 * Stage names are hard-coded in the STAR client (policy-change.component.ts), so they are a safe
 * fallback when the backend sends only `policy_stage_id`. The payload name always wins.
 */
export const POLICY_STAGE_FALLBACK_NAMES: Record<number, string> = {
  1: "Stage 1: Research taken up by next user, policy change not yet enacted",
  2: "Stage 2: Policy enacted",
  3: "Stage 3: Evidence of impact of policy",
};

/** Same labels as the STAR form. */
export const POLICY_CHANGE_LABELS = {
  sectionTitle: "Policy Change Details",
  policyDetails: "Policy Details",
  policyType: "Policy Type",
  policyStage: "Stage in Policy Process",
  usdAmount: "USD Amount",
  amountStatus: "Status",
  evidenceStage: "Evidence for stage",
  implementingOrganizations: "Whose policy is this? (implementing organizations)",
  linkedResults: "Linked Results",
  innovationDevelopment: "Link to a reported Innovation Development output",
  innovationUse: "Link to a reported Innovation Use",
  noLinkedResult: "No result linked.",
} as const;
