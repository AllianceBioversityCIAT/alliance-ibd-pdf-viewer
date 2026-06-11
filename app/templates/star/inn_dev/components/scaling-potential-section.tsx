import type { InnovationDetailsPayload, ScalingPotentialForm } from "../types";
import {
  getExpansionPotentialAnswerDisplay,
  getScalingScaleValue,
  SCALING_DEMAND_QUESTIONS,
  SCALING_FORMULATION_QUESTIONS,
  SCALING_SUSTAINED_QUESTIONS,
  shouldRenderExpansionPotentialQuestion,
  shouldRenderScalingScaleQuestion,
  type ScalingQuestionConfig,
} from "../rules";
import { hasText } from "../../shared/utils";
import { DataTable, type DataTableRow } from "../../shared/components/data-table";
import { ScalingScaleBar } from "./scaling-scale-bar";
import { FieldLabel } from "../../shared/components/label-value";
import { SubSectionBlock } from "../../shared/components/section-title";
import { STAR_COLORS } from "../../shared/tokens";

function ScalingQuestionGroup({
  title,
  questions,
  form,
}: Readonly<{
  title: string;
  questions: ScalingQuestionConfig[];
  form: ScalingPotentialForm;
}>) {
  const rows: DataTableRow[] = questions.flatMap((question) => {
    const value = getScalingScaleValue(form[question.field]);
    if (value == null) return [];
    return [{ label: question.label, value: <ScalingScaleBar value={value} /> }];
  });

  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-[10px]">
      <FieldLabel label={title} />
      <DataTable rows={rows} />
    </div>
  );
}

function ExpansionPotentialQuestion({
  payload,
}: Readonly<{ payload: InnovationDetailsPayload }>) {
  const answer = getExpansionPotentialAnswerDisplay(payload);
  if (!hasText(answer)) return null;

  return (
    <div className="flex flex-col gap-[5px]" data-paginator-block>
      <p
        className="text-[11px] font-bold leading-[1.15] break-words m-0"
        style={{ color: STAR_COLORS.primaryBlue500 }}
      >

        {`Is there potential for actors, such as fellow researchers or policymakers, to expand the innovation more generally in new contexts and for new purposes?`}
      </p>
      <p
        className="text-[11px] leading-[1.25] break-words m-0"
        style={{ color: STAR_COLORS.bodyText }}
      >
        {answer}
      </p>
    </div>
  );
}

interface ScalingPotentialSectionProps {
  data: InnovationDetailsPayload;
}

export function ScalingPotentialSection({
  data,
}: Readonly<ScalingPotentialSectionProps>) {
  const form = data.scaling_potential_form;
  if (!form) return null;

  const hasScaleContent = [
    ...SCALING_FORMULATION_QUESTIONS,
    ...SCALING_DEMAND_QUESTIONS,
    ...SCALING_SUSTAINED_QUESTIONS,
  ].some((question) => shouldRenderScalingScaleQuestion(form[question.field]));

  const hasExpansion = shouldRenderExpansionPotentialQuestion(data);

  if (!hasScaleContent && !hasExpansion) return null;

  return (
    <SubSectionBlock title="Scaling Potential" paginatorBlock>
      <div className="flex flex-col gap-[18px]">
        <ScalingQuestionGroup
          title="Formulation"
          questions={SCALING_FORMULATION_QUESTIONS}
          form={form}
        />
        <ScalingQuestionGroup
          title="Demand and Investment"
          questions={SCALING_DEMAND_QUESTIONS}
          form={form}
        />
        <ScalingQuestionGroup
          title="Sustained use"
          questions={SCALING_SUSTAINED_QUESTIONS}
          form={form}
        />
        {hasExpansion && <ExpansionPotentialQuestion payload={data} />}
      </div>
    </SubSectionBlock>
  );
}
