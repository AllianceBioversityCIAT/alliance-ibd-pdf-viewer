import type { GeneralInformationPayload } from "./types";
import {
  getMainContactDisplay,
  shouldRenderDescription,
  shouldRenderKeywords,
  shouldRenderSection,
  shouldRenderYear,
  shouldRenderTitle,
  shouldRenderMainContact,
} from "./rules";
import { SectionTitle } from "../../components/section-title";
import { LabelValueRow, KeywordList } from "../../components/label-value";

interface GeneralInformationSectionProps {
  data: GeneralInformationPayload | null | undefined;
}

export function GeneralInformationSection({
  data,
}: Readonly<GeneralInformationSectionProps>) {
  if (!shouldRenderSection(data)) return null;

  const keywords = data?.keywords ?? [];

  return (
    <section className="flex flex-col gap-2.5 w-full" data-paginator-block>
      <SectionTitle>General Information</SectionTitle>
      <div className="flex flex-col gap-2">
        {shouldRenderDescription(data) && (
          <LabelValueRow label="Description" value={data!.description.trim()} />
        )}
        {shouldRenderYear(data) && (
          <LabelValueRow label="Reporting year" value={data!.year.trim()} />
        )}
        {shouldRenderMainContact(data) && (
          <LabelValueRow
            label="Main contact person"
            value={getMainContactDisplay(data)!}
          />
        )}
        {shouldRenderKeywords(data) && (
          <div className="flex flex-col gap-1">
            <span
              className="text-[11px] font-bold"
              style={{ color: "#173F6F" }}
            >
              Keywords:
            </span>
            <KeywordList keywords={keywords} />
          </div>
        )}
        {shouldRenderTitle(data) && !shouldRenderDescription(data) && (
          /* title rendered in PageShell; section only shows body fields */
          null
        )}
      </div>
    </section>
  );
}

export type { GeneralInformationPayload };
