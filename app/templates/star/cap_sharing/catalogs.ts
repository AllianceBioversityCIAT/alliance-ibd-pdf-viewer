/**
 * STAR backend lookup IDs — visibility/conditional rules only.
 * Display labels must come from the payload (*_label fields in CapSharingPdfContext).
 */
export const SESSION_LENGTH_IDS = {
  SHORT_TERM: 1,
  LONG_TERM: 2,
} as const;

export const SESSION_PURPOSE_IDS = {
  TRAINING_ENUMERATORS: 1,
  ENGAGING_CHANGE_AGENTS: 2,
  TRAINING_OF_TRAINERS: 3,
  OTHER: 4,
} as const;

export const ATTENDING_ORGANIZATION = {
  NO: 0,
  YES: 1,
} as const;

export const DELIVERY_MODALITY_IDS = {
  VIRTUAL: 1,
  HYBRID: 2,
  IN_PERSON: 3,
} as const;
