import type { CapSharingPayload } from "../types";
import { getGenderLabel } from "../rules";
import { hasText } from "../../shared/utils";
import type { DataTableRow } from "../../shared/components/data-table";
import { INDIVIDUAL_TRAINING_ICONS } from "../assets";
import {
  TraineeNationalityValue,
  TrainingDetailIconValue,
} from "./training-detail-value";

export function getIndividualTrainingTableRows(
  data: CapSharingPayload,
): DataTableRow[] {
  const individual = data.individual;
  if (!individual) return [];

  const rows: DataTableRow[] = [];


  const affiliation = data.affiliation_label?.trim();
  if (hasText(affiliation)) {
    rows.push({
      label: "Trainee affiliation",
      value: (
        <TrainingDetailIconValue
          iconSrc={INDIVIDUAL_TRAINING_ICONS.traineeAffiliation}
          iconWidth={11}
          iconHeight={12}
        >
          {affiliation}
        </TrainingDetailIconValue>
      ),
    });
  }

  const traineeName = individual.trainee_name?.trim();
  if (hasText(traineeName)) {
    rows.push({
      label: "Trainee name",
      value: (
        <TrainingDetailIconValue iconSrc={INDIVIDUAL_TRAINING_ICONS.traineeName}>
          {traineeName}
        </TrainingDetailIconValue>
      ),
    });
  }


  const nationality = data.nationality_label?.trim();
  if (hasText(nationality)) {
    rows.push({
      label: "Trainee nationality",
      value: (
        <TraineeNationalityValue
          isoAlpha2={individual.nationality?.isoAlpha2}
          label={nationality}
        />
      ),
    });
  }
  const gender = getGenderLabel(data);
  if (gender) {
    rows.push({
      label: "Gender",
      value: (
        <TrainingDetailIconValue iconSrc={INDIVIDUAL_TRAINING_ICONS.traineeGender}>
          {gender}
        </TrainingDetailIconValue>
      ),
    });
  }

  return rows;
}
