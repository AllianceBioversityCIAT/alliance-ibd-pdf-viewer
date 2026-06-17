import languageIcon from "./assets/language.svg";
import startDateIcon from "./assets/start-date.svg";
import endDateIcon from "./assets/end-date.svg";
import deliveryModalityVirtualIcon from "./assets/delivery-modality-virtual.svg";
import deliveryModalityHybridIcon from "./assets/delivery-modality-hybrid.svg";
import deliveryModalityInPersonIcon from "./assets/delivery-modality-in-person.svg";
import degreeIcon from "./assets/degree.svg";
import sessionFormatIcon from "./assets/training-format.svg";
import sessionTypeIcon from "./assets/training-or-engagement.svg";
import sessionLengthIcon from "./assets/training-length.svg";
import totalParticipantsIcon from "./assets/total-participants.svg";
import trainingPurposeIcon from "./assets/training-purpose.svg";
import traineeNameIcon from "./assets/trainee-name.svg";
import traineeGenderIcon from "./assets/trainee-gender.svg";
import traineeAffiliationIcon from "./assets/trainee-affiliation.svg";
import { DELIVERY_MODALITY_IDS } from "./catalogs";

const DELIVERY_MODALITY_ICON_BY_ID: Partial<Record<number, string>> = {
  [DELIVERY_MODALITY_IDS.VIRTUAL]: deliveryModalityVirtualIcon.src,
  [DELIVERY_MODALITY_IDS.HYBRID]: deliveryModalityHybridIcon.src,
  [DELIVERY_MODALITY_IDS.IN_PERSON]: deliveryModalityInPersonIcon.src,
};

/** Figma Training Details row icons */
export const TRAINING_DETAIL_ICONS = {
  language: languageIcon.src,
  startDate: startDateIcon.src,
  endDate: endDateIcon.src,
} as const;

/** Figma Training Type row icons */
export const TRAINING_TYPE_ICONS = {
  sessionFormat: sessionFormatIcon.src,
  sessionType: sessionTypeIcon.src,
  sessionLength: sessionLengthIcon.src,
  degree: degreeIcon.src,
} as const;

/** Figma Group Training row icons */
export const GROUP_TRAINING_ICONS = {
  totalParticipants: totalParticipantsIcon.src,
  trainingPurpose: trainingPurposeIcon.src,
} as const;

/** Figma Individual Training row icons (nationality uses flagcdn from isoAlpha2) */
export const INDIVIDUAL_TRAINING_ICONS = {
  traineeName: traineeNameIcon.src,
  traineeGender: traineeGenderIcon.src,
  traineeAffiliation: traineeAffiliationIcon.src,
} as const;

export const SUPERVISOR_AVATAR_COLOR = "#358540";

export function getDeliveryModalityIconSrc(
  deliveryModalityId: number | null | undefined,
): string | undefined {
  if (deliveryModalityId == null) return undefined;
  return DELIVERY_MODALITY_ICON_BY_ID[deliveryModalityId];
}
