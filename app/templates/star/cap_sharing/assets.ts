import languageIcon from "./assets/language.svg";
import startDateIcon from "./assets/start-date.svg";
import endDateIcon from "./assets/end-date.svg";
import deliveryModalityIcon from "./assets/delivery-modality.svg";
import sessionFormatIcon from "./assets/training-format.svg";
import sessionTypeIcon from "./assets/training-or-engagement.svg";
import sessionLengthIcon from "./assets/training-length.svg";
import totalParticipantsIcon from "./assets/total-participants.svg";
import trainingPurposeIcon from "./assets/training-purpose.svg";
import traineeNameIcon from "./assets/trainee-name.svg";
import traineeGenderIcon from "./assets/trainee-gender.svg";
import traineeAffiliationIcon from "./assets/trainee-affiliation.svg";

/** Figma Training Details row icons */
export const TRAINING_DETAIL_ICONS = {
  language: languageIcon.src,
  startDate: startDateIcon.src,
  endDate: endDateIcon.src,
  deliveryModality: deliveryModalityIcon.src,
} as const;

/** Figma Training Type row icons (Degree has no icon) */
export const TRAINING_TYPE_ICONS = {
  sessionFormat: sessionFormatIcon.src,
  sessionType: sessionTypeIcon.src,
  sessionLength: sessionLengthIcon.src,
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
