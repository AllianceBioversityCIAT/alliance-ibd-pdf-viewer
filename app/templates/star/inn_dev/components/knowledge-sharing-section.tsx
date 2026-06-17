import type { InnovationDetailsPayload } from "../types";
import {
  getDisseminationQualificationLabel,
  getKnowledgeSharingExpandedBlocks,
  getKnowledgeSharingOtherToolsBlocks,
  getKnowledgeSharingLabel,
  getRenderableLinkedResults,
  shouldRenderDisseminationQualification,
} from "../rules";
import { FieldLabel } from "../../shared/components/label-value";
import { SubSectionBlock } from "../../shared/components/section-title";
import { STAR_COLORS } from "../../shared/tokens";
import { LinkedResultCard } from "./linked-result-card";

function KnowledgeSharingQuestionBlock({
  question,
  answer,
}: Readonly<{
  question: string;
  answer: string;
}>) {
  return (
    <div className="flex flex-col gap-[5px]" data-paginator-block>
      <p
        className="text-[11px] font-bold leading-[1.15] break-words m-0"
        style={{ color: STAR_COLORS.primaryBlue500 }}
      >
        {question}
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

interface KnowledgeSharingSectionProps {
  data: InnovationDetailsPayload;
}

export function KnowledgeSharingSection({
  data,
}: Readonly<KnowledgeSharingSectionProps>) {
  const form = data.knowledge_sharing_form;
  const primaryAnswer = getKnowledgeSharingLabel(data);

  if (!primaryAnswer) return null;

  const disseminationAnswer = getDisseminationQualificationLabel(data);
  const showDissemination =
    shouldRenderDisseminationQualification(data) && disseminationAnswer;

  const expandedBlocks = form
    ? getKnowledgeSharingExpandedBlocks(data, form)
    : [];
  const otherToolsBlocks = form
    ? getKnowledgeSharingOtherToolsBlocks(data, form)
    : [];
  const linkedResults = form ? getRenderableLinkedResults(form) : [];

  return (
    <SubSectionBlock title="Knowledge Sharing" paginatorBlock>
      <div className="flex flex-col gap-[10px]">
        <KnowledgeSharingQuestionBlock
          question="Is there potential for fellow researchers or policymakers to adapt and expand your tool or method in new contexts and for new purposes?"
          answer={primaryAnswer}
        />

        {showDissemination && disseminationAnswer && (
          <KnowledgeSharingQuestionBlock
            question="Your method or tool qualifies for further dissemination on the Alliance website. Please fill out the following questions to share your innovation through the Alliance website"
            answer={disseminationAnswer}
          />
        )}

        {expandedBlocks.map((block) => (
          <KnowledgeSharingQuestionBlock
            key={block.question}
            question={block.question}
            answer={block.answer}
          />
        ))}

        {linkedResults.length > 0 && (
          <div className="flex flex-col gap-[8px]" data-paginator-block>
            <FieldLabel label="Tools often used together with this tool" />
            <div className="flex flex-col gap-[8px]">
              {linkedResults.map((entry, index) => (
                <LinkedResultCard
                  key={entry.link_result_id ?? `linked-${index}`}
                  entry={entry}
                />
              ))}
            </div>
          </div>
        )}

        {otherToolsBlocks.map((block) => (
          <KnowledgeSharingQuestionBlock
            key={block.question}
            question={block.question}
            answer={block.answer}
          />
        ))}
      </div>
    </SubSectionBlock>
  );
}
