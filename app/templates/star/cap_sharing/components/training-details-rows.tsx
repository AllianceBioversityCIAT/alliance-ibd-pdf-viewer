import type { CapSharingPayload } from "../types";
import { formatDate } from "../../shared/utils";
import {
  getDeliveryModalityLabel,
  getLanguageDisplay,
  getSupervisorDisplay,
  getSupervisorInitials,
} from "../rules";
import type { DataTableRow } from "../../shared/components/data-table";
import { getDeliveryModalityIconSrc, TRAINING_DETAIL_ICONS } from "../assets";
import {
  SupervisorDetailValue,
  TrainingDetailIconValue,
} from "./training-detail-value";

export function getTrainingDetailRows(
  data: CapSharingPayload,
): DataTableRow[] {
  const rows: DataTableRow[] = [];

  const supervisorDisplay = getSupervisorDisplay(data);
  const supervisorInitials = getSupervisorInitials(data);
  if (supervisorDisplay) {
    rows.push({
      label: "Training / Engagement supervisor",
      value:
        supervisorInitials != null ? (
          <SupervisorDetailValue
            initials={supervisorInitials}
            display={supervisorDisplay}
          />
        ) : (
          supervisorDisplay
        ),
    });
  }

  const language = getLanguageDisplay(data);
  if (language) {
    rows.push({
      label: "Language",
      value: (
        <TrainingDetailIconValue
          iconSrc={TRAINING_DETAIL_ICONS.language}
          iconWidth={15}
          iconHeight={15}
        >
          {language}
        </TrainingDetailIconValue>
      ),
    });
  }

  const startDate = formatDate(data.start_date);
  if (startDate) {
    rows.push({
      label: "Start date",
      value: (
        <TrainingDetailIconValue iconSrc={TRAINING_DETAIL_ICONS.startDate}>
          {startDate}
        </TrainingDetailIconValue>
      ),
    });
  }

  const endDate = formatDate(data.end_date);
  if (endDate) {
    rows.push({
      label: "End date",
      value: (
        <TrainingDetailIconValue iconSrc={TRAINING_DETAIL_ICONS.endDate}>
          {endDate}
        </TrainingDetailIconValue>
      ),
    });
  }

  const deliveryModality = getDeliveryModalityLabel(data);
  if (deliveryModality) {
    const modalityIcon = getDeliveryModalityIconSrc(data.delivery_modality_id);
    rows.push({
      label: "Delivery modality",
      value: modalityIcon ? (
        <TrainingDetailIconValue iconSrc={modalityIcon}>
          {deliveryModality}
        </TrainingDetailIconValue>
      ) : (
        deliveryModality
      ),
    });
  }

  return rows;
}
