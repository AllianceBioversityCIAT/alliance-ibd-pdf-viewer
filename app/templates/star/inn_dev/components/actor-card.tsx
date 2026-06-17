import type { Actor, InnovationDetailsPayload } from "../types";
import {
  getActorCustomName,
  getActorDisaggregationFields,
  getActorNumberLabel,
  getActorTypeDisplay,
  shouldRenderActorCustomName,
} from "../rules";
import { InfoCard } from "../../shared/components/info-card";
import { STAR_COLORS } from "../../shared/tokens";

const CONTENT_WIDTH_CLASS = "w-full max-w-[521px]";

function CardNumberLabel({ label }: Readonly<{ label: string }>) {
  return (
    <p
      className="text-[9px] font-[450] leading-[1.15] uppercase m-0"
      style={{ color: STAR_COLORS.primaryBlue600 }}
    >
      {label}
    </p>
  );
}

interface InlineFieldProps {
  label: string;
  value: string;
}

function InlineField({ label, value }: Readonly<InlineFieldProps>) {
  return (
    <span className="text-[10px] break-words leading-[1.15] whitespace-nowrap">
      <span className="font-bold" style={{ color: STAR_COLORS.primaryBlue500 }}>
        {label}:
      </span>{" "}
      <span className="font-normal" style={{ color: STAR_COLORS.bodyText }}>
        {value}
      </span>
    </span>
  );
}

interface InlineFieldsRowProps {
  fields: { label: string; value: string }[];
}

function InlineFieldsRow({ fields }: Readonly<InlineFieldsRowProps>) {
  if (fields.length === 0) return null;

  return (
    <div className="flex flex-row flex-wrap items-baseline gap-x-6 gap-y-1">
      {fields.map((field) => (
        <InlineField key={field.label} label={field.label} value={field.value} />
      ))}
    </div>
  );
}

interface ActorCardProps {
  payload: InnovationDetailsPayload;
  actor: Actor;
  index: number;
}

export function ActorCard({
  payload,
  actor,
  index,
}: Readonly<ActorCardProps>) {
  const actorType = getActorTypeDisplay(payload, actor);
  const customName = getActorCustomName(actor);
  const disaggregationFields = getActorDisaggregationFields(actor);

  const fields: { label: string; value: string }[] = [];
  if (actorType) fields.push({ label: "Actor type", value: actorType });
  if (shouldRenderActorCustomName(actor) && customName) {
    fields.push({ label: "Custom actor type", value: customName });
  }
  fields.push(...disaggregationFields);

  if (fields.length === 0) return null;

  return (
    <InfoCard className={CONTENT_WIDTH_CLASS}>
      <div className="flex flex-col gap-[10px]">
        <CardNumberLabel label={getActorNumberLabel(index)} />
        <InlineFieldsRow fields={fields} />
      </div>
    </InfoCard>
  );
}

export { CONTENT_WIDTH_CLASS as ACTOR_CARD_WIDTH_CLASS };
