import type { CapSharingPayload, GroupTraining } from "../types";
import {
  getAttendingOrganizationDisplay,
  getSessionPurposeLabel,
  shouldRenderOtherPurposeDescription,
} from "../rules";
import { hasText } from "../../shared/utils";
import type { DataTableRow } from "../../shared/components/data-table";
import { InlineMeta } from "../../shared/components/data-table";
import { GROUP_TRAINING_ICONS } from "../assets";
import { TrainingDetailIconValue } from "./training-detail-value";

const TRAINING_PURPOSE_LABEL =
  "What was the purpose of this training/engagement?";

function hasParticipantStats(group: GroupTraining): boolean {
  return (
    group.session_participants_total != null ||
    group.session_participants_female != null ||
    group.session_participants_male != null ||
    group.session_participants_non_binary != null
  );
}

function getParticipantStatsItems(group: GroupTraining): string[] {
  return [
    group.session_participants_total != null
      ? `Total: ${group.session_participants_total}`
      : null,
    group.session_participants_female != null
      ? `Female: ${group.session_participants_female}`
      : null,
    group.session_participants_male != null
      ? `Male: ${group.session_participants_male}`
      : null,
    group.session_participants_non_binary != null
      ? `Non-binary: ${group.session_participants_non_binary}`
      : null,
  ].filter((item): item is string => item != null);
}

function ParticipantStatsValue({ group }: Readonly<{ group: GroupTraining }>) {
  const items = getParticipantStatsItems(group);
  if (items.length === 0) return null;

  return (
    <span className="inline-flex items-center gap-2 min-w-0 flex-wrap">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={GROUP_TRAINING_ICONS.totalParticipants}
        alt=""
        width={17}
        height={13}
        className="shrink-0"
        aria-hidden
      />
      <InlineMeta items={items} />
    </span>
  );
}

export function getGroupTrainingTableRows(
  data: CapSharingPayload,
): DataTableRow[] {
  const group = data.group;
  if (!group) return [];

  const rows: DataTableRow[] = [];

  if (hasParticipantStats(group)) {
    rows.push({
      label: "Participants",
      value: <ParticipantStatsValue group={group} />,
    });
  }

  const sessionPurpose = getSessionPurposeLabel(data);
  if (sessionPurpose) {
    rows.push({
      label: TRAINING_PURPOSE_LABEL,
      value: (
        <TrainingDetailIconValue iconSrc={GROUP_TRAINING_ICONS.trainingPurpose}>
          {sessionPurpose}
        </TrainingDetailIconValue>
      ),
    });
  }

  if (shouldRenderOtherPurposeDescription(data)) {
    const description = group.session_purpose_description?.trim();
    if (hasText(description)) {
      rows.push({
        label: "Purpose description",
        value: description,
      });
    }
  }

  const attendingOrganization = getAttendingOrganizationDisplay(data);
  if (attendingOrganization) {
    rows.push({
      label: "Were the trainees attending on behalf of an organization?",
      value: attendingOrganization,
    });
  }

  return rows;
}
