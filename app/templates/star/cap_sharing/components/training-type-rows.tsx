import type { CapSharingPayload } from "../types";
import {
  getDegreeLabel,
  getSessionFormatLabel,
  getSessionLengthLabel,
  getSessionTypeLabel,
} from "../rules";
import { hasText } from "../../shared/utils";
import type { DataTableRow } from "../../shared/components/data-table";
import { TRAINING_TYPE_ICONS } from "../assets";
import { TrainingDetailIconValue } from "./training-detail-value";

export function getTrainingTypeTableRows(
  data: CapSharingPayload,
): DataTableRow[] {
  const rows: DataTableRow[] = [];

  const sessionFormat = getSessionFormatLabel(data);
  if (sessionFormat) {
    rows.push({
      label: "Training or engagement to report",
      value: (
        <TrainingDetailIconValue
          iconSrc={TRAINING_TYPE_ICONS.sessionFormat}
          iconWidth={11}
          iconHeight={10}
        >
          {sessionFormat}
        </TrainingDetailIconValue>
      ),
    });
  }

  const sessionType = getSessionTypeLabel(data);
  if (sessionType) {
    rows.push({
      label: "Is this a training or an engagement?",
      value: (
        <TrainingDetailIconValue iconSrc={TRAINING_TYPE_ICONS.sessionType}>
          {sessionType}
        </TrainingDetailIconValue>
      ),
    });
  }

  const sessionLength = getSessionLengthLabel(data);
  if (sessionLength) {
    rows.push({
      label: "Length of training",
      value: (
        <TrainingDetailIconValue
          iconSrc={TRAINING_TYPE_ICONS.sessionLength}
          iconWidth={13}
          iconHeight={13}
        >
          {sessionLength}
        </TrainingDetailIconValue>
      ),
    });
  }

  const degree = getDegreeLabel(data);
  if (hasText(degree)) {
    rows.push({
      label: "Degree",
      value: (
        <TrainingDetailIconValue iconSrc={TRAINING_TYPE_ICONS.degree}>
          {degree}
        </TrainingDetailIconValue>
      ),
    });
  }

  return rows;
}
