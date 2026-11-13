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
import { PortfolioTag } from "../../components/info-card";

interface GeneralInformationSectionProps {
  data: GeneralInformationPayload | null | undefined;
  /** e.g. "Portfolio 2026–2030" — shown as a tag next to Reporting year. */
  portfolioLabel?: string | null;
}

export function GeneralInformationSection({
  data,
  portfolioLabel,
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
          <div className="flex items-center gap-2 w-full">
            <div className="min-w-0">
              <LabelValueRow label="Reporting year" value={data!.year.trim()} />
            </div>
            {portfolioLabel?.trim() && <PortfolioTag label={portfolioLabel.trim()} />}
          </div>
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
