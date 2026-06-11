/** STAR lookup IDs — conditional rules only. Display labels come from the payload. */
export const INNOVATION_TYPE_NEW_VARIETY = 12;

export const ANTICIPATED_USERS_EXPANDED = 2;

/** PDF label for the anticipated users question row. */
export const ANTICIPATED_USERS_QUESTION_LABEL =
  "Who would be the user(s) of this Innovation?";

export const ACTOR_TYPE_OTHER = 5;

export const INSTITUTION_TYPE_OTHER = 78;

export const DISSEMINATION_QUALIFICATION_OPT_OUT = 1;

export const DISSEMINATION_QUALIFICATION_EXPANDED = 2;

export const EXPANSION_POTENTIAL_YES = 1;

export const EXPANSION_POTENTIAL_WITH_ADAPTATIONS = 2;

/** @deprecated Use EXPANSION_POTENTIAL_WITH_ADAPTATIONS */
export const EXPANSION_POTENTIAL_OTHER = EXPANSION_POTENTIAL_WITH_ADAPTATIONS;

export const EXPANSION_POTENTIAL_NO = 3;

export const SCALING_SCALE_STEPS = [1, 2, 3, 4, 5] as const;

export const EXPANSION_POTENTIAL_OPTIONS = [
  { id: EXPANSION_POTENTIAL_YES, label: "Yes" },
  { id: EXPANSION_POTENTIAL_WITH_ADAPTATIONS, label: "Yes, with adaptations" },
  { id: EXPANSION_POTENTIAL_NO, label: "No" },
] as const;

export const READINESS_LEVEL_KNOWLEDGE_SHARING_MIN = 7;

/** Readiness scale steps shown in the PDF graphic (0–9). */
export const READINESS_SCALE_STEPS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
