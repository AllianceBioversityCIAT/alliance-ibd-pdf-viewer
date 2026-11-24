import type { TemplateProps } from "../..";
import type { PolicyChangePdfPayload } from "./types";
import { PageShell } from "../shared/components/page-shell";
import { GeneralInformationSection } from "../shared/sections/general_information";
import {
  AllianceAlignmentSection,
  getPortfolioLabel,
} from "../shared/sections/alliance_alignment";
import { ResultsPartnersSection } from "../shared/sections/results_partners";
import { GeographicScopeSection } from "../shared/sections/geographic_scope";
import { EvidenceSection } from "../shared/sections/evidence";
import { PolicyChangeDetailsSection } from "./components/policy-change-details-section";
import { shouldRenderTitle } from "../shared/sections/general_information/rules";

/** STAR Policy Change PDF (indicator 4). Same shared sections as Cap Sharing / Innovation, no IP Rights. */
export default function PolicyChangeTemplate({ data }: Readonly<TemplateProps>) {
  const payload = data as PolicyChangePdfPayload | null;
  const general = payload?.general_information;

  const title = shouldRenderTitle(general)
    ? general!.title.trim()
    : "STAR Result";

  return (
    <PageShell
      title={title}
      resultCode={general?.result_code}
      indicator={general?.result_type}
      generatedAt={general?.generated_at}
      status={general?.status}
    >
      <GeneralInformationSection
        data={general}
        portfolioLabel={getPortfolioLabel(payload?.alliance_alignment)}
      />
      <AllianceAlignmentSection data={payload?.alliance_alignment} />
      <PolicyChangeDetailsSection data={payload?.policy_change} />
      <ResultsPartnersSection data={payload?.results_partners} />
      <GeographicScopeSection data={payload?.geographic_scope} />
      <EvidenceSection data={payload?.evidence} />
    </PageShell>
  );
}
