import type { IpRightsPayload } from "./types";
import {
  getAssetIpOwnerDisplayValue,
  getFormalIpRightsApplicationDisplayValue,
  getPotentialAssetDisplayValue,
  getPrivateSectorEngagementDisplayValue,
  getPublicityRestrictionDisplayValue,
  getRequiresFurtherDevelopmentDisplayValue,
  shouldRenderAssetIpOwner,
  shouldRenderFormalIpRightsApplication,
  shouldRenderIpRights,
  shouldRenderPotentialAsset,
  shouldRenderPrivateSectorEngagement,
  shouldRenderPublicityRestriction,
  shouldRenderRequiresFurtherDevelopment,
} from "./rules";
import { SectionTitle } from "../../components/section-title";
import { STAR_COLORS } from "../../tokens";

const CONTENT_WIDTH_CLASS = "w-full max-w-[521px]";

interface IpRightsSectionProps {
  data: IpRightsPayload | null | undefined;
  /** From `general_information.indicator_id` — section shows only for 1 or 2 */
  indicatorId?: number | null;
}

interface IpRightsQuestionBlockProps {
  question: string;
  answer: string;
}

function QuestionLabel({ children }: Readonly<{ children: string }>) {
  return (
    <p
      className="text-[11px] font-bold leading-[1.15] break-words m-0"
      style={{ color: STAR_COLORS.primaryBlue500 }}
    >
      {children}
    </p>
  );
}

function AnswerText({ children }: Readonly<{ children: string }>) {
  return (
    <p
      className="text-[11px] leading-[1.25] break-words m-0"
      style={{ color: STAR_COLORS.bodyText }}
    >
      {children}
    </p>
  );
}

function IpRightsQuestionBlock({
  question,
  answer,
}: Readonly<IpRightsQuestionBlockProps>) {
  return (
    <div className="flex flex-col gap-[5px]" data-paginator-block>
      <QuestionLabel>{question}</QuestionLabel>
      <AnswerText>{answer}</AnswerText>
    </div>
  );
}

export function IpRightsSection({
  data,
  indicatorId,
}: Readonly<IpRightsSectionProps>) {
  const effectiveIndicatorId = indicatorId ?? data?.indicator_id;

  if (!shouldRenderIpRights(effectiveIndicatorId) || !data) return null;

  return (
    <section className={`flex flex-col gap-[10px] ${CONTENT_WIDTH_CLASS}`}>
      <SectionTitle>IP Rights</SectionTitle>

      <div className="flex flex-col gap-[10px]">
        {shouldRenderAssetIpOwner(effectiveIndicatorId) &&
          getAssetIpOwnerDisplayValue(data) && (
            <IpRightsQuestionBlock
              question="Who owns the intellectual property rights to this asset?"
              answer={getAssetIpOwnerDisplayValue(data)!}
            />
          )}

        {shouldRenderPublicityRestriction(effectiveIndicatorId) &&
          getPublicityRestrictionDisplayValue(data) && (
            <IpRightsQuestionBlock
              question="Are there any legal restrictions for the publication of the work?"
              answer={getPublicityRestrictionDisplayValue(data)!}
            />
          )}

        {shouldRenderPotentialAsset(effectiveIndicatorId) &&
          getPotentialAssetDisplayValue(data) && (
            <IpRightsQuestionBlock
              question="Is there any potential for commercialization/release/making available this asset?"
              answer={getPotentialAssetDisplayValue(data)!}
            />
          )}

        {shouldRenderRequiresFurtherDevelopment(effectiveIndicatorId) &&
          getRequiresFurtherDevelopmentDisplayValue(data) && (
            <IpRightsQuestionBlock
              question="Does this asset require further development or refinement?"
              answer={getRequiresFurtherDevelopmentDisplayValue(data)!}
            />
          )}

        {shouldRenderPrivateSectorEngagement(data, effectiveIndicatorId) &&
          getPrivateSectorEngagementDisplayValue(data) && (
            <IpRightsQuestionBlock
              question="Do you expect private sector engagement in innovation development and/or scaling?"
              answer={getPrivateSectorEngagementDisplayValue(data)!}
            />
          )}

        {shouldRenderFormalIpRightsApplication(data, effectiveIndicatorId) &&
          getFormalIpRightsApplicationDisplayValue(data) && (
            <IpRightsQuestionBlock
              question="Do you consider applying for formal Intellectual Property Rights?"
              answer={getFormalIpRightsApplicationDisplayValue(data)!}
            />
          )}
      </div>
    </section>
  );
}

export type { IpRightsPayload };
